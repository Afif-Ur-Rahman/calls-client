"use client";

import { PrivateCall, IncomingCall, GroupCall } from "@/components";
import { useCall } from "@/hooks/useCall";
import { useCallStore } from "@/store/call-store";
import { CallSelector, LoginCall } from "./blocks";

export const Home = () => {
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
  const { userId, isGroupCall, activeCall } = useCallStore();

  if (isGroupCall === null && !incomingCall && !activeCall) {
    return <LoginCall />;
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

      <CallSelector startCall={startCall} />

      {incomingCall && (
        <IncomingCall
          from={incomingCall.from}
          callType={incomingCall.callType}
          groupCall={incomingCall.groupCall}
          onAccept={handleAcceptCall}
          onReject={handleRejectCall}
        />
      )}

      {callStatus === "connected" && !activeCall?.groupCall ?
        <PrivateCall
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
        :
        <GroupCall
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
        />}
    </div>
  );
}
