package app

import (
	"encoding/json"
	"fmt"
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
)

func SearchContent(c *gin.Context) {

	// Get the query parameter
	query := c.Query("query")
	
	
	searchModalServiceUrl := os.Getenv("SEARCH_MODEL_SERVICE_URL")
	apiUrl := fmt.Sprintf("%s/search?query=%s", searchModalServiceUrl, query)
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
