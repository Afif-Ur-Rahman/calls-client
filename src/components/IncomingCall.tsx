"use client";

import { CallType } from "@/enum/socket-enum";

type Props = {
  from: string;
  callType?: CallType;
  onAccept: () => void;
  onReject: () => void;
};

export const IncomingCall = ({ from, callType, onAccept, onReject }: Props) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="flex w-80 flex-col items-center gap-6 rounded-3xl bg-gray-900 p-10 shadow-2xl">
        {/* Avatar */}
        <div className="relative">
          <div className="flex h-28 w-28 items-center justify-center rounded-full bg-linear-to-br from-green-400 to-green-600 text-5xl font-bold text-white shadow-lg">
            {from.charAt(0).toUpperCase()}
          </div>
          <div className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-white text-lg shadow">
            {callType === CallType.VIDEO ? "📹" : "📞"}
          </div>
        </div>

        <div className="text-center">
          <h3 className="text-xl font-semibold text-white">{from}</h3>
          <p className="mt-1 animate-pulse text-sm text-gray-400">
            Incoming {callType} call…
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex gap-10">
          <div className="flex flex-col items-center gap-1">
            <button
              onClick={onReject}
              className="flex h-16 w-16 items-center justify-center rounded-full bg-red-500 text-2xl text-white shadow-lg transition hover:bg-red-600 active:scale-95"
              aria-label="Reject call"
            >
              ✕
            </button>
            <span className="text-xs text-gray-400">Decline</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <button
              onClick={onAccept}
              className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500 text-2xl text-white shadow-lg transition hover:bg-green-600 active:scale-95"
              aria-label="Accept call"
            >
              {callType === CallType.VIDEO ? "📹" : "📞"}
            </button>
            <span className="text-xs text-gray-400">Accept</span>
          </div>
        </div>
      </div>
    </div>
  );
};
