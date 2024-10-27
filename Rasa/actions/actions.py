# This files contains your custom actions which can be used to run
# custom Python code.
#
# See this guide on how to implement these action:
# https://rasa.com/docs/rasa/custom-actions


# This is a simple example for a custom action which utters "Hello World!"

# from typing import Any, Text, Dict, List
#
# from rasa_sdk import Action, Tracker
# from rasa_sdk.executor import CollectingDispatcher
#
#
# class ActionHelloWorld(Action):
#
#     def name(self) -> Text:
#         return "action_hello_world"
#
#     def run(self, dispatcher: CollectingDispatcher,
#             tracker: Tracker,
#             domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
#
#         dispatcher.utter_message(text="Hello World!")
#
#         return []
# actions.py
import requests
from rasa_sdk import Action, Tracker
from rasa_sdk.executor import CollectingDispatcher

class ActionDetectEmotion(Action):

    def name(self) -> str:
        return "action_detect_emotion"

    def run(self, dispatcher: CollectingDispatcher, tracker: Tracker, domain: dict) -> list:
        # Get the user's latest message
        user_message = tracker.latest_message.get('text')

        # Hugging Face API details
        api_url = "https://api-inference.huggingface.co/models/j-hartmann/emotion-english-distilroberta-base"
        headers = {
            "Authorization": f"Bearer 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"
        }

        # Send the user message to Hugging Face for emotion detection
        response = requests.post(api_url, headers=headers, json={"inputs": user_message})

        if response.status_code == 200:
            result = response.json()
            emotion = result[0]['label']  # Extract the predicted emotion

            # Store the detected emotion in a slot
            return [SlotSet("emotion", emotion)]
        else:
            dispatcher.utter_message(text="Sorry, I couldn't detect the emotion.")
            return []
