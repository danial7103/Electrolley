const payBtn = document.querySelector('.creditCardButton');

payBtn.addEventListener('click', () => {
    fetch('https://poto-97e16.web.app//create-checkout-session', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            items: JSON.parse(localStorage.getItem('cart-items')),
        }),
    })
    .then((res) => {
        if (!res.ok) {
            throw new Error('Failed to initiate payment');
        }
        return res.json(); // Parse the response as JSON
    })
    .then((data) => {
        // Ensure the response contains the sessionId property
        if (data && data.sessionId) {
            // Initialize Stripe with your public key
            const stripe = Stripe('pk_test_51OBLSIIi9rV9aQEN3LI7bVIJMn98JODSZx1xrrfnSxrphlrbtFurSimeLBOzCNwQhxnbizpyqfr0REymRQJ2r3R600kIFKnLzy'); // Replace with your public key
            // Redirect to the Stripe checkout page using the session ID
            stripe.redirectToCheckout({ sessionId: data.sessionId });
        } else {
            throw new Error('Invalid response from server');
        }
    })
    .catch((err) => console.error(err));
});
