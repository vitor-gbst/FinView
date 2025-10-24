package service

import (
	"fmt"
	"io"
	"mime/multipart"
	"os"
	"path/filepath"
   "finview/backend/initializers"
   "finview/backend/internal/projects/model"
	"time"
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

	// 3. Gerar um nome de arquivo único para evitar conflitos
	ext := filepath.Ext(file.Filename)
	safeFilename := fmt.Sprintf("%d_%s", time.Now().Unix(), "arquivo"+ext)
	storagePath := filepath.Join(userUploadDir, safeFilename)

	// 4. Criar o arquivo de destino no servidor
	dst, err := os.Create(storagePath)
	if err != nil {
		return nil, err
	}
	defer dst.Close()

	// 5. Copiar o conteúdo
	if _, err = io.Copy(dst, src); err != nil {
		return nil, err
	}

	// 6. Criar a entrada no banco de dados
	project := model.Project{
		Name:             projectName,
		UserID:           userID,
		ArqPath:          storagePath,
		OriginalFilename: file.Filename,
		ConfigLine:       1, // Valor padrão, o usuário pode mudar depois
		ConfigColumn:     "A", // Valor padrão
	}

	result := initializers.DB.Create(&project)
	if result.Error != nil {
		// Se der erro no DB, remove o arquivo que acabamos de salvar
		os.Remove(storagePath)
		return nil, result.Error
	}

	return &project, nil
}

// GetProjectsForUser busca todos os projetos de um usuário
func GetProjectsForUser(userID uint) ([]model.Project, error) {
	var projects []model.Project
	result := initializers.DB.Where("user_id = ?", userID).Find(&projects)
	if result.Error != nil {
		return nil, result.Error
	}
	return projects, nil
}

