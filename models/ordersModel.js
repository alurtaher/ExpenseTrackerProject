const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  paymentid: {
    type: String
  },
  orderid: {
    type: String
  },
  status: {
    type: String
  }
}, { timestamps: true });

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;