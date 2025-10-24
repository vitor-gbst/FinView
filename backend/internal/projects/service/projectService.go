package service

import (
	"finview/backend/initializers"
	"finview/backend/internal/projects/model"
	"fmt"
	"io"
	"mime/multipart"
	"os"
	"path/filepath"
	"strconv"
	"time"

	"github.com/xuri/excelize/v2"
	"gorm.io/gorm"
)

const uploadDir = "./uploads"

// ---Create a new project ---
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

// --- Get Users project ---
func GetProjectsForUser(userID uint) ([]model.Project, error) {
	var projects []model.Project
	result := initializers.DB.Where("user_id = ?", userID).Find(&projects)
	if result.Error != nil {
		return nil, result.Error
	}
	return projects, nil
}

// --- Update project settings --
func UpdateProjectSettings(userID, projectID uint, sheet string, column string, line int) (*model.Project, error) {
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
	project.ConfigLine = line

	saveResult := initializers.DB.Save(&project)
	if saveResult.Error != nil {
		return nil, saveResult.Error
	}

	return &project, nil
}


// --- Analysis --
type AnalysisResult struct {
	Type   string    `json:"type"`
	Column string    `json:"column"`
	Count  int       `json:"count"`
	Sum    float64   `json:"sum"`
	Mean   float64   `json:"mean"`
	Data   []float64 `json:"data"` 
}

// --- GetProjectAnalysis exec analisys ---
func GetProjectAnalysis(userID, projectID uint, analysisType string) (*AnalysisResult, error) {
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
		return nil, fmt.Errorf("Failed to read '%s'", project.ConfigSheet)
	}

	colIndex := -1
	if project.ConfigLine > 0 && project.ConfigLine-1 < len(rows) {
		headerRow := rows[project.ConfigLine-1] 
		for i, colName := range headerRow {
			if colName == project.ConfigColumn {
				colIndex = i
				break
			}
		}
	}

	if colIndex == -1 {
		return nil, fmt.Errorf("collumn '%s' not found on line %d", project.ConfigColumn, project.ConfigLine)
	}

	var data []float64
	var sum float64
	for i := project.ConfigLine; i < len(rows); i++ {
		row := rows[i]
		if colIndex < len(row) {
			valStr := row[colIndex]
			if val, err := strconv.ParseFloat(valStr, 64); err == nil {
				
				data = append(data, val)
				sum += val
			}
		}
	}
	
	count := len(data)
	var mean float64
	if count > 0 {
		mean = sum / float64(count)
	}

	analysis := &AnalysisResult{
		Type:   analysisType,
		Column: project.ConfigColumn,
		Count:  count,
		Sum:    sum,
		Mean:   mean,
		Data:   data, 
	}

	return analysis, nil
}

