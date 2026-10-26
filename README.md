# Modify

Modify is an AI-powered music platform that lets users listen to songs based on their current mood. The app combines a React frontend with a Node.js/Express backend to support user authentication, song uploads, streaming recommendations, and facial emotion detection using MediaPipe.

## Features

- Real-time facial emotion detection with webcam input
- Mood-based music recommendation flow
- Quick mood presets like Happy, Sad, Calm, Angry, Romantic, and more
- User authentication and session management
- Upload and manage songs
- Explore recommended songs by mood
- Personalized song library for authenticated users
- Responsive UI for desktop and mobile-style browsing

## Tech Stack

Frontend:
- React
- Vite
- React Router
- SCSS
- MediaPipe Tasks Vision
- Lucide React

Backend:
- Node.js
- Express
- MongoDB with Mongoose
- Redis
- JWT Authentication
- Cookie-based session handling
- Multer for file uploads
- ImageKit integration
- Node ID3 for metadata handling

## Project Structure

```text
Modify/
├── Backend/
│   ├── public/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middlewares/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── app.js
│   │   └── ...
│   ├── .gitignore
│   ├── package.json
│   ├── package-lock.json
│   └── server.js
├── Frontend/
│   ├── public/
│   ├── src/
│   │   ├── features/
│   │   ├── App.jsx
│   │   ├── app.routes.jsx
│   │   ├── main.jsx
│   │   └── ...
│   ├── .gitignore
│   ├── eslint.config.js
│   ├── index.html
│   ├── package.json
│   ├── package-lock.json
│   ├── vite.config.js
│   └── README.md
├── .gitignore
└── README.md
