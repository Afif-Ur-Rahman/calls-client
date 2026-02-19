import { Call, CallEvents, CallType } from "@/enum/socket-enum";
import { useCallStore } from "@/store/call-store";

type Callback = (data: Call) => void;
type UsersCallback = (users: string[]) => void;

export const useCallSocket = () => {
  const { socket } = useCallStore();

  const initiateCall = (to: string, callType: CallType, groupCall: boolean) => {
    socket?.emit(CallEvents.CALL_INITIATE, { to, callType, groupCall });
  };

  const acceptCall = (to: string, callId: string) => {
    socket?.emit(CallEvents.CALL_ACCEPT, { to, callId });
  };

  const rejectCall = (to: string, callId: string) => {
    socket?.emit(CallEvents.CALL_REJECT, { to, callId });
  };

  const cancelCall = (to: string, callId: string) => {
    socket?.emit(CallEvents.CALL_CANCELLED, { to, callId });
  };

  const endCall = (to: string, callId: string) => {
    socket?.emit(CallEvents.CALL_END, { to, callId });
  };

  const sendOffer = (
    to: string,
    offer: RTCSessionDescriptionInit,
    callId: string,
  ) => {
    socket?.emit(CallEvents.CALL_OFFER, { to, offer, callId });
  };

  const sendAnswer = (
    to: string,
    answer: RTCSessionDescriptionInit,
    callId: string,
  ) => {
    socket?.emit(CallEvents.CALL_ANSWER, { to, answer, callId });
  };

  const sendIceCandidate = (
    to: string,
    candidate: RTCIceCandidateInit,
    callId: string,
  ) => {
    socket?.emit(CallEvents.CALL_ICE, { to, candidate, callId });
  };

  const toggleAudio = (to: string, callId: string, enabled: boolean) => {
    socket?.emit(CallEvents.CALL_TOGGLE_AUDIO, { to, callId, enabled });
  };

  const toggleVideo = (to: string, callId: string, enabled: boolean) => {
    socket?.emit(CallEvents.CALL_TOGGLE_VIDEO, { to, callId, enabled });
  };

  const onIncomingCall = (cb: Callback) =>
    socket?.on(CallEvents.CALL_INCOMING, cb);
  const onRinging = (cb: Callback) => socket?.on(CallEvents.CALL_RINGING, cb);
  const onAccept = (cb: Callback) => socket?.on(CallEvents.CALL_ACCEPT, cb);
  const onOffer = (cb: Callback) => socket?.on(CallEvents.CALL_OFFER, cb);
  const onAnswer = (cb: Callback) => socket?.on(CallEvents.CALL_ANSWER, cb);
  const onIce = (cb: Callback) => socket?.on(CallEvents.CALL_ICE, cb);
  const onEnd = (cb: () => void) => socket?.on(CallEvents.CALL_END, cb);
  const onReject = (cb: () => void) => socket?.on(CallEvents.CALL_REJECT, cb);
  const onCancelled = (cb: () => void) =>
    socket?.on(CallEvents.CALL_CANCELLED, cb);
  const onBusy = (cb: (data: { message: string }) => void) =>
    socket?.on(CallEvents.CALL_BUSY, cb);
  const onUnavailable = (cb: (data: { message: string }) => void) =>
    socket?.on(CallEvents.CALL_UNAVAILABLE, cb);
  const onToggleAudio = (cb: Callback) =>
    socket?.on(CallEvents.CALL_TOGGLE_AUDIO, cb);
  const onToggleVideo = (cb: Callback) =>
    socket?.on(CallEvents.CALL_TOGGLE_VIDEO, cb);
  const onMissed = (cb: (data: { message: string }) => void) =>
    socket?.on(CallEvents.CALL_MISSED, cb);

  const getAllUsers = (cb: UsersCallback) => {
    socket?.on("all-users", cb);
  };

  // Remove listeners
  const off = (
    event: string,
    cb:
      | Callback
      | (() => void)
      | ((data: { message: string }) => void)
      | UsersCallback,
  ) => socket?.off(event, cb);

  return {
    initiateCall,
    acceptCall,
    rejectCall,
    cancelCall,
    endCall,
    sendOffer,
    sendAnswer,
    sendIceCandidate,
    toggleAudio,
    toggleVideo,
    onIncomingCall,
    onRinging,
    onAccept,
    onOffer,
    onAnswer,
    onIce,
    onEnd,
    onReject,
    onCancelled,
    onBusy,
    onUnavailable,
    onToggleAudio,
    onToggleVideo,
    onMissed,
    off,
    socket,
    getAllUsers,
  };
};
