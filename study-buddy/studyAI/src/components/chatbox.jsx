import { useRef, useState, useEffect } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import * as pdfjsLib from "pdfjs-dist";
import mammoth from "mammoth";

// Initialize Gemini
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

// Eleven Labs configuration
const ELEVEN_LABS_API_KEY = import.meta.env.VITE_ELEVEN_LABS_API_KEY;
// Output character limit for chatbot responses
const OUTPUT_CHAR_LIMIT = 1000;

const PERSONALITY_VOICE_IDS = {
  "friendly_tutor": "pwMBn0SsmN1220Aorv15",
  "serious_professor": "ClF3eMOzqYc7v2G67EkD",
  "storyteller": "BNgbHR0DNeZixGQVzloa",
  "motivator": "DGzg6RaUqxGRTHSBjfgF",
  "visionary_ceo": "oziFLKtaxVDHQAh7o45V",
  "pro_gamer": "oF3F9Srlnt0plaTRGrew", 
  "brainrot_buddy": "Ej7b8NK3jVRdCTx2U53T",
  "rhyming_rapper": "qVpGLzi5EhjW3WGVhOa9"
};

// Personality definitions (moved from backend)
const PERSONALITIES = {
  "friendly_tutor": {
    name: "Friendly Tutor",
    description: "A bubbly, patient teacher who explains with real-life mini examples and emojis.",
    systemPrompt: "You are a cheerful and approachable tutor who helps younger students understand tricky topics. Explain with warmth, humor, and tiny real-life examples (like pizza slices, video games, or school life). Use clear everyday language and add emojis to keep it fun."
  },
  "serious_professor": {
    name: "Serious Professor",
    description: "A calm, precise educator with academic tone; uses structure, logic, and brief examples.",
    systemPrompt: "You are a highly knowledgeable professor who values clarity, logic, and academic rigor. Provide structured, step-by-step explanations, use correct terminology, and cite examples or formulas that show real conceptual depth."
  },
  "storyteller": {
    name: "Storyteller",
    description: "A creative explainer who turns lessons into tiny imaginative stories or metaphors.",
    systemPrompt: "You are a captivating storyteller who teaches through imagination. Every explanation should feel like a short, vivid story or scene that sneaks in the concept naturally."
  },
  "motivator": {
    name: "Coach Commander",
    description: "A bold, high-energy commander who motivates learners with military-level focus.",
    systemPrompt: "You are a tough but encouraging commander leading a learning squad. Speak with energy, confidence, and authority. Push learners to stay disciplined, focused, and resilient. End every response with a short motivational quote."
  },
  "visionary_ceo": {
    name: "Visionary CEO",
    description: "A strategic, forward-thinking leader who connects learning to real-world innovation.",
    systemPrompt: "You are a visionary CEO mentoring a young professional. Use leadership and innovation language. Draw connections between topics and how they matter in careers, innovation, and growth."
  },
  "pro_gamer": {
  name: "Pro Gamer",
  description: "A gaming legend who teaches concepts using gaming terminology, strategies, and epic quest vibes. Perfect for gamers who want to level up their knowledge.",
  systemPrompt: "You are a legendary pro gamer and streaming personality who makes learning feel like an epic gaming quest. Use gaming terminology naturally throughout your explanations (XP, grinding, boss battles, skill trees, meta, buffs, debuffs, farming, clutch plays, combos, etc.). Frame concepts as game mechanics, challenges, or quests that need to be conquered. Keep the energy high and competitive but supportive — like a pro player coaching their teammate. Use references to popular games when helpful (Minecraft, Fortnite, League, Valorant, Dark Souls, etc.) but stay educational. Celebrate progress like achieving a new rank or unlocking an achievement. Stay completely in character as the Pro Gamer throughout your response."
  },

  "brainrot_buddy": {
    name: "Brainrot Buddy",
    description: "Your chronically online bestie who speaks fluent Gen Z and explains concepts using memes, slang, and unhinged internet energy. It's giving educational chaos.",
    systemPrompt: "You are the most chronically online tutor ever — your brain is literally rotted from too much TikTok and you speak in pure Gen Z brainrot. Use terms like: no cap, fr fr, bussin, slay, ate and left no crumbs, it's giving, the way I, not me [doing something], let him cook, understood the assignment, serving, periodt, lowkey/highkey, main character energy, rizz, aura points, sigma, beta, alpha, NPC behavior, cooked, we're so back, it's so over, caught in 4k, ratio, L + ratio, touch grass, based, cringe, mid, chat is this real, delulu, snatched, tea/spill the tea, vibe check, gagged, mother is mothering, icon, legend, the girls are fighting, etc. Reference memes, TikTok sounds, and internet culture naturally. Be unhinged but still teach the actual concept correctly. Use emojis liberally (💀😭🔥✨💅). Call out when something is 'giving' specific vibes. You're like if a teacher and a TikTok comment section had a baby. Stay completely in this chaotic character."
  },
  "rhyming_rapper": {
    name: "Rhyming Rapper",
    description: "A cool educator who explains everything in catchy rhymes and beats.",
    systemPrompt: "You are a rapper teacher. Explain concepts using rhymes and rhythmic flow. Keep it poetic and catchy."
  }
  



};



