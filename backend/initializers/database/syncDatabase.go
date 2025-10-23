package initializers

import "finview/backend/internal/user/model"

func SyncDatabase() {
	DB.AutoMigrate(&model.User{})
}
