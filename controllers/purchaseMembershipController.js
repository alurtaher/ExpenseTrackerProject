const cashfreeService = require("../services/cashfreeService");
const Order = require("../models/ordersModel");
const User = require("../models/userModel");

exports.purchasePremium = async (req, res) => {
  try {
    const userId = req.user._id;

    // Check if user is already premium
    const existingUser = await User.findById(userId);
    if (existingUser && existingUser.isPremiumUser) {
      return res.status(200).json({
        message: "You are already premium User.",
        isPremium: true,
      });
    }

    // Create new order
    const orderId = "order_" + Date.now() + "_" + Math.floor(Math.random() * 1000);
    const orderAmount = 2000.0;
    const customerPhone = "8499089094";

    const order = new Order({
      orderid: orderId,
      status: "PENDING",
      userId: userId,
    });
    await order.save();

    if (!order || !order._id) {
      console.error("Order creation failed — missing ID");
      return res.status(500).json({ message: "Order creation failed" });
    }

    // Auto-fail pending order after 5 minutes
    setTimeout(async () => {
      try {
        const currentOrder = await Order.findOne({ orderid: orderId });
        if (currentOrder && currentOrder.status === "PENDING") {
          currentOrder.status = "FAILED";
          await currentOrder.save();
          console.log(`Order ${orderId} marked as FAILED after 5 minutes`);
        }
      } catch (timeoutErr) {
        console.error("Failed to update order status after timeout:", timeoutErr);
      }
    }, 5 * 60 * 1000); // 5 minutes

    // Proceed with payment
    const paymentSessionId = await cashfreeService.createOrder({
      orderId,
      orderAmount,
      userId,
      customerPhone,
      dbOrderId: order._id.toString(),
    });

    res.status(201).json({ paymentSessionId, orderId });
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ message: "Failed to create payment session" });
  }
};

exports.updateTransactionStatus = async (req, res) => {
  try {
    const orderId = req.params.orderId;
    const status = await cashfreeService.getPaymentStatus(orderId);

    const order = await Order.findOne({ orderid: orderId });
    if (order) {
      order.status = status;
      await order.save();

      if (status === "SUCCESS") {
        // Update user to premium
        const user = await User.findById(order.userId);
        if (user) {
          user.isPremiumUser = true;
          await user.save();
        }
      }
    }

    return res.json({
      status: status,
      success: true,
      message: "Transaction successful",
    });
  } catch (error) {
    console.error("Error fetching payment status:", error);
    await Order.updateOne(
      { orderid: req.params.orderId },
      { status: "FAILED" }
    );

    return res.status(500).json({ message: "Error fetching payment status", status: "Failed" });
  }
};