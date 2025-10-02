const mongoose = require('mongoose');
require('dotenv').config();

const mongoURI = process.env.MONGO_DEV_URI || 'mongodb://localhost:27017/expense_tracker';

const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

mongoose.connect(mongoURI, options);

const db = mongoose.connection;

db.on('error', (error) => console.error('MongoDB connection error:', error));
db.once('open', () => console.log('MongoDB connected successfully'));

module.exports = db;