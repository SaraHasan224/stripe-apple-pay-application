async function createStripeCustomer(email) {
  // Create a customer with a valid address
  let customerId = await stripe.customers
    .create({
      email: email,
      address: {
        line1: "51-53 Kings Road",
        city: "Brighton",
        state: "ES",
        postal_code: "BN11NA",
        country: "UK",
      },
    })
    .then((customer) => {
      console.log("Customer created:", customer);
      return customer.id;
    })
    .catch((error) => {
      console.error("Error creating customer:", error);
    });
  return customerId;
}

async function updateCheckoutStatus(session) {
  console.log("updateCheckoutStatus:", session);
  const getLastUnpaidQuery = `SELECT * FROM checkout WHERE payment_status = 'unpaid' AND stripe_checkout_id = ? LIMIT 1`;
  const getLastUnpaidValues = [session.id];

  let connection;

  try {
    connection = await db.getConnection();

    const [rows] = await connection.execute(
      getLastUnpaidQuery,
      getLastUnpaidValues
    );

    if (rows.length > 0) {
      console.log("checkout found: ", rows);
      // If there is an unpaid record, update it
      // If there is an unpaid record, update it
      const query = `
          UPDATE checkout 
          SET payment_intent = ?, charge_id = ?, payment_status = ?
          WHERE stripe_checkout_id = ?
        `;

      const values = [
        session.payment_intent,
        null,
        session.payment_status,
        rows[0].stripe_checkout_id,
      ];

      console.log("Executing update query:", query, values);

      try {
        const [results] = await connection.execute(query, values);
        console.log("Data updated successfully");
      } catch (err) {
        console.error("Error updating data:", err);
        throw new Error("Server error: " + err.message);
      }
    }
  } catch (err) {
    console.error("Database connection error:", err);
    throw new Error("Database connection error: " + err.message);
  } finally {
    if (connection) {
      connection.release();
    }
  }
}
module.exports = {
  createOrFindCustomer,
}; // Export the pool
