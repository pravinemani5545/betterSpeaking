"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Video,
  Square,
  Loader2,
  Camera,
  AlertTriangle,
} from "lucide-react";
import type { Analysis } from "@/types";

interface VideoRecorderProps {
  questionId: string;
  onSubmitted: (analysis?: Analysis) => void;
}

export function VideoRecorder({ questionId, onSubmitted }: VideoRecorderProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const framesRef = useRef<string[]>([]);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const frameIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const durationIntervalRef = useRef<ReturnType<typeof setInterval> | null>(
    null
  );

  const [status, setStatus] = useState<
    "idle" | "previewing" | "recording" | "uploading" | "analyzing"
  >("idle");
  const [transcript, setTranscript] = useState("");
  const [duration, setDuration] = useState(0);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [browserSupported, setBrowserSupported] = useState(true);
  const [speechSupported, setSpeechSupported] = useState(true);

  useEffect(() => {
    const hasMediaDevices = !!(navigator.mediaDevices?.getUserMedia);
    const hasMediaRecorder = typeof MediaRecorder !== "undefined";
    setBrowserSupported(hasMediaDevices && hasMediaRecorder);

    const SR =
      typeof window !== "undefined"
        ? window.SpeechRecognition || window.webkitSpeechRecognition
        : null;
    setSpeechSupported(!!SR);
  }, []);

  const captureFrame = useCallback(() => {
    if (!videoRef.current) return;
    const canvas = document.createElement("canvas");
    canvas.width = 640;
    canvas.height = 480;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(videoRef.current, 0, 0, 640, 480);
    const base64 = canvas.toDataURL("image/jpeg", 0.7);
    framesRef.current.push(base64);
  }, []);

  async function startCamera() {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setStream(mediaStream);
      setStatus("previewing");
    } catch {
      toast.error(
        "Camera access denied. Please allow camera and microphone permissions."
      );
    }
  }

  function startRecording() {
    if (!stream) return;

    const mimeType = MediaRecorder.isTypeSupported(
      "video/webm;codecs=vp9,opus"
    )
      ? "video/webm;codecs=vp9,opus"
      : MediaRecorder.isTypeSupported("video/webm")
        ? "video/webm"
        : "video/mp4";

    const recorder = new MediaRecorder(stream, { mimeType });
    chunksRef.current = [];
    framesRef.current = [];

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };

    mediaRecorderRef.current = recorder;
    recorder.start(1000);

    // Capture frames every 5 seconds
    captureFrame(); // Initial frame
    frameIntervalRef.current = setInterval(captureFrame, 5000);

    // Start SpeechRecognition
    startTranscription();

    // Duration timer
    const startTime = Date.now();
    setDuration(0);
    durationIntervalRef.current = setInterval(() => {
      setDuration(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    setStatus("recording");
  }

  function startTranscription() {
    const SR =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;

    const recognition = new SR();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    let finalTranscript = "";
    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript + " ";
        } else {
          interim += event.results[i][0].transcript;
        }
      }
      setTranscript(finalTranscript + interim);
    };

    recognition.onerror = () => {};
    recognition.start();
    recognitionRef.current = recognition;
  }

  async function stopRecording() {
    // Clear intervals
    if (frameIntervalRef.current) clearInterval(frameIntervalRef.current);
    if (durationIntervalRef.current) clearInterval(durationIntervalRef.current);

    // Stop recognition
    recognitionRef.current?.stop();

    // Stop recorder
    const recorder = mediaRecorderRef.current;
    if (!recorder) return;

    await new Promise<void>((resolve) => {
      recorder.onstop = () => resolve();
      recorder.stop();
    });

    // Final frame capture
    captureFrame();

    // Stop camera
    stream?.getTracks().forEach((t) => t.stop());
    setStream(null);

    // Create blob
    const blob = new Blob(chunksRef.current, { type: "video/webm" });

    if (blob.size > 100 * 1024 * 1024) {
      toast.error("Video too large. Maximum 100MB.");
      setStatus("idle");
      return;
    }

    setStatus("uploading");

    try {
      const formData = new FormData();
      formData.append("video", blob, `response-${Date.now()}.webm`);
      formData.append("question_id", questionId);
      formData.append("transcript", transcript);
      formData.append("duration_seconds", String(duration));

      const res = await fetch("/api/responses/video", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Upload failed");
      }

      const data = await res.json();

      setStatus("analyzing");

      const analyzeRes = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          response_id: data.id,
          frames: framesRef.current,
        }),
      });

      if (!analyzeRes.ok) {
        toast.error("Response saved but analysis failed");
        onSubmitted();
        return;
      }

      const analysisData = await analyzeRes.json();
      toast.success("Response analyzed!");
      onSubmitted(analysisData);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to upload video"
      );
      setStatus("idle");
    }
  }

  function formatDuration(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  }

  if (!browserSupported) {
    return (
      <div className="border border-border bg-card rounded-lg p-6 text-center space-y-3">
        <AlertTriangle className="h-8 w-8 text-amber-400 mx-auto" />
        <p className="text-sm text-muted-foreground">
          Your browser doesn&apos;t support video recording. Please use Chrome
          or Edge.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Video Preview */}
      <div className="border border-border bg-card rounded-lg overflow-hidden">
        <div className="relative aspect-video bg-black">
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className="w-full h-full object-cover"
          />
          {status === "recording" && (
            <div className="absolute top-4 left-4 flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-red-500 animate-pulse" />
              <span className="text-sm font-mono text-white bg-black/50 px-2 py-0.5 rounded">
                {formatDuration(duration)}
              </span>
            </div>
          )}
          {status === "idle" && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Camera className="h-12 w-12 text-muted-foreground" />
            </div>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3">
        {status === "idle" && (
          <Button onClick={startCamera}>
            <Camera className="mr-2 h-4 w-4" />
            Start Camera
          </Button>
        )}
        {status === "previewing" && (
          <Button onClick={startRecording}>
            <Video className="mr-2 h-4 w-4" />
            Start Recording
          </Button>
        )}
        {status === "recording" && (
          <Button onClick={stopRecording} variant="destructive">
            <Square className="mr-2 h-4 w-4" />
            Stop Recording
          </Button>
        )}
        {(status === "uploading" || status === "analyzing") && (
          <Button disabled>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {status === "uploading"
              ? "Uploading video..."
              : "Analyzing your response..."}
          </Button>
        )}
      </div>

      {/* Speech Recognition Warning */}
      {!speechSupported && status !== "idle" && (
        <p className="text-xs text-amber-400 flex items-center gap-1">
          <AlertTriangle className="h-3 w-3" />
          Live transcription not available in this browser. Analysis will be
          based on video only.
        </p>
      )}

      {/* Live Transcript */}
      {transcript && (status === "recording" || status === "previewing") && (
        <div className="border border-border bg-card rounded-lg p-4">
          <p className="text-xs text-muted-foreground mb-2">Live Transcript</p>
          <p className="text-sm leading-relaxed">{transcript}</p>
        </div>
      )}
    </div>
  );
}