export default function ChatBox({ selectedPersonality, personalities }) {
  const textareaRef = useRef(null);
  const chatContainerRef = useRef(null);
  const audioRef = useRef(null);
  const recognitionRef = useRef(null);
  
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [autoPlayAudio, setAutoPlayAudio] = useState(true); // NEW: toggle whether audio auto-plays after generation

  const [uploadedFile, setUploadedFile] = useState(null);

  // File upload handler
  const handleFileChange = (e) => {
  const file = e.target.files[0];
  if (file) setUploadedFile(file);
    };

  // Get user profile from localStorage
  const topic = localStorage.getItem("sb_topic") || "";
  const education = localStorage.getItem("sb_education") || "";
  const grade = localStorage.getItem("sb_grade") || "";

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setMessage(transcript);
        setTimeout(() => {
          if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
            textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 200) + "px";
          }
        }, 0);
      };

      recognitionRef.current.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory]);

  const handleInput = (e) => {
    const textarea = textareaRef.current;
    textarea.style.height = "auto"; 
    textarea.style.height = Math.min(textarea.scrollHeight, 200) + "px"; 
    setMessage(e.target.value);
  };

  const buildPrompt = (userMessage) => {
    const personality = PERSONALITIES[selectedPersonality] || PERSONALITIES["friendly_tutor"];
    
    let prompt = `ROLE AND PERSONA:\n${personality.systemPrompt}\n\n`;
    
    if (topic || education || grade) {
      prompt += "LEARNER CONTEXT:\n";
      if (topic) prompt += `Learning Topic: ${topic}\n`;
      if (education) prompt += `Education Level: ${education}\n`;
      if (grade) prompt += `Grade/Academic Level: ${grade}\n`;
      prompt += "\n";
    }
    
    if (chatHistory.length > 0) {
      prompt += "CONVERSATION HISTORY:\n";
      chatHistory.slice(-4).forEach(msg => {
        prompt += `${msg.role === 'user' ? 'Student' : 'You'}: ${msg.content}\n`;
      });
      prompt += "\n";
    }
    
    prompt += `STUDENT'S QUESTION:\n${userMessage}\n\n`;
    prompt += "Respond naturally in character. Provide comprehensive explanations with examples. For math, read symbols properly (e.g., '3/6' as 'three divided by six', not 'three forwardslash six').";
    // Ask the model to keep responses short to help enforce the client-side limit
    prompt += 'Do not use parenthetical actions.';
    prompt += ` Please keep the response under ${OUTPUT_CHAR_LIMIT} characters.`;
    prompt += "Avoid using symbols like * because it doesn't read well aloud.";

     
     return prompt;
   };

  const generateAudio = async (text) => {
    if (!ELEVEN_LABS_API_KEY) return null;
    
    const voiceId = PERSONALITY_VOICE_IDS[selectedPersonality];
    if (!voiceId) return null;

    try {
      const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
        method: "POST",
        headers: {
          "xi-api-key": ELEVEN_LABS_API_KEY,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          text: text,
          voice_settings: {},
          output_format: "mp3_44100_128"
        })
      });

      if (response.ok) {
        const audioBlob = await response.blob();
        return URL.createObjectURL(audioBlob);
      }
    } catch (error) {
      console.error("Audio generation error:", error);
    }
    return null;
  };

  // Helper function to convert file to base64
  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result.split(",")[1]);
      reader.onerror = reject;
    });
  };
  
  const handleSubmit = async () => {
    if (message.trim() === "" || isLoading) return;

    const userMessage = message.trim();
    setMessage("");
    setUploadedFile(null);
    textareaRef.current.style.height = "auto";

    // Add user message to chat
    setChatHistory(prev => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      // Build prompt with personality and context
      const prompt = buildPrompt(userMessage);

      // Call Gemini API
      let result;
      if (uploadedFile) {
        const fileData = [
      {
        inlineData: {
        data: await fileToBase64(uploadedFile),
        mimeType: uploadedFile.type,
                    },
      },
      ];
      result = await model.generateContent([prompt, ...fileData]);
        } else {
      result = await model.generateContent(prompt);
      }

      const response = await result.response;
      const aiResponse = response.text();
      // Enforce client-side output length limit and mark truncation if needed
      const truncatedResponse = aiResponse.length > OUTPUT_CHAR_LIMIT
        ? aiResponse.slice(0, OUTPUT_CHAR_LIMIT) + "..."
        : aiResponse;

      // Generate audio (use truncated text so TTS matches displayed text)
      const audioUrl = await generateAudio(truncatedResponse);

      // Add AI response to chat (store truncated version)
      setChatHistory(prev => [...prev, { 
        role: "assistant", 
        content: truncatedResponse,
        audioUrl: audioUrl
      }]);

      // Auto-play audio if available
      if (audioUrl && audioRef.current) {
        audioRef.current.src = audioUrl;
        if (autoPlayAudio) {
          audioRef.current.play().catch(err => console.error("Audio playback error:", err));
        }
      }

    } catch (error) {
      console.error("Error generating response:", error);
      setChatHistory(prev => [...prev, { 
        role: "error", 
        content: "Sorry, I encountered an error. Please check your API keys and try again." 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleListen = () => {
    if (!recognitionRef.current) {
      alert("Speech recognition is not supported in your browser. Try Chrome or Edge.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      setIsListening(true);
      recognitionRef.current.start();
    }
  };

  const getPersonalityName = () => {
    return PERSONALITIES[selectedPersonality]?.name || selectedPersonality;
  };

  return (
    <div style={{ 
      width: "100%", 
      height: "100%", 
      display: "flex", 
      flexDirection: "column",
      position: "relative",
      overflow: "hidden"
    }}>
      {/* Chat Header */}
      <div style={{
        padding: "20px",
        borderBottom: "1px solid #e0e0e0",
        backgroundColor: "#f9f9f9",
        textAlign: "center",
        flexShrink: 0
      }}>
        <h2 style={{ margin: 0, color: "#000" }}>
          Chatting with: {getPersonalityName()}
        </h2>
        {topic && (
          <p style={{ margin: "5px 0 0 0", color: "#666", fontSize: "0.9em" }}>
            Topic: {topic} {education && `• ${education}`} {grade && `• Grade ${grade}`}
          </p>
        )}
      </div>

      {/* Chat Messages */}
      <div 
        ref={chatContainerRef}
        style={{
          flex: 1,
          overflowY: "auto",
          overflowX: "hidden",
          padding: "20px",
          display: "flex",
          flexDirection: "column",
          gap: "15px",
          backgroundColor: "#fff",
          minHeight: 0
        }}
      >
        {chatHistory.length === 0 && (
          <div style={{ 
            textAlign: "center", 
            color: "#999", 
            marginTop: "50px",
            fontSize: "1.1em" 
          }}>
            Start your conversation by typing a message below!
          </div>
        )}

        {chatHistory.map((msg, index) => (
          <div
            key={index}
            style={{
              alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
              maxWidth: "70%",
              padding: "12px 16px",
              borderRadius: "12px",
              backgroundColor: msg.role === "user" ? "#000" : msg.role === "error" ? "#ffebee" : "#f0f0f0",
              color: msg.role === "user" ? "#fff" : msg.role === "error" ? "#c62828" : "#000",
              wordWrap: "break-word",
              whiteSpace: "pre-wrap"
            }}
          >
            {msg.content}
            
            {msg.audioUrl && (
              <button
                onClick={() => {
                  if (audioRef.current) {
                    audioRef.current.src = msg.audioUrl;
                    audioRef.current.play();
                  }
                }}
                style={{
                  marginLeft: 8,
                  padding: "2px 6px",
                  fontSize: 12,
                  background: "transparent",
                  border: "1px solid #333",
                  borderRadius: 4,
                  cursor: "pointer"
                }}
              >
                🔊 Play
              </button>
            )}
                      </div>
        ))}

        {isLoading && (
          <div
            style={{
              alignSelf: "flex-start",
              padding: "12px 16px",
              borderRadius: "12px",
              backgroundColor: "#f0f0f0",
              color: "#666"
            }}
          >
            Thinking...
          </div>
        )}
      </div>

     {/* Input Area */}
    <div
    style={{
    position: "sticky",
    bottom: 0,
    width: "100%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center", 
    padding: "20px",
    backgroundColor: "#fff",
    borderTop: "1px solid #e0e0e0",
    zIndex: 1000,
  }}
>
  <button
    onClick={() => setAutoPlayAudio(prev => !prev)}
    title={autoPlayAudio ? "Auto-play ON" : "Auto-play OFF"}
    style={{
      marginRight: "10px",
      padding: "0 12px",
      borderRadius: "20px",
      fontSize: "1.1em",
      backgroundColor: autoPlayAudio ? "#10b981" : "#9ca3af",
      color: "white",
      border: "none",
      cursor: "pointer",
      minWidth: "48px",
      alignSelf: "center",
    }}
  >
    {autoPlayAudio ? "🔊" : "🔇"}
  </button>

  {/* 📎 File Upload */}
  <input
    type="file"
    accept=".pdf,.docx,.txt,.png,.jpg,.jpeg"
    onChange={handleFileChange}
    id="file-upload"
    style={{ display: "none" }}
  />

  <label
    htmlFor="file-upload"
    style={{
      display: "flex", 
      justifyContent: "center",
      alignItems: "center",
      width: "48px", // same height as buttons
      height: "48px",
      borderRadius: "50%",
      backgroundColor: uploadedFile ? "#10b981" : "#1a1a1a",
      color: "white",
      cursor: "pointer",
      border: "none",
      fontSize: "1.3em",
      marginRight: "10px",
      transition: "background-color 0.2s ease",
    }}
  >
    📎
  </label>

  {uploadedFile && (
    <span
      style={{
        alignSelf: "center",
        marginRight: "10px",
        color: "#10b981",
        fontSize: "0.9em",
        maxWidth: "150px",
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
      }}
    >
      {uploadedFile.name}
    </span>
  )}

  <textarea
    ref={textareaRef}
    placeholder="Type your question here... (Shift+Enter for new line)"
    value={message}
    onInput={handleInput}
    onKeyPress={handleKeyPress}
    disabled={isLoading}
    style={{
      width: "60%",
      maxWidth: "700px",
      fontSize: "1.1em",
      borderRadius: "20px",
      border: "1px solid #ccc",
      padding: "15px",
      marginRight: "10px",
      resize: "none",
      overflow: "hidden",
      minHeight: "50px",
      maxHeight: "200px",
      lineHeight: "1.5em",
      color: "black",
      backgroundColor: "white",
    }}
  />

  <button
    onClick={handleListen}
    disabled={isLoading}
    style={{
      padding: "0 20px",
      borderRadius: "20px",
      fontSize: "1.2em",
      backgroundColor: isListening ? "#ef4444" : "#1a1a1a",
      color: "white",
      cursor: isLoading ? "not-allowed" : "pointer",
      border: "none",
      fontWeight: "500",
      marginRight: "10px",
      minWidth: "80px",
      height: "48px", // 🟢 match height for perfect alignment
    }}
  >
    {isListening ? "🎤 Stop" : "🎤"}
  </button>

  <button
    onClick={handleSubmit}
    disabled={isLoading || message.trim() === ""}
    style={{
      padding: "0 20px",
      borderRadius: "20px",
      fontSize: "1.2em",
      backgroundColor: isLoading || message.trim() === "" ? "#666" : "#1a1a1a",
      color: "white",
      cursor: isLoading || message.trim() === "" ? "not-allowed" : "pointer",
      border: "none",
      fontWeight: "500",
      minWidth: "80px",
      height: "48px", // 🟢 match height
    }}
  >
    {isLoading ? "..." : "Send"}
  </button>
</div>



      {/* Hidden audio element for playing responses */}
      <audio ref={audioRef} style={{ display: "none" }} />
    </div>
  );
}