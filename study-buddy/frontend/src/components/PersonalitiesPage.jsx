import React, { useState } from "react";
import ChatBox from "./chatbox.jsx";

// Mock personalities list
const personalities = [
  { id: 1, name: "Curious Cat", description: "Always asks questions" },
  { id: 2, name: "Helpful Owl", description: "Gives guidance" },
  { id: 3, name: "Friendly Dog", description: "Encourages learning" },
  { id: 4, name: "Serious Fox", description: "Focused and precise" },
  { id: 5, name: "Creative Rabbit", description: "Explores new ideas" },
];

export default function PersonalitiesPage() {
  const [selectedPersonality, setSelectedPersonality] = useState(null);

  const handleCardClick = (id) => {
    if (selectedPersonality === id) {
      // Deselect if clicked again
      setSelectedPersonality(null);
    } else {
      setSelectedPersonality(id);
    }
  };

  return (
    <div className="relative min-h-screen flex bg-white text-black">
      {/* Sidebar */}
      <aside className="w-64 bg-black text-white flex flex-col p-4 space-y-4">  
        <h2 className="text-2xl font-bold mb-4">Personalities</h2>
        {personalities.map((p) => (
          <div
            key={p.id}
            className={`p-4 rounded-lg border border-white/20 cursor-pointer hover:bg-white hover:text-black transition-all ${
              selectedPersonality === p.id ? "bg-white text-black" : ""
            }`}
            onClick={() => handleCardClick(p.id)}
          >
            <h3 className="font-semibold text-lg">{p.name}</h3>
            <p className="text-sm opacity-80">{p.description}</p>
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

        {selectedPersonality && <ChatBox />}
      </main>
    </div>
  );
}
