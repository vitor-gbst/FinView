package routes

import (
	"finview/backend/internal/user/controller"
	"finview/backend/internal/user/middleware"

	"github.com/gin-gonic/gin"
)

func SetupRoutes(r *gin.Engine) {
	r.POST("/signup", controller.Signup)
	r.POST("/login", controller.Login)
	r.GET("/validate", middleware.RequireAuth, controller.Validate)

}
