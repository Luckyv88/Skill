/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Peer from "simple-peer";
import { getSocket } from "@/src/lib/socket";
import "./call.css";

export default function CallPageContent() {
  const router = useRouter();
  const params = useSearchParams();
  const socket = getSocket();

  const type = params.get("type"); // "video" | "audio"
  const friendId = params.get("friendId");
  const mode = params.get("mode"); // "caller" | "receiver"
  const userId = params.get("userId"); // your own ID

  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [receivingCall, setReceivingCall] = useState(false);
  const [callerSignal, setCallerSignal] = useState<any>(null);
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const peerRef = useRef<Peer.Instance | null>(null);

  const joinedRef = useRef(false);
  const callActiveRef = useRef(false);
  const signalingDoneRef = useRef(false);

  // ------------------- Initialize Media & Socket -------------------
  useEffect(() => {
    const startMedia = async () => {
      try {
        if (localStream) {
          localStream.getTracks().forEach((t) => t.stop());
          setLocalStream(null);
        }

        const stream = await navigator.mediaDevices.getUserMedia({
          video: type === "video",
          audio: true,
        });
        setLocalStream(stream);

        if (localVideoRef.current && type === "video") {
          localVideoRef.current.srcObject = stream;
        }

        // Join socket room once
        if (!joinedRef.current && userId) {
          socket.emit("join", userId);
          joinedRef.current = true;
        }
      } catch (err) {
        console.error("Media error:", err);
      }
    };

    startMedia();

    // ------------------- Socket Event Handlers -------------------
    socket.on("incomingCall", (data) => {
      if (!data) return;

      const { from, signalData, callType } = data || {};
      if (!from || !signalData || callType !== type) return;
      if (callActiveRef.current) return;

      setReceivingCall(true);
      setCallerSignal({ from, signalData });
    });

    socket.on("callAccepted", (data) => {
      if (!data || !data.signalData) return;
      if (!peerRef.current || peerRef.current.destroyed || signalingDoneRef.current)
        return;

      peerRef.current.signal(data.signalData);
      signalingDoneRef.current = true;
    });

    socket.on("callEnded", () => {
      hardReset();
    });

    return () => {
      cleanupCall();
      socket.off("incomingCall");
      socket.off("callAccepted");
      socket.off("callEnded");
      if (userId) socket.emit("leaveCall", { userId });
    };
  }, [type, userId]);

  // ------------------- Call / Answer / End -------------------
  const callUser = () => {
    if (!localStream || callActiveRef.current || !friendId || !userId) return;

    callActiveRef.current = true;
    signalingDoneRef.current = false;

    const peer = new Peer({ initiator: true, trickle: false, stream: localStream });

    peer.on("signal", (data) => {
      socket.emit("callUser", {
        to: friendId,
        from: userId,
        signalData: data,
        callType: type,
      });
    });

    peer.on("stream", (remote) => {
      if (remoteVideoRef.current) remoteVideoRef.current.srcObject = remote;
    });

    peer.on("close", cleanupCall);
    peer.on("error", cleanupCall);

    peerRef.current = peer;
  };

  const answerCall = () => {
    if (!callerSignal || !callerSignal.signalData || callActiveRef.current || !localStream)
      return;

    callActiveRef.current = true;
    setReceivingCall(false);

    const peer = new Peer({ initiator: false, trickle: false, stream: localStream });

    peer.on("signal", (data) => {
      socket.emit("acceptCall", { to: callerSignal.from, signalData: data });
    });

    peer.on("stream", (remote) => {
      if (remoteVideoRef.current) remoteVideoRef.current.srcObject = remote;
    });

    peer.on("close", cleanupCall);
    peer.on("error", cleanupCall);

    // Signal the incoming call
    peer.signal(callerSignal.signalData);

    peerRef.current = peer;
  };

  const endCall = () => {
    if (!userId) return;

    socket.emit("endCall", {
      to: callerSignal?.from || friendId,
      from: userId,
    });

    if (callerSignal?.from) {
      socket.emit("updateStatus", { userId: callerSignal.from, status: "online" });
    }

    hardReset();
  };

  // ------------------- Reset / Cleanup -------------------
  const hardReset = () => {
    if (peerRef.current) {
      peerRef.current.destroy();
      peerRef.current = null;
    }

    if (localStream) {
      localStream.getTracks().forEach((t) => t.stop());
      setLocalStream(null);
    }

    if (localVideoRef.current) localVideoRef.current.srcObject = null;
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;

    setReceivingCall(false);
    setCallerSignal(null);

    socket.off();
    if (userId) socket.emit("join", userId);

    callActiveRef.current = false;
    signalingDoneRef.current = false;

    router.replace("/home");
  };

  const cleanupCall = () => {
    callActiveRef.current = false;
    signalingDoneRef.current = false;

    if (peerRef.current) {
      peerRef.current.destroy();
      peerRef.current = null;
    }

    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
    if (localVideoRef.current) localVideoRef.current.srcObject = null;

    if (localStream) {
      localStream.getTracks().forEach((t) => t.stop());
      setLocalStream(null);
    }

    setReceivingCall(false);
    setCallerSignal(null);
  };

  // ------------------- Mic / Cam -------------------
  const toggleMic = () => {
    localStream?.getAudioTracks().forEach((t) => {
      t.enabled = !t.enabled;
      setMicOn(t.enabled);
    });
  };

  const toggleCam = () => {
    localStream?.getVideoTracks().forEach((t) => {
      t.enabled = !t.enabled;
      setCamOn(t.enabled);
    });
  };

  // ------------------- UI -------------------
  return (
    <div className="call-container">
      {type === "video" ? (
        <>
          <video ref={remoteVideoRef} autoPlay playsInline className="remote-video" />
          <video ref={localVideoRef} autoPlay muted className="local-video" />
        </>
      ) : (
        <div className="audio-container">
          <h2>Audio Call</h2>
        </div>
      )}

      <div className="call-controls">
        <button onClick={toggleMic}>{micOn ? "Mute Mic" : "Unmute Mic"}</button>
        {type === "video" && (
          <button onClick={toggleCam}>{camOn ? "Camera Off" : "Camera On"}</button>
        )}
        {receivingCall && <button onClick={answerCall}>Answer</button>}
        <button className="end-btn" onClick={endCall}>
          End Call
        </button>
        {mode === "caller" && !callActiveRef.current && (
          <button onClick={callUser}>Call Friend</button>
        )}
      </div>
    </div>
  );
}
