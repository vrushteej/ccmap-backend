const http = require('http');
const socketIO = require('socket.io');
const app = require('./app');
const db = require('./config/db');

const server = http.createServer(app);

const io = socketIO(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

io.on('connection', (socket) => {
  console.log('Client connected: ', socket.id);

  socket.on('chat_from_flutter', async (data) => {
    console.log('Message from Flutter:' , data.message);

    // Forward to Python bot server
    try {
      const res = await fetch('https://your-python-bot.onrender.com/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: data.message }),
      });
      const botData = await res.json();
      console.log('Bot replied: ', botData.response);

      // Send back to Flutter
      socket.emit('chat_to_flutter', { response: botData.response });
    } catch (err) {
      console.error('Error forwarding to bot: ', err);
      socket.emit('chat_to_flutter', { response: 'Bot error.' });
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected: ', socket.id);
  });
})

//const port = 3000;
const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
