"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { CallUI, IncomingCall } from "@/components";
import { useCall } from "@/hooks/useCall";
import { CallType } from "@/enum/socket-enum";

function CallPageContent() {
  const params = useSearchParams();
  const userId = params.get("userId") ?? "guest";
  const targetId = params.get("targetId");
  const type = (params.get("callType") as CallType) ?? CallType.VIDEO;

  const {
    startCall,
    acceptCall,
    rejectCall,
    cancelCall,
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
    callDuration,
    localVideoRef,
    remoteVideoRef,
  } = useCall(userId);

  return (
    <div className="flex h-screen flex-col items-center justify-center gap-4 bg-gray-950 text-white">
      <h2 className="text-xl font-semibold">Logged in as: {userId}</h2>

      {callStatus === "idle" && targetId && (
        <div className="flex gap-3">
          <button
            className="rounded-lg bg-green-600 px-8 py-3 font-semibold text-white transition hover:bg-green-700"
            onClick={() => startCall(targetId, CallType.AUDIO)}
          >
            📞 Audio Call {targetId}
          </button>
          <button
            className="rounded-lg bg-blue-600 px-8 py-3 font-semibold text-white transition hover:bg-blue-700"
            onClick={() => startCall(targetId, type)}
          >
            📹 Video Call {targetId}
          </button>
        </div>
      )}

      {incomingCall && (
        <IncomingCall
          from={incomingCall.from}
          callType={incomingCall.callType}
          onAccept={acceptCall}
          onReject={rejectCall}
        />
      )}

      <CallUI
        localVideoRef={localVideoRef}
        remoteVideoRef={remoteVideoRef}
        callStatus={callStatus}
        callType={callType}
        remoteUserId={remoteUserId}
        isMuted={isMuted}
        isCameraOff={isCameraOff}
        remoteAudioEnabled={remoteAudioEnabled}
        remoteVideoEnabled={remoteVideoEnabled}
        callDuration={callDuration}
        onEndCall={endCall}
        onCancelCall={cancelCall}
        onToggleMute={toggleMute}
        onToggleCamera={toggleCamera}
      />
    </div>
  );
}

export default function CallPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center bg-gray-950 text-white">
          Loading…
        </div>
      }
    >
      <CallPageContent />
    </Suspense>
  );
}
