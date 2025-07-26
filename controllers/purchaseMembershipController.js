const cashfreeService = require("../services/cashfreeService");
const Order = require("../models/ordersModel");
const userController = require("./userController");
const user = require('../models/userModel')

exports.purchasePremium = async (req, res) => {
  try {
    const userId = req.user.id;

    // ✅ Check if user is already premium
    const existingUser = await user.findByPk(userId);
    if (existingUser && existingUser.isPremiumUser) {
      return res.status(200).json({
        message: "You are already premium User.",
        isPremium: true,
      });
    }

    // Proceed with new order creation
    const orderId =
      "order_" + Date.now() + "_" + Math.floor(Math.random() * 1000);
    const orderAmount = 2000.0;
    const customerPhone = "8499089094";

    // ✅ Create DB Order and store result
    const order = await Order.create({
      orderid: orderId,
      status: "PENDING",
      userId: userId,
    });

    // ✅ Optional safety check
    if (!order || !order.id) {
      console.error("❌ Order creation failed — missing ID");
      return res.status(500).json({ message: "Order creation failed" });
    }

    // ❗ Start timeout countdown: auto-fail after 5 minutes if status is still pending
    setTimeout(async () => {
      try {
        const currentOrder = await Order.findOne({ where: { orderid: orderId } });
        if (currentOrder && currentOrder.status === "PENDING") {
          await currentOrder.update({ status: "FAILED" });
          console.log(`Order ${orderId} marked as FAILED after 5 minutes`);
        }
      } catch (timeoutErr) {
        console.error("Failed to update order status after timeout:", timeoutErr);
      }
    }, 5 * 60 * 1000); // 5 minutes in milliseconds

    // ✅ Proceed with payment
    const paymentSessionId = await cashfreeService.createOrder({
      orderId,
      orderAmount,
      userId,
      customerPhone,
      dbOrderId: order.id.toString(), // optional if you want to track DB order ID
    });

    res.status(201).json({ paymentSessionId, orderId });
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ message: "Failed to create payment session" });
  }
};


exports.updateTransactionStatus = async(req,res)=>{
    try {
        const orderId = req.params.orderId;
    const status = await cashfreeService.getPaymentStatus(orderId);

    // Update Order table based on result
    const order = await Order.findOne({ where: { orderid: orderId } });
    if (order) {
      await order.update({ status });
      if (status === "Success") {
        // Make user premium
        const user = await order.getUser();
        console.log("User is "+ user)
        user.isPremiumUser = true;
        await user.save();
      }
    }
    return res.json({status})
    } catch (error) {
        console.error("Error fetching payment status:", error);
        await Order.update({ status: "FAILED" }, { where: { orderid: req.params.orderId } });

        return res.status(500).json({ message: "Error fetching payment status", status: "Failed" });
    }
}