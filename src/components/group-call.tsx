"use client";

import { CallStatus, CallType } from "@/enum/socket-enum";
import { Mic, MicOff, Phone, Video, VideoOff, X } from "lucide-react";
import { CallTimer } from "./call-timer";

type Props = {
  userId: string;
  localVideoRef: React.RefObject<HTMLVideoElement | null>;
  remoteVideoRef: React.RefObject<HTMLVideoElement | null>;
  callStatus: CallStatus;
  callType: CallType;
  remoteUserId: string | null;
  isMuted: boolean;
  isCameraOff: boolean;
  remoteAudioEnabled: boolean;
  remoteVideoEnabled: boolean;
  connectedAt: number | null;
  onEndCall: () => void;
  onCancelCall: () => void;
  onToggleMute: () => void;
  onToggleCamera: () => void;
  errorMessage: string | null;
  onCleanup: () => void;
};

export const GroupCall = ({
  userId,
  localVideoRef,
  remoteVideoRef,
  callStatus,
  callType,
  remoteUserId,
  isMuted,
  isCameraOff,
  remoteAudioEnabled,
  remoteVideoEnabled,
  connectedAt,
  onEndCall,
  onCancelCall,
  onToggleMute,
  onToggleCamera,
  errorMessage,
  onCleanup,
}: Props) => {
  if (callStatus === "idle") return null;

  const isConnected = callStatus === "connected";
  const isBusy = callStatus === "busy";
  const isMissed = callStatus === "missed";
  const isVideoCall = callType === CallType.VIDEO;

  return (
    <div className="fixed inset-0 z-40 flex flex-col bg-black">
      <div className="absolute left-0 right-0 top-0 z-50 flex items-center justify-center bg-linear-to-b from-black/80 to-transparent px-6 py-4">
        <div className="flex flex-col items-center">
          <span className="text-lg font-semibold text-white">
            {remoteUserId ?? "Unknown"}
          </span>
          <span className="text-sm text-white">
            {callStatus === "calling" && "Calling…"}
            {callStatus === "ringing" && "Ringing…"}
            {isBusy && (
              <span className="text-red-400">{errorMessage ?? "User is busy"}</span>
            )}
            {isMissed && (
              <span className="text-red-400">{errorMessage ?? "Missed call"}</span>
            )}
            {isConnected && !remoteAudioEnabled && "Muted"}
            {isConnected && remoteAudioEnabled && connectedAt && (
              <CallTimer connectedAt={connectedAt} />
            )}
          </span>
        </div>
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
            </div>
          )}
        </>
      )}

      {!isConnected && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900/90">
          <div className="flex h-32 w-32 items-center justify-center rounded-full bg-linear-to-br from-green-400 to-green-600 text-6xl font-bold text-white shadow-xl">
            {remoteUserId?.charAt(0).toUpperCase() ?? "?"}
          </div>
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
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900/90">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-linear-to-br from-green-400 to-green-600 text-xl font-bold text-white shadow-xl">
                {userId.charAt(0).toUpperCase() ?? "?"}
              </div>
            </div>
          )}
        </div>
      )}

      {isMissed || isBusy ?
        <div className="absolute bottom-0 left-0 right-0 z-50 flex items-center justify-center gap-5 bg-linear-to-t from-black/90 to-transparent px-6 py-8">
          <button
            onClick={onCleanup}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-500 transition hover:bg-gray-600"
            aria-label="Cancel"
          >
            <X />
          </button>
        </div>
        :
        <div className="absolute bottom-0 left-0 right-0 z-50 flex items-center justify-center gap-5 bg-linear-to-t from-black/90 to-transparent px-6 py-8">
          <button
            onClick={onToggleMute}
            className={`flex h-12 w-12 items-center justify-center rounded-full transition ${isMuted
              ? "bg-white text-gray-900"
              : "bg-white/20 hover:bg-white/30"
              }`}
            aria-label={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted ? <MicOff /> : <Mic />}
          </button>

          {isVideoCall && (
            <button
              onClick={onToggleCamera}
              className={`flex h-12 w-12 items-center justify-center rounded-full transition ${isCameraOff
                ? "bg-white text-gray-900"
                : "bg-white/20 hover:bg-white/30"
                }`}
              aria-label={isCameraOff ? "Turn camera on" : "Turn camera off"}
            >
              {isCameraOff ? <VideoOff /> : <Video />}
            </button>
          )}

          <button
            onClick={isConnected ? onEndCall : onCancelCall}
            className="flex h-12 w-20 items-center justify-center rounded-full bg-red-500 transition hover:bg-red-600"
            aria-label={isConnected ? "End call" : "Cancel call"}
          >
            <Phone strokeWidth={0} fill="white" className="rotate-135" />
          </button>
        </div>}
    </div>
  );
};
