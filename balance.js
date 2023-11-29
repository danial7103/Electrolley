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
  
  // Reference your Realtime Database
  var contactFormDB = firebase.database().ref("users");
  
  // Initialize Firebase Authentication
  const auth = firebase.auth();

      // Function to display a notification when the cart button is clicked
document.getElementById('cart-button').addEventListener('click', function() {
  // Create a notification element
  const notification = document.createElement('div');
  notification.textContent = 'To check the cart items please get back to home page'; // Customize the notification message
  notification.className = 'cart-notification'; // Add a class for styling

  // Append the notification to the body or a specific container
  document.body.appendChild(notification);

  // Automatically remove the notification after a certain duration (e.g., 3 seconds)
  setTimeout(function() {
      notification.remove(); // Remove the notification after 3 seconds (adjust the duration as needed)
  }, 3000); // Duration in milliseconds (e.g., 3000 milliseconds = 3 seconds)
});

  // Add click event listener to user icon
document.getElementById('User').addEventListener('click', function() {
  const dropdown = document.getElementById('userDropdown');
  dropdown.classList.toggle('active');
});

// Hide dropdown when clicking outside the user icon
window.addEventListener('click', function(event) {
  const dropdown = document.getElementById('userDropdown');
  const userIcon = document.getElementById('User');
  if (!userIcon.contains(event.target)) {
      dropdown.classList.remove('active');
  }
});

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

// Add click event listener to the logout button
document.addEventListener("DOMContentLoaded", function() {
  var logoutButton = document.getElementById("logout-button");
  if (logoutButton) {
      logoutButton.addEventListener("click", function(event) {
          event.preventDefault(); // Prevent default link behavior
          backToHomepage(); // Call the backToHomepage function
      });
  }
});

  // Function to update the displayed credit in the HTML
function updateCreditDisplay(userId) {
    contactFormDB.child(userId).child('credit').once('value')
      .then((snapshot) => {
        const currentCredit = snapshot.val() || 0;
        document.getElementById('creditDisplay').innerText = `Credit: ${currentCredit.toFixed(2)}`;
      })
      .catch((error) => {
        console.error("Error fetching user credit:", error);
      });
  }
  
  // Check if a user is currently signed in
  auth.onAuthStateChanged((user) => {
    if (user) {
      // User is signed in, fetch user data and update credit display
      contactFormDB.once('value')
        .then((snapshot) => {
          snapshot.forEach((childSnapshot) => {
            const userId = childSnapshot.key;
            const userData = childSnapshot.val();
  
            if (userId === user.uid && userData.credit !== undefined) {
              // Display the user's credit in the HTML
              updateCreditDisplay(userId);
            }
          });
        })
        .catch((error) => {
          console.error("Error fetching user data:", error);
        });
  
      // Update the displayed credit whenever there's a change in the database
      contactFormDB.child(user.uid).child('credit').on('value', (snapshot) => {
        const currentCredit = snapshot.val() || 0;
        document.getElementById('creditDisplay').innerText = `Credit: ${currentCredit.toFixed(2)}`;
      });
    } else {
      console.log("No user is signed in.");
      // Handle the case when no user is signed in
    }
  });
  
  function openTopUpForm() {
    // Display the top-up form
    document.getElementById('topUpForm').style.display = 'block';
  }
  
  function cancelTopUp() {
    // Hide the top-up form
    document.getElementById('topUpForm').style.display = 'none';
  }
  
  function confirmTopUp() {
    // Perform the top-up logic here
    topUpCredit();
  
    // Hide the top-up form after confirming
    document.getElementById('topUpForm').style.display = 'none';
  }
  
  // Function to top up the user's credit by 50.00
  function topUpCredit() {
    auth.onAuthStateChanged((user) => {
      if (user) {
        // Fetch the user's current credit
        contactFormDB.child(user.uid).child('credit').once('value')
          .then((snapshot) => {
            const currentCredit = snapshot.val() || 0;
            const newCredit = currentCredit + 50.00;
  
            // Update the credit in Firebase
            contactFormDB.child(user.uid).child('credit').set(newCredit);
  
            // Update the displayed credit in the HTML immediately
            document.getElementById('creditDisplay').innerText = `Credit: ${newCredit.toFixed(2)}`;
          })
          .catch((error) => {
            console.error("Error fetching user credit:", error);
          });
      } else {
        console.log("No user is signed in.");
        // Handle the case when no user is signed in
      }
    });
  }
