"use client";

import { useState } from "react";
import { CallUI, IncomingCall } from "@/components";
import { useCall } from "@/hooks/useCall";
import { CallType } from "@/enum/socket-enum";
import { Phone, Video } from "lucide-react";

export default function Home() {
  const [userId, setUserId] = useState("");
  const [targetId, setTargetId] = useState("");
  const [isJoined, setIsJoined] = useState(false);

  const {
    startCall,
    handleAcceptCall,
    handleRejectCall,
    handleCancelCall,
    endCall,
    toggleMute,
    toggleCamera,
    incomingCall,
    callStatus,
    callType,
    remoteUserId,
    isMuted,
    isCameraOff,
    remoteAudioEnabled,
    remoteVideoEnabled,
    connectedAt,
    errorMessage,
    localVideoRef,
    remoteVideoRef,
    cleanup,
  } = useCall(isJoined ? userId : "");

  if (!isJoined) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-6 bg-gray-950 text-white">
        <h1 className="text-3xl font-bold">📞 WebRTC Calls</h1>
        <p className="text-gray-400">Enter your user ID to get started</p>
        <input
          type="text"
          placeholder="Your User ID"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && userId.trim() && setIsJoined(true)}
          className="w-72 rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 text-center text-white placeholder-gray-500 outline-none focus:border-green-500"
        />
        <button
          onClick={() => userId.trim() && setIsJoined(true)}
          disabled={!userId.trim()}
          className="rounded-lg bg-green-600 px-8 py-3 font-semibold text-white transition hover:bg-green-700 disabled:opacity-50"
        >
          Join
        </button>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col items-center justify-center gap-6 bg-gray-950 text-white">
      <h1 className="text-2xl font-bold">Hi, {userId} 👋</h1>
      <p className="text-sm text-gray-400">Enter a user ID to call</p>

      {errorMessage && (
        <div className="rounded-lg bg-red-500/20 px-4 py-2 text-sm text-red-400">
          {errorMessage}
        </div>
      )}

      <div className="flex flex-col items-center gap-3">
        <input
          type="text"
          placeholder="Target User ID"
          value={targetId}
          onChange={(e) => setTargetId(e.target.value)}
          className="w-64 rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 text-center text-white placeholder-gray-500 outline-none focus:border-green-500"
        />
        <div className="flex gap-3">
          <button
            onClick={() => targetId.trim() && startCall(targetId, CallType.AUDIO)}
            disabled={!targetId.trim() || callStatus !== "idle"}
            className="rounded-lg bg-green-600 px-6 py-3 font-semibold text-white transition hover:bg-green-700 disabled:opacity-50"
          >
            <span className="flex items-center gap-2">
              <Phone width={20} height={20} strokeWidth={0} fill="white" /> Audio
            </span>
          </button>
          <button
            onClick={() => targetId.trim() && startCall(targetId, CallType.VIDEO)}
            disabled={!targetId.trim() || callStatus !== "idle"}
            className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
          >
            <span className="flex items-center gap-2">
              <Video fill="white" /> Video
            </span>
          </button>
        </div>
      </div>

      {incomingCall && (
        <IncomingCall
          from={incomingCall.from}
          callType={incomingCall.callType}
          onAccept={handleAcceptCall}
          onReject={handleRejectCall}
        />
      )}

      <CallUI
        userId={userId}
        localVideoRef={localVideoRef}
        remoteVideoRef={remoteVideoRef}
        callStatus={callStatus}
        callType={callType}
        remoteUserId={remoteUserId}
        isMuted={isMuted}
        isCameraOff={isCameraOff}
        remoteAudioEnabled={remoteAudioEnabled}
        remoteVideoEnabled={remoteVideoEnabled}
        connectedAt={connectedAt}
        onEndCall={endCall}
        onCancelCall={handleCancelCall}
        onToggleMute={toggleMute}
        onToggleCamera={toggleCamera}
        errorMessage={errorMessage}
        onCleanup={cleanup}
      />
    </div>
  );
}
