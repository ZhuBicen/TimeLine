package main

import (
	"log"
	"net/http"
)

func handleHome(w http.ResponseWriter, r *http.Request) {
	http.ServeFile(w, r, "TimeChart.html")
}

func main() {

	http.Handle("/js/", http.StripPrefix("/js/", http.FileServer(http.Dir("./js"))))
	http.Handle("/css/", http.StripPrefix("/css/", http.FileServer(http.Dir("./css"))))
	http.Handle("/images/", http.StripPrefix("/images/", http.FileServer(http.Dir("./images"))))

	http.HandleFunc("/", handleHome)

	log.Println("Listening...")
	http.ListenAndServe(":3000", nil)
}
