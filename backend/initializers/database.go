package initializers

import (
	"finview/backend/internal/user/model"
	"os"

	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

var DB *gorm.DB

func InitDB() {
	var err error
	dsn := os.Getenv("DB")
	DB, err = gorm.Open(sqlite.Open(dsn), &gorm.Config{})

	if err != nil {
		panic("Failed to connect to database")
	}

	// Migrate the schema
	DB.AutoMigrate(&model.User{})
}
