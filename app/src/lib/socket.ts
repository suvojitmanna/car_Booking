import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;
export const getSocket = () => {
  if (!socket) {
    socket = io(
      process.env.NEXT_PUBLIC_SOCKET_SERVER_URL || "http://localhost:8000",
      {
        transports: ["websocket", "polling"],
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 2000,
        autoConnect: true,
      },
    );
  }
  return socket;
};
