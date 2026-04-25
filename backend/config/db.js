const path = require('path');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

const PLACEHOLDER_SEGMENTS = [
  '<user>',
  '<password>',
  'cluster0.mongodb.net',
];

let memoryServer;

const isPlaceholderUri = (mongoUri = '') =>
  PLACEHOLDER_SEGMENTS.some((segment) => mongoUri.includes(segment));

const startInMemoryMongo = async () => {
  if (!memoryServer) {
    memoryServer = await MongoMemoryServer.create({
      instance: { dbName: 'sidebyside' },
      binary: {
        downloadDir: path.join(__dirname, '..', '.mongodb-binaries'),
      },
    });
  }

  const memoryUri = memoryServer.getUri();
  const conn = await mongoose.connect(memoryUri);
  console.log(`MongoDB connected (in-memory): ${conn.connection.host}`);
  return conn;
};

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI;
  const isDevelopment = process.env.NODE_ENV !== 'production';

  if (!mongoUri) {
    if (isDevelopment) {
      console.warn('MONGO_URI missing in backend/.env. Starting temporary in-memory MongoDB for development.');
      return startInMemoryMongo();
    }

    throw new Error('MONGO_URI is missing in backend/.env. Add a MongoDB Atlas or local MongoDB connection string.');
  }

  if (isPlaceholderUri(mongoUri)) {
    if (isDevelopment) {
      console.warn('MONGO_URI is still using the example value. Starting temporary in-memory MongoDB for development.');
      return startInMemoryMongo();
    }

    throw new Error('MONGO_URI in backend/.env is still using the example value. Replace it with a real MongoDB Atlas URI or mongodb://127.0.0.1:27017/sidebyside.');
  }

  try {
    const conn = await mongoose.connect(mongoUri);
    console.log(`MongoDB connected: ${conn.connection.host}`);
    return conn;
  } catch (err) {
    throw new Error(`MongoDB connection error: ${err.message}`);
  }
};

module.exports = connectDB;
