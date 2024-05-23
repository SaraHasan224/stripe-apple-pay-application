// This is your test secret API key.
const stripe = require("stripe")(process.env.STRIPE_KEY);
const express = require("express");
const app = express();
app.use(express.static("public"));

const YOUR_DOMAIN = "http://localhost:4242";

app.post("/create-checkout-session", async (req, res) => {
  let price;
  (async () => {
    const product = await stripe.products.create({
      name: "Product Name",
    });

    price = await stripe.prices.create({
      product: product.id,
      unit_amount: 20,
      currency: "usd",
    });

    console.log(`Product ID: ${product.id}`);
    console.log(`Price ID: ${price}`);
    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          // Provide the exact Price ID (for example, pr_1234) of the product you want to sell
          price: price.id,
          quantity: 5,
        },
      ],
      mode: "payment",
      success_url: `${YOUR_DOMAIN}/success.html`,
      cancel_url: `${YOUR_DOMAIN}/cancel.html`,
      automatic_tax: { enabled: true },
    });
    console.log("session: ", session);
    res.redirect(303, session.url);
  })();
});

app.listen(4242, () => console.log("Running on port 4242"));
