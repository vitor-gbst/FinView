package controller

import (
	"finview/backend/initializers"
	"finview/backend/internal/user/model"
	"net/http"
	"os"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
)
func Login(c *gin.Context){
	var body struct{
		Email string
		Password string
	}
	if c.Bind(&body) !=nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Failed to read body",
		})
		return
	}

	var user model.User
	initializers.DB.First(&user, "email = ?", body.Email)

	if user.ID == 0 {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid email or password",
		})
		return
	}

	err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(body.Password))

	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Faield to compare password hash",
		})
		return
	}

	
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
	"sub": user.ID,
	"exp": time.Now().Add(time.Hour * 24 * 30).Unix(),
	})

	tokenString, err := token.SignedString([]byte(os.Getenv("SECRET")))


	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Failed to create token",
		})
		return
	}

	c.SetSameSite(http.SameSiteLaxMode)
	c.SetCookie("Authorization", tokenString, 3600 * 24 * 30, "/", "", false, true)

	c.JSON(http.StatusOK, gin.H{
		
	})

	
}

func Logout(c *gin.Context) {
    // Definindo o cookie com valor vazio e tempo de vida negativo (-1)
    // IMPORTANTE: O nome "Authorization", o path, o secure e o httpOnly 
    // devem ser IGUAIS aos que você usou na função Login.
    c.SetCookie("Authorization", "", -1, "/", "", false, true)

    c.JSON(http.StatusOK, gin.H{
        "message": "Deslogado com sucesso",
    })
}