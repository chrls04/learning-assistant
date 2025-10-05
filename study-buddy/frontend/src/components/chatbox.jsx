import { useRef, useState, useEffect } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { useUserProfile } from "../context/UserProfileContext";
import { PERSONALITIES, PERSONALITY_VOICE_IDS, getPersonality } from "../config/personalities";

// Initialize Gemini - with error checking
const GEMINI_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const ELEVEN_LABS_API_KEY = import.meta.env.VITE_ELEVEN_LABS_API_KEY;

if (!GEMINI_KEY || GEMINI_KEY === 'undefined') {
  console.error('⚠️ GEMINI API KEY IS MISSING! Check your .env file');
}

const genAI = new GoogleGenerativeAI(GEMINI_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

export default function ChatBox({ selectedPersonality }) {
  const { profile } = useUserProfile();
  const textareaRef = useRef(null);
  const chatContainerRef = useRef(null);
  const audioRef = useRef(null);
  const recognitionRef = useRef(null);
  
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [autoPlayAudio, setAutoPlayAudio] = useState(true); // Toggle for auto-play

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
    const personality = getPersonality(selectedPersonality);
    
    let prompt = `ROLE AND PERSONA:\n${personality.systemPrompt}\n\n`;
    
    if (profile.topic || profile.education || profile.grade) {
      prompt += "LEARNER CONTEXT:\n";
      if (profile.topic) prompt += `Learning Topic: ${profile.topic}\n`;
      if (profile.education) prompt += `Education Level: ${profile.education}\n`;
      if (profile.grade) prompt += `Grade/Academic Level: ${profile.grade}\n`;
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
    
    // Add response format instructions
    prompt += `RESPONSE REQUIREMENTS:\n${personality.responseFormat}\n\n`;
    
    // Additional universal requirements
    prompt += "ADDITIONAL INSTRUCTIONS:\n";
    prompt += "- Provide comprehensive, thorough explanations that fully address the question\n";
    prompt += "- Include multiple examples (2-3) that illustrate different aspects of the concept\n";
    prompt += "- For any problem-solving: provide detailed step-by-step solutions with explanations for each step\n";
    prompt += "- Use your personality's unique style consistently throughout the response\n";
    prompt += "- Ensure answers are accurate, educational, and age-appropriate\n";
    prompt += "- If including quizzes or exercises, provide complete solutions and explanations\n";
    prompt += "- Make learning engaging while maintaining educational integrity\n\n";
    
    // Critical math and arithmetic reading instructions
    prompt += "**READ ARITHMETIC PROPERLY**: When reading mathematical expressions:\n";
    prompt += "- Say '3 divided by 6' NOT '3 forwardslash 6'\n";
    prompt += "- Say '5 times 2' or '5 multiplied by 2' NOT '5 star 2'\n";
    prompt += "- Say '2 plus 3' NOT '2 plus sign 3'\n";
    prompt += "- Say '8 minus 4' NOT '8 dash 4'\n";
    prompt += "- Say 'x squared' NOT 'x caret 2'\n";
    prompt += "- Say 'the square root of 16' NOT 'sqrt 16'\n";
    prompt += "- Always read mathematical symbols using proper mathematical terms\n";
    prompt += "- Write fractions as '1/2' but say 'one half' or '1 divided by 2'\n";
    prompt += "- Write equations clearly but describe them using proper mathematical language\n";
    
    return prompt;
  };

  const generateAudio = async (text) => {
    if (!ELEVEN_LABS_API_KEY) {
      console.warn('Eleven Labs API key not found - skipping audio generation');
      return null;
    }
    
    const voiceId = PERSONALITY_VOICE_IDS[selectedPersonality];
    if (!voiceId) {
      console.warn(`No voice ID found for personality: ${selectedPersonality}`);
      return null;
    }

    console.log('Generating audio for text length:', text.length);
    
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
          model_id: "eleven_monolingual_v1",
          output_format: "mp3_44100_128"
        })
      });

      if (response.ok) {
        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        console.log('Audio generated successfully');
        return audioUrl;
      } else {
        const errorText = await response.text();
        console.error('Eleven Labs API error:', response.status, errorText);
        return null;
      }
    } catch (error) {
      console.error("Audio generation error:", error);
      return null;
    }
  };

  const handleSubmit = async () => {
    if (message.trim() === "" || isLoading) return;

    const userMessage = message.trim();
    setMessage("");
    textareaRef.current.style.height = "auto";

    setChatHistory(prev => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      const prompt = buildPrompt(userMessage);
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const aiResponse = response.text();

      const audioUrl = await generateAudio(aiResponse);

      setChatHistory(prev => [...prev, { 
        role: "assistant", 
        content: aiResponse,
        audioUrl: audioUrl
      }]);

      console.log('Audio URL:', audioUrl ? 'Generated' : 'Not generated');

      if (audioUrl && audioRef.current && autoPlayAudio) {
        audioRef.current.src = audioUrl;
        audioRef.current.onplay = () => setIsPlayingAudio(true);
        audioRef.current.onended = () => setIsPlayingAudio(false);
        audioRef.current.onpause = () => setIsPlayingAudio(false);
        audioRef.current.play().catch(err => console.error("Audio playback error:", err));
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
    return getPersonality(selectedPersonality).name;
  };

  const handlePlayLatestAudio = () => {
    const latestMessageWithAudio = [...chatHistory].reverse().find(msg => msg.audioUrl);
    if (latestMessageWithAudio && audioRef.current) {
      audioRef.current.src = latestMessageWithAudio.audioUrl;
      audioRef.current.play();
    }
  };

  const handleStopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };

  return (
    <div className="w-full h-screen flex flex-col">
      {/* Chat Header */}
      <div className="p-5 border-b border-gray-200 bg-gray-50 text-center ml-64">
        <h2 className="text-xl font-semibold text-black m-0">
          Chatting with: {getPersonalityName()}
        </h2>
        {profile.topic && (
          <p className="mt-1 text-gray-600 text-sm">
            Topic: {profile.topic} 
            {profile.education && ` • ${profile.education}`} 
            {profile.grade && ` • Grade ${profile.grade}`}
          </p>
        )}
        
        {/* Audio Controls */}
        <div className="mt-2 flex justify-center gap-2">
          {chatHistory.some(msg => msg.audioUrl) && (
            <>
              <button
                onClick={handlePlayLatestAudio}
                disabled={isPlayingAudio}
                className={`px-3 py-1 text-sm rounded-lg ${
                  isPlayingAudio 
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-500 text-white hover:bg-blue-600 cursor-pointer'
                }`}
              >
                🔊 Play Latest Response
              </button>
              {isPlayingAudio && (
                <button
                  onClick={handleStopAudio}
                  className="px-3 py-1 text-sm rounded-lg bg-red-500 text-white hover:bg-red-600 cursor-pointer"
                >
                  ⏸️ Stop Audio
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Chat Messages */}
      <div 
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-5 flex flex-col gap-4 bg-white ml-64"
      >
        {chatHistory.length === 0 && (
          <div className="text-center text-gray-400 mt-12 text-lg">
            Start your conversation by typing a message below!
          </div>
        )}

        {chatHistory.map((msg, index) => (
          <div
            key={index}
            className={`max-w-[70%] p-3 rounded-xl ${
              msg.role === "user" 
                ? "self-end bg-black text-white" 
                : msg.role === "error"
                ? "self-start bg-red-50 text-red-800"
                : "self-start bg-gray-100 text-black"
            }`}
            style={{ wordWrap: "break-word", whiteSpace: "pre-wrap" }}
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
                className="ml-2 px-2 py-1 text-xs bg-transparent border border-black rounded cursor-pointer hover:bg-gray-200"
              >
                🔊 Play
              </button>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="self-start max-w-[70%] p-3 rounded-xl bg-gray-100 text-gray-600">
            Thinking...
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="sticky bottom-0 w-full flex justify-center p-5 bg-white border-t border-gray-200 z-50 ml-64">
        <div className="flex w-full max-w-4xl justify-center items-center gap-2">
        {/* Audio Toggle Button */}
        <button
          onClick={() => setAutoPlayAudio(!autoPlayAudio)}
          className={`px-4 py-3 rounded-2xl text-lg font-medium border-2 transition-all ${
            autoPlayAudio 
              ? 'bg-green-500 border-green-600 text-white hover:bg-green-600' 
              : 'bg-gray-200 border-gray-300 text-gray-600 hover:bg-gray-300'
          }`}
          title={autoPlayAudio ? "Audio ON - Will play responses automatically" : "Audio OFF - Click to enable"}
        >
          {autoPlayAudio ? '🔊' : '🔇'}
        </button>
        
        <textarea
          ref={textareaRef}
          placeholder="Type your question here... (Shift+Enter for new line)"
          value={message}
          onInput={handleInput}
          onKeyPress={handleKeyPress}
          disabled={isLoading}
          className="flex-1 max-w-[700px] text-base rounded-2xl border border-gray-300 p-4 resize-none overflow-hidden min-h-[50px] max-h-[200px] leading-6"
        />
        <button
          onClick={handleListen}
          disabled={isLoading}
          className={`px-4 py-3 rounded-2xl text-lg font-medium border-none cursor-pointer min-w-[60px] ${
            isListening 
              ? 'bg-red-500 text-white' 
              : 'bg-gray-900 text-white hover:bg-gray-700'
          } ${isLoading && 'cursor-not-allowed opacity-50'}`}
          title="Voice input"
        >
          {isListening ? "⏸️" : "🎤"}
        </button>
        <button
          onClick={handleSubmit}
          disabled={isLoading || message.trim() === ""}
          className={`px-4 py-3 rounded-2xl text-lg font-medium border-none min-w-[80px] ${
            isLoading || message.trim() === ""
              ? 'bg-gray-400 text-white cursor-not-allowed'
              : 'bg-gray-900 text-white hover:bg-gray-700 cursor-pointer'
          }`}
        >
          {isLoading ? "..." : "Send"}
        </button>
        </div>
      </div>

      <audio ref={audioRef} className="hidden" />
    </div>
  );
}