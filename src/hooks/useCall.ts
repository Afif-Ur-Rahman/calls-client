"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getSocket } from "@/lib/socket";
import { CallEvents, CallType } from "@/enum/socket-enum";
import { createPeerConnection } from "@/lib/webrtc";

export type CallStatus =
  | "idle"
  | "calling"
  | "ringing"
  | "connected"
  | "busy"
  | "missed";

export interface CallInfo {
  from: string;
  callId: string;
  callType?: CallType;
}

interface ActiveCall {
  callId: string;
  remoteUserId: string;
  callType: CallType;
}

export const useCall = (userId: string) => {
  const pc = useRef<RTCPeerConnection | null>(null);
  const localStream = useRef<MediaStream | null>(null);
  const ringtoneRef = useRef<HTMLAudioElement | null>(null);

  const iceCandidateQueue = useRef<RTCIceCandidateInit[]>([]);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  const [incomingCall, setIncomingCall] = useState<CallInfo | null>(null);
  const [callStatus, setCallStatus] = useState<CallStatus>("idle");
  const [activeCall, setActiveCall] = useState<ActiveCall | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [remoteAudioEnabled, setRemoteAudioEnabled] = useState(true);
  const [remoteVideoEnabled, setRemoteVideoEnabled] = useState(true);
  const [connectedAt, setConnectedAt] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const socketRef = useRef(userId ? getSocket(userId) : null);

  const callTypeRef = useRef<CallType>(CallType.VIDEO);

  useEffect(() => {
    if (activeCall?.callType) {
      callTypeRef.current = activeCall.callType;
    }
  }, [activeCall?.callType]);

  useEffect(() => {
    if (userId) {
      socketRef.current = getSocket(userId);
    }
  }, [userId]);

  const acquireMedia = useCallback(async (type: CallType = CallType.VIDEO) => {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: type === CallType.VIDEO,
    });
    localStream.current = stream;
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = stream;
    }
    return stream;
  }, []);

  const endCallRef = useRef(() => {});

  const createPc = useCallback((targetId: string, currentCallId: string) => {
    const peerConnection = createPeerConnection();

    peerConnection.ontrack = (e) => {
      const stream = e.streams[0];
      if (!stream) return;

      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = stream;
      }

      (
        peerConnection as unknown as { remoteStream: MediaStream }
      ).remoteStream = stream;
    };

    peerConnection.onicecandidate = (e) => {
      if (e.candidate) {
        socketRef.current?.emit(CallEvents.CALL_ICE, {
          to: targetId,
          candidate: e.candidate,
          callId: currentCallId,
        });
      }
    };

    peerConnection.oniceconnectionstatechange = () => {
      const state = peerConnection.iceConnectionState;
      if (state === "connected" || state === "completed") {
        setCallStatus("connected");
        setConnectedAt((prev) => prev ?? Date.now());
      }
      if (state === "failed") {
        endCallRef.current();
      }
    };

    pc.current = peerConnection;
    return peerConnection;
  }, []);

  const cleanup = useCallback(() => {
    pc.current?.close();
    pc.current = null;
    localStream.current?.getTracks().forEach((t) => t.stop());
    localStream.current = null;
    if (localVideoRef.current) localVideoRef.current.srcObject = null;
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
    setCallStatus("idle");
    setIncomingCall(null);
    setActiveCall(null);
    setIsMuted(false);
    setIsCameraOff(false);
    setRemoteAudioEnabled(true);
    setRemoteVideoEnabled(true);
    setConnectedAt(null);
    setErrorMessage(null);
    iceCandidateQueue.current = [];
  }, []);

  const endCall = useCallback(() => {
    if (activeCall?.remoteUserId && activeCall.callId) {
      socketRef.current?.emit(CallEvents.CALL_END, {
        to: activeCall.remoteUserId,
        callId: activeCall.callId,
      });
    }
    cleanup();
  }, [activeCall, cleanup]);
  useEffect(() => {
    endCallRef.current = endCall;
  }, [endCall]);

  useEffect(() => {
    if (!userId) return;

    const s = getSocket(userId);
    socketRef.current = s;

    s.on(
      CallEvents.CALL_INCOMING,
      ({
        callId: cId,
        from,
        callType: cType,
      }: {
        callId: string;
        from: string;
        callType: CallType;
      }) => {
        setIncomingCall({ from, callId: cId, callType: cType });
        setActiveCall({ callId: cId, remoteUserId: from, callType: cType });

        s.emit(CallEvents.CALL_RINGING, { to: from, callId: cId });
      },
    );

    s.on(
      CallEvents.CALL_RINGING,
      ({ callId }: { from: string; callId: string }) => {
        setCallStatus("ringing");
        setActiveCall((prev) => (prev ? { ...prev, callId: callId } : prev));
      },
    );

    s.on(
      CallEvents.CALL_ACCEPT,
      async ({ from, callId: cId }: { from: string; callId: string }) => {
        const peerConnection = createPc(from, cId);
        const stream =
          localStream.current ?? (await acquireMedia(callTypeRef.current));
        stream
          .getTracks()
          .forEach((track) => peerConnection.addTrack(track, stream));

        const offer = await peerConnection.createOffer();
        await peerConnection.setLocalDescription(offer);

        s.emit(CallEvents.CALL_OFFER, { to: from, offer, callId: cId });
      },
    );

    s.on(
      CallEvents.CALL_OFFER,
      async ({
        from,
        offer,
        callId: cId,
      }: {
        from: string;
        offer: RTCSessionDescriptionInit;
        callId: string;
      }) => {
        const peerConnection = createPc(from, cId);

        const stream =
          localStream.current ?? (await acquireMedia(callTypeRef.current));

        stream
          .getTracks()
          .forEach((track) => peerConnection.addTrack(track, stream));

        await peerConnection.setRemoteDescription(
          new RTCSessionDescription(offer),
        );

        for (const c of iceCandidateQueue.current) {
          try {
            await peerConnection.addIceCandidate(new RTCIceCandidate(c));
          } catch (err) {
            console.warn("Error adding queued ICE candidate:", err);
          }
        }
        iceCandidateQueue.current = [];

        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answer);

        s.emit(CallEvents.CALL_ANSWER, { to: from, answer, callId: cId });
      },
    );

    s.on(
      CallEvents.CALL_ANSWER,
      async ({
        answer,
      }: {
        from: string;
        answer: RTCSessionDescriptionInit;
        callId: string;
      }) => {
        if (pc.current) {
          await pc.current.setRemoteDescription(
            new RTCSessionDescription(answer),
          );
        }
      },
    );

    s.on(
      CallEvents.CALL_ICE,
      async ({ candidate }: { candidate: RTCIceCandidateInit }) => {
        const peerConnection = pc.current;

        if (
          !peerConnection ||
          peerConnection.signalingState === "closed" ||
          !peerConnection.remoteDescription
        ) {
          iceCandidateQueue.current.push(candidate);
          return;
        }

        try {
          await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (err) {
          console.warn("Ignoring ICE candidate error:", err);
        }
      },
    );

    s.on(CallEvents.CALL_END, () => cleanup());
    s.on(CallEvents.CALL_REJECT, () => cleanup());
    s.on(CallEvents.CALL_CANCELLED, () => cleanup());

    s.on(CallEvents.CALL_BUSY, ({ message }: { message: string }) => {
      setCallStatus("busy");
      setErrorMessage(message);
    });

    s.on(CallEvents.CALL_UNAVAILABLE, ({ message }: { message: string }) => {
      setErrorMessage(message);
      cleanup();
    });

    s.on(
      CallEvents.CALL_TOGGLE_AUDIO,
      ({ enabled }: { from: string; callId: string; enabled: boolean }) => {
        setRemoteAudioEnabled(enabled);
      },
    );

    s.on(
      CallEvents.CALL_TOGGLE_VIDEO,
      ({ enabled }: { from: string; callId: string; enabled: boolean }) => {
        setRemoteVideoEnabled(enabled);
      },
    );

    s.on(CallEvents.CALL_MISSED, ({ message }: { message: string }) => {
      setCallStatus("missed");
      setErrorMessage(message || "Missed call");
    });

    return () => {
      s.off(CallEvents.CALL_INCOMING);
      s.off(CallEvents.CALL_RINGING);
      s.off(CallEvents.CALL_ACCEPT);
      s.off(CallEvents.CALL_OFFER);
      s.off(CallEvents.CALL_ANSWER);
      s.off(CallEvents.CALL_ICE);
      s.off(CallEvents.CALL_END);
      s.off(CallEvents.CALL_REJECT);
      s.off(CallEvents.CALL_CANCELLED);
      s.off(CallEvents.CALL_BUSY);
      s.off(CallEvents.CALL_UNAVAILABLE);
      s.off(CallEvents.CALL_TOGGLE_AUDIO);
      s.off(CallEvents.CALL_TOGGLE_VIDEO);
      s.off(CallEvents.CALL_MISSED);
    };
  }, [userId, cleanup, acquireMedia, createPc]);

  const startCall = useCallback(
    async (to: string, type: CallType = CallType.VIDEO) => {
      const s = socketRef.current;

      if (!s?.connected) {
        console.error("Socket not connected! Cannot initiate call.");
        setErrorMessage("Socket not connected. Please try again.");
        return;
      }

      setCallStatus("calling");
      setActiveCall({ callId: "", remoteUserId: to, callType: type });
      setErrorMessage(null);

      await acquireMedia(type);

      s.emit(CallEvents.CALL_INITIATE, {
        to,
        callType: type,
      });
    },
    [acquireMedia],
  );

  const acceptCall = useCallback(async () => {
    if (!incomingCall) return;

    const { from, callId: cId, callType: cType } = incomingCall;
    setIncomingCall(null);
    setActiveCall({
      callId: cId,
      remoteUserId: from,
      callType: cType ?? CallType.VIDEO,
    });

    await acquireMedia(cType ?? CallType.VIDEO);

    socketRef.current?.emit(CallEvents.CALL_ACCEPT, { to: from, callId: cId });
  }, [incomingCall, acquireMedia]);

  const rejectCall = useCallback(() => {
    if (!incomingCall) return;

    socketRef.current?.emit(CallEvents.CALL_REJECT, {
      to: incomingCall.from,
      callId: incomingCall.callId,
    });
    cleanup();
  }, [incomingCall, cleanup]);

  const cancelCall = useCallback(() => {
    if (activeCall?.remoteUserId && activeCall.callId) {
      socketRef.current?.emit(CallEvents.CALL_CANCELLED, {
        to: activeCall.remoteUserId,
        callId: activeCall.callId,
      });
    }
    cleanup();
  }, [activeCall, cleanup]);

  const toggleMute = useCallback(() => {
    if (localStream.current) {
      const newEnabled = !localStream.current.getAudioTracks()[0]?.enabled;
      localStream.current.getAudioTracks().forEach((track) => {
        track.enabled = newEnabled;
      });
      setIsMuted(!newEnabled);

      if (activeCall) {
        socketRef.current?.emit(CallEvents.CALL_TOGGLE_AUDIO, {
          to: activeCall.remoteUserId,
          callId: activeCall.callId,
          enabled: newEnabled,
        });
      }
    }
  }, [activeCall]);

  const toggleCamera = useCallback(() => {
    if (localStream.current) {
      const newEnabled = !localStream.current.getVideoTracks()[0]?.enabled;
      localStream.current.getVideoTracks().forEach((track) => {
        track.enabled = newEnabled;
      });
      setIsCameraOff(!newEnabled);

      if (activeCall?.remoteUserId && activeCall?.callId) {
        socketRef.current?.emit(CallEvents.CALL_TOGGLE_VIDEO, {
          to: activeCall.remoteUserId,
          callId: activeCall.callId,
          enabled: newEnabled,
        });
      }
    }
  }, [activeCall]);

  const startRingtone = useCallback(() => {
    const audioSrc =
      callTypeRef.current === CallType.VIDEO
        ? "/audio/videoNotif.mp3"
        : "/audio/notification.mp3";

    if (
      ringtoneRef.current &&
      ringtoneRef.current.src !== new URL(audioSrc, window.location.origin).href
    ) {
      ringtoneRef.current.pause();
      ringtoneRef.current = null;
    }

    if (!ringtoneRef.current) {
      ringtoneRef.current = new Audio(audioSrc);
      ringtoneRef.current.loop = true;
    }
    ringtoneRef.current.currentTime = 0;
    ringtoneRef.current.play().catch((err) => {
      console.warn("Could not play ringtone:", err);
    });
  }, []);

  const stopRingtone = useCallback(() => {
    if (ringtoneRef.current) {
      ringtoneRef.current.pause();
      ringtoneRef.current.currentTime = 0;
    }
  }, []);

  useEffect(() => {
    if (callStatus === "ringing" && incomingCall) {
      startRingtone();
    } else {
      stopRingtone();
    }
    return () => stopRingtone();
  }, [callStatus, incomingCall, startRingtone, stopRingtone]);

  useEffect(() => {
    if (
      remoteVideoRef.current &&
      pc.current &&
      (pc.current as unknown as { remoteStream: MediaStream }).remoteStream &&
      !remoteVideoRef.current.srcObject
    ) {
      remoteVideoRef.current.srcObject = (
        pc.current as unknown as { remoteStream: MediaStream }
      ).remoteStream;
    }

    if (
      localVideoRef.current &&
      localStream.current &&
      !localVideoRef.current.srcObject
    ) {
      localVideoRef.current.srcObject = localStream.current;
    }
  });

  return {
    incomingCall,
    callStatus,
    callType: activeCall?.callType ?? CallType.VIDEO,
    callId: activeCall?.callId ?? null,
    remoteUserId: activeCall?.remoteUserId ?? null,
    isMuted,
    isCameraOff,
    remoteAudioEnabled,
    remoteVideoEnabled,
    connectedAt,
    errorMessage,
    startCall,
    acceptCall,
    rejectCall,
    cancelCall,
    endCall,
    toggleMute,
    toggleCamera,
    localVideoRef,
    remoteVideoRef,
    cleanup,
  };
};
