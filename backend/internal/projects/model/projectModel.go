package model

import (
	"gorm.io/gorm"
)

type Project struct {
	gorm.Model // Adiciona ID, CreatedAt, UpdatedAt, DeletedAt

	Name             string `gorm:"not null"`
	ArqPath          string `gorm:"not null;unique"` // Caminho do arquivo no servidor
	OriginalFilename string
	ConfigColumn     string // Coluna de análise (ex: "C")
	ConfigLine       int    // Linha onde os dados começam (ex: 2)

	// A Relação: "Project pertence a um User"
	UserID uint `gorm:"not null"`
}