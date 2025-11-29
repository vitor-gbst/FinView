package controller

import (
	"finview/backend/internal/projects/service"
	userModel "finview/backend/internal/user/model"
	"net/http"
	"strconv"

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
		c.JSON(http.StatusBadRequest, gin.H{"error": "Project name required"})
		return
	}

	file, err := c.FormFile("project_file")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Files not fount"})
		return
	}

	project, err := service.CreateProject(file, user.ID, projectName)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to process files"})
		return
	}

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

type settingsInput struct {
	Sheet      string `json:"sheet" binding:"required"`
	Column     string `json:"column" binding:"required"`
	DateColumn string `json:"date_column"`
	Line       int    `json:"line" binding:"required"`
}

func UpdateProjectSettings(c *gin.Context) {
	userInterface, _ := c.Get("user")
	user := userInterface.(userModel.User)

	idStr := c.Param("id")
	projectID, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID de projeto inválido"})
		return
	}

	var input settingsInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	project, err := service.UpdateProjectSettings(user.ID, uint(projectID), input.Sheet, input.Column, input.DateColumn, input.Line)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()}) 
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Configuration saved successfully",
		"project": project,
	})
}

func GetProjectAnalysis(c *gin.Context) {
	
	userInterface, _ := c.Get("user")
	user := userInterface.(userModel.User)

	
	idStr := c.Param("id")
	projectID, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
		return
	}


	analysisType := c.DefaultQuery("type", "full_analysis")

	result, err := service.GetProjectAnalysis(user.ID, uint(projectID), analysisType)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, result)
}
