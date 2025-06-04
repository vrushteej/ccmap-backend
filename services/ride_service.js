const Ride = require('../models/ride_model');
const Station = require('../models/station_model');
const RideTracking = require('../models/ride_tracking_model');

class RideServices {
  // Start a ride
  static async startRide({ userId, bikeId, stationId, latitude, longitude }) {
    let station;

    if (stationId) {
      station = await Station.findById(stationId);
    } else if (latitude !== undefined && longitude !== undefined) {
      station = await Station.findOne({
        location: {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [longitude, latitude]
            },
            $maxDistance: 100
          }
        }
      });
    }

    if (!station) throw new Error('No valid start station found');

    const start_station = {
      station_id: station._id.toString(),
      name: station.station_name,
      location: {
        latitude: station.location.coordinates[1],
        longitude: station.location.coordinates[0]
      }
    };

    const ride = await Ride.create({
      userId,
      bike_id: bikeId,
      start_station,
      start_time: new Date(),
      tracking_path: []
    });

    // Initialize the first tracking point
    const initialPoint = {
      latitude: latitude || station.latitude,
      longitude: longitude || station.longitude,
      accuracy: null,
      timestamp: new Date()
    };

    // Create RideTracking doc with initial GPS point
    await RideTracking.create({
      rideId: ride._id,
      trackingData: [initialPoint]
    });

    // Also add the initial GPS point to ride's tracking_path and save
    ride.tracking_path.push(initialPoint);
    await ride.save();

    return ride;
  }

  // Distance utility
  static calculateDistanceKm(lat1, lon1, lat2, lon2) {
    const toRad = (val) => (val * Math.PI) / 180;
    const R = 6371; // Radius of the Earth in km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) ** 2;

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  // End ride and store final amount and distance
  static async endRide({ rideId, stationId, latitude, longitude, amount }) {
    let station;

    if (stationId) {
      station = await Station.findById(stationId);
    } else if (latitude !== undefined && longitude !== undefined) {
      station = await Station.findOne({
        location: {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [longitude, latitude]
            },
            $maxDistance: 100
          }
        }
      });
    }

    if (!station) throw new Error('No valid end station found');

    const ride = await Ride.findById(rideId);
    if (!ride) throw new Error('Ride not found');
    if (ride.status === 'completed') throw new Error('Ride already completed');

    const endTime = new Date();
    const duration = Math.ceil((endTime - ride.start_time) / (1000 * 60)); // in minutes

    const start = ride.start_station.location;
    const end = {
      latitude: station.location.coordinates[1],
      longitude: station.location.coordinates[0]
    };

    const distance = this.calculateDistanceKm(
      start.latitude,
      start.longitude,
      end.latitude,
      end.longitude
    );

    ride.end_station = {
      station_id: station._id.toString(),
      name: station.station_name,
      location: {
        latitude: end.latitude,
        longitude: end.longitude
      }
    };

    ride.end_time = endTime;
    ride.duration_minutes = duration;
    ride.amount = amount;
    ride.status = 'completed';
    ride.distance_km = parseFloat(distance.toFixed(2));

    // Add the final GPS point to tracking (if provided)
    if (latitude !== undefined && longitude !== undefined) {
      await this.addTrackingPoint({ rideId, latitude, longitude, accuracy: null });
    }

    // Sync and sort tracking data from RideTracking to ride document
    const trackingRecord = await RideTracking.findOne({ rideId });

    if (trackingRecord && trackingRecord.trackingData.length > 0) {
      // Sort by timestamp ascending
      ride.tracking_path = trackingRecord.trackingData.sort(
        (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
      );
    }

    await ride.save();

    return ride;
  }


  static async getRide(userId) {
    return await Ride.find({ userId }).populate('userId');
  }

  static async addTrackingPoint({ rideId, latitude, longitude, accuracy }) {
    if (!rideId || !latitude || !longitude) 
      throw new Error('Invalid tracking data');

    const point = {
      latitude,
      longitude,
      accuracy: accuracy || null,
      timestamp: new Date()
    };

    const trackingRecord = await RideTracking.findOne({ rideId });

    if (trackingRecord) {
      trackingRecord.trackingData.push(point);
      await trackingRecord.save();
    } else {
      await RideTracking.create({
        rideId,
        trackingData: [point]
      });
    }

    return point;
  }
}

module.exports = RideServices;
