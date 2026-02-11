/* eslint-disable react-hooks/immutability */
"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getSocket } from "@/src/lib/socket";
import "./call.css";

export default function CallPage() {
  const router = useRouter();
  const params = useSearchParams();
  const socket = getSocket();

  const type = params.get("type"); // video | audio
  const friendId = params.get("friendId");

  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);

  const localVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const startMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: type === "video",
          audio: true,
        });

        setLocalStream(stream);

        if (localVideoRef.current && type === "video") {
          localVideoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error(err);
      }
    };

    startMedia();

    socket.on("callEnded", () => {
      cleanup();
      router.back();
    });

    return () => {
      cleanup();
      socket.off("callEnded");
    };
  }, []);

  const cleanup = () => {
    localStream?.getTracks().forEach((track) => track.stop());
  };

  const toggleMic = () => {
    localStream?.getAudioTracks().forEach((track) => {
      track.enabled = !track.enabled;
      setMicOn(track.enabled);
    });
  };

  const toggleCam = () => {
    localStream?.getVideoTracks().forEach((track) => {
      track.enabled = !track.enabled;
      setCamOn(track.enabled);
    });
  };

  const endCall = () => {
    socket.emit("endCall", { to: friendId });
    cleanup();
    router.back();
  };

  return (
    <div className="call-container">
      {type === "video" ? (
        <>
          {/* Friend Full Screen (placeholder for now) */}
          <div className="remote-video">
            <h2>Friend Video</h2>
          </div>

          {/* User small top right */}
          <video
            ref={localVideoRef}
            autoPlay
            muted
            className="local-video"
          />
        </>
      ) : (
        <div className="audio-container">
          <div className="wave"></div>
          <h2>Audio Call</h2>
        </div>
      )}

      <div className="call-controls">
        <button onClick={toggleMic}>
          {micOn ? "Mute Mic" : "Unmute Mic"}
        </button>

        {type === "video" && (
          <button onClick={toggleCam}>
            {camOn ? "Camera Off" : "Camera On"}
          </button>
        )}

        <button className="end-btn" onClick={endCall}>
          End Call
        </button>
      </div>
    </div>
  );
}
