

# Moti-PuP
## Virtual assistant that promotes productivity and healthy mental health aimed to assist individuals who sit a computers all day to get the most out of their day - all wrapped in a cute companion. You are never truly alone with Moti-PuP!
### Features
- Task managment
- Alert System
- Motivation
- Verbal and non-Verbal Cues Emotion Detection
- Chatbot
### Well-Being 
Moti-PuP uses an emotion detection A.I model to retain emotions from a users camera. If any negative emotions are detected motiv-pet will help you manage the best way it knows how, whether that be promting you to take a break and play a quick game of frisbee, or walking you through well being exercises. 
### Tech Stack
- React
- Rasa
- MongoDB 
## Dev env. set up 
### Front End Env Setup
1. Git clone the repo 
2. Navigate to the frontend directory 
3. Download latest version of node.js
4. Download latest version of npm 
#### How to run 
```
 cd motiv-pup
```
```
 npm run dev 
``` 
3. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
### Backend Env Setup - Rasa Chatbot
```
 cd Moti-PET/Rasa
```
```
 sudo apt update
```
```
 sudo apt install python3 
``` 
```
 sudo apt install python3-dev python3-pip
``` 
```
 pip3 install -U pip
``` 
```
 pip3 install rasa
``` 
#### Communicate with model for model testing

```
 rasa shell
```
Type whatever phrase you wish into the command line after it runs.  

#### Communicate with model for UI testing
Ask me for the actions.oy file since it holds a special API key
```
 rasa train 
```
run this command in seperate terminal - this allows motiv-pup to communication with emotion detection model 
```
 rasa run actions 
```
run this command in seperate terminal allows rasa api to be exposed to frontend
```
 rasa run -m models --enable-api --cors “*” --debug
```