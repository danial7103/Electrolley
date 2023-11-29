// invoice.js

// Initialize Firebase
const firebaseConfig = {
    apiKey: "AIzaSyB9ZS9eQYrJNMhakjPedGGGR72Qgg41vIQ",
    authDomain: "poto-97e16.firebaseapp.com",
    databaseURL: "https://poto-97e16-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "poto-97e16",
    storageBucket: "poto-97e16.appspot.com",
    messagingSenderId: "723346352461",
    appId: "1:723346352461:web:335fa921789d59142aaf04"
    };
  
  firebase.initializeApp(firebaseConfig);

  // Reference the "trolley/trolley1/item" node in the Realtime Database
  var trolleyRef = firebase.database().ref("trolley/trolley1/item");
  
  // Reference the "Inventory" node
  var inventoryRef = firebase.database().ref("Inventory");
  // Reference the "cart" node in the Realtime Database
let cartRef = firebase.database().ref("cart");
  

// Function to retrieve user information from Firebase Authentication
async function retrieveUserInfo() {
    return new Promise((resolve, reject) => {
        firebase.auth().onAuthStateChanged(async (user) => {
            if (user) {
                // User is signed in
                try {
                    const uid = user.uid;

                    const snapshot = await firebase.database().ref(`users/${uid}`).once("value");
                    const userData = snapshot.val();

                    if (userData) {
                        resolve({
                            email: userData.email,
                            name: userData.name || "N/A", // Use name or default to "N/A"
                            phoneNumber: userData.telephoneid || "N/A", // Use telephoneid or default to "N/A"
                        });
                    } else {
                        reject(new Error("User data not found."));
                    }
                } catch (error) {
                    reject(error);
                }
            } else {
                // No user is signed in
                reject(new Error("No user signed in."));
            }
        });
    });
}



// Function to retrieve cart data from Firebase
async function retrieveCartDataForInvoice() {
    try {
        const snapshot = await firebase.database().ref("cart").once("value");
        const cartItems = snapshot.val() && snapshot.val().items ? snapshot.val().items : [];
        console.log("Retrieved Cart Data for Invoice:", cartItems); // Log cart items for debugging
        return cartItems;
    } catch (error) {
        console.error("Error retrieving cart data for invoice:", error);
        throw error;
    }
}

// Function to update the invoice based on user information and cart data
async function updateInvoiceWithUserInfo(cartItems) {
    try {
        const userInfo = await retrieveUserInfo();

        const invoiceContainer = document.getElementById('invoice-container');
         // Mask the last four digits of the phone number with stars
         const maskedPhoneNumber = maskPhoneNumber(userInfo.phoneNumber);

        // Display user information in the invoice
        const userContainer = document.createElement('div');
        userContainer.innerHTML = `
            <p>Email: ${userInfo.email}</p>
            <p>Name: ${userInfo.name}</p>
            <p>Phone Number: ${maskedPhoneNumber}</p>
            <hr>
        `;
        invoiceContainer.appendChild(userContainer);

        // Create a table for cart items
        const table = document.createElement('table');
        table.style.width = '100%';

        // Create a table header row
        const headerRow = document.createElement('tr');
        headerRow.innerHTML = `
            <th>Item</th>
            <th>Price</th>
            <th>Quantity</th>
            <th>Total Price</th>
            <hr>
        `;
        table.appendChild(headerRow);

        // Check if cartItems is an array before attempting to iterate over it
        if (Array.isArray(cartItems)) {
            cartItems.forEach((item) => {
                // Create a table row for each item
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${item.name}</td>
                    <td>${item.price}</td>
                    <td>${item.quantity}</td>
                    <td>${item.totalPrice.toFixed(2)}</td>
                `;
                table.appendChild(row);
            });
        } else {
            console.error("Cart data is not an array:", cartItems);
            // Handle the situation where cartItems is not an array
        }

        // Add the table to the invoice container
        invoiceContainer.appendChild(table);

        // Add total price to the invoice
        const totalContainer = document.createElement('div');
        totalContainer.innerHTML = `<strong>Total Price: RM${getTotalPrice(cartItems).toFixed(2)}</strong>`;
        invoiceContainer.appendChild(totalContainer);

    } catch (error) {
        console.error("Error updating invoice with user information:", error);
    }
}

// Function to calculate total price
function getTotalPrice(cartItems) {
    return cartItems.reduce((total, item) => total + item.totalPrice, 0);
}

function maskPhoneNumber(phoneNumber) {
    if (phoneNumber && phoneNumber.length >= 4) {
        const digitsToMask = phoneNumber.length - 4;
        const maskedDigits = '*'.repeat(digitsToMask) + phoneNumber.slice(-4);
        return maskedDigits;
    } else {
        return phoneNumber;
    }
}

// Call the updated function when the page loads
window.addEventListener('load', async () => {
    try {
        const cartItems = await retrieveCartDataForInvoice();
        updateInvoiceWithUserInfo(cartItems);
    } catch (error) {
        console.error("Error initializing invoice:", error);
    }
});
