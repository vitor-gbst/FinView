package initializers

func SyncDatabase(){
	DB.AutoMigrate(&model.User{})
}