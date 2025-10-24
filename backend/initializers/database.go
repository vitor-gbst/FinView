package initializers

import (
	projectModel "finview/backend/internal/projects/model"
	userModel "finview/backend/internal/user/model"
	"log"
	"os"
	"path/filepath"

	"gorm.io/driver/sqlite"
	_ "github.com/mattn/go-sqlite3"
	"gorm.io/gorm"
)

var DB *gorm.DB

func InitDB() {
	var err error
	dsn := os.Getenv("DB")

	// Ensure the database directory exists
	dbDir := filepath.Dir(dsn)
	if err := os.MkdirAll(dbDir, 0755); err != nil {
		log.Fatalf("Failed to create database directory: %v", err)
	}

	DB, err = gorm.Open(sqlite.Open(dsn), &gorm.Config{})

	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}

	// Migrate the schema
	DB.AutoMigrate(&userModel.User{}, &projectModel.Project{})
}
