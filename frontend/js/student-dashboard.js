const API_URL = "http://localhost:5000/api";

const token = localStorage.getItem("token");
const user = JSON.parse(localStorage.getItem("user") || "null");

if (!token || !user || user.role !== "user") {
    alert("Please login as a student.");
    window.location.href = "login.html";
}

function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "login.html";
}

async function loadMyItems() {
    const container = document.getElementById("myItems");

    try {
        const response = await fetch(`${API_URL}/items/my-items`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message);
        }

        if (!data.items || data.items.length === 0) {
            container.innerHTML = "<p>You have not reported any items yet.</p>";
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
                <p><strong>Type:</strong> ${item.listingType}</p>
                <p><strong>Location:</strong> ${item.location}</p>
                <p><strong>Status:</strong> ${item.status}</p>
            </div>
        `).join("");

    } catch (error) {
        container.innerHTML = "Error loading items: " + error.message;
    }
}

async function loadMyClaims() {
    const container = document.getElementById("myClaims");

    try {
        const response = await fetch(`${API_URL}/claims/my-claims`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message);
        }

        if (!data.claims || data.claims.length === 0) {
            container.innerHTML = "<p>You have not submitted any claims.</p>";
            return;
        }

        container.innerHTML = data.claims.map(claim => `
            <div class="feature-card">
                <h3>${claim.item?.itemName || "Item unavailable"}</h3>
                <p><strong>Description:</strong> ${claim.description}</p>
                <p><strong>Claim Status:</strong> ${claim.status}</p>
            </div>
        `).join("");

    } catch (error) {
        container.innerHTML = "Error loading claims: " + error.message;
    }
}

loadMyItems();
loadMyClaims();