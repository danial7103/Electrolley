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

    // Get a reference to the database service
    const database = firebase.database();
    
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

    // Function to fetch items from Firebase Realtime Database and display pagination
function fetchItems(startIndex, endIndex, itemsPerRowTop, itemsPerRowBottom) {
    const inventoryRef = database.ref('Inventory'); // Reference to your Inventory node
  
    inventoryRef.once('value', (snapshot) => {
      const items = snapshot.val(); // Retrieve all items
      const productContainer = document.getElementById('productContainer');
      productContainer.innerHTML = ''; // Clear the container before re-rendering
  
      let count = 0;
      let topItems = [];
      let bottomItems = [];
  
      // Loop through each item and divide them into top and bottom arrays
      for (let itemId in items) {
        if (count >= startIndex && count < endIndex) {
          const item = items[itemId];
          if (count < startIndex + itemsPerRowTop) {
            topItems.push(item);
          } else {
            bottomItems.push(item);
          }
        }
        count++;
      }
  
      // Function to generate HTML for items array and append to product container
      const generateHTML = (itemsArray) => {
        itemsArray.forEach((item) => {
          const productDiv = document.createElement('div');
          productDiv.className = 'pro';
          productDiv.onclick = function() {
            window.location.href = `sproduct${item.BarcodeID}.html`;
          };
  
          productDiv.innerHTML = `
            <img src="${item.ImageURL}" alt="${item.Name}">
            <div class="des">
              <span>${item.Name}</span>
              <div class="star">
                <i class="fas fa-star"></i>
                <i class="fas fa-star"></i>
                <i class="fas fa-star"></i>
                <i class="fas fa-star"></i>
                <i class="fas fa-star"></i>
            </div>
              <h4>RM ${item.Price}</h4>
              <div class="icons">
              <a href="#"><i class="fas fa-shopping-cart cart"></i></a>
            </div>
            </div>
          `;
  
          productContainer.appendChild(productDiv);
        });
      };
  
      // Display the top items at the top
      generateHTML(topItems);
  
      // Display the bottom items at the bottom
      generateHTML(bottomItems);
    });
  }
  
  // Function to display items for the first pagination (4 items above, 4 items below)
  function displayFirstPagination() {
    fetchItems(0, 8, 4, 4); // Display items for the first pagination
  }
  
  // Function to display items for the second pagination (4 items above, 3 items below)
  function displaySecondPagination() {
    fetchItems(8, 16, 4, 4); // Display items for the second pagination
  }

  // Function to display items for the second pagination (4 items above, 3 items below)
  function displayThirdPagination() {
    fetchItems(16, 18, 1, 1); // Display items for the second pagination
  }
  
  // Event listener for the first pagination link
  document.getElementById('pagination').addEventListener('click', function(event) {
    if (event.target.textContent === '1') {
      displayFirstPagination(); // Display items for the first pagination when clicked
    } else if (event.target.textContent === '2') {
      displaySecondPagination(); // Display items for the second pagination when clicked
    } else if (event.target.textContent === '3') {
      displayThirdPagination(); // Display items for the second pagination when clicked
    }
  });
  
  // Call the function to display the first page when the window loads
  window.onload = function() {
    displayFirstPagination(); // Display items for the first pagination initially
  };
