import { LogOut, User, Users } from "lucide-react";
import { useState } from "react";
import { useCallStore } from "@/store/call-store";

export const LoginCall = () => {
  const {
    userId,
    setUserId,
    setIsGroupCall,
    logout,
  } = useCallStore();
  const [userIdInput, setUserIdInput] = useState("");
  const [isJoined, setIsJoined] = useState(false);

  const handleLogout = () => {
    setUserIdInput("");
    setIsJoined(false);
    logout();
  };

  return (
    <div className="flex h-screen flex-col items-center justify-center gap-6 bg-gray-950 text-white">
      <h1 className="text-3xl font-bold">📞 WebRTC Calls</h1>
      {!isJoined && !userId ? (
        <div className="flex flex-col items-center gap-3">
          <p className="text-gray-400">Enter your user ID to get started</p>
          <input
            type="text"
            placeholder="Your User ID"
            value={userIdInput}
            onChange={(e) => setUserIdInput(e.target.value)}
            onKeyDown={(e) =>
              e.key === "Enter" &&
              userIdInput.trim() &&
              setUserId(userIdInput) &&
              setIsJoined(true)
            }
            className="w-72 rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 text-center text-white placeholder-gray-500 outline-none focus:border-green-500"
          />
          <button
            onClick={() => {
              if (!userIdInput.trim()) return;
              setUserId(userIdInput);
              setIsJoined(true);
            }}
            disabled={!userIdInput.trim()}
            className="w-full rounded-lg bg-green-600 px-8 py-3 font-semibold text-white transition hover:bg-green-700 disabled:opacity-50"
          >
            Login
          </button>
        </div>
      ) : (
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
      )}
    </div>
  );
};