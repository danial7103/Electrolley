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
  
  let closeShopping = document.querySelector('.closeShopping');
        let OpenShopping = document.querySelector('.OpenShopping');
        let cart = document.getElementById('cart');
  
        OpenShopping.addEventListener('click', () => {
          cart.style.right = '0px'; // Adjust the value as needed to hide the cart
          });
  
        closeShopping.addEventListener('click', () => {
        cart.style.right = '-800px'; // Adjust the value as needed to hide the cart
        });
  
  // Reference the "trolley/trolley1/item" node in the Realtime Database
  var trolleyRef = firebase.database().ref("trolley/trolley1/item");
  
  // Reference the "Inventory" node
  var inventoryRef = firebase.database().ref("Inventory");
  // Reference the "cart" node in the Realtime Database
let cartRef = firebase.database().ref("cart");

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

  // Function to retrieve the data from BarcodeID in Inventory
  function retrieveInventoryBarcodeData(itemNumber) {
    return new Promise((resolve, reject) => {
        inventoryRef.child("Item" + itemNumber).once("value", function (snapshot) {
            var inventoryItemData = snapshot.val();
            console.log("Inventory Item" + itemNumber + " Data:", inventoryItemData); // Log retrieved data
            resolve(inventoryItemData);
        });
    });
  }
  
  function changeQuantity(index, change) {
    const item = cartItems[index];
    const oldQuantity = item.quantity;
  
    // Update the quantity
    item.quantity += change;
  
    if (item.quantity < 0) {
      item.quantity = 0;
    }
  
    // Update the total price for the item based on the new quantity
    item.totalPrice = item.price * item.quantity;
  
    // Update the cart item in the cartItems array
    cartItems[index] = item;
  
    // Update the cart display
    updateCart();
  
    // If the quantity has changed, you may want to also update the table to reflect the change
    if (oldQuantity !== item.quantity) {
      updateTable();
    }
  }
  
  
  
// Function to update the table with matched product data
// Function to update the table with matched product data
function updateTable() {
    const productTableBody = document.getElementById('productTableBody');
    productTableBody.innerHTML = ''; // Clear the table body

    if (matchedProducts.length > 0) {
        const newestProduct = matchedProducts[matchedProducts.length - 1]; // Get the newest product

        matchedProducts.forEach((product) => {
            const row = document.createElement('tr');
            const imageCell = document.createElement('td');
            const combinedCell = document.createElement('td'); // Create a single cell for name, price, and barcodeID
            const addToCartCell = document.createElement('td'); // Add a new cell for Add to Cart button

            // Add an image element to the imageCell with the product image
            imageCell.innerHTML = `<img src="${product.image}" alt="${product.name}">`;

            // Combine name, price, and barcodeID and apply a class for styling
            combinedCell.classList.add('productDetails'); // Add a class to style name, price, and barcodeID
            combinedCell.innerHTML = `
                <p class="productName">${product.name}</p>
                <p class="productPrice">RM:${product.price}</p>
                <p class="productBarcode">${product.barcodeID}</p>
            `;

            // Create and configure the "Add to Cart" button
            const addToCartButton = document.createElement('button');
            addToCartButton.textContent = 'Add to Cart';
            addToCartButton.classList.add('addToCartButton'); // Add a class to the button
            addToCartButton.addEventListener('click', () => addToCart(product));

            // Append the button to the addToCartCell
            addToCartCell.appendChild(addToCartButton);

            // Append cells to the row
            row.appendChild(imageCell);
            row.appendChild(combinedCell); // Add the combined cell for name, price, and barcodeID
            row.appendChild(addToCartCell); // Add the Add to Cart cell

            // Hide rows that are not the newest item
            if (product !== newestProduct) {
                row.style.display = 'none';
            }

            // Append the row to the table body
            productTableBody.appendChild(row);
        });
    }
}




// Function to handle the "Add to Cart" button click
function addToCart(product) {
     // Check if the product already exists in the cart
     const existingItem = cartItems.find(item => item.barcodeID === product.barcodeID);

     if (existingItem) {
         // If the product exists, increase the quantity
         existingItem.quantity += 1;
         existingItem.totalPrice = existingItem.quantity * existingItem.price;
     } else {
    // Add the selected product to the cart
    cartItems.push({
        name: product.name,
        image: product.image,
        price: product.price,
        barcodeID: product.barcodeID,
        quantity: 1, // Set initial quantity to 1
        totalPrice: product.price, // Set initial total price to the product price
    });
    }

    // Call the updateCart() function to refresh the cart
    updateCart();

     // Save the cart items after modification
     saveCartItems(cartItems);   
}

