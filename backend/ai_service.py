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

    def _heuristic_message(self, quantity, time_left, tags):
        tag_text = ", ".join(tags) if tags else "mixed food"
        if time_left <= 90:
            return f"Urgent rescue window for {tag_text}; alert nearby NGOs for pickup within the next hour."
        if quantity >= 100:
            return f"Large-volume {tag_text} listing; prioritize NGOs with transport capacity to avoid waste."
        return f"Fresh {tag_text} is within a safe rescue window; match with the nearest active NGO cluster soon."

    def get_recommendation(self, distance, quantity, time_left, tags):
        if not self.client:
            return self._heuristic_message(quantity, time_left, tags)
            
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
            print(f"Groq recommendation error: {str(e)}")
            return self._heuristic_message(quantity, time_left, tags)

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
            print(f"Groq expiry analysis error: {str(e)}")
            return "Pickup likely failed because the timing window was too short or the quantity needed faster matching."

    def preview_listing(self, title, quantity, time_left, tags, location):
        fallback = {
            "summary": self._heuristic_message(quantity, time_left, tags),
            "demand_cluster": f"{location or 'Nearby shelters'} show active demand for this category right now.",
            "posting_window": "Next 30-60 minutes is the strongest rescue window.",
        }

        if not self.client:
            return fallback

        prompt = f"""
        You are the live AI engine for ResQMeal, a food rescue platform.
        Listing title: {title}
        Quantity: {quantity} meals
        Time left: {time_left} minutes
        Tags: {', '.join(tags) if tags else 'mixed'}
        Pickup location: {location or 'unknown'}

        Return exactly three short lines in this format:
        SUMMARY: ...
        DEMAND: ...
        WINDOW: ...
        """

        try:
          response = self.client.chat.completions.create(
              model="llama-3.1-8b-instant",
              messages=[{"role": "user", "content": prompt}],
              max_tokens=120,
              temperature=0.4
          )
          text = response.choices[0].message.content.strip()
          summary = fallback["summary"]
          demand = fallback["demand_cluster"]
          window = fallback["posting_window"]
          for line in text.splitlines():
              cleaned = line.strip()
              if cleaned.startswith("SUMMARY:"):
                  summary = cleaned.split("SUMMARY:", 1)[1].strip() or summary
              elif cleaned.startswith("DEMAND:"):
                  demand = cleaned.split("DEMAND:", 1)[1].strip() or demand
              elif cleaned.startswith("WINDOW:"):
                  window = cleaned.split("WINDOW:", 1)[1].strip() or window
          return {
              "summary": summary,
              "demand_cluster": demand,
              "posting_window": window,
          }
        except Exception as e:
            print(f"Groq preview error: {str(e)}")
            return fallback

ai_service = AIService()
