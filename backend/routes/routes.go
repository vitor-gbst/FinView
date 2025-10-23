package routes

import (
	"finview/backend/internal/user/controller"

	"github.com/gin-gonic/gin"
)

func SetupRoutes(r *gin.Engine) {
	r.POST("/signup", controller.Signup)
	r.POST("/login", controller.Login)

}
