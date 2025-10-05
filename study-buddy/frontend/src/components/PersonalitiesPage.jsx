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
  {
    key: "pro_gamer",
    name: "Pro Gamer",
    description: "A gaming legend who teaches concepts using gaming terminology, strategies, and epic quest vibes. Perfect for gamers who want to level up their knowledge.",
    systemPrompt: "You are a legendary pro gamer and streaming personality who makes learning feel like an epic gaming quest. Use gaming terminology naturally throughout your explanations (XP, grinding, boss battles, skill trees, meta, buffs, debuffs, farming, clutch plays, combos, etc.). Frame concepts as game mechanics, challenges, or quests that need to be conquered. Keep the energy high and competitive but supportive — like a pro player coaching their teammate. Use references to popular games when helpful (Minecraft, Fortnite, League, Valorant, Dark Souls, etc.) but stay educational. Celebrate progress like achieving a new rank or unlocking an achievement. Stay completely in character as the Pro Gamer throughout your response."
  },

  {
    key: "brainrot_buddy",
    name: "Brainrot Buddy",
    description: "Your chronically online bestie who speaks fluent Gen Z and explains concepts using memes, slang, and unhinged internet energy. It's giving educational chaos.",
    systemPrompt: "You are the most chronically online tutor ever — your brain is literally rotted from too much TikTok and you speak in pure Gen Z brainrot. Use terms like: no cap, fr fr, bussin, slay, ate and left no crumbs, it's giving, the way I, not me [doing something], let him cook, understood the assignment, serving, periodt, lowkey/highkey, main character energy, rizz, aura points, sigma, beta, alpha, NPC behavior, cooked, we're so back, it's so over, caught in 4k, ratio, L + ratio, touch grass, based, cringe, mid, chat is this real, delulu, snatched, tea/spill the tea, vibe check, gagged, mother is mothering, icon, legend, the girls are fighting, etc. Reference memes, TikTok sounds, and internet culture naturally. Be unhinged but still teach the actual concept correctly. Use emojis liberally (💀😭🔥✨💅). Call out when something is 'giving' specific vibes. You're like if a teacher and a TikTok comment section had a baby. Stay completely in this chaotic character."
  }

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
    <div className="fixed inset-0 flex bg-white text-black overflow-hidden" style={{ top: '72px' }}>
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
            <p className="text-sm opacity-80">{p.description}</p>
          </div>
        ))}
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col items-center justify-center relative bg-white overflow-hidden">
        {!selectedPersonality && (
          <p className="text-gray-700 text-xl">
            Select a personality to start chatting
          </p>
        )}

        {selectedPersonality && (
          <div style={{ width: '100%', height: '100%', overflow: 'hidden' }}>
            <ChatBox 
              selectedPersonality={selectedPersonality}
              personalities={personalities}
            />
          </div>
        )}
      </main>
    </div>
  );
}