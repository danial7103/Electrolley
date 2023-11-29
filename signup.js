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

// Reference your Realtime Database
var contactFormDB = firebase.database().ref("users");

// Initialize Firebase Authentication
const auth = firebase.auth();

document.getElementById("users").addEventListener("submit", submitForm);

function submitForm(e) {
    e.preventDefault();

    var name = getElementVal("name");
    var emailid = getElementVal("emailid");
    var passwordid = getElementVal("passwordid");
    var telephoneid = getElementVal("telephoneid");
    var cardnumberid = getElementVal("cardnumberid");

    // Create a new user with Firebase Authentication
    auth.createUserWithEmailAndPassword(emailid, passwordid)
        .then((userCredential) => {
            // User signed up successfully
            var user = userCredential.user;

            // Save user data to the Realtime Database
            saveUserData(user.uid, name, emailid, passwordid, telephoneid, cardnumberid);

            // Enable alert
            document.querySelector(".alert").style.display = "block";

            // Remove the alert after a delay
            setTimeout(() => {
                document.querySelector(".alert").style.display = "none";
            }, 3000);

            // Reset the form
            document.getElementById("users").reset();
        })
        .catch((error) => {
            console.error("Error signing up:", error);

            // Handle signup error, e.g., display an error message to the user
        });
}

const saveUserData = (userId, name, email, passwordid, telephoneid, cardnumberid) => {
    var userRef = contactFormDB.child(userId);

    userRef.set({
        name: name,
        email: email,
        telephoneid: telephoneid,
        cardnumberid: cardnumberid,
        credit: 100.00,
        // You can add more user data fields here as needed
    });
};

const getElementVal = (id) => {
    return document.getElementById(id).value;
};