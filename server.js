const express = require("express");
const app = express();
// Load environment variables from .env file
require("dotenv").config();
app.use(express.static("public"));
// set the view engine to ejs
app.set("view engine", "ejs");
app.set("views", __dirname + "/views");

// checkout page
app.get("/", function (req, res) {
  res.render("pages/checkout", { appUrl: process.env.APP_URL });
});

// success page
app.get("/success", function (req, res) {
  res.render("pages/success");
});

// cancel page
app.get("/cancel", function (req, res) {
  res.render("pages/cancel");
});

app.post("/create-checkout-session", async (req, res) => {
  let price;
  // This is your test secret API key.
  const stripe = require("stripe")(process.env.STRIPE_KEY);
  (async () => {
    console.log("stripe key: ", process.env.STRIPE_KEY);
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
      success_url: process.env.APP_URL + `success`,
      cancel_url: process.env.APP_URL + `cancel`,
      automatic_tax: { enabled: true },
    });
    console.log("session: ", session);
    res.redirect(303, session.url);
  })();
});

app.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  (request, response) => {
    const sig = request.headers["stripe-signature"];

    let event;

    // This is your test secret API key.
    const stripe = require("stripe")(process.env.STRIPE_KEY);

    try {
      event = stripe.webhooks.constructEvent(
        request.rawBody,
        sig,
        process.env.STRIPE_WEBHHOK_SECRET
      );
    } catch (err) {
      response.status(400).send(`Webhook Error: ${err.message}`);
      return;
    }

    // Handle the event
    switch (event.type) {
      case "customer.created":
        const customerCreated = event.data.object;
        // Then define and call a function to handle the event customer.created
        break;
      case "customer.deleted":
        const customerDeleted = event.data.object;
        // Then define and call a function to handle the event customer.deleted
        break;
      case "customer.updated":
        const customerUpdated = event.data.object;
        // Then define and call a function to handle the event customer.updated
        break;
      case "customer.discount.created":
        const customerDiscountCreated = event.data.object;
        // Then define and call a function to handle the event customer.discount.created
        break;
      case "customer.discount.deleted":
        const customerDiscountDeleted = event.data.object;
        // Then define and call a function to handle the event customer.discount.deleted
        break;
      case "customer.discount.updated":
        const customerDiscountUpdated = event.data.object;
        // Then define and call a function to handle the event customer.discount.updated
        break;
      case "customer.source.created":
        const customerSourceCreated = event.data.object;
        // Then define and call a function to handle the event customer.source.created
        break;
      case "customer.source.deleted":
        const customerSourceDeleted = event.data.object;
        // Then define and call a function to handle the event customer.source.deleted
        break;
      case "customer.source.expiring":
        const customerSourceExpiring = event.data.object;
        // Then define and call a function to handle the event customer.source.expiring
        break;
      case "customer.source.updated":
        const customerSourceUpdated = event.data.object;
        // Then define and call a function to handle the event customer.source.updated
        break;
      case "customer.subscription.created":
        const customerSubscriptionCreated = event.data.object;
        // Then define and call a function to handle the event customer.subscription.created
        break;
      case "customer.subscription.deleted":
        const customerSubscriptionDeleted = event.data.object;
        // Then define and call a function to handle the event customer.subscription.deleted
        break;
      case "customer.subscription.paused":
        const customerSubscriptionPaused = event.data.object;
        // Then define and call a function to handle the event customer.subscription.paused
        break;
      case "customer.subscription.pending_update_applied":
        const customerSubscriptionPendingUpdateApplied = event.data.object;
        // Then define and call a function to handle the event customer.subscription.pending_update_applied
        break;
      case "customer.subscription.pending_update_expired":
        const customerSubscriptionPendingUpdateExpired = event.data.object;
        // Then define and call a function to handle the event customer.subscription.pending_update_expired
        break;
      case "customer.subscription.resumed":
        const customerSubscriptionResumed = event.data.object;
        // Then define and call a function to handle the event customer.subscription.resumed
        break;
      case "customer.subscription.trial_will_end":
        const customerSubscriptionTrialWillEnd = event.data.object;
        // Then define and call a function to handle the event customer.subscription.trial_will_end
        break;
      case "customer.subscription.updated":
        const customerSubscriptionUpdated = event.data.object;
        // Then define and call a function to handle the event customer.subscription.updated
        break;
      case "customer.tax_id.created":
        const customerTaxIdCreated = event.data.object;
        // Then define and call a function to handle the event customer.tax_id.created
        break;
      case "customer.tax_id.deleted":
        const customerTaxIdDeleted = event.data.object;
        // Then define and call a function to handle the event customer.tax_id.deleted
        break;
      case "customer.tax_id.updated":
        const customerTaxIdUpdated = event.data.object;
        // Then define and call a function to handle the event customer.tax_id.updated
        break;
      case "issuing_card.created":
        const issuingCardCreated = event.data.object;
        // Then define and call a function to handle the event issuing_card.created
        break;
      case "issuing_card.updated":
        const issuingCardUpdated = event.data.object;
        // Then define and call a function to handle the event issuing_card.updated
        break;
      case "issuing_transaction.created":
        const issuingTransactionCreated = event.data.object;
        // Then define and call a function to handle the event issuing_transaction.created
        break;
      case "issuing_transaction.updated":
        const issuingTransactionUpdated = event.data.object;
        // Then define and call a function to handle the event issuing_transaction.updated
        break;
      case "payment_intent.amount_capturable_updated":
        const paymentIntentAmountCapturableUpdated = event.data.object;
        // Then define and call a function to handle the event payment_intent.amount_capturable_updated
        break;
      case "payment_intent.canceled":
        const paymentIntentCanceled = event.data.object;
        // Then define and call a function to handle the event payment_intent.canceled
        break;
      case "payment_intent.created":
        const paymentIntentCreated = event.data.object;
        // Then define and call a function to handle the event payment_intent.created
        break;
      case "payment_intent.partially_funded":
        const paymentIntentPartiallyFunded = event.data.object;
        // Then define and call a function to handle the event payment_intent.partially_funded
        break;
      case "payment_intent.payment_failed":
        const paymentIntentPaymentFailed = event.data.object;
        // Then define and call a function to handle the event payment_intent.payment_failed
        break;
      case "payment_intent.processing":
        const paymentIntentProcessing = event.data.object;
        // Then define and call a function to handle the event payment_intent.processing
        break;
      case "payment_intent.requires_action":
        const paymentIntentRequiresAction = event.data.object;
        // Then define and call a function to handle the event payment_intent.requires_action
        break;
      case "payment_intent.succeeded":
        const paymentIntentSucceeded = event.data.object;
        // Then define and call a function to handle the event payment_intent.succeeded
        break;
      // ... handle other event types
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    // Return a 200 response to acknowledge receipt of the event
    response.send();
  }
);
const port = process.env.PORT || 4242;

app.listen(port, () => console.log(`Server is running on port: ${port}`));
