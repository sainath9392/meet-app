// src/components/AudioChatRoom.jsx
import React, { useEffect, useRef, useState } from "react";
import Peer from "simple-peer";

const AudioChatRoom = () => {
  const userAudioRef = useRef(null);
  const peerAudioRef = useRef(null);
  const [caption, setCaption] = useState("Say something...");

  useEffect(() => {
    // Get mic stream
    navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
      userAudioRef.current.srcObject = stream;

      // WebRTC peer setup
      const peer = new Peer({
        initiator: true,
        trickle: false,
        stream,
      });

      peer.on("stream", (remoteStream) => {
        peerAudioRef.current.srcObject = remoteStream;
      });

      peer.on("signal", (data) => {
        peer.signal(data); // loopback test
      });

      // Start speech recognition
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.lang = "en-US";
        recognition.continuous = true;
        recognition.interimResults = true;

        recognition.onresult = (event) => {
          const transcript = Array.from(event.results)
            .map((result) => result[0].transcript)
            .join("");
          setCaption(transcript);
        };

        recognition.onerror = (event) => {
          console.error("Speech recognition error:", event.error);
        };

        recognition.start();
      } else {
        setCaption("Speech Recognition not supported in this browser.");
      }
    });
  }, []);

  return (
    <div style={{ padding: "2rem" }}>
      <h2>🔊 WebRTC + Live Captions</h2>

      <div style={{ marginBottom: "2rem" }}>
        <h4>Your Mic</h4>
        <audio ref={userAudioRef} autoPlay muted />
      </div>

      <div style={{ marginBottom: "2rem" }}>
        <h4>Peer Audio</h4>
        <audio ref={peerAudioRef} autoPlay />
      </div>

      <div style={{ fontSize: "1.2rem", fontStyle: "italic", color: "#333" }}>
        🗣️ <strong>Live Caption:</strong> {caption}
      </div>
    </div>
  );
};

export default AudioChatRoom;
