export enum CallEvents {
  // Active users
  ALL_USERS = "all-users",

  // Call lifecycle
  CALL_INITIATE = "call:initiate",
  CALL_INCOMING = "call:incoming",
  CALL_RINGING = "call:ringing",
  CALL_ACCEPT = "call:accept",
  CALL_REJECT = "call:reject",
  CALL_END = "call:end",
  CALL_BUSY = "call:busy",
  CALL_MISSED = "call:missed",
  CALL_CANCELLED = "call:cancelled",
  CALL_UNAVAILABLE = "call:unavailable",

  // WebRTC signaling
  CALL_OFFER = "call:offer",
  CALL_ANSWER = "call:answer",
  CALL_ICE = "call:ice",

  // Media control
  CALL_TOGGLE_AUDIO = "call:toggle-audio",
  CALL_TOGGLE_VIDEO = "call:toggle-video",
  CALL_SWITCH_CAMERA = "call:switch-camera",
}

export enum CallType {
  AUDIO = "audio",
  VIDEO = "video",
}

export type CallStatus =
  | "idle"
  | "calling"
  | "ringing"
  | "connected"
  | "busy"
  | "missed";

export type Call = {
  callId: string;
  from: string;
  offer: RTCSessionDescriptionInit;
  answer: RTCSessionDescriptionInit;
  candidate: RTCIceCandidateInit;
  callType: CallType;
  enabled: boolean;
  groupCall: boolean;
};
