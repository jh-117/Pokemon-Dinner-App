import React, { useEffect, useRef, useState } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from "@google/genai";
import { GeneratedMeal } from '../types';
import { Mic, MicOff, X, Volume2, Radio, User, ChefHat, AlertCircle, RefreshCw } from 'lucide-react';

interface LiveCookingSessionProps {
  meal: GeneratedMeal;
  onClose: () => void;
}

const LiveCookingSession: React.FC<LiveCookingSessionProps> = ({ meal, onClose }) => {
  const [status, setStatus] = useState<'connecting' | 'connected' | 'error' | 'disconnected'>('connecting');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [volumeLevel, setVolumeLevel] = useState(0); 
  const [aiSpeaking, setAiSpeaking] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  // Refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const sessionRef = useRef<any>(null); // Hold the session object
  const nextStartTimeRef = useRef<number>(0);
  const audioSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const mountedRef = useRef(true);

  const cleanup = () => {
      // Stop all playing audio
      audioSourcesRef.current.forEach(s => {
          try { s.stop(); } catch(e) {}
      });
      audioSourcesRef.current.clear();

      if (streamRef.current) {
          streamRef.current.getTracks().forEach(t => t.stop());
          streamRef.current = null;
      }
      if (sourceRef.current) {
          sourceRef.current.disconnect();
          sourceRef.current = null;
      }
      if (processorRef.current) {
          processorRef.current.disconnect();
          processorRef.current.onaudioprocess = null;
          processorRef.current = null;
      }
      
      if (inputAudioContextRef.current) {
          inputAudioContextRef.current.close();
          inputAudioContextRef.current = null;
      }
      if (audioContextRef.current) {
          audioContextRef.current.close();
          audioContextRef.current = null;
      }

      if (sessionRef.current) {
         // Attempt to close session if it exists
         try {
             sessionRef.current.close();
         } catch(e) { 
             console.warn("Error closing session:", e);
         }
         sessionRef.current = null;
      }
  };

  const connect = async () => {
      if (!mountedRef.current) return;
      
      cleanup(); // Ensure clean slate
      setStatus('connecting');
      setErrorMessage(null);

      try {
        if (!process.env.API_KEY) {
          throw new Error("API Key is missing.");
        }

        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        
        // Setup Audio Contexts
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        const inputCtx = new AudioContextClass({ sampleRate: 16000 });
        const outputCtx = new AudioContextClass({ sampleRate: 24000 });
        
        inputAudioContextRef.current = inputCtx;
        audioContextRef.current = outputCtx;

        // Get Microphone Stream
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        streamRef.current = stream;

        // Ensure Contexts are running
        if (inputCtx.state === 'suspended') await inputCtx.resume();
        if (outputCtx.state === 'suspended') await outputCtx.resume();

        // Connect
        const session = await ai.live.connect({
          model: 'gemini-2.5-flash-native-audio-preview-09-2025',
          config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
              voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } },
            },
            systemInstruction: `You are Chef Poke, teaching how to cook "${meal.name}".
            Recipe: ${meal.description}
            Ingredients: ${meal.ingredients.join(', ')}
            Steps: ${meal.instructions.join('. ')}
            Tips: ${meal.tips.join('. ')}
            Guide step-by-step. Be concise and encouraging.`,
          },
          callbacks: {
            onopen: () => {
              if (!mountedRef.current) return;
              console.log("Session Open");
              setStatus('connected');
              setRetryCount(0); // Reset retry count on success
              
              // Start Input Processing
              const source = inputCtx.createMediaStreamSource(stream);
              const processor = inputCtx.createScriptProcessor(4096, 1, 1);
              
              processor.onaudioprocess = (e) => {
                if (isMuted || !sessionRef.current) return; 
                
                const inputData = e.inputBuffer.getChannelData(0);
                
                // Visualization
                let sum = 0;
                for (let i = 0; i < inputData.length; i++) {
                    sum += inputData[i] * inputData[i];
                }
                const rms = Math.sqrt(sum / inputData.length);
                if (!aiSpeaking && mountedRef.current) setVolumeLevel(Math.min(rms * 5, 1)); 

                const pcmBlob = createBlob(inputData);
                session.sendRealtimeInput({ media: pcmBlob });
              };

              source.connect(processor);
              processor.connect(inputCtx.destination);
              
              sourceRef.current = source;
              processorRef.current = processor;
            },
            onmessage: async (message: LiveServerMessage) => {
               if (!mountedRef.current) return;

               const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
               if (base64Audio) {
                 setAiSpeaking(true);
                 const ctx = audioContextRef.current;
                 if (ctx) {
                    nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
                    const audioBuffer = await decodeAudioData(decode(base64Audio), ctx, 24000, 1);
                    const source = ctx.createBufferSource();
                    source.buffer = audioBuffer;
                    source.connect(ctx.destination);
                    source.addEventListener('ended', () => {
                        audioSourcesRef.current.delete(source);
                        if (audioSourcesRef.current.size === 0 && mountedRef.current) {
                            setAiSpeaking(false);
                        }
                    });
                    source.start(nextStartTimeRef.current);
                    nextStartTimeRef.current += audioBuffer.duration;
                    audioSourcesRef.current.add(source);
                 }
               }

               if (message.serverContent?.interrupted) {
                 audioSourcesRef.current.forEach(s => { try { s.stop(); } catch(e) {} });
                 audioSourcesRef.current.clear();
                 nextStartTimeRef.current = 0;
                 if (mountedRef.current) setAiSpeaking(false);
               }
            },
            onclose: () => {
               if (mountedRef.current) {
                   console.log("Session Closed");
                   // If we were connected and it closed unexpectedly, maybe retry?
                   // For now, just show disconnected state or error if it wasn't intentional
                   if (status === 'connected') setStatus('disconnected');
               }
            },
            onerror: (err) => {
               console.error("Live API Error:", err);
               if (mountedRef.current) {
                   setStatus('error');
                   setErrorMessage("Network error. Please try again.");
               }
            }
          }
        });
        
        sessionRef.current = session;

      } catch (e: any) {
        console.error("Connection setup failed:", e);
        if (mountedRef.current) {
            setStatus('error');
            setErrorMessage(e.message || "Failed to connect.");
        }
      }
  };

  useEffect(() => {
    mountedRef.current = true;
    connect();
    return () => {
      mountedRef.current = false;
      cleanup();
    };
  }, [meal.id]); 

  // --- Audio Helpers ---
  function createBlob(data: Float32Array) {
    const l = data.length;
    const int16 = new Int16Array(l);
    for (let i = 0; i < l; i++) {
        let s = Math.max(-1, Math.min(1, data[i]));
        int16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
    }
    const bytes = new Uint8Array(int16.buffer);
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return {
        data: btoa(binary),
        mimeType: 'audio/pcm;rate=16000',
    };
  }

  function decode(base64: string) {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  }

  async function decodeAudioData(
    data: Uint8Array,
    ctx: AudioContext,
    sampleRate: number,
    numChannels: number,
  ): Promise<AudioBuffer> {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
    for (let channel = 0; channel < numChannels; channel++) {
        const channelData = buffer.getChannelData(channel);
        for (let i = 0; i < frameCount; i++) {
            channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
        }
    }
    return buffer;
  }

  // --- UI Render ---
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-poke-dark/90 backdrop-blur-md animate-in fade-in duration-300">
       <div className="bg-white rounded-[2.5rem] p-8 w-full max-w-lg shadow-2xl relative overflow-hidden border-4 border-poke-red">
          
          <div className="flex justify-between items-center mb-8 relative z-10">
             <div className="flex items-center gap-3">
                <div className="bg-poke-red p-3 rounded-full text-white animate-bounce">
                   <Radio className="w-6 h-6" />
                </div>
                <div>
                   <h2 className="text-2xl font-extrabold text-poke-dark">Live Kitchen</h2>
                   <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${status === 'connected' ? 'bg-green-500 animate-pulse' : status === 'error' ? 'bg-red-500' : 'bg-yellow-500'}`}></span>
                      <span className="text-xs font-bold text-gray-400 uppercase">{status}</span>
                   </div>
                </div>
             </div>
             <button onClick={onClose} className="p-3 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors">
                <X className="w-6 h-6 text-poke-dark" />
             </button>
          </div>

          {status === 'error' ? (
              <div className="flex flex-col items-center justify-center h-48 text-center px-4">
                  <AlertCircle className="w-12 h-12 text-poke-red mb-4" />
                  <p className="font-bold text-poke-dark text-lg">Connection Failed</p>
                  <p className="text-sm text-gray-500 mt-2 mb-6">{errorMessage || "Network error. Please try again."}</p>
                  <button 
                    onClick={() => connect()} 
                    className="px-6 py-3 bg-poke-blue text-white rounded-xl font-bold text-sm shadow-md hover:scale-105 transition-transform flex items-center gap-2"
                  >
                    <RefreshCw className="w-4 h-4" /> Retry Connection
                  </button>
              </div>
          ) : (
            <>
                <div className="flex justify-center mb-12 relative z-10">
                    <div className="relative w-48 h-48 flex items-center justify-center">
                        {status === 'connected' && (
                        <>
                            <div className="absolute inset-0 bg-poke-red/20 rounded-full animate-ping" style={{ animationDuration: '3s' }}></div>
                            <div className={`absolute inset-0 border-4 border-poke-red/30 rounded-full transition-transform duration-100 ease-out`}
                                style={{ transform: `scale(${1 + (aiSpeaking ? 0.2 : volumeLevel * 0.5)})` }}></div>
                        </>
                        )}
                        <div className="w-32 h-32 bg-white rounded-full border-4 border-gray-100 shadow-xl flex items-center justify-center relative z-20 overflow-hidden">
                            <img 
                            src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${Math.floor(meal.timestamp % 800) + 1}.png`}
                            className="w-24 h-24 object-contain"
                            alt="Chef"
                            />
                            {aiSpeaking && (
                                <div className="absolute bottom-2 right-2 bg-white rounded-full p-1 shadow-sm">
                                    <Volume2 className="w-4 h-4 text-poke-blue" />
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex justify-center gap-6 relative z-10">
                    <button 
                        onClick={() => setIsMuted(!isMuted)}
                        disabled={status !== 'connected'}
                        className={`p-6 rounded-2xl transition-all shadow-lg border-b-4 active:border-b-0 active:translate-y-1 ${
                            isMuted 
                            ? 'bg-gray-200 text-gray-500 border-gray-300' 
                            : status !== 'connected' 
                                ? 'bg-gray-100 text-gray-300 border-gray-200 cursor-not-allowed' 
                                : 'bg-poke-blue text-white border-blue-600'
                        }`}
                    >
                        {isMuted ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
                    </button>
                    
                    <button 
                        onClick={onClose}
                        className="p-6 rounded-2xl bg-poke-red text-white border-b-4 border-red-700 shadow-lg transition-all active:border-b-0 active:translate-y-1 flex-1 font-black text-xl tracking-wider uppercase"
                    >
                        End Session
                    </button>
                </div>
                
                <div className="mt-8 text-center">
                    <p className="text-gray-400 font-bold text-sm">
                        {status === 'connecting' ? 'Establishing link...' : aiSpeaking ? "Chef is explaining..." : "Listening to you..."}
                    </p>
                </div>
            </>
          )}

          <div className="absolute inset-0 opacity-[0.05] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
       </div>
    </div>
  );
};

export default LiveCookingSession;