const mongoose = require('mongoose');

async function connectToDB() {
  try {
    // Create the connection using mongoose.connect() rather than mongoose.createConnection()
    const connection = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,   // Ensures proper parsing of connection string
      useUnifiedTopology: true, // Avoids deprecation warning related to topology engine
    });
    await mongoose.connection.db.admin().command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
    // Log on successful connection
    // console.log('MongoDB connected');

    // You can access the connection through `connection.connection` if you need to reference it later
    return connection;  // Return the connection to use elsewhere if needed
  } catch (error) {
    console.error('Connection failed', error);  // Catch any connection error and log it
    process.exit(1);  // Exit the process if MongoDB connection fails
  }
}

// Export the connection
module.exports = mongoose;
