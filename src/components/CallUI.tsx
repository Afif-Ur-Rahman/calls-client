"use client";

import { CallStatus } from "@/hooks/useCall";
import { CallType } from "@/enum/socket-enum";

type Props = {
  localVideoRef: React.RefObject<HTMLVideoElement | null>;
  remoteVideoRef: React.RefObject<HTMLVideoElement | null>;
  callStatus: CallStatus;
  callType: CallType;
  remoteUserId: string | null;
  isMuted: boolean;
  isCameraOff: boolean;
  remoteAudioEnabled: boolean;
  remoteVideoEnabled: boolean;
  callDuration: number;
  onEndCall: () => void;
  onCancelCall: () => void;
  onToggleMute: () => void;
  onToggleCamera: () => void;
};

const formatDuration = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
};

export const CallUI = ({
  localVideoRef,
  remoteVideoRef,
  callStatus,
  callType,
  remoteUserId,
  isMuted,
  isCameraOff,
  remoteAudioEnabled,
  remoteVideoEnabled,
  callDuration,
  onEndCall,
  onCancelCall,
  onToggleMute,
  onToggleCamera,
}: Props) => {
  if (callStatus === "idle") return null;

  const isConnected = callStatus === "connected";
  const isVideoCall = callType === CallType.VIDEO;

  return (
    <div className="fixed inset-0 z-40 flex flex-col bg-black">
      <div className="absolute left-0 right-0 top-0 z-50 flex items-center justify-between bg-linear-to-b from-black/80 to-transparent px-6 py-4">
        <div className="flex flex-col">
          <span className="text-lg font-semibold text-white">
            {remoteUserId ?? "Unknown"}
          </span>
          <span className="text-sm text-gray-300">
            {callStatus === "calling" && "Calling…"}
            {callStatus === "ringing" && "Ringing…"}
            {isConnected && formatDuration(callDuration)}
          </span>
        </div>

        {isConnected && (
          <div className="flex gap-2">
            {!remoteAudioEnabled && (
              <span className="rounded-full bg-red-500/80 px-2 py-1 text-xs text-white">
                🔇 Muted
              </span>
            )}
            {!remoteVideoEnabled && isVideoCall && (
              <span className="rounded-full bg-red-500/80 px-2 py-1 text-xs text-white">
                📷 Off
              </span>
            )}
          </div>
        )}
      </div>

      {isVideoCall ? (
        <>
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="h-full w-full object-cover"
          />
          {(!remoteVideoEnabled && isConnected) && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900">
              <div className="flex h-28 w-28 items-center justify-center rounded-full bg-linear-to-br from-gray-600 to-gray-800 text-5xl font-bold text-white">
                {remoteUserId?.charAt(0).toUpperCase() ?? "?"}
              </div>
              <p className="mt-4 text-gray-400">Camera is off</p>
            </div>
          )}
        </>
      ) : (
        <>
          <audio ref={remoteVideoRef} autoPlay playsInline />
          {isConnected && (
            <div className="flex h-full w-full flex-col items-center justify-center bg-linear-to-b from-gray-800 to-gray-950">
              <div className="flex h-32 w-32 items-center justify-center rounded-full bg-linear-to-br from-green-400 to-green-600 text-6xl font-bold text-white">
                {remoteUserId?.charAt(0).toUpperCase() ?? "?"}
              </div>
              <p className="mt-6 text-2xl font-semibold text-white">{remoteUserId}</p>
            </div>
          )}
        </>
      )}

      {!isConnected && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900/90">
          <div className="flex h-32 w-32 items-center justify-center rounded-full bg-linear-to-br from-green-400 to-green-600 text-6xl font-bold text-white shadow-xl">
            {remoteUserId?.charAt(0).toUpperCase() ?? "?"}
          </div>
          <p className="mt-6 text-2xl font-semibold text-white">
            {remoteUserId}
          </p>
          <p className="mt-2 animate-pulse text-gray-400">
            {callStatus === "calling" ? "Calling…" : "Ringing…"}
          </p>
          <p className="mt-1 text-sm text-gray-500">
            {callType === CallType.VIDEO ? "Video call" : "Audio call"}
          </p>
        </div>
      )}

      {isVideoCall && (
        <div className="absolute bottom-32 right-4 z-50 overflow-hidden rounded-2xl border-2 border-white/20 shadow-xl">
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="h-48 w-36 object-cover"
          />
          {isCameraOff && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-800 text-sm text-gray-400">
              Camera Off
            </div>
          )}
        </div>
      )}

      <div className="absolute bottom-0 left-0 right-0 z-50 flex items-center justify-center gap-5 bg-linear-to-t from-black/90 to-transparent px-6 py-8">
        <button
          onClick={onToggleMute}
          className={`flex h-14 w-14 items-center justify-center rounded-full text-xl transition active:scale-95 ${isMuted
            ? "bg-white text-gray-900"
            : "bg-white/20 text-white hover:bg-white/30"
            }`}
          aria-label={isMuted ? "Unmute" : "Mute"}
        >
          {isMuted ? "🔇" : "🎤"}
        </button>

        {isVideoCall && (
          <button
            onClick={onToggleCamera}
            className={`flex h-14 w-14 items-center justify-center rounded-full text-xl transition active:scale-95 ${isCameraOff
              ? "bg-white text-gray-900"
              : "bg-white/20 text-white hover:bg-white/30"
              }`}
            aria-label={isCameraOff ? "Turn camera on" : "Turn camera off"}
          >
            {isCameraOff ? "🚫" : "📷"}
          </button>
        )}

        <button
          onClick={isConnected ? onEndCall : onCancelCall}
          className="flex h-14 w-16 items-center justify-center rounded-full bg-red-500 text-xl text-white shadow-lg transition hover:bg-red-600 active:scale-95"
          aria-label={isConnected ? "End call" : "Cancel call"}
        >
          📵
        </button>
      </div>
    </div>
  );
};
