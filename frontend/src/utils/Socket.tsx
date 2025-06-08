// src/utils/Socket.ts
import  io  from "socket.io-client";

// Read from environment variable
const URL = import.meta.env.VITE_BACKEND_URL;

export const socket = io(URL, {
  transports: ["websocket"], // optional, but helps in production sometimes
});
