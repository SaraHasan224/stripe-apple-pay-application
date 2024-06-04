const express = require("express");
const bodyParser = require("body-parser");
const app = express();
// Load environment variables from .env file
require("dotenv").config();
app.use(express.static("public"));
const db = require("./db"); // Import the database connection
const common = require("./common"); // Import the database connection
const customer = require("./stripe/customer"); // Import the database connection

// Parse JSON bodies
// app.use(bodyParser.json());

// Parse URL-encoded bodies
app.use(bodyParser.urlencoded({ extended: true }));
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

// intent page
app.get("/intent", async function (req, res) {
  const stripe = require("stripe")(process.env.STRIPE_KEY);
  const intent = await stripe.paymentIntents.create({
    amount: 1,
    currency: "usd",
    automatic_payment_methods: {
      enabled: true,
    },
  });
  res.render("pages/intent", {
    appUrl: process.env.APP_URL,
    client_secret: intent.client_secret,
  });
});

// Parse create checkout session
app.post(
  "/create-checkout-session",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    let price;
    // Retrieve email from request body
    const body = req.body.toString();
    console.log("my body: ", body);
    // Find the index of the email value
    const emailStartIndex =
      body.indexOf('name="email"') + 'name="email"\r\n\r\n'.length;
    const emailEndIndex = body.indexOf("\r\n", emailStartIndex);

    // Find the index of the name value
    const nameStartIndex =
      body.indexOf('name="customer_name"') +
      'name="customer_name"\r\n\r\n'.length;
    const nameEndIndex = body.indexOf("\r\n", nameStartIndex);

    // Extract the email value
    const email = body.substring(emailStartIndex, emailEndIndex);
    const name = body.substring(nameStartIndex, nameEndIndex);

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
      let customerId = await customer.createOrFindCustomer(email, name);
      console.log("customerId:", customerId);
      console.log(`Product ID: ${product.id}`);
      console.log(`Price ID: ${price}`);
      let checkout_session = "";
      // Run the function
      common
        .upsertCheckout()
        .then(() => {
          console.log("Operation completed successfully.");
        })
        .catch((err) => {
          console.error("Error:", err);
        });
      const session = await stripe.checkout.sessions.create({
        // mode: "setup",
        payment_method_types: ["card"], // e.g.,
        success_url: process.env.APP_URL + `success`,
        customer: customerId,
        cancel_url: process.env.APP_URL + `cancel`,
        line_items: [
          {
            // Provide the exact Price ID (for example, pr_1234) of the product you want to sell
            price: price.id,
            quantity: 5,
          },
        ],
        mode: "payment",
        automatic_tax: { enabled: true },
        payment_intent_data: {
          setup_future_usage: "off_session",
        },
      });
      // Set the status code to 200
      res.statusCode = 200;
      common.upsertCheckoutSession(session);
      // res.redirect(303, session.url);
      res.end(JSON.stringify({ url: session.url }));
    })();
  }
);
// create-payment-intent-session
app.post(
  "/create-payment-intent-session",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    let price;
    // Retrieve email from request body
    const body = req.body.toString();
    console.log("my body: ", body);
    // Find the index of the email value
    const emailStartIndex =
      body.indexOf('name="email"') + 'name="email"\r\n\r\n'.length;
    const emailEndIndex = body.indexOf("\r\n", emailStartIndex);

    // Find the index of the name value
    const nameStartIndex =
      body.indexOf('name="customer_name"') +
      'name="customer_name"\r\n\r\n'.length;
    const nameEndIndex = body.indexOf("\r\n", nameStartIndex);

    // Extract the email value
    const email = body.substring(emailStartIndex, emailEndIndex);
    const name = body.substring(nameStartIndex, nameEndIndex);

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
      let customerId = await customer.createOrFindCustomer(email, name);
      console.log("customerId:", customerId);
      console.log(`Product ID: ${product.id}`);
      console.log(`Price ID: ${price}`);
      let checkout_session = "";
      // Run the function
      common
        .upsertCheckout()
        .then(() => {
          console.log("Operation completed successfully.");
        })
        .catch((err) => {
          console.error("Error:", err);
        });
      const session = await stripe.checkout.sessions.create({
        // mode: "setup",
        payment_method_types: ["card"], // e.g.,
        success_url: process.env.APP_URL + `success`,
        customer: customerId,
        cancel_url: process.env.APP_URL + `cancel`,
        line_items: [
          {
            // Provide the exact Price ID (for example, pr_1234) of the product you want to sell
            price: price.id,
            quantity: 5,
          },
        ],
        mode: "subscription",
        automatic_tax: { enabled: true },
        // payment_intent_data: {
        //   setup_future_usage: "off_session",
        // },
      });
      // Set the status code to 200
      res.statusCode = 200;
      common.upsertCheckoutSession(session);
      // res.redirect(303, session.url);
      res.end(JSON.stringify({ url: session.url }));
    })();
  }
);

//Subscription
// checkout page
app.get("/subscription", function (req, res) {
  res.render("pages/subscription/checkout", { appUrl: process.env.APP_URL });
});

