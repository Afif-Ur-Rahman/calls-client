import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;
let currentUserId: string | null = null;

export const createSocket = (userId: string): Socket => {
  if (socket && currentUserId === userId) {
    return socket;
  }

  if (socket) {
    console.warn(
      "Socket already exists.",
    );
    return socket;
  }

  currentUserId = userId;

  socket = io(process.env.NEXT_PUBLIC_SOCKET_URL!, {
    transports: ["websocket"],
    auth: { userId },
    query: { userId },
    autoConnect: true,
  });

  socket.on("connect", () => {
    console.log("✅ Socket connected:", socket?.id, "user:", userId);
  });

  socket.on("disconnect", (reason) => {
    console.log("❌ Socket disconnected:", reason);
  });

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
    currentUserId = null;
  }
};

export const getExistingSocket = () => socket;
