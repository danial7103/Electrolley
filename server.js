import express from 'express';
import dotenv from 'dotenv';
import Stripe from 'stripe';
import cors from 'cors'; // Import the 'cors' package

dotenv.config();

const app = express();
app.use(express.static('public'));
app.use(express.json());

const stripe = new Stripe(process.env.stripe_key, {
  apiVersion: '2020-08-27', // Use the appropriate API version
});

app.use(cors({
  origin: 'https://poto-97e16.web.app/', // Specify the allowed origin
  methods: 'GET,POST', // Specify the allowed HTTP methods
  allowedHeaders: 'Content-Type,Authorization', // Specify the allowed headers
}));


app.get("/main", (req, res) => {
    res.sendFile("main.html", {root: "public"});
});

app.get("/Printreceipt", (req, res) => {
    res.sendFile("printreceipt.html", {root: "public"});
  });

app.get("/invoice", (req, res) => {
  res.sendFile("invoice.html", {root: "public"});
});

app.get("/Balance", (req, res) => {
    res.sendFile("balance.html", {root: "public"});
  });

app.get("/Payment", (req, res) => {
  res.sendFile("Payment.html", {root: "public"});
});

app.get("/Success", (req, res) => {
  res.sendFile("checkout.html", {root: "public"});
});

app.get("/Cancel", (req, res) => {
  res.sendFile("cancel.html", {root: "public"});
});

app.get("/Product", (req, res) => {
  res.sendFile("shop.html", {root: "public"});
});

app.get("/Signup", (req, res) => {
  res.sendFile("signup.html", {root: "public"});
});

app.get("/", (req, res) => {
  res.sendFile("index.html", {root: "public"});
});

app.post('https://poto-97e16.web.app//create-checkout-session', async (req, res) => {
  const { items } = req.body; // Assuming items contain necessary details for checkout

  if (!items || !Array.isArray(items)) {
    // Handle the case where items is null, undefined, or not an array
    res.status(400).send('Invalid items data');
    return;
  }

  // Ensure items is an array with valid data before using map
  const lineItems = items.map((item) => ({
    price_data: {
      currency: 'myr',
      product_data: {
        name: item.name,
        images: [item.image], // Assuming the item has an image URL
      },
      unit_amount: item.price * 100, // Amount in cents
    },
    quantity: item.quantity,
  }));

  try {
    // Create a Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: 'http://localhost:3000/checkout.html', // Change to your success URL
      cancel_url: 'http://localhost:3000/cancel.html', // Change to your cancel URL
    });

    res.json({ sessionId: session.id });
  } catch (error) {
    console.error('Error creating checkout session:', error.message);
    res.status(500).send('Error creating checkout session');
  }
});

app.listen(3000, () => {
  console.log('Server listening on port 3000');
});
