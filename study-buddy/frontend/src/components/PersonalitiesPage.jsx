import React, { useState } from "react";
import ChatBox from "./chatbox.jsx";
import { getPersonalitiesList } from "../config/personalities";

export default function PersonalitiesPage() {
  const [selectedPersonality, setSelectedPersonality] = useState(null);
  const personalities = getPersonalitiesList();

  const handleCardClick = (key) => {
    if (selectedPersonality === key) {
      setSelectedPersonality(null);
    } else {
      setSelectedPersonality(key);
    }
  };

  return (
    <div className="relative min-h-screen flex bg-white text-black">
      {/* Sidebar */}
      <aside className="w-64 bg-black text-white flex flex-col p-4 space-y-4 overflow-y-auto">  
        <h2 className="text-2xl font-bold mb-4">Personalities</h2>
        {personalities.map((p) => (
          <div
            key={p.key}
            className={`p-4 rounded-lg border border-white/20 cursor-pointer hover:bg-white hover:text-black transition-all ${
              selectedPersonality === p.key ? "bg-white text-black" : ""
            }`}
            onClick={() => handleCardClick(p.key)}
          >
            <h3 className="font-semibold text-lg">{p.name}</h3>
            <p className="text-sm opacity-80 mt-1">{p.description}</p>
          </div>
        ))}
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col items-center justify-center relative bg-white">
        {!selectedPersonality && (
          <p className="text-gray-700 text-xl">
            Select a personality to start chatting
          </p>
        )}

        {selectedPersonality && (
          <ChatBox selectedPersonality={selectedPersonality} />
        )}
      </main>
    </div>
  );
}