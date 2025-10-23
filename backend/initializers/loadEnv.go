package initializers

import (
	"log"

	"github.com/joho/godotenv"
)

func LoaderEnvVariables() {

	err := godotenv.Load()

	if err != nil {
		log.Fatal("Error loading .evn file")
	}
}
