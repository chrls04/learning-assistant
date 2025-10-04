from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import google.generativeai as genai
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure Gemini
genai.configure(api_key=os.getenv('GEMINI_API_KEY'))
model = genai.GenerativeModel('gemini-2.5-flash')

app = Flask(__name__)
CORS(app)

# Store active personality
current_personality = "enthusiastic"

# Personality system
PERSONALITIES = {
    "enthusiastic": "You are an SUPER energetic study buddy! Use lots of excitement, emojis, and encouragement! 🎉",
    "professional": "You are a serious, professional tutor. Be clear, precise, and focused on learning.",
    "funny": "You are a hilarious study companion! Use humor, jokes, and make learning fun!",
    "wise": "You are a wise, patient mentor. Speak calmly and share deep insights."
}

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({"message": "✅ Backend with AI is working!", "status": "healthy"})

@app.route('/api/chat', methods=['POST'])
def chat_with_ai():
    try:
        data = request.json
        user_message = data.get('message', 'Hello!')
        
        # Get the current personality prompt
        personality_prompt = PERSONALITIES.get(current_personality, PERSONALITIES["enthusiastic"])
        
        # Create the full prompt
        full_prompt = f"""
        {personality_prompt}
        
        User: {user_message}
        
        Respond in character as their study companion:
        """
        
        # Get AI response
        response = model.generate_content(full_prompt)
        
        return jsonify({
            "response": response.text,
            "personality": current_personality,
            "status": "success"
        })
    
    except Exception as e:
        return jsonify({
            "response": f"Sorry, AI is taking a break: {str(e)}",
            "personality": current_personality, 
            "status": "error"
        })

@app.route('/api/personality', methods=['POST'])
def switch_personality():
    global current_personality
    data = request.json or {}
    # Accept case-insensitive input and a few common synonyms
    raw = data.get('personality', 'enthusiastic')
    new_personality = str(raw).strip().lower()

    # map synonyms to canonical personality keys
    ALIASES = {
        'energetic': 'enthusiastic',
        'enthusiastic': 'enthusiastic',
        'professional': 'professional',
        'pro': 'professional',
        'funny': 'funny',
        'humorous': 'funny',
        'wise': 'wise',
        'sage': 'wise'
    }

    mapped = ALIASES.get(new_personality, new_personality)

    if mapped in PERSONALITIES:
        current_personality = mapped
        return jsonify({
            "message": f"🎭 Switched to {mapped} mode!",
            "personality": current_personality
        })
    else:
        return jsonify({
            "message": f"❌ Personality '{raw}' not found. Available: {', '.join(PERSONALITIES.keys())}",
            "personality": current_personality
        }), 400

@app.route('/api/personalities', methods=['GET'])
def list_personalities():
    return jsonify({
        "available_personalities": list(PERSONALITIES.keys()),
        "active_personality": current_personality
    })

if __name__ == '__main__':
    print("🚀 Study Buddy Backend with REAL AI!")
    print("📍 Server: http://localhost:5000")
    print("🎭 Personalities: enthusiastic, professional, funny, wise")
    print("🔗 Test with your HTML file!")
    app.run(debug=True, port=5000)