// success page
app.get("/subscription/success", function (req, res) {
  res.render("pages/subscription/success");
});

// cancel page
app.get("/subscription/cancel", function (req, res) {
  res.render("pages/subscription/cancel");
});

app.post("/create-portal-session", async (req, res) => {
  // For demonstration purposes, we're using the Checkout session to retrieve the customer ID.
  // Typically this is stored alongside the authenticated user in your database.
  const { session_id } = req.body;
  const checkoutSession = await stripe.checkout.sessions.retrieve(session_id);

  // This is the url to which the customer will be redirected when they are done
  // managing their billing with the portal.
  const returnUrl = YOUR_DOMAIN;

  const portalSession = await stripe.billingPortal.sessions.create({
    customer: checkoutSession.customer,
    return_url: returnUrl,
  });

  res.redirect(303, portalSession.url);
});

app.post("/create-subscription", async (req, res) => {
  const stripe = require("stripe")(process.env.STRIPE_KEY);
  try {
    // Create a product
    let product = await stripe.products.create({
      name: "Test Product",
    });

    // Create a price for the product
    let price = await stripe.prices.create({
      product: product.id,
      unit_amount: 2000,
      currency: "usd",
      recurring: {
        interval: "month",
      },
    });

    console.log("lookup keys: ", req.body.lookup_key);
    console.log("price keys: ", price);

    // Calculate trial_end as 30 days from today (example)
    const trialDays = 30;
    const today = new Date();
    const trialStartDate = new Date(today.setDate(today.getDate()));
    const trialStartTimestamp = Math.floor(trialStartDate.getTime() / 1000);

    const trialEndDate = new Date(today.setDate(today.getDate() + trialDays));
    const trialEndTimestamp = Math.floor(trialEndDate.getTime() / 1000);

    // Create a checkout session
    const session = await stripe.checkout.sessions.create({
      currency: "usd",
      line_items: [
        {
          price: price.id,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${process.env.APP_URL}subscription/success.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.APP_URL}subscription/cancel.html`,
      subscription_data: {
        trial_period_days: 7,
        trial_settings: {
          end_behavior: {
            missing_payment_method: "cancel", // Other options: 'create_invoice', 'pause'
          },
        },
      },
    });

    res.redirect(303, session.url);
  } catch (error) {
    console.error("Error creating subscription: ", error);
    res.status(500).send("Internal Server Error");
  }
});

// stripe webhooks
app.post(
  "/stripe_webhooks",
  express.json({ type: "application/json" }),
  (request, response) => {
    const event = request.body;
    // Handle the event
    switch (event.type) {
      case "customer.created":
        const customerCreated = event.data.object;
        console.log("customerCreated: ", customerCreated);
        // Then define and call a function to handle the event customer.created
        break;
      case "payment_intent.succeeded":
        const paymentIntent = event.data.object;
        console.log("payment intent: ", paymentIntent);
        // Then define and call a method to handle the successful payment intent.
        // handlePaymentIntentSucceeded(paymentIntent);
        break;
      case "payment_method.attached":
        const paymentMethod = event.data.object;
        console.log("payment_method.attached: ", paymentMethod);
        // Then define and call a method to handle the successful attachment of a PaymentMethod.
        // handlePaymentMethodAttached(paymentMethod);
        break;
      case "payment_intent.partially_funded":
        const paymentIntentPartiallyFunded = event.data.object;
        console.log(
          "paymentIntentPartiallyFunded: ",
          paymentIntentPartiallyFunded
        );
        // Then define and call a function to handle the event payment_intent.partially_funded
        break;
      case "payment_intent.payment_failed":
        const paymentIntentPaymentFailed = event.data.object;
        console.log("paymentIntentPaymentFailed: ", paymentIntentPaymentFailed);
        // Then define and call a function to handle the event payment_intent.payment_failed
        break;
      case "payment_intent.processing":
        const paymentIntentProcessing = event.data.object;
        console.log("paymentIntentProcessing: ", paymentIntentProcessing);
        // Then define and call a function to handle the event payment_intent.processing
        break;
      case "payment_intent.requires_action":
        const paymentIntentRequiresAction = event.data.object;
        console.log(
          "paymentIntentRequiresAction: ",
          paymentIntentRequiresAction
        );
        // Then define and call a function to handle the event payment_intent.requires_action
        break;
      case "payment_intent.succeeded":
        const paymentIntentSucceeded = event.data.object;
        console.log("paymentIntentSucceeded: ", paymentIntentSucceeded);
        // Then define and call a function to handle the event payment_intent.succeeded
        break;
      case "charge.succeeded":
        const chargeSucceeded = event.data.object;
        console.log("chargeSucceeded: ", chargeSucceeded);
        break;
      case "checkout.session.completed":
        const checkoutSucceeded = event.data.object;
        console.log("checkout.session.completed: ", checkoutSucceeded);
        common.updateCheckoutStatus(checkoutSucceeded);
        break;
      // ... handle other event types
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    // Return a response to acknowledge receipt of the event
    response.json({ received: true });
  }
);

app.post(
  "/stripe-webhook",
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
