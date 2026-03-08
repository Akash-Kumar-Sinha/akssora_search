package api

import (
	"auth_service/internals/handlers/app"
	"auth_service/internals/middlewares"

	"github.com/gin-gonic/gin"
)

func AppRoutes(router *gin.RouterGroup) {

	router.POST("/upload", middlewares.AuthSession(), app.UploadContent)
	router.GET("/search", middlewares.AuthSession(), app.SearchContent)

}
