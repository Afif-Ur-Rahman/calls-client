"use client";

import { useCallback, useEffect, useRef } from "react";
import { Call, CallEvents, CallType } from "@/enum/socket-enum";
import { acquireMedia, createPc } from "@/lib/webrtc";
import { useCallStore } from "@/store/call-store";
import { useCallSocket } from "./useCallSocket";
import { createSocket } from "@/lib/socket";

export const useCall = () => {
  const {
    userId,
    incomingCall,
    activeCall,
    callStatus,
    isMuted,
    isCameraOff,
    remoteAudioEnabled,
    remoteVideoEnabled,
    connectedAt,
    errorMessage,
    setIncomingCall,
    setActiveCall,
    setCallStatus,
    setIsMuted,
    setIsCameraOff,
    setRemoteAudioEnabled,
    setRemoteVideoEnabled,
    setConnectedAt,
    setErrorMessage,
    resetCall,
    socket,
    setSocket,
  } = useCallStore();

  const pc = useRef<RTCPeerConnection | null>(null);
  const localStream = useRef<MediaStream | null>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const iceCandidateQueue = useRef<RTCIceCandidateInit[]>([]);
  const callTypeRef = useRef<CallType>(CallType.VIDEO);
  const ringtoneRef = useRef<HTMLAudioElement | null>(null);
  const endCallRef = useRef(() => {});

  const {
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
    initiateCall,
    acceptCall,
    rejectCall,
    cancelCall,
    off,
  } = useCallSocket();

  useEffect(() => {
    if (activeCall?.callType) callTypeRef.current = activeCall.callType;
  }, [activeCall?.callType]);

  useEffect(() => {
    if (userId && !socket) {
      const s = createSocket(userId);
      setSocket(s);
    }
  }, [userId, socket, setSocket]);

  const cleanup = useCallback(() => {
    pc.current?.close();
    pc.current = null;
    localStream.current?.getTracks().forEach((t) => t.stop());
    localStream.current = null;

    if (localVideoRef.current) localVideoRef.current.srcObject = null;
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;

    resetCall();
    iceCandidateQueue.current = [];
  }, [resetCall]);

  const endCall = useCallback(() => {
    if (activeCall?.remoteUserId && activeCall.callId) {
      socket?.emit(CallEvents.CALL_END, {
        to: activeCall.remoteUserId,
        callId: activeCall.callId,
      });
    }
    cleanup();
  }, [activeCall, cleanup, socket]);

  useEffect(() => {
    endCallRef.current = endCall;
  }, [endCall]);

  useEffect(() => {
    if (!socket) return;

    const handleIncoming = (data: Call) => {
      setIncomingCall({
        from: data.from,
        callId: data.callId,
        callType: data.callType,
      });
      setActiveCall({
        callId: data.callId,
        remoteUserId: data.from,
        callType: data.callType,
      });
      socket.emit("call:ringing", {
        to: data.from,
        callId: data.callId,
        callType: data.callType,
      });
    };

    const handleRinging = (data: Call) => {
      setCallStatus("ringing");
      setActiveCall({
        callId: data.callId,
        remoteUserId: data.from,
        callType: data.callType,
      });
    };

    const handleAccept = async ({
      from,
      callId: cId,
    }: {
      from: string;
      callId: string;
    }) => {
      const peerConnection = createPc({
        pc,
        targetId: from,
        currentCallId: cId,
        remoteVideoRef,
        socketRef: socket,
        setCallStatus,
        setConnectedAt,
        endCallRef: endCallRef.current,
        connectedAt,
      });
      const stream =
        localStream.current ??
        (await acquireMedia({
          type: callTypeRef.current,
          localStream,
          localVideoRef,
        }));
      stream
        .getTracks()
        .forEach((track) => peerConnection.addTrack(track, stream));

      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);

      socket.emit(CallEvents.CALL_OFFER, { to: from, offer, callId: cId });
    };

    const handleOffer = async ({
      from,
      offer,
      callId: cId,
    }: {
      from: string;
      offer: RTCSessionDescriptionInit;
      callId: string;
    }) => {
      const peerConnection = createPc({
        pc,
        targetId: from,
        currentCallId: cId,
        remoteVideoRef,
        socketRef: socket,
        setCallStatus,
        setConnectedAt,
        endCallRef: endCallRef.current,
        connectedAt,
      });

      const stream =
        localStream.current ??
        (await acquireMedia({
          type: callTypeRef.current,
          localStream,
          localVideoRef,
        }));

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

      socket?.emit(CallEvents.CALL_ANSWER, {
        to: from,
        answer,
        callId: cId,
      });
    };

    const handleAnswer = async ({
      answer,
    }: {
      answer: RTCSessionDescriptionInit;
    }) => {
      if (pc.current) {
        await pc.current.setRemoteDescription(
          new RTCSessionDescription(answer),
        );
      }
    };

    const handleIce = async ({
      candidate,
    }: {
      candidate: RTCIceCandidateInit;
    }) => {
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
    };

    const handleBusy = ({ message }: { message: string }) => {
      setCallStatus("busy");
      setErrorMessage(message);
    };

    const handleUnavailable = ({ message }: { message: string }) => {
      setErrorMessage(message);
      cleanup();
    };

    const handleToggleAudio = ({
      enabled,
    }: {
      from: string;
      callId: string;
      enabled: boolean;
    }) => setRemoteAudioEnabled(enabled);
    
    const handleToggleVideo = ({
      enabled,
    }: {
      from: string;
      callId: string;
      enabled: boolean;
    }) => setRemoteVideoEnabled(enabled);
    
    const handleMissed = ({ message }: { message?: string }) => {
      setCallStatus("missed");
      setErrorMessage(message || "Missed call");
    };

    onIncomingCall(handleIncoming);
    onRinging(handleRinging);
    onAccept(handleAccept);
    onOffer(handleOffer);
    onAnswer(handleAnswer);
    onIce(handleIce);
    onEnd(cleanup);
    onReject(cleanup);
    onCancelled(cleanup);
    onBusy(handleBusy);
    onUnavailable(handleUnavailable);
    onToggleAudio(handleToggleAudio);
    onToggleVideo(handleToggleVideo);
    onMissed(handleMissed);

    return () => {
      off(CallEvents.CALL_INCOMING, handleIncoming);
      off(CallEvents.CALL_RINGING, handleRinging);
      off(CallEvents.CALL_ACCEPT, handleAccept);
      off(CallEvents.CALL_OFFER, handleOffer);
      off(CallEvents.CALL_ANSWER, handleAnswer);
      off(CallEvents.CALL_ICE, handleIce);
      off(CallEvents.CALL_END, cleanup);
      off(CallEvents.CALL_REJECT, cleanup);
      off(CallEvents.CALL_CANCELLED, cleanup);
      off(CallEvents.CALL_BUSY, handleBusy);
      off(CallEvents.CALL_UNAVAILABLE, handleUnavailable);
      off(CallEvents.CALL_TOGGLE_AUDIO, handleToggleAudio);
      off(CallEvents.CALL_TOGGLE_VIDEO, handleToggleVideo);
      off(CallEvents.CALL_MISSED, handleMissed);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket]);

  const startCall = useCallback(
    async (to: string, type: CallType = CallType.VIDEO) => {
      if (!socket?.connected) {
        setErrorMessage("Socket not connected. Please try again.");
        return;
      }
      setCallStatus("calling");
      setActiveCall({ callId: "", remoteUserId: to, callType: type });
      setErrorMessage(null);
      await acquireMedia({ type, localStream, localVideoRef });
      initiateCall(to, type);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [acquireMedia, socket],
  );

  const handleAcceptCall = useCallback(async () => {
    if (!incomingCall) return;

    const { from, callId: cId, callType: cType } = incomingCall;
    setIncomingCall(null);
    setActiveCall({
      callId: cId,
      remoteUserId: from,
      callType: cType ?? CallType.VIDEO,
    });

    await acquireMedia({
      type: cType ?? CallType.VIDEO,
      localStream,
      localVideoRef,
    });

    acceptCall(from, cId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [incomingCall, acquireMedia, socket]);

  const handleRejectCall = useCallback(() => {
    if (!incomingCall) return;

    rejectCall(incomingCall.from, incomingCall.callId);
    cleanup();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [incomingCall, cleanup, socket]);

  const handleCancelCall = useCallback(() => {
    if (activeCall?.remoteUserId && activeCall.callId) {
      cancelCall(activeCall.remoteUserId, activeCall.callId);
    }
    cleanup();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeCall, cleanup, socket]);

  const toggleMute = useCallback(() => {
    if (localStream.current) {
      const newEnabled = !localStream.current.getAudioTracks()[0]?.enabled;
      localStream.current.getAudioTracks().forEach((track) => {
        track.enabled = newEnabled;
      });
      setIsMuted(!newEnabled);

      if (activeCall) {
        socket?.emit(CallEvents.CALL_TOGGLE_AUDIO, {
          to: activeCall.remoteUserId,
          callId: activeCall.callId,
          enabled: newEnabled,
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeCall, socket]);

  const toggleCamera = useCallback(() => {
    if (localStream.current) {
      const newEnabled = !localStream.current.getVideoTracks()[0]?.enabled;
      localStream.current.getVideoTracks().forEach((track) => {
        track.enabled = newEnabled;
      });
      setIsCameraOff(!newEnabled);

      if (activeCall?.remoteUserId && activeCall?.callId) {
        socket?.emit(CallEvents.CALL_TOGGLE_VIDEO, {
          to: activeCall.remoteUserId,
          callId: activeCall.callId,
          enabled: newEnabled,
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeCall, socket]);

  const startRingtone = useCallback(() => {
    const audioSrc =
      callTypeRef.current === CallType.VIDEO
        ? "/audio/videoNotif.mp3"
        : "/audio/notification.mp3";
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
    if (callStatus === "ringing" && incomingCall) startRingtone();
    else stopRingtone();
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
    handleAcceptCall,
    handleRejectCall,
    handleCancelCall,
    endCall,
    toggleMute,
    toggleCamera,
    localVideoRef,
    remoteVideoRef,
    cleanup,
  };
};
