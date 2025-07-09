const mongoose = require('mongoose');

const uri = 'mongodb://10.104.139.38:27017/ccmap'; // or load from .env if needed

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
