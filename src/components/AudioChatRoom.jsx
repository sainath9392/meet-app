import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import Peer from "simple-peer/simplepeer.min.js";
import { io } from "socket.io-client";

const socket = io("http://localhost:5000");

const AudioChatRoom = () => {
  const { roomId } = useParams();
  const [caption, setCaption] = useState("Say something...");
  const [peerCaption, setPeerCaption] = useState("");
  const [micOn, setMicOn] = useState(true);
  const [videoOn, setVideoOn] = useState(true);
  const [copied, setCopied] = useState(false);

  const userVideoRef = useRef(null);
  const peerVideoRef = useRef(null);
  const audioTrackRef = useRef(null);
  const videoTrackRef = useRef(null);
  const peerRef = useRef(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    let stream;

    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((mediaStream) => {
        stream = mediaStream;
        userVideoRef.current.srcObject = stream;

        audioTrackRef.current = stream.getAudioTracks()[0];
        videoTrackRef.current = stream.getVideoTracks()[0];

        socket.emit("join_room", roomId);

        socket.on("user_joined", (peerId) => {
          peerRef.current = new Peer({
            initiator: true,
            trickle: false,
            stream,
          });

          peerRef.current.on("signal", (data) => {
            socket.emit("sending_signal", {
              userToSignal: peerId,
              signal: data,
              from: socket.id,
            });
          });

          peerRef.current.on("stream", (remoteStream) => {
            peerVideoRef.current.srcObject = remoteStream;
          });

          peerRef.current.on("error", console.error);
        });

        socket.on("receiving_returned_signal", (payload) => {
          if (peerRef.current) {
            try {
              peerRef.current.signal(payload.signal);
            } catch (err) {
              console.error("Error applying signal:", err);
            }
          }
        });

        socket.on("user_joined_late", (payload) => {
          peerRef.current = new Peer({
            initiator: false,
            trickle: false,
            stream,
          });

          peerRef.current.on("signal", (signal) => {
            socket.emit("returning_signal", {
              signal,
              to: payload.from,
            });
          });

          peerRef.current.on("stream", (remoteStream) => {
            peerVideoRef.current.srcObject = remoteStream;
          });

          try {
            peerRef.current.signal(payload.signal);
          } catch (err) {
            console.error("Error on late signal:", err);
          }

          peerRef.current.on("error", console.error);
        });

        socket.on("receive_caption", (data) => {
          setPeerCaption(data);
        });

        const SpeechRecognition =
          window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
          const recognition = new SpeechRecognition();
          recognitionRef.current = recognition;
          recognition.lang = "en-US";
          recognition.continuous = true;
          recognition.interimResults = true;

          recognition.onresult = (event) => {
            const transcript = Array.from(event.results)
              .map((result) => result[0].transcript)
              .join("");
            setCaption(transcript);

            socket.emit("send_caption", {
              roomId,
              caption: transcript,
            });
          };

          recognition.onerror = (event) => {
            console.error("Speech recognition error:", event.error);
          };

          if (micOn) recognition.start();
        } else {
          setCaption("Speech Recognition not supported in this browser.");
        }
      });

    return () => {
      recognitionRef.current?.stop();
      socket.off("receive_caption");

      if (peerRef.current) {
        peerRef.current.destroy();
        peerRef.current = null;
      }

      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [roomId]);

  const toggleMic = () => {
    if (audioTrackRef.current) {
      audioTrackRef.current.enabled = !audioTrackRef.current.enabled;
      setMicOn(audioTrackRef.current.enabled);

      if (recognitionRef.current) {
        try {
          if (audioTrackRef.current.enabled) {
            recognitionRef.current.start();
          } else {
            recognitionRef.current.stop();
          }
        } catch (err) {
          console.error("Speech recognition toggle failed:", err);
        }
      }
    }
  };

  const toggleVideo = () => {
    if (videoTrackRef.current) {
      videoTrackRef.current.enabled = !videoTrackRef.current.enabled;
      setVideoOn(videoTrackRef.current.enabled);
    }
  };

  const handleCopyLink = () => {
    const link = `${window.location.origin}/room/${roomId}`;
    navigator.clipboard.writeText(link).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">🎥 Voice-to-Text Meet</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-5xl mb-6">
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

        <div className="bg-white p-4 rounded-lg shadow-md">
          <video ref={peerVideoRef} autoPlay className="rounded-lg w-full" />
          <p className="mt-2 text-sm text-blue-600 font-semibold">
            👥 Peer: {peerCaption}
          </p>
        </div>
      </div>

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

        <div className="flex flex-col items-center">
          <button
            onClick={handleCopyLink}
            className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition"
          >
            🔗 Copy Room Link
          </button>
          {copied && (
            <span className="text-green-600 text-sm mt-1 font-medium">
              ✅ Link copied!
            </span>
          )}
        </div>

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
