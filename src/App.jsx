import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AudioChatRoom from "./components/AudioChatRoom";
import Home from "./components/Home";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/room/:roomId" element={<AudioChatRoom />} />
      </Routes>
    </Router>
  );
}

export default App;
