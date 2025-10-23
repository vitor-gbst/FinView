package controller

import (
	"finview/backend/initializers"
	"finview/backend/internal/user/model"
	"net/http"
	"os/user"

	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
)

func Singup(c *gin.Context){
	var body struct{
		Email string
		Password string
	}
	if c.Bind(&body) !=nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Failed to read body",
		})
		return
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(body.Password), 10)

	if err !=nil{
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Failed to hash password",
		})
		return
	}

	user := models.User(Email: body.Email, Password: string(hash))
	result := initializers.DB.Create(&user)

	if result.Error !=nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Failed to create user",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{})
}