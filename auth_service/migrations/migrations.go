package main

import (
	"auth_service/internals/database"
	"auth_service/models"
	"log"
)

func init() {
	database.LoadInitializers()
	database.ConnectToDb()
}

func main() {

	if err := database.DB.AutoMigrate(&models.RefreshToken{}); err != nil {
		log.Printf("Error migrating RefreshToken: %v", err)
		panic(err)
	}

	if err := database.DB.AutoMigrate(models.Profile{}); err != nil {
		log.Printf("Error during migration of Profile: %v", err)
		panic(err)
	}
	if err := database.DB.AutoMigrate(models.User{}); err != nil {
		log.Printf("Error during migration of User: %v", err)
		panic(err)
	}
}
