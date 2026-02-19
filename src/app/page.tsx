"use client";

import { useState } from "react";
import { CallUI, IncomingCall } from "@/components";
import { useCall } from "@/hooks/useCall";
import { CallType } from "@/enum/socket-enum";
import { LogOut, Phone, User, Users, Video } from "lucide-react";
import { useCallStore } from "@/store/call-store";

export default function Home() {
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
  } = useCall();
  const { userId, setUserId, isGroupCall, setIsGroupCall, activeCall, logout } = useCallStore();
  const [userIdInput, setUserIdInput] = useState("");
  const [targetIds, setTargetIds] = useState<string[]>([]);
  const [isJoined, setIsJoined] = useState(false);

  const handleLogout = () => {
    setUserIdInput("");
    setIsJoined(false);
    setTargetIds([]);
    logout();
  };

  if (isGroupCall === null && !incomingCall && !activeCall) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-6 bg-gray-950 text-white">
        <h1 className="text-3xl font-bold">📞 WebRTC Calls</h1>
        {!isJoined && !userId ?
          <>
            <p className="text-gray-400">Enter your user ID to get started</p>
            <input
              type="text"
              placeholder="Your User ID"
              value={userIdInput}
              onChange={(e) => setUserIdInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && userIdInput.trim() && setUserId(userIdInput) && setIsJoined(true)}
              className="w-72 rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 text-center text-white placeholder-gray-500 outline-none focus:border-green-500"
            />
            <button
              onClick={() => {
                if (!userIdInput.trim()) return;
                setUserId(userIdInput)
                setIsJoined(true)
              }}
              disabled={!userIdInput.trim()}
              className="rounded-lg bg-green-600 px-8 py-3 font-semibold text-white transition hover:bg-green-700 disabled:opacity-50"
            >
              Join
            </button>
          </>
          :
          <div className="flex flex-col items-center gap-3">
            <h1 className="text-2xl font-bold">Hi, {userId} 👋</h1>
            <p className="text-gray-400">Select Call Type</p>
            <div className="flex gap-2">
              <button
                onClick={() => setIsGroupCall(false)}
                className="flex justify-between items-center gap-1 rounded-md bg-green-600 px-8 py-3 font-semibold text-white transition hover:bg-green-700"
              >
                <User /> Private
              </button>
              <button
                onClick={() => setIsGroupCall(true)}
                className="flex justify-between items-center gap-1 rounded-md bg-blue-600 px-8 py-3 font-semibold text-white transition hover:bg-blue-700"
              >
                <Users /> Group
              </button>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-red-600 px-6 py-3 font-semibold text-white transition hover:bg-red-700"
            >
              <LogOut className="rotate-180" /> Logout
            </button>
          </div>
        }
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col items-center justify-center gap-6 bg-gray-950 text-white">
      <h1 className="text-2xl font-bold">Hi, {userId} 👋</h1>
      <p className="text-sm text-gray-400">{isGroupCall ? "Select users to call" : "Select a user to call"}</p>

      {errorMessage && (
        <div className="rounded-lg bg-red-500/20 px-4 py-2 text-sm text-red-400">
          {errorMessage}
        </div>
      )}

      <div className="flex flex-col items-center gap-3">
        <button
          onClick={() => setIsGroupCall(isGroupCall ? false : true)}
          className="w-full text-center rounded-lg bg-green-600 px-6 py-3 font-semibold text-white transition hover:bg-green-700"
        >
          {`Switch to ${isGroupCall ? "Private" : "Group"} Call`}
        </button>
        {isGroupCall ? null : <input
          type="text"
          placeholder="Target User ID"
          value={targetIds[0] || ""}
          onChange={(e) => setTargetIds([e.target.value])}
          className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 text-center text-white placeholder-gray-500 outline-none focus:border-green-500"
        />}
        <div className="flex w-full gap-3">
          <button
            onClick={() => targetIds[0]?.trim() && startCall(targetIds[0], CallType.AUDIO)}
            disabled={!targetIds[0]?.trim() || callStatus !== "idle"}
            className="flex flex-1 rounded-lg bg-green-600 px-6 py-3 font-semibold text-white transition hover:bg-green-700 disabled:opacity-50"
          >
            <span className="flex items-center gap-2">
              <Phone width={20} height={20} strokeWidth={0} fill="white" /> Audio
            </span>
          </button>
          <button
            onClick={() => targetIds[0]?.trim() && startCall(targetIds[0], CallType.VIDEO)}
            disabled={!targetIds[0]?.trim() || callStatus !== "idle"}
            className="flex flex-1 rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
          >
            <span className="flex items-center gap-2">
              <Video fill="white" /> Video
            </span>
          </button>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 rounded-lg bg-red-600 px-6 py-3 font-semibold text-white transition hover:bg-red-700"
        >
          <LogOut className="rotate-180" /> Logout
        </button>
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
