"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

interface UserSelectProps {
  allUsers: string[];
  selectedUsers: string[];
  setSelectedUsers: (users: string[]) => void;
  isMulti?: boolean | null;
  placeholder?: string;
}

export const Select = ({
  allUsers,
  selectedUsers,
  setSelectedUsers,
  isMulti = false,
  placeholder = "Select user(s)...",
}: UserSelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const OPTION_HEIGHT = 40;
  const MAX_VISIBLE_OPTIONS = 5;
  const dropdownMaxHeight =
    Math.min(allUsers.length, MAX_VISIBLE_OPTIONS) * OPTION_HEIGHT;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="w-full relative">
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 text-white placeholder-gray-500 outline-none cursor-pointer flex justify-between items-center focus-within:border-green-500 transition-colors duration-200"
      >
        <span>
          {selectedUsers.length > 0
            ? isMulti
              ? selectedUsers.join(", ")
              : selectedUsers[0]
            : placeholder}
        </span>
        <ChevronDown
          size={20}
          className={`transition-transform duration-200 ${
            isOpen ? "rotate-180" : "rotate-0"
          }`}
        />
      </div>

      <div
        className={`absolute z-10 mt-1 w-full overflow-auto overscroll-contain rounded-lg border border-gray-700 bg-gray-800 transition-all duration-200 ease-in-out ${
          isOpen
            ? "opacity-100 max-h-250"
            : "opacity-0 max-h-0 pointer-events-none"
        }`}
        style={{ maxHeight: `${dropdownMaxHeight}px` }}
      >
        {allUsers.length === 0 ? (
          <div className="flex justify-center items-center gap-2 p-2 text-gray-400">
            No users available
          </div>
        ) : (
          allUsers.map((user) => (
            <div
              key={user}
              onClick={() => {
                if (isMulti) {
                  if (selectedUsers.includes(user)) {
                    setSelectedUsers(selectedUsers.filter((id) => id !== user));
                  } else {
                    setSelectedUsers([...selectedUsers, user]);
                  }
                } else {
                  setSelectedUsers([user]);
                  setIsOpen(false);
                }
              }}
              className={`flex items-center gap-2 p-2 cursor-pointer hover:bg-gray-700 transition-colors duration-150 ${
                selectedUsers.includes(user) ? "bg-gray-700 font-semibold" : ""
              }`}
            >
              {selectedUsers.includes(user) && (
                <span className="text-green-400">✓</span>
              )}
              {user}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
