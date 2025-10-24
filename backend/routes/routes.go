package routes

import (
	"finview/backend/internal/user/middleware"
    projectController "finview/backend/internal/projects/controller"
	userController "finview/backend/internal/user/controller"    

	"github.com/gin-gonic/gin"
)

func SetupRoutes(r *gin.Engine) {
	// --- User Routes  ---
	r.POST("/signup", userController.Signup)
	r.POST("/login", userController.Login)
	r.GET("/validate", middleware.RequireAuth, userController.Validate)


	// --- Project Routes ---
	
	
	projectRoutes := r.Group("/projects", middleware.RequireAuth)
	{
		// POST /projects/
		projectRoutes.POST("/", projectController.UploadProject)

		// GET /projects/
		projectRoutes.GET("/", projectController.GetUserProjects)

	}
}