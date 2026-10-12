import { useState, useEffect, useCallback } from "react";

export function useMcdAIVoice() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [recognition, setRecognition] = useState<any>(null);

  useEffect(() => {
    // Initialize Speech Recognition
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = "id-ID"; // Default to Indonesian

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
      try {
        recognition.start();
      } catch {
        // ignore already started
      }
    } else {
      console.warn("Speech recognition not supported in this browser.");
    }
  }, [recognition]);

  const stopListening = useCallback(() => {
    if (recognition) {
      try {
        recognition.stop();
      } catch {
        // ignore
      }
    }
  }, [recognition]);

  const speak = useCallback((text: string) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "id-ID";
      utterance.pitch = 1.0;
      utterance.rate = 1.1;

      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find(
        (v) => v.name.includes("Google") || v.lang === "id-ID"
      );
      if (preferredVoice) utterance.voice = preferredVoice;

      window.speechSynthesis.speak(utterance);
    }
  }, []);

  return {
    isListening,
    transcript,
    startListening,
    stopListening,
    speak,
  };
}
