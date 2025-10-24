package model

import(
	"gorm.io/gorm"
	projectModel "finview/backend/internal/projects/model") 

type User struct {
	gorm.Model
	Email    string `gorm:"unique"`
	Password string

	Project []projectModel.Project `gorm:"foreignKey:UserID"`
}
