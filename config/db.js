const mongoose = require('mongoose');

const uri = 'mongodb://localhost:27017/new'; // or load from .env if needed

mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('MongoDB connected');
})
.catch((err) => {
  console.error('MongoDB connection error:', err);
});

module.exports = mongoose;
