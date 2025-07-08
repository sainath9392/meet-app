// src/components/Home.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";

const Home = () => {
  const navigate = useNavigate();

  const handleCreateRoom = () => {
    const newRoomId = uuidv4(); // 🔑 Unique room ID
    navigate(`/room/${newRoomId}`);
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-100">
      <h1 className="text-4xl font-bold mb-6">🎤 Meet Voice Caption App</h1>
      <button
        onClick={handleCreateRoom}
        className="bg-blue-600 text-white px-6 py-3 rounded-lg text-lg hover:bg-blue-700 transition"
      >
        ➕ Create New Room
      </button>
    </div>
  );
};

export default Home;
