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


// Function to set the payment node in Firebase to true
function setPaymentNodeToTrue() {
    return firebase.database().ref('payment').set(true);
}

  // Function to delete trolley/trolley1/item in Firebase
function deleteTrolleyItem() {
    return firebase.database().ref('trolley/trolley1/item').remove();
}

// Function to delete cardtouch node in Firebase
function deleteCardTouch() {
    return firebase.database().ref('cardtouch').remove();
}

// Function to delete cart node in Firebase
function deleteCart() {
    return firebase.database().ref('cart').remove();
}

// Function to handle the "Back To Homepage" button click
function backToHomepage() {
    // Call functions to delete data from Firebase
    Promise.all([deleteTrolleyItem(), deleteCardTouch(), deleteCart()])
        .then(() => {
            // Redirect to signin.html
            window.location.href = "index.html";
        })
        .catch(error => {
            console.error("Error deleting data", error);
            // Redirect to signin.html even if there's an error (adjust as needed)
            window.location.href = "index.html";
        });
}


// Function to be executed when the page is loaded
function onPageLoad() {
    // Set the payment node to true
    setPaymentNodeToTrue()
        .then(() => {
            console.log("Payment node set to true successfully");
        })
        .catch(error => {
            console.error("Error setting payment node to true", error);
        });
}

// Attach the backToHomepage function to the button click event
document.addEventListener("DOMContentLoaded", function () {
    var backButton = document.querySelector(".back-to-homepage");
    if (backButton) {
        backButton.addEventListener("click", backToHomepage);
    }

    onPageLoad();
});