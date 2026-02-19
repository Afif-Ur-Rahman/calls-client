import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { CallStatus, CallType } from "@/enum/socket-enum";
import { Socket } from "socket.io-client";
import { disconnectSocket } from "@/lib/socket";
import { zustandStorage } from "./storage/storage";

export interface CallInfo {
  from: string;
  callId: string;
  callType?: CallType;
}

export interface ActiveCall {
  callId: string;
  remoteUserId: string;
  callType: CallType;
}

interface CallState {
  allUsers: string[];
  userId: string;
  activeUsers: string[];
  socket: Socket | null;

  setAllUsers: (users: string[]) => void;
  setUserId: (id: string) => void;
  setActiveUsers: (users: string[]) => void;
  setSocket: (socket: Socket) => void;
  logout: () => void;

  isGroupCall: boolean | null;
  incomingCall: CallInfo | null;
  activeCall: ActiveCall | null;
  callStatus: CallStatus;

  isMuted: boolean;
  isCameraOff: boolean;
  remoteAudioEnabled: boolean;
  remoteVideoEnabled: boolean;

  connectedAt: number | null;
  errorMessage: string | null;

  setIsGroupCall: (v: boolean | null) => void;
  setIncomingCall: (c: CallInfo | null) => void;
  setActiveCall: (c: ActiveCall | null) => void;
  setCallStatus: (s: CallStatus) => void;

  setIsMuted: (v: boolean) => void;
  setIsCameraOff: (v: boolean) => void;
  setRemoteAudioEnabled: (v: boolean) => void;
  setRemoteVideoEnabled: (v: boolean) => void;

  setConnectedAt: (v: number | null) => void;
  setErrorMessage: (v: string | null) => void;

  resetCall: () => void;
}

export const useCallStore = create<CallState>()(
  persist(
    (set) => ({
      allUsers: [],
      userId: "",
      activeUsers: [],
      socket: null,

      setAllUsers: (allUsers) => set({ allUsers }),
      setUserId: (userId) => set({ userId }),
      setActiveUsers: (activeUsers) => set({ activeUsers }),
      setSocket: (socket) => set({ socket }),

      logout: () => {
        disconnectSocket();
        set({
          userId: "",
          socket: null,
          isGroupCall: null,
          allUsers: [],
        });
      },

      isGroupCall: null,
      incomingCall: null,
      activeCall: null,
      callStatus: "idle",

      isMuted: false,
      isCameraOff: false,
      remoteAudioEnabled: true,
      remoteVideoEnabled: true,

      connectedAt: null,
      errorMessage: null,

      setIsGroupCall: (isGroupCall) => set({ isGroupCall }),
      setIncomingCall: (incomingCall) => set({ incomingCall }),
      setActiveCall: (activeCall) => set({ activeCall }),
      setCallStatus: (callStatus) => set({ callStatus }),

      setIsMuted: (isMuted) => set({ isMuted }),
      setIsCameraOff: (isCameraOff) => set({ isCameraOff }),
      setRemoteAudioEnabled: (remoteAudioEnabled) =>
        set({ remoteAudioEnabled }),
      setRemoteVideoEnabled: (remoteVideoEnabled) =>
        set({ remoteVideoEnabled }),

      setConnectedAt: (connectedAt) => set({ connectedAt }),
      setErrorMessage: (errorMessage) => set({ errorMessage }),

      resetCall: () =>
        set({
          incomingCall: null,
          activeCall: null,
          callStatus: "idle",
          isMuted: false,
          isCameraOff: false,
          remoteAudioEnabled: true,
          remoteVideoEnabled: true,
          connectedAt: null,
          errorMessage: null,
        }),
    }),
    {
      name: "call-store",
      storage: createJSONStorage(() => zustandStorage),
      partialize: (state) => ({ userId: state.userId }),
    },
  ),
);
