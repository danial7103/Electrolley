const firebaseConfig = {
    apiKey: "AIzaSyB9ZS9eQYrJNMhakjPedGGGR72Qgg41vIQ",
    authDomain: "poto-97e16.firebaseapp.com",
    databaseURL: "https://poto-97e16-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "poto-97e16",
    storageBucket: "poto-97e16.appspot.com",
    messagingSenderId: "723346352461",
  appId: "1:723346352461:web:335fa921789d59142aaf04"
  };

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();

document.getElementById("users").addEventListener("submit", function (e) {
    e.preventDefault();

    const email = document.getElementById("emailid").value;
    const password = document.getElementById("passwordid").value;

    auth.signInWithEmailAndPassword(email, password)
    .then((userCredential) => {
        // User signed in successfully
        const user = userCredential.user;
        console.log("Logged in user:", user);

        // Create a new "payment" node in the database and set its value to false
        const database = firebase.database();
        const paymentRef = database.ref('payment');

        paymentRef.set(false)
            .then(() => {
                console.log("Payment node created and updated successfully");
                // Redirect to main or another page
                window.location.href = "main.html";
            })
            .catch((databaseError) => {
                console.error("Error creating/updating payment node:", databaseError);
                document.getElementById("error-message").textContent = "Login successful, but there was an error creating/updating payment status.";
            });
    })
    .catch((error) => {
        const errorMessage = error.message;
        console.error("Login error:", errorMessage);
        document.getElementById("error-message").textContent = errorMessage;
    });
});