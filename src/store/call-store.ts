import { create } from "zustand";
import { CallStatus, CallType } from "@/enum/socket-enum";
import { Socket } from "socket.io-client";

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
  incomingCall: CallInfo | null;
  activeCall: ActiveCall | null;
  callStatus: CallStatus;

  isMuted: boolean;
  isCameraOff: boolean;
  remoteAudioEnabled: boolean;
  remoteVideoEnabled: boolean;

  connectedAt: number | null;
  errorMessage: string | null;

  socket: Socket | null;
  setSocket: (socket: Socket | null) => void;

  setIncomingCall: (c: CallInfo | null) => void;
  setActiveCall: (c: ActiveCall | null) => void;
  setCallStatus: (s: CallStatus) => void;

  setIsMuted: (v: boolean) => void;
  setIsCameraOff: (v: boolean) => void;
  setRemoteAudioEnabled: (v: boolean) => void;
  setRemoteVideoEnabled: (v: boolean) => void;

  setConnectedAt: (v: number | null) => void;
  setErrorMessage: (v: string | null) => void;

  reset: () => void;
}

export const useCallStore = create<CallState>((set) => ({
  incomingCall: null,
  activeCall: null,
  callStatus: "idle",

  isMuted: false,
  isCameraOff: false,
  remoteAudioEnabled: true,
  remoteVideoEnabled: true,

  connectedAt: null,
  errorMessage: null,

  socket: null,
  setSocket: (socket) => set({ socket }),

  setIncomingCall: (incomingCall) => set({ incomingCall }),
  setActiveCall: (activeCall) => set({ activeCall }),
  setCallStatus: (callStatus) => set({ callStatus }),

  setIsMuted: (isMuted) => set({ isMuted }),
  setIsCameraOff: (isCameraOff) => set({ isCameraOff }),
  setRemoteAudioEnabled: (remoteAudioEnabled) => set({ remoteAudioEnabled }),
  setRemoteVideoEnabled: (remoteVideoEnabled) => set({ remoteVideoEnabled }),

  setConnectedAt: (connectedAt) => set({ connectedAt }),
  setErrorMessage: (errorMessage) => set({ errorMessage }),

  reset: () =>
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
}));
