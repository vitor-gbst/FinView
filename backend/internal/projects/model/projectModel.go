package model

import (
	"gorm.io/gorm"
)

type Project struct {
	gorm.Model 

	Name             string `gorm:"not null"`
	ArqPath          string `gorm:"not null;unique"` 
	OriginalFilename string
	ConfigSheet 	 string
	ConfigColumn     string
	ConfigDateColumn string
	ConfigLine       int

	UserID uint `gorm:"not null"`
}
