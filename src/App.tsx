import React, { useState, useEffect, useRef } from 'react';
import { Send, User, MessageSquare, Tv, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Message {
  id: string;
  user: string;
  text: string;
  timestamp: Date;
}

const StarryBackground = () => {
  const [stars, setStars] = useState<{ id: number; top: string; left: string; size: string; duration: string }[]>([]);

  useEffect(() => {
    const newStars = Array.from({ length: 100 }).map((_, i) => ({
      id: i,
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      size: `${Math.random() * 3}px`,
      duration: `${2 + Math.random() * 4}s`,
    }));
    setStars(newStars);
  }, []);

  return (
    <div className="starry-bg">
      {stars.map((star) => (
        <div
          key={star.id}
          className="star"
          style={{
            top: star.top,
            left: star.left,
            width: star.size,
            height: star.size,
            // @ts-ignore
            '--duration': star.duration,
          }}
        />
      ))}
    </div>
  );
};

export default function App() {
  const [nickname, setNickname] = useState<string>('');
  const [isNickSet, setIsNickSet] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream, isStreaming]);

  const startStream = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720 },
        audio: true
      });
      setStream(mediaStream);
      setIsStreaming(true);
    } catch (err) {
      console.error("Error accessing media devices.", err);
      alert("Não foi possível acessar a câmera ou microfone. Verifique as permissões.");
    }
  };

  const stopStream = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
      setIsStreaming(false);
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      user: nickname,
      text: inputText,
      timestamp: new Date(),
    };

    setMessages([...messages, newMessage]);
    setInputText('');
  };

  const handleSetNick = (e: React.FormEvent) => {
    e.preventDefault();
    if (nickname.trim()) {
      setIsNickSet(true);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col p-4 md:p-8 relative">
      <StarryBackground />

      {/* Nickname Modal */}
      <AnimatePresence>
        {!isNickSet && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-zinc-900 border border-zinc-800 p-8 rounded-2xl w-full max-w-md shadow-2xl"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-yellow-500/10 rounded-xl">
                  <User className="w-6 h-6 text-yellow-500" />
                </div>
                <h2 className="text-2xl font-bold text-white">Escolha seu Nick</h2>
              </div>
              <form onSubmit={handleSetNick} className="space-y-4">
                <input
                  autoFocus
                  type="text"
                  placeholder="Seu apelido incrível..."
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500 transition-all"
                />
                <button
                  type="submit"
                  className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-3 rounded-xl transition-colors"
                >
                  Entrar no Chat
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-6 max-w-7xl mx-auto w-full">
        {/* Live Stream Area (Turquoise) */}
        <div className="lg:col-span-3 flex flex-col gap-4">
          <div className="relative aspect-video bg-turquoise rounded-2xl overflow-hidden shadow-2xl border-4 border-black group">
            {isStreaming ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <Tv className="w-20 h-20 text-white/50 mb-4 mx-auto animate-pulse" />
                  <p className="text-white font-bold text-xl uppercase tracking-widest">Aguardando Transmissão...</p>
                </div>
              </div>
            )}
            
            {/* Overlay Info */}
            <div className="absolute top-4 left-4 flex items-center gap-2">
              {isStreaming ? (
                <div className="bg-red-600 text-white text-xs font-bold px-2 py-1 rounded flex items-center gap-1">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                  AO VIVO
                </div>
              ) : (
                <div className="bg-zinc-800 text-white text-xs font-bold px-2 py-1 rounded">
                  OFFLINE
                </div>
              )}
              <div className="bg-black/50 backdrop-blur-md text-white text-xs px-2 py-1 rounded">
                {isStreaming ? "1,234 assistindo" : "0 assistindo"}
              </div>
            </div>
          </div>
          
          <div className="bg-zinc-900/50 backdrop-blur-md p-6 rounded-2xl border border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-white mb-2">Minha Live Incrível</h1>
              <p className="text-zinc-400 text-sm">Bem-vindo à transmissão! Sinta-se em casa e use o chat ao lado para interagir.</p>
            </div>
            
            <div className="flex gap-3">
              {!isStreaming ? (
                <button
                  onClick={startStream}
                  className="bg-red-600 hover:bg-red-500 text-white font-bold px-6 py-3 rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-red-600/20"
                >
                  <Tv className="w-5 h-5" />
                  Abrir Live
                </button>
              ) : (
                <button
                  onClick={stopStream}
                  className="bg-zinc-700 hover:bg-zinc-600 text-white font-bold px-6 py-3 rounded-xl transition-all flex items-center gap-2"
                >
                  Encerrar Live
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Chat Area (Green) */}
        <div className="lg:col-span-1 flex flex-col h-[600px] lg:h-auto bg-chat-green rounded-2xl overflow-hidden shadow-2xl border-4 border-black">
          <div className="p-4 bg-black/20 backdrop-blur-sm border-b border-black/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-white" />
              <span className="font-bold text-white uppercase text-sm tracking-wider">Chat ao Vivo</span>
            </div>
            {isNickSet && (
              <span className="text-xs text-white/70 italic">Logado como: {nickname}</span>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-white/40 text-center p-4">
                <Star className="w-8 h-8 mb-2 animate-spin-slow" />
                <p className="text-sm">Seja o primeiro a dizer oi!</p>
              </div>
            ) : (
              messages.map((msg) => (
                <motion.div
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  key={msg.id}
                  className="bg-black/10 p-3 rounded-xl border border-white/5"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-white text-xs">{msg.user}</span>
                    <span className="text-[10px] text-white/50">
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-white text-sm leading-relaxed">{msg.text}</p>
                </motion.div>
              ))
            )}
            <div ref={chatEndRef} />
          </div>

          <form onSubmit={handleSendMessage} className="p-4 bg-black/20 border-t border-black/10">
            <div className="relative">
              <input
                disabled={!isNickSet}
                type="text"
                placeholder={isNickSet ? "Digite sua mensagem..." : "Defina seu nick primeiro"}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="w-full bg-black/30 border border-white/10 text-white px-4 py-3 pr-12 rounded-xl focus:outline-none focus:ring-2 focus:ring-white/20 transition-all placeholder:text-white/30"
              />
              <button
                disabled={!isNickSet || !inputText.trim()}
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-white hover:text-yellow-400 disabled:opacity-50 disabled:hover:text-white transition-colors"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </form>
        </div>
      </main>

      <footer className="mt-8 text-center text-zinc-500 text-xs">
        <p>© 2024 LiveStream Chat • Feito com ✨</p>
      </footer>
    </div>
  );
}
