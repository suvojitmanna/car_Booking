import mongoose from "mongoose";

let cached = (global as any).mongooseConn;
if (!cached) {
  cached = (global as any).mongooseConn = { conn: null, promise: null };
}

const connectDb = async () => {
  if (cached.conn) {
    return cached.conn;
  }

  const mongodbUrl = process.env.MONGODB_URL || process.env.MONGODB_URI;
  if (!mongodbUrl) {
    throw new Error(
      "db url not found: Please define MONGODB_URL in your .env.local file",
    );
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(mongodbUrl).then((c) => c.connection);
  }
  try {
    const conn = await cached.promise;
    cached.conn = conn;
    return conn;
  } catch (error) {
    cached.promise = null;
    console.error("MongoDB connection error:", error);
    throw error;
  }
};

export default connectDb;
