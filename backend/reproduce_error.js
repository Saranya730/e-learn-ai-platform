const Razorpay = require("razorpay");

const razorpay = new Razorpay({
    key_id: "rzp_test_YourKeyId", // Placeholder from server.js
    key_secret: "YourKeySecret",  // Placeholder from server.js
});

const options = {
    amount: 100 * 100, // 100 INR
    currency: "INR",
    receipt: "receipt_order_" + Date.now(),
};

console.log("Attempting to create Razorpay order with placeholders...");

razorpay.orders.create(options)
    .then(order => {
        console.log("Order created successfully:", order);
    })
    .catch(error => {
        console.error("Error creating order:", error);
    });
