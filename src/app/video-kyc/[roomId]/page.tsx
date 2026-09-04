"use client";

import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import Image from "next/image";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  AlertCircle,
  CheckCircle,
  XCircle,
  PhoneOff,
  X,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import { AnimatePresence, motion } from "motion/react";

const VideoKycPage = () => {
  const { userData } = useSelector((state: RootState) => state.user);
  const router = useRouter();
  const params = useParams();
  const roomId = (params?.roomId || params?.roomid) as string;

  const [joined, setJoined] = useState(false);
  const [loadingCall, setLoadingCall] = useState(false);
  const [permissionError, setPermissionError] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const [reason, setReason] = useState<string>("");
  const [approvedLoading, setApprovedLoading] = useState(false);
  const [rejectedLoading, setRejectedLoading] = useState(false);
  const [showApprovelModel, setShowApprovelModel] = useState(false);
  const [showRejectionModel, setShowRejectionModel] = useState(false);

  useEffect(() => {
    if (joined) return;
    let localStream: MediaStream | null = null;

    const initPreview = async () => {
      try {
        setPermissionError(null);
        localStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });

        setStream(localStream);

        if (previewRef.current) {
          previewRef.current.srcObject = localStream;
          previewRef.current.play().catch(() => {});
        }
      } catch (error: any) {
        console.warn("Could not access camera/mic preview:", error);
        setPermissionError(
          "Camera or Microphone access was blocked. Please allow permissions in your browser address bar to join the call.",
        );
      }
    };

    initPreview();

    return () => {
      if (localStream) {
        localStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [joined]);

  const toggleCamera = () => {
    if (!stream) return;
    const newCameraState = !isCameraOn;
    stream.getVideoTracks().forEach((track) => {
      track.enabled = newCameraState;
    });
    setIsCameraOn(newCameraState);
  };

  const toggleMic = () => {
    if (!stream) return;
    const newMicState = !isMicOn;
    stream.getAudioTracks().forEach((track) => {
      track.enabled = newMicState;
    });
    setIsMicOn(newMicState);
  };

  const startCall = async () => {
    if (!roomId) {
      console.error("Room ID is missing");
      return;
    }

    setLoadingCall(true);
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }

    setJoined(true);

    try {
      const { ZegoUIKitPrebuilt } =
        await import("@zegocloud/zego-uikit-prebuilt");

      const appId = Number(process.env.NEXT_PUBLIC_ZEGO_APP_ID);
      const serverSecret =
        process.env.NEXT_PUBLIC_ZEGO_APP_SECRECT ||
        process.env.NEXT_PUBLIC_ZEGO_APP_SECRET;

      if (!appId || !serverSecret) {
        console.error("Missing Zego App ID or Server Secret in .env.local");
        setLoadingCall(false);
        return;
      }

      const displayName =
        userData?.role === "admin"
          ? "Admin"
          : `${userData?.name || "Partner"} (${userData?.email || ""})`;

      const userId = userData?._id?.toString() || `user_${Date.now()}`;

      const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
        appId,
        serverSecret,
        roomId,
        userId,
        displayName,
      );

      const zp = ZegoUIKitPrebuilt.create(kitToken);

      if (containerRef.current) {
        zp.joinRoom({
          container: containerRef.current,
          scenario: {
            mode: ZegoUIKitPrebuilt.OneONOneCall,
          },
          showPreJoinView: false,
          turnOnCameraWhenJoining: isCameraOn,
          turnOnMicrophoneWhenJoining: isMicOn,
        });
      }
    } catch (error) {
      console.error("Error joining Zego room:", error);
    } finally {
      setLoadingCall(false);
    }
  };

  const handleApproved = async () => {
    setApprovedLoading(true);
    try {
      const { data } = await axios.post("/api/admin/videoKyc/complete", {
        roomId,
        action: "approved",
      });
      if (data?.status === "approved" || data) {
        setShowApprovelModel(false);
        router.push("/");
      }
    } catch (error) {
      console.error("Error approving video KYC:", error);
    } finally {
      setApprovedLoading(false);
    }
  };

  const handleRejected = async () => {
    if (!reason.trim()) {
      return;
    }
    setRejectedLoading(true);
    try {
      const { data } = await axios.post("/api/admin/videoKyc/complete", {
        roomId,
        action: "rejected",
        reason: reason.trim(),
      });
      if (data?.status === "rejected" || data) {
        setShowRejectionModel(false);
        router.push("/");
      }
    } catch (error) {
      console.error("Error rejecting video KYC:", error);
    } finally {
      setRejectedLoading(false);
    }
  };

  return (
    <div className="h-screen max-h-screen w-screen bg-black text-white flex flex-col overflow-hidden">
      <header className="shrink-0 px-3 sm:px-6 py-2.5 sm:py-3 border-b border-white/10 flex items-center justify-between gap-3 bg-zinc-950 z-20">
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <Image
            src={"/logo.jpeg"}
            alt="logo"
            width={34}
            height={34}
            className="rounded-lg object-cover shrink-0 sm:w-[38px] sm:h-[38px]"
            priority
          />
          <div className="min-w-0">
            <h2 className="font-semibold text-xs sm:text-sm leading-tight truncate">
              <span className="hidden sm:inline">Video KYC Verification</span>
              <span className="sm:hidden">Video KYC</span>
            </h2>
            <p className="text-[10px] sm:text-xs text-gray-400 truncate">
              {userData?.role === "admin"
                ? "Admin Verification"
                : "Partner Session"}
            </p>
          </div>
        </div>

        {joined ? (
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            {userData?.role === "admin" && (
              <>
                <button
                  type="button"
                  className="bg-emerald-600 hover:bg-emerald-500 active:scale-95 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-full text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow"
                  onClick={() => setShowApprovelModel(true)}
                >
                  <CheckCircle size={14} className="shrink-0" />
                  <span>Approve</span>
                </button>
                <button
                  type="button"
                  className="bg-rose-600 hover:bg-rose-500 active:scale-95 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-full text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow"
                  onClick={() => setShowRejectionModel(true)}
                >
                  <XCircle size={14} className="shrink-0" />
                  <span>Reject</span>
                </button>
              </>
            )}
            <button
              type="button"
              onClick={() => {
                router.push("/");
              }}
              className="bg-red-700 hover:bg-red-600 active:scale-95 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow"
            >
              <PhoneOff size={14} className="shrink-0" />
              <span>
                End<span className="hidden sm:inline"> Call</span>
              </span>
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-[10px] sm:text-xs text-gray-400 bg-white/5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full border border-white/10 shrink-0 max-w-[150px] sm:max-w-none">
            <span className="hidden sm:inline text-gray-500">Room:</span>
            <span className="text-white font-mono truncate">{roomId}</span>
          </div>
        )}
      </header>

      <main className="flex-1 relative w-full h-full overflow-hidden">
        <div
          ref={containerRef}
          className={`w-full h-full ${
            joined
              ? "relative z-10"
              : "absolute inset-0 -z-50 opacity-0 pointer-events-none"
          }`}
        />

        {!joined && (
          <div className="w-full h-full overflow-y-auto flex items-center justify-center p-3.5 sm:p-6 md:p-8">
            <div className="w-full max-w-4xl lg:max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-8 lg:gap-12 items-center my-auto">
              <div className="w-full max-w-sm sm:max-w-md lg:max-w-none mx-auto relative rounded-2xl overflow-hidden border border-white/10 bg-zinc-900 aspect-video max-h-[32vh] sm:max-h-[40vh] lg:max-h-[50vh] flex items-center justify-center shadow-2xl">
                <video
                  autoPlay
                  muted
                  playsInline
                  ref={previewRef}
                  className={`w-full h-full object-cover ${
                    !isCameraOn ? "hidden" : "block"
                  }`}
                />
                {!isCameraOn && (
                  <div className="flex flex-col items-center gap-2 text-gray-400 p-4 text-center">
                    <VideoOff size={36} className="sm:w-10 sm:h-10" />
                    <span className="text-xs sm:text-sm font-medium">
                      Camera is off
                    </span>
                  </div>
                )}
              </div>

              <div className="space-y-4 sm:space-y-6 text-center lg:text-left flex flex-col justify-center">
                <div>
                  <h1 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold tracking-tight">
                    Join Video KYC
                  </h1>
                  <p className="text-gray-400 mt-1 sm:mt-1.5 text-xs sm:text-sm max-w-md mx-auto lg:mx-0">
                    Check your camera and microphone settings before joining the
                    verification session.
                  </p>
                </div>

                {permissionError && (
                  <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-xl text-xs flex items-start gap-2 text-left max-w-md mx-auto lg:mx-0">
                    <AlertCircle size={16} className="shrink-0 mt-0.5" />
                    <span>{permissionError}</span>
                  </div>
                )}

                <div className="flex justify-center lg:justify-start gap-3 sm:gap-4">
                  <button
                    type="button"
                    className={`w-11 h-11 sm:w-13 sm:h-13 rounded-full flex items-center justify-center transition cursor-pointer shadow ${
                      isCameraOn
                        ? "bg-white text-black hover:bg-gray-200"
                        : "bg-red-500/20 text-red-400 border border-red-500/30"
                    }`}
                    onClick={toggleCamera}
                    title={isCameraOn ? "Turn camera off" : "Turn camera on"}
                  >
                    {isCameraOn ? (
                      <Video size={19} className="sm:w-5 sm:h-5" />
                    ) : (
                      <VideoOff size={19} className="sm:w-5 sm:h-5" />
                    )}
                  </button>

                  <button
                    type="button"
                    className={`w-11 h-11 sm:w-13 sm:h-13 rounded-full flex items-center justify-center transition cursor-pointer shadow ${
                      isMicOn
                        ? "bg-white text-black hover:bg-gray-200"
                        : "bg-red-500/20 text-red-400 border border-red-500/30"
                    }`}
                    onClick={toggleMic}
                    title={isMicOn ? "Mute microphone" : "Unmute microphone"}
                  >
                    {isMicOn ? (
                      <Mic size={19} className="sm:w-5 sm:h-5" />
                    ) : (
                      <MicOff size={19} className="sm:w-5 sm:h-5" />
                    )}
                  </button>
                </div>

                <button
                  type="button"
                  onClick={startCall}
                  disabled={loadingCall}
                  className="w-full max-w-md mx-auto lg:mx-0 bg-white text-black py-3 sm:py-3.5 rounded-xl font-semibold cursor-pointer hover:bg-gray-200 active:scale-[0.99] transition shadow-lg text-sm sm:text-base disabled:opacity-50"
                >
                  {loadingCall ? "Connecting..." : "Join Secure Call"}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <AnimatePresence>
        {showApprovelModel && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ opacity: 0.9 }}
              animate={{ scale: 1 }}
              className="relative bg-[#111] w-full max-w-md rounded-2xl p-6 shadow-xl"
            >
              <button
                className="absolute top-4 right-4 text-gray-400 cursor-pointer border rounded-full p-1 hover:bg-gray-200 hover:text-black"
                onClick={() => setShowApprovelModel(false)}
              >
                <X size={16} />
              </button>
              <h2 className="text-lg font-semibold mb-4">Confirm Approval</h2>
              <div className="flex items-center gap-4 mt-1">
                <button
                  onClick={() => setShowApprovelModel(false)}
                  className="flex-1 border rounded-xl py-2 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleApproved}
                  disabled={approvedLoading}
                  className="flex-1 bg-green-600 rounded-xl py-2 cursor-pointer"
                >
                  {approvedLoading ? "Approving..." : "Approve"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showRejectionModel && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ opacity: 0.9 }}
              animate={{ scale: 1 }}
              className="relative bg-[#111] w-full max-w-md rounded-2xl p-6 shadow-xl"
            >
              <button
                className="absolute top-4 right-4 text-gray-400 cursor-pointer border rounded-full p-1 hover:bg-gray-200 hover:text-black"
                onClick={() => setShowRejectionModel(false)}
              >
                <X size={16} />
              </button>
              <h2 className="text-lg font-semibold mb-4">Confirm Rejection</h2>
              <textarea
                placeholder="Give Rejection Reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full bg-white/10 border border-white/10 rounded-xl p-3 mb-4 text-sm"
              />
              <div className="flex items-center gap-4 mt-1">
                <button
                  onClick={() => setShowRejectionModel(false)}
                  className="flex-1 border rounded-xl py-2 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRejected}
                  disabled={rejectedLoading}
                  className="flex-1 bg-red-600 rounded-xl py-2 cursor-pointer"
                >
                  {rejectedLoading ? "Rejecting..." : "Reject"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default VideoKycPage;
