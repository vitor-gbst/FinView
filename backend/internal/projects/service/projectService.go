package service

import (
	"finview/backend/initializers"
	"finview/backend/internal/analysis"
	"finview/backend/internal/projects/model"
	"fmt"
	"io"
	"mime/multipart"
	"os"
	"path/filepath"
	"strconv"
	"time"

	"strings"

	"github.com/xuri/excelize/v2"
	"gorm.io/gorm"
)

const uploadDir = "./uploads"

func CreateProject(file *multipart.FileHeader, userID uint, projectName string) (*model.Project, error) {
	src, err := file.Open()
	if err != nil {
		return nil, err
	}
	defer src.Close()

	userUploadDir := filepath.Join(uploadDir, fmt.Sprintf("user_%d", userID))
	if err := os.MkdirAll(userUploadDir, os.ModePerm); err != nil {
		return nil, err
	}

	ext := filepath.Ext(file.Filename)
	safeFilename := fmt.Sprintf("%d_%s", time.Now().Unix(), "arquivo"+ext)
	storagePath := filepath.Join(userUploadDir, safeFilename)

	dst, err := os.Create(storagePath)
	if err != nil {
		return nil, err
	}
	defer dst.Close()

	if _, err = io.Copy(dst, src); err != nil {
		return nil, err
	}

	project := model.Project{
		Name:             projectName,
		UserID:           userID,
		ArqPath:          storagePath,
		OriginalFilename: file.Filename,
		ConfigLine:       1,
		ConfigColumn:     "A",
	}

	result := initializers.DB.Create(&project)
	if result.Error != nil {
		os.Remove(storagePath)
		return nil, result.Error
	}

	return &project, nil
}

func GetProjectsForUser(userID uint) ([]model.Project, error) {
	var projects []model.Project
	result := initializers.DB.Where("user_id = ?", userID).Find(&projects)
	if result.Error != nil {
		return nil, result.Error
	}
	return projects, nil
}

func UpdateProjectSettings(userID, projectID uint, sheet, column, dateColumn string, line int) (*model.Project, error) {
	var project model.Project

	result := initializers.DB.First(&project, "id = ? AND user_id = ?", projectID, userID)
	if result.Error != nil {
		if result.Error == gorm.ErrRecordNotFound {
			return nil, fmt.Errorf("Project not found or acess denied")
		}
		return nil, result.Error
	}

	project.ConfigSheet = sheet
	project.ConfigColumn = column
	project.ConfigDateColumn = dateColumn
	project.ConfigLine = line

	saveResult := initializers.DB.Save(&project)
	if saveResult.Error != nil {
		return nil, saveResult.Error
	}

	return &project, nil
}

func UpdateProjectFile(userID, projectID uint, file *multipart.FileHeader) (*model.Project, error) {
    var project model.Project

    
    result := initializers.DB.First(&project, "id = ? AND user_id = ?", projectID, userID)
    if result.Error != nil {
        return nil, fmt.Errorf("Projeto não encontrado ou acesso negado")
    }

    if project.ArqPath != "" {
        _ = os.Remove(project.ArqPath) 
    }

    src, err := file.Open()
    if err != nil {
        return nil, err
    }
    defer src.Close()

    userUploadDir := filepath.Join(uploadDir, fmt.Sprintf("user_%d", userID))
    os.MkdirAll(userUploadDir, os.ModePerm)

    ext := filepath.Ext(file.Filename)
    
    safeFilename := fmt.Sprintf("%d_%s", time.Now().Unix(), "upd"+ext) 
    storagePath := filepath.Join(userUploadDir, safeFilename)

    dst, err := os.Create(storagePath)
    if err != nil {
        return nil, err
    }
    defer dst.Close()

    if _, err = io.Copy(dst, src); err != nil {
        return nil, err
    }

    project.ArqPath = storagePath
    project.OriginalFilename = file.Filename
    

    if err := initializers.DB.Save(&project).Error; err != nil {
        return nil, err
    }

    return &project, nil
}

