/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useRef, useState } from "react";
import Peer from "simple-peer";
import { getSocket } from "@/./src/lib/socket";
import "./VideoCall.css";

interface Props {
  userId: string;
  friendId: string;
}

export default function VideoCall({ userId, friendId }: Props) {
  const socket = getSocket();

  const myVideo = useRef<HTMLVideoElement>(null);
  const friendVideo = useRef<HTMLVideoElement>(null);
  const connectionRef = useRef<any>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [receivingCall, setReceivingCall] = useState(false);
  const [callerSignal, setCallerSignal] = useState<any>(null);

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((currentStream) => {
        setStream(currentStream);
        if (myVideo.current)
          myVideo.current.srcObject = currentStream;
      });

    socket.emit("register", userId);

    socket.on("incomingCall", (data) => {
      setReceivingCall(true);
      setCallerSignal(data);
    });

    socket.on("callAccepted", (signal) => {
      connectionRef.current.signal(signal);
    });

    return () => {
      socket.off("incomingCall");
      socket.off("callAccepted");
    };
  }, []);

  const callUser = () => {
    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream: stream!,
    });

    peer.on("signal", (data) => {
      socket.emit("callUser", {
        to: friendId,
        from: userId,
        signal: data,
      });
    });

    peer.on("stream", (remoteStream) => {
      if (friendVideo.current)
        friendVideo.current.srcObject = remoteStream;
    });

    connectionRef.current = peer;
  };

  const answerCall = () => {
    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream: stream!,
    });

    peer.on("signal", (data) => {
      socket.emit("answerCall", {
        to: callerSignal.from,
        signal: data,
      });
    });

    peer.on("stream", (remoteStream) => {
      if (friendVideo.current)
        friendVideo.current.srcObject = remoteStream;
    });

    peer.signal(callerSignal.signal);
    connectionRef.current = peer;
    setReceivingCall(false);
  };

  return (
    <div className="video-container">
      <video ref={myVideo} autoPlay muted playsInline />
      <video ref={friendVideo} autoPlay playsInline />

      <div className="controls">
        <button onClick={callUser}>Call</button>
        {receivingCall && (
          <button onClick={answerCall}>Answer</button>
        )}
      </div>
    </div>
  );
}
