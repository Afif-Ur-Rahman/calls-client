import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;
let currentUserId: string | null = null;

export const getSocket = (userId: string): Socket => {
  if (!socket || currentUserId !== userId) {
    if (socket) {
      socket.disconnect();
    }

    currentUserId = userId;

    socket = io(process.env.NEXT_PUBLIC_SOCKET_URL!, {
      auth: { userId },
      query: { userId },
      transports: ["websocket"],
      autoConnect: true,
    });
  }

  return socket;
};

export const disconnectSocket = () => {
  socket?.disconnect();
  socket = null;
  currentUserId = null;
};
