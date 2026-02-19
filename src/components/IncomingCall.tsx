"use client";

import { CallType } from "@/enum/socket-enum";
import { Phone, Video } from "lucide-react";

type Props = {
  from: string;
  callType?: CallType;
  onAccept: () => void;
  onReject: () => void;
  groupCall?: boolean;
};

export const IncomingCall = ({ from, callType, onAccept, onReject, groupCall }: Props) => {
  return (
    <div className="fixed inset-0 z-40 flex flex-col bg-black">
      <div className="absolute left-0 right-0 top-0 z-50 flex flex-col items-center justify-center bg-linear-to-b from-black/80 to-transparent px-6 py-4">
        <h3 className="text-xl font-semibold text-white">{from}</h3>
        <p className="mt-1 animate-pulse text-sm text-gray-400">
          Incoming {groupCall ? "Group" : "Private"} {callType === CallType.AUDIO ? "Audio" : "Video"} call…
        </p>
      </div>
      <div>
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900">
          <div className="flex h-28 w-28 items-center justify-center rounded-full bg-linear-to-br from-gray-600 to-gray-800 text-5xl font-bold text-white">
            {from?.charAt(0).toUpperCase() ?? "?"}
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 z-50 flex items-center justify-center gap-5 bg-linear-to-t from-black/90 to-transparent px-6 py-8">
          <div className="flex flex-col items-center gap-1">
            <button
              onClick={onReject}
              className="flex h-12 w-12 items-center justify-center rounded-full bg-red-500 transition hover:bg-red-600"
              aria-label="Reject call"
            >
              <Phone width={20} height={20} strokeWidth={0} fill="white" className="rotate-135" />
            </button>
            <span className="text-sm text-gray-400 font-bold">Decline</span>
          </div>

          <div className="flex flex-col items-center gap-1">
            <button
              onClick={onAccept}
              className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500 transition hover:bg-green-600"
              aria-label="Accept call"
            >
              {callType === CallType.VIDEO ? <Video fill="white" /> : <Phone width={20} height={20} strokeWidth={0} fill="white" />}
            </button>
            <span className="text-sm text-gray-400 font-bold">Accept</span>
          </div>
        </div>
      </div>
    </div>
  );
};
