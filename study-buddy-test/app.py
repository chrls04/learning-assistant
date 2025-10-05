from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import sys
import google.generativeai as genai
from dotenv import load_dotenv

# allow importing the shared content package from project root
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

# import personalities and prompt builder from content
from content.personality_prompts import PERSONALITIES as CONTENT_PERSONALITIES, get_personality_config, build_prompt

# Load environment variables
load_dotenv()

# Configure Gemini (keep original behavior; set GEMINI_API_KEY in .env)
genai.configure(api_key=os.getenv('GEMINI_API_KEY'))
model = genai.GenerativeModel('gemini-2.5-flash')

app = Flask(__name__)
CORS(app)

# Default active personality (use one of the content keys)
current_personality = "friendly_tutor"

# Backwards-compatible alias mapping (maps old/simple names to new content keys)
ALIASES = {
    'energetic': 'friendly_tutor',
    'enthusiastic': 'friendly_tutor',
    'friendly': 'friendly_tutor',

    'professional': 'serious_professor',
    'pro': 'serious_professor',
    'serious': 'serious_professor',
    'professor': 'serious_professor',

    'storyteller': 'storyteller',
    'creative': 'storyteller',
    'funny': 'storyteller',

    'motivator': 'motivator',
    'coach': 'motivator',

    'visionary': 'visionary_ceo',
    'ceo': 'visionary_ceo',

    # map some legacy keys
    'wise': 'serious_professor'
}

def map_personality_key(raw):
    if raw is None:
        return None
    key = str(raw).strip().lower()
    return ALIASES.get(key, key)

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({"message": "✅ Backend with AI is working!", "status": "healthy"})

@app.route('/api/chat', methods=['POST'])
def chat_with_ai():
    try:
        data = request.json or {}
        user_message = data.get('message', 'Hello!')

        # per-request override (frontend can pass personality)
        requested = map_personality_key(data.get('personality'))
        active_key = requested if (requested and requested in CONTENT_PERSONALITIES) else current_personality

        # build the model prompt using shared content builder
        full_prompt = build_prompt(
            user_message=user_message,
            personality_name=active_key,
            topic=data.get('topic'),
            education=data.get('education'),
            grade=data.get('grade'),
            prior_context=data.get('prior_context')
        )

        # call Gemini
        response = model.generate_content(full_prompt)

        return jsonify({
            "response": response.text,
            "personality": active_key,
            "status": "success"
        })

    except Exception as e:
        return jsonify({
            "response": f"Sorry, AI is taking a break: {str(e)}",
            "personality": current_personality,
            "status": "error"
        }), 500

@app.route('/api/personality', methods=['POST'])
def switch_personality():
    global current_personality
    data = request.json or {}
    raw = data.get('personality', 'friendly_tutor')
    mapped = map_personality_key(raw)

    if mapped in CONTENT_PERSONALITIES:
        current_personality = mapped
        return jsonify({
            "message": f"🎭 Switched to {mapped} mode!",
            "personality": current_personality
        })
    else:
        return jsonify({
            "message": f"❌ Personality '{raw}' not found. Available: {', '.join(CONTENT_PERSONALITIES.keys())}",
            "personality": current_personality
        }), 400

@app.route('/api/personalities', methods=['GET'])
def list_personalities():
    # expose key, name and description for each persona
    available = [
        {"key": k, "name": v.get("name"), "description": v.get("description")}
        for k, v in CONTENT_PERSONALITIES.items()
    ]
    return jsonify({
        "available_personalities": available,
        "active_personality": current_personality
    })

if __name__ == '__main__':
    print("🚀 Study Buddy Backend (content-driven personalities).")
    print("📍 Server: http://localhost:5000")
    print(f"🎭 Personalities: {', '.join(CONTENT_PERSONALITIES.keys())}")
    print("🔗 Test with your HTML file!")
    app.run(debug=True, port=5000)