// Function to remove an item from the cart
function removeItem(index) {
    cartItems.splice(index, 1); // Remove the item at the specified index
    updateCart(); // Update the cart after removing the item

    // Save the cart items after modification
    saveCartItems(cartItems);
}

  window.addEventListener('load', observeTableChanges);
  
  const matchedProducts = [];
  
    // Function to check if a product matches and add it to the matchedProducts array
    function checkAndAddToMatchedProducts(trolleyData, inventoryData) {
        if (String(trolleyData.BarcodeID) === String(inventoryData.BarcodeID)) {
          matchedProducts.push({ name: inventoryData.Name, price: inventoryData.Price, image: inventoryData.ImageURL, barcodeID: inventoryData.BarcodeID });
          updateTable(); // Update the table when a match is found
        }
      }
      
      async function retrieveInventoryBarcodeDataWrapper(itemNumber) {
        try {
          const data = await retrieveInventoryBarcodeData(itemNumber);
          return data;
        } catch (error) {
          console.error(`Error retrieving Inventory Item${itemNumber} data:`, error);
          return null;
        }
      }
      
      async function initializePage() {
        const inventoryItemDataArray = [];
      
        for (let i = 1; i <= 25; i++) {
          const inventoryItemData = await retrieveInventoryBarcodeDataWrapper(i);
          inventoryItemDataArray.push(inventoryItemData);
          console.log(`Inventory Item${i} Data:`, inventoryItemData);
        }
      
        listenForNewItems(inventoryItemDataArray);
      }
      
      function listenForNewItems(inventoryItemDataArray) {
        trolleyRef.on("child_added", function (snapshot) {
          const trolleyBarcodeData = snapshot.val();
          const trolleyConvertedData = { BarcodeID: trolleyBarcodeData.id };
          console.log("Trolley Barcode Data:", trolleyConvertedData);
      
          // Check for matches
          const matchedItem = findMatchingItem(trolleyConvertedData, inventoryItemDataArray);
      
          if (!matchedItem) {
            // Display a message when the barcode ID doesn't match
            alert("Sorry, item is not recognized. Please scan other items");
          } else {
            // Process the matched product
            checkAndAddToMatchedProducts(trolleyConvertedData, matchedItem);
            updateTable();
          }
        });
      }
      
      function findMatchingItem(trolleyConvertedData, inventoryItemDataArray) {
        for (const inventoryItemData of inventoryItemDataArray) {
          if (inventoryItemData !== null && String(trolleyConvertedData.BarcodeID) === String(inventoryItemData.BarcodeID)) {
            return inventoryItemData;
          }
        }
        return null;
      }


    
  
window.addEventListener('load', () => {
    listenForNewItems();
    initializePage();
});
  
  // Define a variable to store the cart items
  let cartItems = [];

  
  
  // Call the observeTableChanges function when the page loads
  window.addEventListener('load', observeTableChanges);

  function saveCartItems(cartItems) {
    // Here you can define how you want to save the cart items
    // For instance, you can use localStorage or any other storage method
    // This function can be customized as per your application requirements

    // For example, using localStorage:
    localStorage.setItem('cart-items', JSON.stringify(cartItems));
    }

// Function to update the cart list and calculate total price
function updateCart() {
    const cartItemsList = document.getElementById('cart-items');
    cartItemsList.innerHTML = '';
    let totalCartPrice = 0;

    // Check if cartItems is an object and has an 'items' property before attempting to iterate over it
    if (typeof cartItems === 'object' && cartItems.hasOwnProperty('items')) {
        cartItems = cartItems.items; // Extract the 'items' property
    }


    // Check if cartItems is an array before attempting to iterate over it
    if (Array.isArray(cartItems)) {
        cartItems.forEach((item, index) => {
            if (item.quantity > 0) {
                const listItem = document.createElement('li');
                listItem.innerHTML = `
                    <img src="${item.image}" alt="${item.name}" class="cart-img">
                    <div class="detail-box">
                        <div class="cart-details-row">
                            <div class="cart-name">${item.name}</div>
                            &nbsp&nbsp&nbsp<div class="cart-price">${item.price}</div>
                        </div>
                        <div class="cart-details-row">
                            <div class="cart-quantity">${item.quantity}</div>
                        </div>
                        <div class="cart-details-row">
                            <div class="cart-total">RM:${(item.price * item.quantity).toFixed(2)}</div>
                            <div class="cart-actions">
                                <button class="change-Quantity"  onclick="changeQuantity(${index}, -1)">-</button>
                                <button class="remove-item" onclick="removeItem(${index})">
                                <i class="fas fa-trash-alt"></i> <!-- Font Awesome trash icon -->
                              </button>
                            </div>
                        </div>
                    </div>`;

                // Add a class to the outer div for better styling
                listItem.classList.add('cart-item');

                cartItemsList.appendChild(listItem);
                totalCartPrice += item.price * item.quantity;
            }
        });
    } else {
        console.error("Cart data is not an array:", cartItems);
        // Handle the situation where cartItems is not an array (e.g., initialize cartItems as an empty array)
        cartItems = [];
    }

    const cartTotal = document.getElementById('totalPrice');
    cartTotal.textContent = totalCartPrice.toFixed(2);
    cartRef.set({
        items: cartItems,
        total: totalCartPrice, // Include the total price in the cart data
    })
        .then(() => {
            console.log("Cart data saved to Firebase:", cartItems);
        })
        .catch(error => {
            console.error("Error saving cart data to Firebase:", error);
        });
        
        // Save the cart items to localStorage
    saveCartItems(cartItems);
}
  
// Function to retrieve cart data from Firebase
async function retrieveCartData() {
    try {
        const snapshot = await cartRef.once("value");
        cartItems = snapshot.val() || [];
        console.log("Retrieved Cart Data:", cartItems);
    } catch (error) {
        console.error("Error retrieving cart data:", error);
        throw error;
    }
}

// Call retrieveCartData and updateCart when the page loads
window.addEventListener('load', async () => {
    try {
        await retrieveCartData();
        updateCart();
    } catch (error) {
        console.error("Error initializing cart:", error);
    }
});
  
  
  // Function to observe changes in the table and trigger data retrieval
  function observeTableChanges() {
    const table = document.querySelector('table');
    const observer = new MutationObserver(retrieveDataFromTable);
    const config = { childList: true, subtree: true };
    observer.observe(table, config);
  }
  
  function showMessage(message) {
    // Customize this part based on your UI (for demonstration, using an alert)
    alert(message);
}
  // Call the observeTableChanges function when the page loads
  window.addEventListener('load', observeTableChanges);