import React, { useState, useEffect, useRef } from "react";
import { 
  Sparkles, X, Send, Settings, Volume2, VolumeX, 
  Eye, EyeOff, BookOpen, Briefcase, Calendar, FolderKanban, 
  MessageSquareCode, HelpCircle, RefreshCw, AudioLines,
  Mic, MicOff, Minus, Maximize2, Minimize2
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { retrieveCampusContext, RagResultItem } from "@/services/rag";
import { 
  callSarvamChat, 
  generateSarvamSpeech, 
  playAudioResponse, 
  stopAudioResponse, 
  isAudioPlaying,
  transcribeSarvamSpeech,
  ChatMessage
} from "@/services/sarvam";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";

interface Message {
  id: string;
  sender: "user" | "bot";
  text: string;
  timestamp: Date;
  isAudioPlaying?: boolean;
  audioBase64?: string;
  sources?: RagResultItem[];
}

const SUGGESTIONS = [
  { text: "Are there any internship opportunities?", icon: Briefcase, color: "text-primary bg-primary/5 border-primary/20" },
  { text: "Find notes or papers to study CS", icon: BookOpen, color: "text-success bg-success/5 border-success/20" },
  { text: "What events are scheduled this month?", icon: Calendar, color: "text-warning bg-warning/5 border-warning/20" },
  { text: "Show active project collaborations", icon: FolderKanban, color: "text-accent-foreground bg-accent/10 border-accent/20" },
];

export default function AIChatbot() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  // Settings States
  const [apiKey, setApiKey] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);
  const [model, setModel] = useState("sarvam-105b");
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [ttsLanguage, setTtsLanguage] = useState("en-IN");
  const [speaker, setSpeaker] = useState("anushka");
  
  // Audio playback state tracker
  const [playingMessageId, setPlayingMessageId] = useState<string | null>(null);

  // STT States
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [sttLanguage, setSttLanguage] = useState("unknown");

  // Silence Detection & Sizing States
  const [isMinimized, setIsMinimized] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const silenceTimeoutRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Initialize configurations from local storage or environment
  useEffect(() => {
    const savedKey = localStorage.getItem("studenthub_sarvam_key") || "";
    const envKey = (import.meta.env.VITE_SARVAM_API_KEY as string) || "";
    
    setApiKey(savedKey || envKey);
    setModel(localStorage.getItem("studenthub_sarvam_model") || "sarvam-105b");
    setTtsEnabled(localStorage.getItem("studenthub_sarvam_tts") !== "false");
    setTtsLanguage(localStorage.getItem("studenthub_sarvam_lang") || "en-IN");
    setSpeaker(localStorage.getItem("studenthub_sarvam_speaker") || "anushka");
    setSttLanguage(localStorage.getItem("studenthub_sarvam_stt_lang") || "unknown");

    // Add introductory greeting if empty
    setMessages([
      {
        id: "welcome",
        sender: "bot",
        text: "Hi! I am StudentHub AI. Ask me anything about study resources, projects, events, or internships on campus!",
        timestamp: new Date()
      }
    ]);
  }, []);

  // Save settings when modified
  const saveSetting = (key: string, value: string) => {
    localStorage.setItem(key, value);
  };

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollContainerRef.current) {
      setTimeout(() => {
        scrollContainerRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
      }, 50);
    }
  }, [messages, isLoading, showSettings]);

  // Clean up recording context on unmount
  useEffect(() => {
    return () => {
      if (silenceTimeoutRef.current) {
        cancelAnimationFrame(silenceTimeoutRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(() => {});
      }
    };
  }, []);

  const handleSendMessage = async (textToSend: string) => {
    const query = textToSend.trim();
    if (!query) return;

    // Stop any active TTS audio
    stopAudioResponse();
    setPlayingMessageId(null);

    // User Message
    const userMsgId = `user-${Date.now()}`;
    const userMessage: Message = {
      id: userMsgId,
      sender: "user",
      text: query,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      // 1. Retrieve RAG context from Supabase tables
      const { contextText, results } = await retrieveCampusContext(query, user?.email, user?.id);

      // 2. Format history for Sarvam AI Chat completion
      const systemPrompt = `You are StudentHub AI, a helpful virtual assistant for StudentHub (a campus collaboration, notes, and events sharing portal). Use the following verified database records to answer the student's query accurately. 

If you cannot find the answer in the context, be honest and state that no matching records were found, but attempt to answer the user's question using general campus advice. Do not make up fake resources or events.

Campus Records Context:
${contextText}

Please respond in a friendly, conversational, and direct manner. Avoid long paragraphs. Use clear bullet points if helpful.`;

      const chatHistory: ChatMessage[] = [
        { role: "system", content: systemPrompt },
        ...messages.slice(-6).map(m => ({
          role: m.sender === "user" ? "user" as const : "assistant" as const,
          content: m.text
        })),
        { role: "user", content: query }
      ];

      // 3. Request LLM completion from Sarvam AI
      const activeKey = apiKey || (import.meta.env.VITE_SARVAM_API_KEY as string);
      if (!activeKey) {
        throw new Error("Sarvam AI API key is missing. Click the gear icon to set your key.");
      }

      const answer = await callSarvamChat(chatHistory, activeKey, model);

      // 4. Create Bot Message
      const botMsgId = `bot-${Date.now()}`;
      const botMessage: Message = {
        id: botMsgId,
        sender: "bot",
        text: answer,
        timestamp: new Date(),
        sources: results
      };

      // 5. Generate TTS Speech if enabled
      if (ttsEnabled) {
        try {
          const base64Audio = await generateSarvamSpeech(answer, activeKey, ttsLanguage, speaker);
          botMessage.audioBase64 = base64Audio;
        } catch (ttsErr) {
          console.warn("Speech generation skipped:", ttsErr);
        }
      }

      setMessages(prev => [...prev, botMessage]);

      // Automatically play voice response if TTS is configured
      if (ttsEnabled && botMessage.audioBase64) {
        playVoice(botMsgId, botMessage.audioBase64);
      }

    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to query Assistant");
      setMessages(prev => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: "bot",
          text: `⚠️ Error: ${err.message || "Unable to get response from AI. Please make sure your Sarvam API key is valid."}`,
          timestamp: new Date()
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const playVoice = (msgId: string, base64Audio: string) => {
    if (playingMessageId === msgId) {
      // Toggle off
      stopAudioResponse();
      setPlayingMessageId(null);
    } else {
      setPlayingMessageId(msgId);
      playAudioResponse(base64Audio, () => {
        setPlayingMessageId(null);
      });
    }
  };

  const generateSpeechOnDemand = async (msg: Message) => {
    const activeKey = apiKey || (import.meta.env.VITE_SARVAM_API_KEY as string);
    if (!activeKey) {
      toast.error("Please add your Sarvam API key in Settings.");
      setShowSettings(true);
      return;
    }

    toast.info("Generating voice response...");
    try {
      const base64Audio = await generateSarvamSpeech(msg.text, activeKey, ttsLanguage, speaker);
      
      // Cache base64 in messages state
      setMessages(prev => 
        prev.map(m => m.id === msg.id ? { ...m, audioBase64: base64Audio } : m)
      );

      playVoice(msg.id, base64Audio);
    } catch (err: any) {
      toast.error(err.message || "Failed to generate voice response");
    }
  };

  const handleClearChat = () => {
    if (window.confirm("Are you sure you want to clear this conversation?")) {
      stopAudioResponse();
      setPlayingMessageId(null);
      setMessages([
        {
          id: "welcome",
          sender: "bot",
          text: "Conversation cleared! How can I assist you with StudentHub data now?",
          timestamp: new Date()
        }
      ]);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const recorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      recorder.onstop = async () => {
        if (silenceTimeoutRef.current) {
          cancelAnimationFrame(silenceTimeoutRef.current);
          silenceTimeoutRef.current = null;
        }
        if (audioContextRef.current) {
          audioContextRef.current.close().catch(() => {});
          audioContextRef.current = null;
        }

        const audioBlob = new Blob(chunks, { type: "audio/wav" });
        stream.getTracks().forEach((track) => track.stop());
        streamRef.current = null;

        const activeKey = apiKey || (import.meta.env.VITE_SARVAM_API_KEY as string);
        if (!activeKey) {
          toast.error("Please add your Sarvam API key in Settings to use Voice Assistant.");
          setShowSettings(true);
          return;
        }

        setIsTranscribing(true);
        try {
          const transcript = await transcribeSarvamSpeech(audioBlob, activeKey, sttLanguage);
          if (transcript.trim()) {
            toast.success(`Transcribed: "${transcript}"`);
            handleSendMessage(transcript);
          } else {
            toast.warning("Could not hear anything. Please try again.");
          }
        } catch (err: any) {
          console.error(err);
          toast.error(err.message || "Transcription failed");
        } finally {
          setIsTranscribing(false);
        }
      };

      // Set up Web Audio silence analyzer
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);

      audioContextRef.current = audioContext;

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      let silenceStart = Date.now();

      const checkSilence = () => {
        if (recorder.state !== "recording") return;

        analyser.getByteFrequencyData(dataArray);

        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const average = sum / bufferLength;

        // A threshold of 8-12 represents speaking volume; below this is treated as silent
        if (average > 8) {
          silenceStart = Date.now();
        } else {
          // If silent for more than 3000ms, trigger stop
          if (Date.now() - silenceStart > 3000) {
            recorder.stop();
            setIsRecording(false);
            toast.info("Auto-submitting: Silence detected.");
            return;
          }
        }

        silenceTimeoutRef.current = requestAnimationFrame(checkSilence);
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);

      silenceTimeoutRef.current = requestAnimationFrame(checkSilence);
    } catch (err: any) {
      console.error(err);
      toast.error("Could not access microphone. Please check browser permissions.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state !== "inactive") {
      mediaRecorder.stop();
      setIsRecording(false);
    }
    if (silenceTimeoutRef.current) {
      cancelAnimationFrame(silenceTimeoutRef.current);
      silenceTimeoutRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <>
      {/* Floating Chat Bubble Button */}
      {!isOpen && (
        <button
          onClick={() => {
            setIsOpen(true);
            setIsMinimized(false);
          }}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full gradient-primary flex items-center justify-center text-primary-foreground shadow-xl hover:scale-105 transition-all duration-300 animate-pulse-subtle"
          title="Ask StudentHub AI"
          id="ai-chatbot-bubble"
        >
          <Sparkles className="w-6 h-6" />
        </button>
      )}

      {/* Chat Window Panel */}
      {isOpen && (
        <div 
          className={`fixed bottom-6 right-6 z-50 ${isMaximized ? "w-[650px]" : "w-[380px]"} ${
            isMinimized 
              ? "h-[68px]" 
              : isMaximized 
                ? "h-[calc(100vh-100px)] max-h-[780px]" 
                : "h-[580px] max-h-[calc(100vh-120px)]"
          } max-w-[calc(100vw-32px)] bg-card rounded-3xl border border-border/80 shadow-2xl flex flex-col overflow-hidden transition-all duration-300 animate-scale-in`}
          style={{ 
            boxShadow: "0 24px 64px -16px hsl(210 20% 20% / 0.25)",
            backdropFilter: "blur(20px)" 
          }}
        >
          {/* Header */}
          <div 
            onClick={() => {
              if (isMinimized) {
                setIsMinimized(false);
              }
            }}
            className={`glass-panel px-5 py-4 flex items-center justify-between border-b border-border/40 shrink-0 select-none ${
              isMinimized ? "cursor-pointer hover:bg-muted/30" : ""
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center text-primary-foreground relative">
                <Sparkles className="w-[18px] h-[18px]" />
                <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border border-card" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-foreground leading-tight">StudentHub AI</h3>
                <p className="text-[10px] text-muted-foreground/80 font-medium">Sarvam RAG Assistant</p>
              </div>
            </div>
            <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
              {/* Minimize/Restore Icon Button */}
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-muted text-muted-foreground transition-colors"
                title={isMinimized ? "Expand Chat" : "Minimize Chat"}
              >
                <Minus className="w-4 h-4" />
              </button>

              {/* Maximize/Restore Size Icon Button */}
              {!isMinimized && (
                <button
                  onClick={() => setIsMaximized(!isMaximized)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-muted text-muted-foreground transition-colors"
                  title={isMaximized ? "Restore Size" : "Maximize Chat"}
                >
                  {isMaximized ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </button>
              )}

              {!isMinimized && (
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center hover:bg-muted transition-colors ${showSettings ? "text-primary" : "text-muted-foreground"}`}
                  title="AI Settings"
                >
                  <Settings className="w-4 h-4" />
                </button>
              )}
              {!isMinimized && (
                <button
                  onClick={handleClearChat}
                  className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-muted text-muted-foreground transition-colors"
                  title="Clear Chat"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-muted text-muted-foreground transition-colors"
                title="Close Panel"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Body Content */}
          {!isMinimized && (
            <div className="flex-1 flex flex-col min-h-0 relative">
            {showSettings ? (
              /* Settings Overlay Screen */
              <div className="absolute inset-0 bg-card/95 backdrop-blur-sm z-10 p-5 overflow-y-auto animate-fade-in flex flex-col">
                <h4 className="font-bold text-sm text-foreground mb-4 flex items-center gap-2">
                  <Settings className="w-4 h-4 text-primary" /> Assistant Configurations
                </h4>
                
                <div className="space-y-4 flex-1">
                  {/* API Key */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground">Sarvam AI API Key</label>
                    <div className="relative">
                      <input
                        type={showApiKey ? "text" : "password"}
                        placeholder={import.meta.env.VITE_SARVAM_API_KEY ? "Using environment API Key" : "Enter your api-subscription-key"}
                        value={apiKey}
                        onChange={(e) => {
                          setApiKey(e.target.value);
                          saveSetting("studenthub_sarvam_key", e.target.value);
                        }}
                        className="w-full h-10 pl-3 pr-10 rounded-xl bg-muted/60 text-xs border border-transparent focus:border-primary/30 focus:outline-none transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowApiKey(!showApiKey)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/75 hover:text-foreground"
                      >
                        {showApiKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                    <p className="text-[10px] text-muted-foreground/70 leading-normal">
                      Get a subscription key on the <a href="https://dashboard.sarvam.ai" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-semibold">Sarvam AI Dashboard</a>.
                    </p>
                  </div>

                  {/* Model */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground">Model Selection</label>
                    <select
                      value={model}
                      onChange={(e) => {
                        setModel(e.target.value);
                        saveSetting("studenthub_sarvam_model", e.target.value);
                      }}
                      className="w-full h-10 px-3 rounded-xl bg-muted/60 text-xs border-0 focus:outline-none focus:ring-2 focus:ring-primary/25"
                    >
                      <option value="sarvam-105b">sarvam-105b (Highest Quality)</option>
                      <option value="sarvam-30b">sarvam-30b (Faster Response)</option>
                    </select>
                  </div>

                  {/* STT Input Language */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground">Speech-to-Text Language</label>
                    <select
                      value={sttLanguage}
                      onChange={(e) => {
                        setSttLanguage(e.target.value);
                        saveSetting("studenthub_sarvam_stt_lang", e.target.value);
                      }}
                      className="w-full h-10 px-3 rounded-xl bg-muted/60 text-xs border-0 focus:outline-none focus:ring-2 focus:ring-primary/25"
                    >
                      <option value="unknown">Auto-Detect Language</option>
                      <option value="en-IN">English (India)</option>
                      <option value="hi-IN">Hindi (हिंदी)</option>
                      <option value="te-IN">Telugu (తెలుగు)</option>
                      <option value="ta-IN">Tamil (தமிழ்)</option>
                      <option value="kn-IN">Kannada (ಕನ್ನಡ)</option>
                    </select>
                  </div>

                  {/* TTS Toggle */}
                  <div className="flex items-center justify-between py-2 border-y border-border/30">
                    <div>
                      <label className="text-xs font-bold text-foreground block">Auto Voice Answers</label>
                      <span className="text-[10px] text-muted-foreground/80">Read assistant responses aloud</span>
                    </div>
                    <button
                      onClick={() => {
                        const nextVal = !ttsEnabled;
                        setTtsEnabled(nextVal);
                        localStorage.setItem("studenthub_sarvam_tts", String(nextVal));
                      }}
                      className={`w-11 h-6 rounded-full transition-colors flex items-center px-0.5 ${ttsEnabled ? "bg-primary justify-end" : "bg-muted justify-start"}`}
                    >
                      <span className="w-5 h-5 rounded-full bg-white shadow-sm" />
                    </button>
                  </div>

                  {/* Voice Options */}
                  {ttsEnabled && (
                    <div className="grid grid-cols-2 gap-3.5 pt-1 animate-fade-in">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-muted-foreground">Language</label>
                        <select
                          value={ttsLanguage}
                          onChange={(e) => {
                            setTtsLanguage(e.target.value);
                            saveSetting("studenthub_sarvam_lang", e.target.value);
                          }}
                          className="w-full h-9 px-2 rounded-lg bg-muted/60 text-xs border-0 focus:outline-none"
                        >
                          <option value="en-IN">English (India)</option>
                          <option value="hi-IN">Hindi (हिंदी)</option>
                          <option value="te-IN">Telugu (తెలుగు)</option>
                          <option value="ta-IN">Tamil (தமிழ்)</option>
                          <option value="kn-IN">Kannada (ಕನ್ನಡ)</option>
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-muted-foreground">Speaker Voice</label>
                        <select
                          value={speaker}
                          onChange={(e) => {
                            setSpeaker(e.target.value);
                            saveSetting("studenthub_sarvam_speaker", e.target.value);
                          }}
                          className="w-full h-9 px-2 rounded-lg bg-muted/60 text-xs border-0 focus:outline-none"
                        >
                          <option value="anushka">Anushka (Female)</option>
                          <option value="aditya">Aditya (Male)</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>

                <Button 
                  onClick={() => setShowSettings(false)} 
                  className="w-full h-10 font-semibold rounded-xl mt-4 shrink-0 shadow-md"
                >
                  Apply Configurations
                </Button>
              </div>
            ) : null}

            {/* Conversation Messages Thread */}
            <ScrollArea className="flex-1 px-4 py-4">
              <div className="space-y-4 pr-1">
                {messages.map((msg) => (
                  <div 
                    key={msg.id}
                    className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"} animate-fade-in`}
                  >
                    <div className="flex items-center gap-1.5 mb-1 text-[10px] text-muted-foreground/75 px-1 font-semibold">
                      <span>{msg.sender === "user" ? "You" : "StudentHub Assistant"}</span>
                      <span>·</span>
                      <span>{msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>

                    <div className="group relative flex items-start gap-2 max-w-[88%]">
                      {msg.sender === "bot" && (
                        <div className="w-6 h-6 rounded-lg gradient-primary flex items-center justify-center text-primary-foreground shrink-0 text-[10px] mt-1 font-extrabold shadow-sm">
                          SH
                        </div>
                      )}
                      
                      <div 
                        className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-[0_2px_8px_-2px_hsl(210_20%_20%/_0.05)] ${
                          msg.sender === "user" 
                            ? "bg-primary text-primary-foreground rounded-tr-none" 
                            : "bg-muted/80 text-foreground rounded-tl-none border border-border/20"
                        }`}
                      >
                        {/* Text Render */}
                        <div className="whitespace-pre-line break-words text-xs sm:text-sm">
                          {msg.text}
                        </div>

                        {/* RAG sources indicator */}
                        {msg.sources && msg.sources.length > 0 && (
                          <div className="mt-3.5 pt-2 border-t border-border/30">
                            <p className="text-[10px] font-bold text-muted-foreground/80 flex items-center gap-1">
                              <MessageSquareCode className="w-3 h-3 text-primary" /> SEARCHED DATABASES:
                            </p>
                            <div className="flex flex-wrap gap-1 mt-1.5">
                              {msg.sources.map((src, i) => (
                                <span 
                                  key={i} 
                                  className="text-[9px] font-semibold px-2 py-0.5 rounded bg-card text-foreground/80 border border-border/40"
                                  title={`${src.type.toUpperCase()}: ${src.title}`}
                                >
                                  {src.type.toUpperCase()} · {src.title.length > 15 ? src.title.slice(0, 15) + "..." : src.title}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Play Audio Button for Bot Message */}
                      {msg.sender === "bot" && (
                        <div className="flex flex-col gap-1 mt-1 shrink-0 opacity-40 group-hover:opacity-100 transition-opacity">
                          {msg.audioBase64 ? (
                            <button
                              onClick={() => playVoice(msg.id, msg.audioBase64!)}
                              className={`w-7 h-7 rounded-full flex items-center justify-center border transition-all ${
                                playingMessageId === msg.id 
                                  ? "bg-primary text-primary-foreground border-primary" 
                                  : "bg-card text-muted-foreground border-border/80 hover:bg-muted"
                              }`}
                              title={playingMessageId === msg.id ? "Pause Audio" : "Listen Response"}
                            >
                              {playingMessageId === msg.id ? <AudioLines className="w-3.5 h-3.5 animate-pulse" /> : <Volume2 className="w-3.5 h-3.5" />}
                            </button>
                          ) : (
                            // Allow generating speech on demand
                            msg.id !== "welcome" && (
                              <button
                                onClick={() => generateSpeechOnDemand(msg)}
                                className="w-7 h-7 rounded-full bg-card border border-border/80 flex items-center justify-center text-muted-foreground/60 hover:text-foreground hover:bg-muted transition-all"
                                title="Synthesize Voice"
                              >
                                <Volume2 className="w-3.5 h-3.5" />
                              </button>
                            )
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {/* Loading state indicator */}
                {isLoading && (
                  <div className="flex flex-col items-start animate-fade-in">
                    <div className="flex items-center gap-1.5 mb-1 text-[10px] text-muted-foreground/75 px-1 font-semibold">
                      <span>StudentHub Assistant</span>
                      <span>·</span>
                      <span>Typing...</span>
                    </div>
                    <div className="flex items-start gap-2 max-w-[85%]">
                      <div className="w-6 h-6 rounded-lg gradient-primary flex items-center justify-center text-primary-foreground shrink-0 text-[10px] mt-1 font-bold animate-pulse">
                        SH
                      </div>
                      <div className="rounded-2xl rounded-tl-none px-4 py-3 bg-muted/80 text-foreground border border-border/20 shadow-sm flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-primary/60 animate-bounce stagger-1" />
                        <span className="w-2 h-2 rounded-full bg-primary/60 animate-bounce stagger-2" />
                        <span className="w-2 h-2 rounded-full bg-primary/60 animate-bounce stagger-3" />
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Scroll Anchor */}
                <div ref={scrollContainerRef} />
              </div>
            </ScrollArea>

            {/* Suggestions Chips (shown when no messages other than welcome greeting) */}
            {messages.length <= 1 && !isLoading && (
              <div className="px-4 py-3 shrink-0 bg-background/50 border-t border-border/20 z-0">
                <p className="text-[10px] font-bold text-muted-foreground mb-2 tracking-wider flex items-center gap-1">
                  <HelpCircle className="w-3.5 h-3.5 text-primary" /> CHOOSE A SUGGESTED INQUIRY:
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {SUGGESTIONS.map((sug, i) => {
                    const Icon = sug.icon;
                    return (
                      <button
                        key={i}
                        onClick={() => handleSendMessage(sug.text)}
                        className={`text-left p-2.5 rounded-2xl border text-[11px] font-semibold leading-snug transition-all duration-300 hover:-translate-y-0.5 hover:shadow-sm flex flex-col gap-1.5 ${sug.color}`}
                      >
                        <Icon className="w-4 h-4 shrink-0" />
                        {sug.text}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
          )}

          {/* Form Input Area */}
          {!isMinimized && (
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage(inputValue);
              }} 
              className="p-4 border-t border-border/40 bg-card/65 backdrop-blur-lg shrink-0 flex gap-2 items-center"
            >
              {/* Microphone Toggle Button */}
              <button
                type="button"
                onClick={toggleRecording}
                disabled={isLoading || isTranscribing}
                className={`h-11 w-11 rounded-2xl flex items-center justify-center border transition-all ${
                  isRecording 
                    ? "bg-destructive text-destructive-foreground border-destructive animate-pulse" 
                    : "bg-muted hover:bg-muted/80 text-muted-foreground border-border/50"
                }`}
                title={isRecording ? "Stop Recording" : "Speak to Assistant"}
              >
                {isRecording ? <AudioLines className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>
              <div className="relative flex-1">
                <input
                  type="text"
                  value={isTranscribing ? "Listening and transcribing..." : inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder={isRecording ? "Recording... Click mic to stop" : "Ask about notes, events, internships..."}
                  disabled={isLoading || isTranscribing || isRecording}
                  className="oneui-input pr-10 border border-border/50 text-xs sm:text-sm h-11"
                />
                {inputValue.trim() && !isRecording && !isTranscribing && (
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-primary hover:text-primary-foreground hover:bg-primary p-1.5 rounded-xl transition-all"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                )}
              </div>
            </form>
          )}
        </div>
      )}
    </>
  );
}
