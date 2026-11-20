const API_URL = "http://localhost:5000/api";

const token = localStorage.getItem("token");
const user = JSON.parse(localStorage.getItem("user") || "null");

// Check student login
if (!token || !user || user.role !== "user") {
    alert("Please login as a student.");
    window.location.href = "login.html";
}

// Logout
function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    window.location.href = "login.html";
}

// Report item
const reportForm = document.getElementById("reportForm");

reportForm.addEventListener("submit", async function(event) {

    event.preventDefault();

    const itemData = {
        itemName: document.getElementById("itemName").value.trim(),
        category: document.getElementById("category").value,
        description: document.getElementById("description").value.trim(),
        location: document.getElementById("location").value.trim(),
        date: document.getElementById("date").value,
        listingType: document.getElementById("listingType").value,
        image: document.getElementById("image").value.trim()
    };

    const message = document.getElementById("reportMessage");

    try {

        const response = await fetch(`${API_URL}/items`, {

            method: "POST",

            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },

            body: JSON.stringify(itemData)

        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message);
        }

        message.textContent = "Item reported successfully!";
        message.style.color = "green";

        reportForm.reset();

    } catch (error) {

        message.textContent = error.message;
        message.style.color = "red";

    }

});