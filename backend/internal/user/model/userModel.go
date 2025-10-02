package model

type User struct(
	gorm.Model
	Email string `gorm:"unique"`
	Password string
)