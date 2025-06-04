const http = require('http');
const { Server } = require('socket.io');
const app = require('./app');
const RideTracking = require('./models/ride_tracking_model');

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // User joins rooms for their userId and the current rideId
  socket.on('join-ride', ({ userId, rideId }) => {
    const userRoom = `user-${userId}`;
    const rideRoom = `ride-${rideId}`;

    socket.join(userRoom);
    socket.join(rideRoom);

    console.log(`User ${userId} joined rooms: ${userRoom}, ${rideRoom}`);
  });

  // Receive location updates from client and broadcast to others in ride room
  socket.on('location-update', async ({ rideId, latitude, longitude, accuracy, timestamp }) => {
    try {
      // Save tracking point in RideTracking collection (upsert to create if not exists)
      await RideTracking.updateOne(
        { rideId },
        {
          $push: {
            trackingData: {
              latitude,
              longitude,
              accuracy,
              timestamp: timestamp || new Date()
            }
          }
        },
        { upsert: true }
      );

      // Emit location update to everyone listening to this ride room
      io.to(`ride-${rideId}`).emit('location-update', {
        latitude,
        longitude,
        accuracy,
        timestamp: timestamp || new Date()
      });

    } catch (err) {
      console.error('Error saving tracking data:', err);
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

module.exports = server;
