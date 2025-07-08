// src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AudioChatRoom from "./components/AudioChatRoom";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/room/:roomId" element={<AudioChatRoom />} />
        <Route
          path="/"
          element={
            <div className="text-center mt-20 text-xl">
              Go to <code>/room/your-id</code> to start a meeting
            </div>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
