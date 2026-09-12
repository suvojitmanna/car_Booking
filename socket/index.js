import express from "express";
import dotenv from "dotenv";
import http from "http";
import { Server } from "socket.io";
import mongoose from "mongoose";
import User from "./models/user.model.js";

dotenv.config();

const port = process.env.PORT || 8000;
const mongoDbUrl = process.env.MONGODB_URL;

const connectDb = async () => {
  try {
    await mongoose.connect(mongoDbUrl);
    console.log("MongoDB connected");
  } catch (err) {
    console.log(err);
  }
};

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.NEXT_BASE_URL
      ? process.env.NEXT_BASE_URL.trim()
      : "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  socket.on("identity", async (userId) => {
    socket.userId = userId;
    await User.findByIdAndUpdate(userId, {
      socketId: socket.id,
      isOnline: true,
    });
  });

  socket.on("update-location", async ({ userId, longitude, latitude }) => {
    try {
      if (!userId || longitude === undefined || latitude === undefined) return;
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        {
          location: {
            type: "Point",
            coordinates: [Number(longitude), Number(latitude)],
          },
        },
        { new: true },
      );
      console.log(`[Socket] Updated location for user ${userId}:`, [
        longitude,
        latitude,
      ]);
    } catch (err) {
      console.error("[Socket] Update location error:", err);
    }
  });

  socket.on("disconnect", async () => {
    try {
      if (!socket.userId) return;
      const res = await User.findOneAndUpdate(
        { _id: socket.userId, socketId: socket.id },
        {
          socketId: "",
          isOnline: false,
        },
      );
      if (res) {
        console.log(`[Socket] User ${socket.userId} went offline (socket: ${socket.id})`);
      } else {
        console.log(`[Socket] Ignored disconnect for user ${socket.userId} (socket ${socket.id} is not current active socket)`);
      }
    } catch (err) {
      console.error("[Socket] Disconnect error:", err);
    }
  });
});

app.get("/health", (req, res) => {
  res.send("OK");
});

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  connectDb();
});
