const API_URL = "http://localhost:5000/api";

const token = localStorage.getItem("token");
const user = JSON.parse(localStorage.getItem("user") || "null");

// Check admin login
if (!token || !user || user.role !== "admin") {
    alert("Please login as an administrator.");
    window.location.href = "login.html";
}

// Logout function
function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    window.location.href = "login.html";
}

// Fetch dashboard statistics
async function loadStatistics() {
    const statisticsDiv = document.getElementById("statistics");

    try {
        const response = await fetch(`${API_URL}/claims/stats`, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message);
        }

        const stats = data.statistics;

        statisticsDiv.innerHTML = `
            <div class="feature-grid">

                <div class="feature-card">
                    <h3>Total Students</h3>
                    <h2>${stats.totalStudents}</h2>
                </div>

                <div class="feature-card">
                    <h3>Total Items</h3>
                    <h2>${stats.totalItems}</h2>
                </div>

                <div class="feature-card">
                    <h3>Lost Items</h3>
                    <h2>${stats.totalLostItems}</h2>
                </div>

                <div class="feature-card">
                    <h3>Found Items</h3>
                    <h2>${stats.totalFoundItems}</h2>
                </div>

                <div class="feature-card">
                    <h3>Pending Claims</h3>
                    <h2>${stats.pendingClaims}</h2>
                </div>

                <div class="feature-card">
                    <h3>Approved Claims</h3>
                    <h2>${stats.approvedClaims}</h2>
                </div>

                <div class="feature-card">
                    <h3>Rejected Claims</h3>
                    <h2>${stats.rejectedClaims}</h2>
                </div>

            </div>
        `;

    } catch (error) {
        statisticsDiv.innerHTML = "Unable to load statistics: " + error.message;
    }
}

// Fetch all claims
async function loadClaims() {
    const claimsDiv = document.getElementById("claims");

    try {
        const response = await fetch(`${API_URL}/claims`, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message);
        }

        if (!data.claims || data.claims.length === 0) {
            claimsDiv.innerHTML = "<p>No claims available.</p>";
            return;
        }

        claimsDiv.innerHTML = data.claims.map(claim => `
            <div class="feature-card">
                <h3>${claim.item?.itemName || "Item unavailable"}</h3>

                <p><strong>Claimant:</strong>
                    ${claim.claimant?.name || "Unknown"}
                </p>

                <p><strong>Email:</strong>
                    ${claim.claimant?.email || "Not available"}
                </p>

                <p><strong>Claim Description:</strong>
                    ${claim.description}
                </p>

                <p><strong>Status:</strong>
                    ${claim.status.toUpperCase()}
                </p>

                ${
                    claim.status === "pending"
                    ? `
                        <button onclick="updateClaim('${claim._id}', 'approve')">
                            Approve
                        </button>

                        <button onclick="updateClaim('${claim._id}', 'reject')">
                            Reject
                        </button>
                    `
                    : ""
                }
            </div>
        `).join("");

    } catch (error) {
        claimsDiv.innerHTML = "Unable to load claims: " + error.message;
    }
}

// Approve or reject claims
async function updateClaim(claimId, action) {
    const confirmed = confirm(`Are you sure you want to ${action} this claim?`);

    if (!confirmed) {
        return;
    }

    try {
        const response = await fetch(
            `${API_URL}/claims/${claimId}/${action}`,
            {
                method: "PUT",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message);
        }

        alert(data.message);

        loadStatistics();
        loadClaims();

    } catch (error) {
        alert("Error: " + error.message);
    }
}

// Load dashboard information
loadStatistics();
loadClaims();