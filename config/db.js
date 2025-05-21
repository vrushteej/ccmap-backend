const mongoose = require('mongoose');

async function connectToDB() {
  try {
    console.log('Starting mongodb connection');
    // Create the connection using mongoose.connect() rather than mongoose.createConnection()
//    const connection = await mongoose.connect(process.env.MONGODB_URI, {
//      useNewUrlParser: true,   // Ensures proper parsing of connection string
//      useUnifiedTopology: true, // Avoids deprecation warning related to topology engine
//    });
//    
    const connection = mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }).then(() => {
      console.log('MongoDB connected successfully');
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
