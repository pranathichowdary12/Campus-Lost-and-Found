const API_URL = "https://campus-lost-and-found-tt3q.onrender.com/api";

const token = localStorage.getItem("token");
const user = JSON.parse(localStorage.getItem("user") || "null");

// Check login
if (!token || !user) {
    alert("Please login first.");
    window.location.href = "login.html";
}

// Logout
function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "login.html";
}

// Fetch and display items
async function loadItems() {

    const container = document.getElementById("itemsContainer");

    const search = document.getElementById("search").value.trim();
    const category = document.getElementById("category").value;
    const location = document.getElementById("location").value.trim();
    const building = document.getElementById("building").value;

    const selectedLocation = building || location;
    const listingType = document.getElementById("listingType").value;

    const params = new URLSearchParams();

    if (search) params.append("search", search);
    if (category) params.append("category", category);
    if (selectedLocation) {
    params.append("location", selectedLocation);
}
    if (listingType) params.append("listingType", listingType);

    try {

        container.innerHTML = "Loading items...";

        const response = await fetch(
            `${API_URL}/items?${params.toString()}`
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message);
        }

        if (!data.items || data.items.length === 0) {
            container.innerHTML = "<p>No items found.</p>";
            return;
        }

        container.innerHTML = data.items.map(item => `
            <div class="feature-card">

                <h3>${item.itemName}</h3>

                ${item.image ? `
    <img
        src="${item.image}"
        alt="${item.itemName}"
        class="item-image"
    >
` : ""}

                <p><strong>Category:</strong> ${item.category}</p>

                <p><strong>Description:</strong> ${item.description}</p>

                <p><strong>Location:</strong> ${item.location}</p>

                <p><strong>Date:</strong>
                    ${new Date(item.date).toLocaleDateString()}
                </p>

                <p><strong>Type:</strong>
                    ${item.listingType.toUpperCase()}
                </p>

                <p><strong>Status:</strong>
                    ${item.status.toUpperCase()}
                </p>

                <p><strong>Reported By:</strong>
                    ${item.user?.name || "Unknown"}
                </p>

                ${
    item.listingType === "found" && item.status === "active"
    ? `
        <button onclick="submitClaim('${item._id}')">
            Claim This Item
        </button>
    `
    : ""
}

            </div>
        `).join("");

    } catch (error) {

        container.innerHTML = "Error loading items: " + error.message;

    }
}

// Search button
document.getElementById("searchButton").addEventListener("click", loadItems);

// Reset filters
document.getElementById("resetButton").addEventListener("click", function() {

    document.getElementById("search").value = "";
    document.getElementById("category").value = "";
    document.getElementById("location").value = "";
    document.getElementById("building").value = "";
    document.getElementById("listingType").value = "";

    loadItems();

});

// Load all items when page opens
loadItems();

// Submit a claim for a found item
async function submitClaim(itemId) {

    const description = prompt(
        "Explain why this item belongs to you:"
    );

    if (!description || !description.trim()) {
        alert("Please enter a claim description.");
        return;
    }

    try {

        const response = await fetch(`${API_URL}/claims`, {

            method: "POST",

            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },

            body: JSON.stringify({
                itemId: itemId,
                description: description.trim()
            })

        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message);
        }

        alert("Your claim has been submitted successfully!");

    } catch (error) {

        alert(error.message);

    }
}