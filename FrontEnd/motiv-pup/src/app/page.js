"use client";

import { useState, useEffect, useRef } from 'react';
import ChatbotStyles from './styles';

export default function Chatbot() {
  const [messages, setMessages] = useState([
    { text: 'Hi, its me motiv-pUp. Woof! Hello! How can I help you today?', sender: 'bot' }
  ]);
  const [userMessage, setUserMessage] = useState('');
  const chatWindowRef = useRef(null);
  const videoRef = useRef(null); // Reference to the video element for the webcam
  const canvasRef = useRef(null); // Reference to the canvas to capture the image

  useEffect(() => {
    if (chatWindowRef.current) {
      chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
    }
  }, [messages]);

  const startWebcam = () => {
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((stream) => {
        videoRef.current.srcObject = stream;
      })
      .catch((err) => console.error('Error accessing webcam: ', err));
  };

  const captureImage = async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    // Draw the current frame from the video onto the canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Get the image data from the canvas as a base64 string
    const imageData = canvas.toDataURL('image/jpeg');

    try {
      // Send the image data to the API route for emotion detection
      const response = await fetch('/api/detectEmotion', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ image: imageData }),
      });

      const result = await response.json();
      const detectedEmotion = result.emotion || "Emotion detection failed";
      return detectedEmotion;

    } catch (error) {
      console.error('Error detecting emotion:', error);
      return "Emotion detection failed";

    }
  };

  const handleSendAWS = async () => {
    if (!userMessage.trim()) return;
    // user messages should be displayed immediately
    setMessages((prevMessages) => [
      ...prevMessages,
      { text: userMessage, sender: 'user' }
    ]);

    const emotion = await captureImage(); // Capture image and analyze emotion when the user sends a message

    const payload = {
      message: userMessage,
      emotion: emotion,
    };
    try {
      const response = await fetch('https://localhost:8080/api/recieve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });


      const backendResponse = await response.json();
      // Make sure to return the correct JSON body from backend
      console.log(backendResponse);
      const backendMessage = backendResponse.message || "No response from beckend";

      // Displaying backend's responde in the chat
      setMessages((prevMessages) => [
        ...prevMessages,
        { text: backendMessage, sender: 'bot' },
      ]);

    }
    catch (error) {
      console.error('Error sending data to backend: ', error);
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          text: 'Error communicating with AWS. Please try again',
          sender: 'bot'
        },
      ]);
    }
    setUserMessage('');
  };

  const handleSendRasa = async () => {
    if (!userMessage.trim()) return;
    // user messages should be displayed immediately
    setMessages((prevMessages) => [
      ...prevMessages,
      { text: userMessage, sender: 'user' }
    ]);

    try {
      const response = await fetch("http://localhost:5005/webhooks/rest/webhook", {
        method: "POST",
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'charset': 'UTF-8',
        },
        credentials: "same-origin",
        body: JSON.stringify({ sender: "user", message: userMessage }),
      });
      const data = await response.json();

      if (data && data.length > 0) {
        data.forEach(message => {
          if (message.text) {
            // Assuming setMessages is a function that updates messages on the frontend
            setMessages(prevMessages => [...prevMessages, {
              text: message.text,
              sender: 'bot'
            }]);
          }
        });
      }


    }
    catch (error) {
      console.error('Error sending data to Rasa chatbot: ', error);
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          text: 'recipient_msg',
          sender: 'bot'
        },
      ]);
    }
    setUserMessage('');
  }

  useEffect(() => startWebcam(), []);

  return (
    <div style={ChatbotStyles.container}>
      <img
        src="/puppy.gif"
        alt="Puppy GIF"
        style={ChatbotStyles.puppyGif}
      />
      <div style={ChatbotStyles.chatWrapper}>
        <div style={ChatbotStyles.header}>
          <img
            src="/screen.png"
            alt="Moti-Pup Logo"
            style={{ width: '100%', height: '100%', objectFit: 'scale-down' }}
          />
        </div>

        <div ref={chatWindowRef} style={ChatbotStyles.chatWindow}>
          {messages.map((message, index) => (
            <div
              key={index}
              style={
                message.sender === 'user'
                  ? ChatbotStyles.userMessage
                  : ChatbotStyles.botMessage
              }
            >
              {message.text}
            </div>
          ))}
        </div>

        <div style={ChatbotStyles.inputContainer}>
          <input
            type="text"
            value={userMessage}
            onChange={(e) => setUserMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendRasa()}
            style={ChatbotStyles.input}
            placeholder="Type your message..."
          />
          <button onClick={handleSendRasa} style={ChatbotStyles.button}>
            Send
          </button>
          <button onClick={handleSendAWS} style={ChatbotStyles.button}>
            Detect facial emotion
          </button>
        </div>
      </div>

      {/* Hidden Video and Canvas for Webcam Capture */}
      <video ref={videoRef} style={{ display: 'none' }} autoPlay></video>
      <canvas ref={canvasRef} style={{ display: 'none' }} width="640" height="480"></canvas>
    </div>
  );
}