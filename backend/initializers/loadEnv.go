package initializers

import "log"

func LoaderEnvVariables() {

	err := gotoenv.Load()

	if err != nil {
		log.Fatal("Error loading .evn file")
	}
}