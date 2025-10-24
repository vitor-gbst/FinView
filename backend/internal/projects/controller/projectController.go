package controller

import (
	"finview/backend/internal/projects/service"
	userModel "finview/backend/internal/user/model"
	"net/http"

	"github.com/gin-gonic/gin"
)

func UploadProject(c *gin.Context) {
	userInterface, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticate"})
		return
	}
	user := userInterface.(userModel.User)

	projectName := c.PostForm("name")
	if projectName == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "O nome do projeto é obrigatório"})
		return
	}

	file, err := c.FormFile("project_file")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Files not fount"})
		return
	}

	// 4. Chamar o Service para processar
	project, err := service.CreateProject(file, user.ID, projectName)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to process files"})
		return
	}

	// 5. Retornar sucesso
	c.JSON(http.StatusOK, gin.H{
		"message": "Projeto criado com sucesso!",
		"project": project,
	})
}

func GetUserProjects(c *gin.Context) {
	userInterface, _ := c.Get("user")
	user := userInterface.(userModel.User)

	projects, err := service.GetProjectsForUser(user.ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get projects"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"projects": projects})
}
