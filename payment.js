// payment.js
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

  // Function to retrieve user information
function retrieveUserInfo() {
    return new Promise((resolve, reject) => {
        const user = firebase.auth().currentUser;

        if (user) {
            const uid = user.uid;

            // Fetch user data from the Realtime Database
            firebase.database().ref(`users/${uid}`).once("value")
                .then((snapshot) => {
                    const userData = snapshot.val();
                    console.log("userData:", userData); // For debugging

                    if (userData && userData.cardnumberid) {
                        resolve({
                            email: userData.email,
                            name: userData.name || "N/A",
                            phoneNumber: userData.telephoneid || "N/A",
                            cardNumberId: userData.cardnumberid,
                            credit: userData.credit || 0, // Ensure credit is correctly assigned
                        });
                    } else {
                        reject(new Error("User data or cardnumberid not found."));
                    }
                })
                .catch((error) => {
                    reject(error);
                });
        } else {
            reject(new Error("No user signed in."));
        }
    });
}

// Function to check the card touch operation
function checkCardTouchOperation() {
    // Ensure the user is signed in
    const user = firebase.auth().currentUser;

    if (!user) {
        return Promise.reject(new Error("No user signed in."));
    }

    let currentUserCredit; // Retrieve current user credit
    let currentUserCardNumberId; // Declare currentUserCardNumberId

    // Retrieve user information using the existing function
    return retrieveUserInfo()
        .then((userInfo) => {
            // Extract cardNumberId from the user information
            currentUserCardNumberId = userInfo.cardNumberId;
            currentUserCredit = userInfo.credit || 0; // Assuming default value is 0
            console.log("currentUserCardNumberId before comparison:", currentUserCardNumberId); // For debugging

            console.log("getcurrentusercredit:", currentUserCredit);

            // Assuming you have a "cardtouch" node in your Firebase Realtime Database
            const cardTouchRef = firebase.database().ref("cardtouch");

            // Use once() to retrieve initial data and then on() to listen for real-time changes
            cardTouchRef.once("value").then((initialSnapshot) => {
                // Handle the initial data, if needed

                // Use on() to listen for real-time changes
                cardTouchRef.on("child_added", (snapshot) => {
                    handleCardTouchData(snapshot.val());
                });

                cardTouchRef.on("child_changed", (snapshot) => {
                    handleCardTouchData(snapshot.val());
                });

                cardTouchRef.on("child_removed", (snapshot) => {
                    // Handle the case where a card touch is removed, if needed
                });
            });

            function handleCardTouchData(cardTouchData) {
                const randomKey = cardTouchData.id;
                console.log("CardTouchData received:", cardTouchData);

                // Ensure that cardTouchData has the expected properties
                if (!cardTouchData || typeof cardTouchData.id === 'undefined') {
                    console.log("CardTouchData is invalid. Showing error form.");
                    // Handle the case where cardTouchData is invalid
                    return;
                }

                const cardTouchIdString = String(cardTouchData.id);

                // Convert both values to strings
                const currentUserCardNumberIdString = String(currentUserCardNumberId);

                console.log("Converted currentUserCardNumberIdString:", currentUserCardNumberIdString); // For debugging
                console.log("Converted cardTouchIdString:", cardTouchIdString); // For debugging

                if (currentUserCardNumberIdString === cardTouchIdString) {
                    // If card numbers match, show "Checking your credit balance..." form
                    console.log("Card numbers match. Showing 'Checking your credit balance...' form.");

                    // Assuming you have a "cart" node in your Firebase Realtime Database
                    const cartTotalRef = firebase.database().ref("cart/total");

                    // Retrieve total cart price from Firebase
                    cartTotalRef.once("value")
                        .then((cartSnapshot) => {
                            const totalCartPrice = cartSnapshot.val();
                            console.log("Total Cart Price:", totalCartPrice);

                            // Check if the user's credit is greater than or equal to the total cart price
                            if (currentUserCredit >= totalCartPrice) {
                                console.log("User has enough credit. Showing 'Payment Successful' form.");

                                // Subtract the total cart price from the user's credit
                                const newCredit = currentUserCredit - totalCartPrice;

                                // Update the user's credit in the Realtime Database
                                firebase.database().ref(`users/${user.uid}/credit`).set(newCredit)
                                    .then(() => {
                                        console.log("User credit updated successfully.");

                                        // Set the users/payment to true
                                        firebase.database().ref(`payment`).set(true)
                                            .then(() => {
                                                console.log("Payment status updated to true.");

                                                // Close any existing forms
                                                closeExistingForms();

                                                // Create a new form for "Payment Successful"
                                                const successForm = document.createElement('div');
                                                successForm.className = 'confirmation-form';
                                                successForm.innerHTML = `
                                                    <p>Payment Successful!</p>
                                                    <button id="okButton">OK</button>
                                                `;

                                                // Append the successForm to the body
                                                document.body.appendChild(successForm);

                                                // Add event listener to the "OK" button
                                                successForm.querySelector('#okButton').addEventListener('click', () => {
                                                    // Navigate to printreceipt.html
                                                    window.location.href = 'printreceipt.html';
                                                });
                                            })
                                            .catch((error) => {
                                                console.error("Error updating payment status:", error);
                                            });
                                    })
                                    .catch((error) => {
                                        console.error("Error updating user credit:", error);
                                    });
                            } else {
                                console.log("User does not have enough credit. Showing 'Payment Failed' form.");

                                // Close any existing forms
                                closeExistingForms();

                                // Create a new form for "Payment Failed"
                                const failedForm = document.createElement('div');
                                failedForm.className = 'confirmation-form';
                                failedForm.innerHTML = `<p>Payment Failed. Insufficient credit.</p><button id="cancelOperation">Cancel</button>`;

                                // Add event listener to the "Cancel" button
                                failedForm.querySelector('#cancelOperation').addEventListener('click', () => {
                                    // Delete the cardtouch node in Firebase
                                    deleteCardTouchNode()
                                        .then(() => {
                                            // Reload the page after deleting the cardtouch node
                                            location.reload();
                                        })
                                        .catch((error) => {
                                            console.error("Error deleting cardtouch node:", error);
                                        });
                                });

                                document.body.appendChild(failedForm);
                            }
                        })
                        .catch((error) => {
                            console.error("Error retrieving cart total:", error);
                        });
                } else {
                    console.log("Card numbers don't match. Showing 'Card does not recognized. Please try again.' form.");

                    // Close any existing forms
                    closeExistingForms();

                    // If card numbers don't match, show "Card does not recognized. Please try again." form
                    const resultForm = document.createElement('div');
                    resultForm.className = 'confirmation-form';
                    resultForm.innerHTML = `<p>Card does not recognized. Please try again.</p><button id="cancelOperation">Cancel</button>`;

                    // Add event listener to the "Cancel" button
                    resultForm.querySelector('#cancelOperation').addEventListener('click', () => {
                        // Delete the cardtouch node in Firebase
                        deleteCardTouchNode()
                            .then(() => {
                                // Reload the page after deleting the cardtouch node
                                location.reload();
                            })
                            .catch((error) => {
                                console.error("Error deleting cardtouch node:", error);
                            });
                    });

                    document.body.appendChild(resultForm);
                }
            }
        })
        .catch((error) => {
            console.error("Error listening to cardtouch data changes:", error);
        });
}








