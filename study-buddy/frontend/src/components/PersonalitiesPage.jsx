import React, { useState } from "react";
import ChatBox from "./chatbox.jsx";

// Personality definitions (no backend needed)
const personalities = [
  { 
    key: "friendly_tutor",
    name: "Friendly Tutor", 
    description: "A bubbly, patient teacher who explains with real-life mini examples and emojis. Ideal for Grades 4–8." 
  },
  { 
    key: "serious_professor",
    name: "Serious Professor", 
    description: "A calm, precise educator with academic tone; uses structure, logic, and brief examples. Ideal for high-school or university." 
  },
  { 
    key: "storyteller",
    name: "Storyteller", 
    description: "A creative explainer who turns lessons into tiny imaginative stories or metaphors that stick." 
  },
  { 
    key: "motivator",
    name: "Coach Commander", 
    description: "A bold, high-energy commander who motivates learners with military-level focus and discipline." 
  },
  { 
    key: "visionary_ceo",
    name: "Visionary CEO", 
    description: "A strategic, forward-thinking leader who connects learning to real-world innovation, leadership, and impact." 
  },
];

export default function PersonalitiesPage() {
  const [selectedPersonality, setSelectedPersonality] = useState(null);

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
      <aside className="w-64 bg-black text-white flex flex-col p-4 space-y-4">  
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

        {selectedPersonality && (
          <ChatBox 
            selectedPersonality={selectedPersonality}
            personalities={personalities}
          />
        )}
      </main>
    </div>
  );
}