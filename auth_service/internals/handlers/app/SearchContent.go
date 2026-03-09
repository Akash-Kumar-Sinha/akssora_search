package app

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"os"

	"github.com/gin-gonic/gin"
)

func SearchContent(c *gin.Context) {
	query := c.Query("searchQuery")
	fmt.Println("Query: ", query)

	searchModalServiceUrl := os.Getenv("SEARCH_MODEL_SERVICE_URL")
	apiUrl := fmt.Sprintf("%s/search?query=%s", searchModalServiceUrl, url.QueryEscape(query))
	fmt.Println("Calling URL:", apiUrl)

	req, err := http.NewRequest("GET", apiUrl, nil)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create search request"})
		return
	}

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to perform search request"})
		return
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		fmt.Println("Python error response:", string(body))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Search service returned an error"})
		return
	}

	var results []map[string]interface{}
	err = json.NewDecoder(resp.Body).Decode(&results)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to decode search results"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"results": results})
}