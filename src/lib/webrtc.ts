import { CallEvents, CallStatus, CallType } from "@/enum";
import { Socket } from "socket.io-client";

export interface AcquireMediaProps {
  type?: CallType;
  localStream: { current: MediaStream | null };
  localVideoRef: { current: HTMLVideoElement | null };
}

export interface CreatePcProps {
  pc: { current: RTCPeerConnection | null };
  targetId: string;
  currentCallId: string;
  remoteVideoRef: React.RefObject<HTMLVideoElement | null>;
  socketRef: Socket | null;
  setCallStatus: (status: CallStatus) => void;
  setConnectedAt: (time: number) => void;
  endCallRef: () => void;
  connectedAt: number | null;
}

export const createPeerConnection = () =>
  new RTCPeerConnection({
    iceServers: [
      { urls: "stun:stun.l.google.com:19302" },
      { urls: "stun:stun1.l.google.com:19302" },
    ],
  });

export const acquireMedia = async ({
  type,
  localStream,
  localVideoRef,
}: AcquireMediaProps) => {
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: true,
    video: type === CallType.VIDEO,
  });
  localStream.current = stream;
  if (localVideoRef.current) {
    localVideoRef.current.srcObject = stream;
  }
  return stream;
};

export const createPc = ({
  pc,
  targetId,
  currentCallId,
  remoteVideoRef,
  socketRef,
  setCallStatus,
  setConnectedAt,
  endCallRef,
  connectedAt,
}: CreatePcProps) => {
  const peerConnection = createPeerConnection();

  peerConnection.ontrack = (e) => {
    const stream = e.streams[0];
    if (!stream) return;

    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = stream;
    }

    (peerConnection as unknown as { remoteStream: MediaStream }).remoteStream =
      stream;
  };

  peerConnection.onicecandidate = (e) => {
    if (e.candidate) {
      socketRef?.emit(CallEvents.CALL_ICE, {
        to: targetId,
        candidate: e.candidate,
        callId: currentCallId,
      });
    }
  };

  peerConnection.oniceconnectionstatechange = () => {
    const state = peerConnection.iceConnectionState;
    if (state === "connected") {
      setCallStatus("connected");

      if (connectedAt === null) {
        setConnectedAt(Date.now());
      }
    }

    if (state === "failed") {
      endCallRef();
    }
  };

  pc.current = peerConnection;
  return peerConnection;
};
