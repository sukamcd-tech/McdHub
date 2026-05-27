"use client";

import { useState, useEffect, useCallback } from "react";

export function useMcdAIVoice() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [recognition, setRecognition] = useState<any>(null);

  useEffect(() => {
    // Initialize Speech Recognition
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = "id-ID"; // Default to Indonesian, can be changed to "en-US"

      rec.onstart = () => setIsListening(true);
      rec.onend = () => setIsListening(false);
      rec.onresult = (event: any) => {
        const text = event.results[0][0].transcript;
        setTranscript(text);
      };

      setRecognition(rec);
    }
  }, []);

  const startListening = useCallback(() => {
    if (recognition) {
      setTranscript("");
      recognition.start();
    } else {
      console.warn("Speech recognition not supported in this browser.");
    }
  }, [recognition]);

  const stopListening = useCallback(() => {
    if (recognition) {
      recognition.stop();
    }
  }, [recognition]);

  const speak = useCallback((text: string) => {
    if ("speechSynthesis" in window) {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "id-ID"; // JARVIS will speak Indonesian
      utterance.pitch = 1.0;
      utterance.rate = 1.1; // Slightly faster for a high-tech feel
      
      // Select a cool voice if available (optional)
      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find(v => v.name.includes("Google") || v.lang === "id-ID");
      if (preferredVoice) utterance.voice = preferredVoice;

      window.speechSynthesis.speak(utterance);
    }
  }, []);

  return {
    isListening,
    transcript,
    startListening,
    stopListening,
    speak
  };
}
