const mongoose = require('mongoose');

async function connectToDB() {
  try {
    const connection = mongoose.connect(process.env.MONGODB_URI).then(() => {
      console.log("Connected to DB: ", mongoose.connection.name);
    }).catch(err => {
      console.error('MongoDB connection error:', err);
    });

    // Log on successful connection
//    console.log('MongoDB connected');

    // You can access the connection through `connection.connection` if you need to reference it later
    return connection;  // Return the connection to use elsewhere if needed
  } catch (error) {
    console.error('Connection failed', error);  // Catch any connection error and log it
    process.exit(1);  // Exit the process if MongoDB connection fails
  }
}

// Export the connection
module.exports = connectToDB;
