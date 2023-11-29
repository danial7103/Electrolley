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

// Reference the "receipt" node in the Realtime Database
let receiptRef = firebase.database().ref("receipt");
  

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
                            name: userData.name || "N/A",
                            phoneNumber: userData.telephoneid || "N/A",
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
        console.log("Retrieved Cart Data for Invoice:", cartItems);
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
        const maskedPhoneNumber = maskPhoneNumber(userInfo.phoneNumber);

        const userContainer = document.createElement('div');
        userContainer.innerHTML = `
            <p>Email: ${userInfo.email}</p>
            <p>Name: ${userInfo.name}</p>
            <p>Phone Number: ${maskedPhoneNumber}</p>
            <hr>
        `;
        invoiceContainer.appendChild(userContainer);

        const table = document.createElement('table');
        table.style.width = '100%';

        const headerRow = document.createElement('tr');
        headerRow.innerHTML = `
            <th>Item</th>
            <th>Price</th>
            <th>Quantity</th>
            <th>Total Price</th>
            <hr>
        `;
        table.appendChild(headerRow);

        if (Array.isArray(cartItems)) {
            cartItems.forEach((item) => {
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
        }

        invoiceContainer.appendChild(table);

        const totalContainer = document.createElement('div');
        totalContainer.innerHTML = `<strong>Total Price: RM${getTotalPrice(cartItems).toFixed(2)}</strong>`;
        invoiceContainer.appendChild(totalContainer);

        // Add a button to trigger the printing of the physical receipt
        const printButton = document.createElement('button');
        printButton.textContent = 'Print Receipt';
        printButton.id = 'printReceiptPhysical';
        printButton.addEventListener('click', () => {
            sendCartDataToReceiptNode(cartItems);
        });

        invoiceContainer.appendChild(printButton);

    } catch (error) {
        console.error("Error updating invoice with user information:", error);
    }
}

async function sendCartDataToReceiptNode(cartItems) {
    try {
        const user = firebase.auth().currentUser;

        if (user) {
            const uid = user.uid;

            // Retrieve user information
            const userInfo = await retrieveUserInfo();

            // Get the current receipt count
            const receiptCount = await getReceiptCount(uid);

            // Create a custom receipt ID
            const receiptId = `receipt${receiptCount + 1}`;

            // Calculate the total price
            const totalPrice = getTotalPrice(cartItems);

            // Set the receipt data under the custom receipt ID
            const receiptNode = receiptRef.child(uid).child(receiptId);

            // Set the receipt data
            receiptNode.set({
                user: {
                    email: userInfo.email,
                    cardNumber: userInfo.cardNumber || "N/A", // Replace with actual card number property
                    phoneNumber: userInfo.phoneNumber,
                },
                items: cartItems,
                totalPrice: totalPrice, // Include the total price
                timestamp: firebase.database.ServerValue.TIMESTAMP
            });

            // Set the "print" node to true at the root level
            const printNode = firebase.database().ref("print");
            printNode.set(true);

            console.log("Receipt data and print flag sent to Firebase successfully!");
        } else {
            console.error("No user signed in.");
        }
    } catch (error) {
        console.error("Error sending receipt data and print flag to Firebase:", error);
    }
}


async function getReceiptCount(uid) {
    try {
        const snapshot = await receiptRef.child(uid).once("value");
        const receipts = snapshot.val();
        return receipts ? Object.keys(receipts).length : 0;
    } catch (error) {
        console.error("Error getting receipt count:", error);
        throw error;
    }
}


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

window.addEventListener('load', async () => {
    try {
        const cartItems = await retrieveCartDataForInvoice();
        updateInvoiceWithUserInfo(cartItems);
    } catch (error) {
        console.error("Error initializing invoice:", error);
    }
});









