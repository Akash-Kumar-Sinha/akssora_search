package app

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"mime/multipart"
	"net/http"
	"os"
	"path/filepath"
	"strings"

	"github.com/gin-gonic/gin"
)

func UploadContent(c *gin.Context) {

	searchModalServiceUrl := os.Getenv("SEARCH_MODEL_SERVICE_URL")

	fileHeader, err := c.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "file is required",
		})
		return
	}

	ext := strings.ToLower(filepath.Ext(fileHeader.Filename))

	imageTypes := map[string]bool{
		".jpg":  true,
		".jpeg": true,
		".png":  true,
	}

	videoTypes := map[string]bool{
		".mp4": true,
	}

	var apiUrl string

	if imageTypes[ext] {
		fmt.Println("File type: image")
		apiUrl = fmt.Sprintf("%s/upload/image", searchModalServiceUrl)

	} else if videoTypes[ext] {
		fmt.Println("File type: video")
		apiUrl = fmt.Sprintf("%s/upload/video", searchModalServiceUrl)

	} else {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "unsupported file type",
		})
		return
	}

	// Open uploaded file
	file, err := fileHeader.Open()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "failed to open file",
		})
		return
	}
	defer file.Close()

	respBody, err := sendFileToPython(file, fileHeader.Filename, apiUrl)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": err.Error(),
		})
		return
	}

	var pythonResp map[string]interface{}
	json.Unmarshal([]byte(respBody), &pythonResp)
	println("________________________________________", pythonResp["message"])
	c.JSON(http.StatusOK, gin.H{"message": pythonResp["message"]})
}

func sendFileToPython(file multipart.File, filename string, url string) (string, error) {

	var requestBody bytes.Buffer
	writer := multipart.NewWriter(&requestBody)

	part, err := writer.CreateFormFile("file", filename)
	if err != nil {
		return "", err
	}

	_, err = io.Copy(part, file)
	if err != nil {
		return "", err
	}

	writer.Close()

	req, err := http.NewRequest("POST", url, &requestBody)
	if err != nil {
		return "", err
	}

	req.Header.Set("Content-Type", writer.FormDataContentType())

	client := &http.Client{}

	resp, err := client.Do(req)
	if err != nil {
		return "", err
	}

	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return "", err
	}

	fmt.Println("Python response:", string(body))

	return string(body), nil
}
