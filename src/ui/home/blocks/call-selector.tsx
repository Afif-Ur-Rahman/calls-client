import { Select } from "@/components";
import { CallType } from "@/enum/socket-enum";
import { useCallStore } from "@/store/call-store";
import { LogOut, Phone, Video } from "lucide-react";
import { useState } from "react";

interface CallSelectorProps {
  startCall: (targetId: string, callType: CallType, isGroupCall: boolean) => void;
}

export const CallSelector = ({ startCall }: CallSelectorProps) => {
  const { allUsers, isGroupCall, setIsGroupCall, callStatus, logout } = useCallStore();
  const [targetIds, setTargetIds] = useState<string[]>([]);

  const handleLogout = () => {
    setTargetIds([]);
    logout();
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <button
        onClick={() => {
          setTargetIds([]);
          setIsGroupCall(isGroupCall ? false : true);
        }}
        className="w-full text-center rounded-lg bg-green-600 px-6 py-3 font-semibold text-white transition hover:bg-green-700"
      >
        {`Switch to ${isGroupCall ? "Private" : "Group"} Call`}
      </button>
      <Select
        allUsers={allUsers}
        selectedUsers={targetIds}
        setSelectedUsers={setTargetIds}
        isMulti={isGroupCall}
        placeholder={isGroupCall ? "Select Users..." : "Select User..."}
      />

      <div className="flex w-full gap-3">
        <button
          onClick={() => targetIds[0]?.trim() && startCall(targetIds[0], CallType.AUDIO, isGroupCall ?? false)}
          disabled={!targetIds[0]?.trim() || callStatus !== "idle"}
          className="flex flex-1 rounded-lg bg-green-600 px-6 py-3 font-semibold text-white transition hover:bg-green-700 disabled:opacity-50"
        >
          <span className="flex items-center gap-2">
            <Phone width={20} height={20} strokeWidth={0} fill="white" /> Audio
          </span>
        </button>
        <button
          onClick={() => targetIds[0]?.trim() && startCall(targetIds[0], CallType.VIDEO, isGroupCall ?? false)}
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
  )
};