// Function to delete the cardtouch node in Firebase
function deleteCardTouchNode() {
    return new Promise((resolve, reject) => {
        const cardTouchRef = firebase.database().ref("cardtouch");

        cardTouchRef.remove()
            .then(() => {
                console.log("cardtouch node deleted successfully.");
                resolve();
            })
            .catch((error) => {
                console.error("Error deleting cardtouch node:", error);
                reject(error);
            });
    });
}

// Function to close any existing forms
function closeExistingForms() {
    const existingForms = document.querySelectorAll('.confirmation-form');
    existingForms.forEach((form) => {
        document.body.removeChild(form);
    });
}

// Event listener for the NFCcardButton click
document.getElementById('NFCcardButton').addEventListener('click', async function () {
    try {
        // Show a confirmation dialog before proceeding
        const userConfirmed = await showConfirmationDialog();
        
        if (userConfirmed) {
            // Add an authentication state change listener
            firebase.auth().onAuthStateChanged(async function (user) {
                if (user) {
                    // User is signed in
                    // Call the function to show the please touch your card to the reader form
                    showPleaseTouchForm();

                    // Check the card touch operation
                    await checkCardTouchOperation();
                } else {
                    // No user is signed in
                    console.log("No user is signed in.");
                }
            });
        } else {
            // User canceled the operation
            console.log("User canceled the operation.");
        }
    } catch (error) {
        console.error("Error in NFCcardButton click event:", error);
    }
});

// Function to show the confirmation dialog
function showConfirmationDialog() {
    return new Promise((resolve) => {
        // Close any existing forms
        closeExistingForms();

        // Create a new confirmation dialog
        const confirmationDialog = document.createElement('div');
        confirmationDialog.className = 'confirmation-dialog';
        confirmationDialog.innerHTML = `
            <p>Are you sure to pay with NFC card?</p>
            <button id="confirmButton">Confirm</button>
            <button id="cancelButton">Cancel</button>
        `;

        // Append the confirmationDialog to the body
        document.body.appendChild(confirmationDialog);

        // Add event listeners to the "Confirm" and "Cancel" buttons
        confirmationDialog.querySelector('#confirmButton').addEventListener('click', () => {
            resolve(true); // User confirmed
            // Close the confirmation dialog
            document.body.removeChild(confirmationDialog);
        });

        confirmationDialog.querySelector('#cancelButton').addEventListener('click', () => {
            resolve(false); // User canceled
            // Close the confirmation dialog
            document.body.removeChild(confirmationDialog);
        });
    });
}

// Function to show the please touch your card to the reader form
function showPleaseTouchForm() {
    // Close any existing forms
    closeExistingForms();

    // Create a new form for confirmation
    const pleaseTouchForm = document.createElement('div');
    pleaseTouchForm.className = 'confirmation-form';
    pleaseTouchForm.innerHTML = `<p>Please touch your card to the reader.</p>`;

    // Append the pleaseTouchForm to the body
    document.body.appendChild(pleaseTouchForm);
}

