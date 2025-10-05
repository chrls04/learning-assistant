from flask import Flask, request, jsonify
import requests
import base64
from flask_cors import CORS
import os
import sys
import google.generativeai as genai
from dotenv import load_dotenv

# allow importing the shared content package from project root
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

# import personalities and prompt builder from content
from content.personality_prompts import PERSONALITIES as CONTENT_PERSONALITIES, get_personality_config, build_prompt

load_dotenv()

# Configure Gemini
genai.configure(api_key=os.getenv('GEMINI_API_KEY'))
model = genai.GenerativeModel('gemini-2.5-flash')

# Eleven Labs API key
ELEVEN_LABS_API_KEY = os.getenv('ELEVEN_LABS_API_KEY')

# Eleven Labs personality-to-voice mapping
PERSONALITY_VOICE_IDS = {
    "friendly_tutor": "pwMBn0SsmN1220Aorv15",
    "serious_professor": "ClF3eMOzqYc7v2G67EkD",
    "storyteller": "BNgbHR0DNeZixGQVzloa",
    "motivator": "DGzg6RaUqxGRTHSBjfgF",
    "visionary_ceo": "oziFLKtaxVDHQAh7o45V"
}

# Eleven Labs TTS function
def eleven_labs_tts(text, personality_key):
    voice_id = PERSONALITY_VOICE_IDS.get(personality_key)
    if not voice_id or not ELEVEN_LABS_API_KEY:
        return None
    url = f"https://api.elevenlabs.io/v1/text-to-speech/{voice_id}"
    headers = {
        "xi-api-key": ELEVEN_LABS_API_KEY,
        "Content-Type": "application/json"
    }
    payload = {
        "text": text,
        "voice_settings": {},
        "output_format": "mp3"
    }
    try:
        resp = requests.post(url, headers=headers, json=payload)
        if resp.status_code == 200:
            audio_bytes = resp.content
            audio_b64 = base64.b64encode(audio_bytes).decode('utf-8')
            return audio_b64
        else:
            return None
    except Exception:
        return None

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
        response_text = response.text

        # call Eleven Labs TTS
        audio_b64 = eleven_labs_tts(response_text, active_key)

        return jsonify({
            "response": response_text,
            "personality": active_key,
            "audio_b64": audio_b64,
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