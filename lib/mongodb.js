/**
 * MongoDB connection utility
 * This file handles the connection to MongoDB Atlas using the provided URI
 * It implements connection pooling for better performance in production
 */
import { MongoClient } from "mongodb"

// Get MongoDB URI from environment variables
const uri = process.env.MONGODB_URI
const options = {
  maxPoolSize: 10, // Maintain up to 10 socket connections
}

// Global variable to cache the MongoDB client connection
let client
let clientPromise

// Check if MongoDB URI is provided
if (!process.env.MONGODB_URI) {
  throw new Error("Please add your MongoDB URI to .env.local")
}

// In development mode, use a global variable to preserve the connection
// across hot-reloads
if (process.env.NODE_ENV === "development") {
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options)
    global._mongoClientPromise = client.connect()
  }
  clientPromise = global._mongoClientPromise
} else {
  // In production mode, create a new connection for each instance
  client = new MongoClient(uri, options)
  clientPromise = client.connect()
}

export default clientPromise

