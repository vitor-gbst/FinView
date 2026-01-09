package main

import (
  "finview/backend/initializers"

	"finview/backend/routes"
  

	"github.com/gin-gonic/gin"
)

func init() {
	initializers.LoaderEnvVariables()
	initializers.InitDB()
	
}

func main() {
	r := gin.Default()
	r.Use(initializers.CorsConfig())
	// Setup routes
	routes.SetupRoutes(r)
	

	

	// Start server
	r.Run() // listens and serves on 0.0.0.0:8080 (for windows "localhost:8080")
}
