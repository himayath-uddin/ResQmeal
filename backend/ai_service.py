import os
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

# Initialize Groq Client
GROQ_API_KEY = os.getenv("GROQ_API_KEY")

class AIService:
    def __init__(self):
        self.client = None
        if GROQ_API_KEY:
            self.client = Groq(api_key=GROQ_API_KEY)

    def get_recommendation(self, distance, quantity, time_left, tags):
        if not self.client:
            return "AI Recommendations Unavailable (No API Key)"
            
        prompt = f"""
        You are an AI logistics assistant for a food rescue app called ResQMeal.
        A donor has just posted high-quality food.
        Distance to nearby NGOs: {distance} km (average).
        Quantity: {quantity} meals.
        Time left until expiry: {time_left} minutes.
        Tags: {', '.join(tags)}
        
        Provide a SHORT, actionable, one-sentence suggestion for NGOs to claim this. For example: 'High volume of fresh meals available nearby; dispatch a van immediately before expiry!'
        """
        
        try:
            response = self.client.chat.completions.create(
                model="llama-3.1-8b-instant",
                messages=[{"role": "user", "content": prompt}],
                max_tokens=50,
                temperature=0.5
            )
            return response.choices[0].message.content.strip()
        except Exception as e:
            return f"Error connecting to AI: {str(e)}"

    def analyze_expired(self, title, distance, quantity, time_posted):
        if not self.client:
            return "AI Analysis Unavailable"
            
        prompt = f"""
        A food listing on our rescue platform expired before any NGO picked it up.
        Food: {title}
        Quantity: {quantity} meals
        Distance to nearest NGOs: {distance} km
        Time available: {time_posted} minutes.
        
        Provide a SHORT, one-line explanation of why this likely wasn't claimed and how the donor can improve. (e.g., 'Too far for the short timeframe; next time, post earlier').
        """
        
        try:
            response = self.client.chat.completions.create(
                model="llama-3.1-8b-instant",
                messages=[{"role": "user", "content": prompt}],
                max_tokens=60,
                temperature=0.7
            )
            return response.choices[0].message.content.strip()
        except Exception as e:
            return f"Analysis failed: {str(e)}"

ai_service = AIService()
