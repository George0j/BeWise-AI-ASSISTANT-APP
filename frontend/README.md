# BeWise - AI Study Assistant & Student Community

BeWise is an AI-powered academic notes generator and real-time student collaboration platform.

## Features
- **Study Module:** Upload course outlines (`.pdf`, `.docx`, `.txt`) and generate structured lecture notes using Google Gemini AI (`gemini-3.8-flash`).
- **Community Chat:** Real-time single-feed student chat built with **Socket.io** and persisted via **MongoDB**.

## Tech Stack
- **Frontend:** React, Vite, Lucide Icons, Socket.io-client
- **Backend:** Node.js, Express, Socket.io, Mongoose, Google Gen AI SDK

## Environment Variables
Create a `.env` file in the backend directory:
```env
PORT=5000
GEMINI_API_KEY=your_gemini_api_key_here
MONGO_URI=your_mongodb_connection_string