func GetProjectAnalysis(userID, projectID uint, analysisType string) (*analysis.AnalysisResult, error) {
	var project model.Project

	result := initializers.DB.First(&project, "id = ? AND user_id = ?", projectID, userID)
	if result.Error != nil {
		return nil, fmt.Errorf("Project not found or acess denied")
	}

	if project.ConfigSheet == "" || project.ConfigColumn == "" || project.ConfigLine <= 0 {
		return nil, fmt.Errorf("Project not configured. Please select sheet, column, and row")
	}

	f, err := excelize.OpenFile(project.ArqPath)
	if err != nil {
		return nil, fmt.Errorf("Failed to open %v", err)
	}
	defer f.Close()

	rows, err := f.GetRows(project.ConfigSheet)
	if err != nil {
		return nil, fmt.Errorf("A aba '%s' não foi encontrada no arquivo Excel. Verifique o nome.", project.ConfigSheet)
	}

	valueColIndex := -1
	dateColIndex := -1
	if project.ConfigLine > 0 && project.ConfigLine-1 < len(rows) {
		headerRow := rows[project.ConfigLine-1]
		for i, colName := range headerRow {
			if colName == project.ConfigColumn {
				valueColIndex = i
			}
			if project.ConfigDateColumn != "" && colName == project.ConfigDateColumn {
				dateColIndex = i
			}
		}
	}

	if valueColIndex == -1 {
		return nil, fmt.Errorf("A coluna de valor '%s' não foi encontrada na linha %d.", project.ConfigColumn, project.ConfigLine)
	}

	if dateColIndex != -1 {
		var series []analysis.TimeSeriesDataPoint
		for i := project.ConfigLine; i < len(rows); i++ {
			row := rows[i]
			if valueColIndex < len(row) && dateColIndex < len(row) {
				valStr := row[valueColIndex]
				dateStr := row[dateColIndex]

				val, err := parseBrazilianNumber(valStr) 
                if err != nil {
                     val, err = strconv.ParseFloat(valStr, 64)
                     if err != nil {
                        continue 
                     }
                }

				date, err := parseDate(dateStr)
				if err != nil {
					continue 
				}

				series = append(series, analysis.TimeSeriesDataPoint{Date: date, Value: val})
			}
		}
		return analysis.CalculateTimeSeriesAnalysis(series, analysisType, project.ConfigColumn), nil
	}

	var data []float64
	for i := project.ConfigLine; i < len(rows); i++ {
		row := rows[i]
		if valueColIndex < len(row) {
			valStr := row[valueColIndex]
			if val, err := strconv.ParseFloat(valStr, 64); err == nil {
				data = append(data, val)
			}
		}
	}

	analysisResult := analysis.CalculateBasicAnalysis(data, analysisType, project.ConfigColumn)
	return analysisResult, nil
}

func parseDate(dateStr string) (time.Time, error) {
	layouts := []string{
		"2006-01-02",
		"02/01/2006",
		"01-02-2006",
		"02-Jan-2006",
		time.RFC3339,
	}
	for _, layout := range layouts {
		t, err := time.Parse(layout, dateStr)
		if err == nil {
			return t, nil
		}
	}
	return time.Time{}, fmt.Errorf("unable to parse date: %s", dateStr)
}


func parseBrazilianNumber(valStr string) (float64, error) {
    cleanStr := strings.ReplaceAll(valStr, "R$", "")
    cleanStr = strings.ReplaceAll(cleanStr, " ", "")
    cleanStr = strings.ReplaceAll(cleanStr, ".", "") 

    
    cleanStr = strings.ReplaceAll(cleanStr, ",", ".")

    return strconv.ParseFloat(cleanStr, 64)
}

func DeleteProject(userID, projectID uint) error {
    var project model.Project

    result := initializers.DB.First(&project, "id = ? AND user_id = ?", projectID, userID)
    if result.Error != nil {
        return result.Error 
    }

    if project.ArqPath != "" {
        os.Remove(project.ArqPath)
    }

    return initializers.DB.Unscoped().Delete(&project).Error
}
