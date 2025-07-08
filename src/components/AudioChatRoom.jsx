// src/components/AudioChatRoom.jsx
import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import Peer from "simple-peer/simplepeer.min.js";
import { io } from "socket.io-client";

const socket = io("http://localhost:5000"); // Replace with backend URL if deployed

const AudioChatRoom = () => {
  const { roomId } = useParams(); // ← Gets room ID from URL

  const userVideoRef = useRef(null);
  const peerVideoRef = useRef(null);
  const [caption, setCaption] = useState("Say something...");
  const [peerCaption, setPeerCaption] = useState("");
  const [micOn, setMicOn] = useState(true);
  const [videoOn, setVideoOn] = useState(true);

  const audioTrackRef = useRef(null);
  const videoTrackRef = useRef(null);

  useEffect(() => {
    let recognition;
    if (!roomId) return;

    socket.emit("join_room", roomId);

    socket.on("receive_caption", (data) => {
      setPeerCaption(data);
    });

    // 🎥 Get media and set up peer
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        userVideoRef.current.srcObject = stream;

        audioTrackRef.current = stream.getAudioTracks()[0];
        videoTrackRef.current = stream.getVideoTracks()[0];

        const peer = new Peer({ initiator: true, stream });

        peer.on("stream", (remoteStream) => {
          peerVideoRef.current.srcObject = remoteStream;
        });

        peer.on("signal", (data) => {
          peer.signal(data); // loopback test
        });

        // 🎙️ Setup speech recognition
        const SpeechRecognition =
          window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
          recognition = new SpeechRecognition();
          recognition.lang = "en-US";
          recognition.continuous = true;
          recognition.interimResults = true;

          recognition.onresult = (event) => {
            const transcript = Array.from(event.results)
              .map((result) => result[0].transcript)
              .join("");
            setCaption(transcript);

            // 📡 Emit caption to room
            socket.emit("send_caption", {
              roomId,
              caption: transcript,
            });
          };

          recognition.onerror = (event) => {
            console.error("Speech recognition error:", event.error);
          };

          recognition.start();
        } else {
          setCaption("Speech Recognition not supported in this browser.");
        }
      });

    return () => {
      socket.off("receive_caption");
    };
  }, [roomId]);

  const toggleMic = () => {
    if (audioTrackRef.current) {
      audioTrackRef.current.enabled = !audioTrackRef.current.enabled;
      setMicOn(audioTrackRef.current.enabled);
    }
  };

  const toggleVideo = () => {
    if (videoTrackRef.current) {
      videoTrackRef.current.enabled = !videoTrackRef.current.enabled;
      setVideoOn(videoTrackRef.current.enabled);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">🎥 Voice-to-Text Meet</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-5xl mb-6">
        {/* Your Video */}
        <div className="bg-white p-4 rounded-lg shadow-md">
          <video
            ref={userVideoRef}
            autoPlay
            muted
            className="rounded-lg w-full"
          />
          <p className="mt-2 text-sm text-gray-700 font-semibold">
            🗣️ You: {caption}
          </p>
        </div>

        {/* Peer Video */}
        <div className="bg-white p-4 rounded-lg shadow-md">
          <video ref={peerVideoRef} autoPlay className="rounded-lg w-full" />
          <p className="mt-2 text-sm text-blue-600 font-semibold">
            👥 Peer: {peerCaption}
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-4">
        <button
          onClick={toggleMic}
          className={`px-4 py-2 rounded-lg font-medium transition ${
            micOn ? "bg-red-600 text-white" : "bg-gray-300 text-gray-700"
          }`}
        >
          {micOn ? "🔇 Mute Mic" : "🎙️ Unmute Mic"}
        </button>

        <button
          onClick={toggleVideo}
          className={`px-4 py-2 rounded-lg font-medium transition ${
            videoOn ? "bg-blue-600 text-white" : "bg-gray-300 text-gray-700"
          }`}
        >
          {videoOn ? "📷 Turn Off Video" : "🎥 Turn On Video"}
        </button>

        {/* Language Selector (placeholder) */}
        <select className="px-4 py-2 rounded-lg border border-gray-400 text-sm">
          <option value="en">English</option>
          <option value="hi">Hindi</option>
          <option value="te">Telugu</option>
          <option value="fr">French</option>
        </select>
      </div>
    </div>
  );
};

export default AudioChatRoom;
