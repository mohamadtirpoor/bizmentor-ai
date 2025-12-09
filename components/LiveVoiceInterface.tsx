import React, { useEffect, useRef, useState } from 'react';
import { Modality, LiveServerMessage } from '@google/genai';
import { Mic, MicOff, Activity, XCircle } from 'lucide-react';
import { getLiveClient } from '../services/geminiService';
import { createPcmBlob, decodeAudioData } from '../utils/audioUtils';

const LiveVoiceInterface: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [status, setStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');
  const [volume, setVolume] = useState(0);
  
  // Audio Refs
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  
  // Playback Refs
  const nextStartTimeRef = useRef<number>(0);
  const audioQueueRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  // Connection Ref
  const sessionPromiseRef = useRef<Promise<any> | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const stopAudio = () => {
    // Stop all playing sources
    audioQueueRef.current.forEach(source => {
      try { source.stop(); } catch (e) {}
    });
    audioQueueRef.current.clear();
    nextStartTimeRef.current = 0;

    // Disconnect Input
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current.onaudioprocess = null;
    }
    if (sourceRef.current) {
      sourceRef.current.disconnect();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    
    // Close Contexts
    if (inputAudioContextRef.current) {
      inputAudioContextRef.current.close();
      inputAudioContextRef.current = null;
    }
    if (outputAudioContextRef.current) {
      outputAudioContextRef.current.close();
      outputAudioContextRef.current = null;
    }

    // Close Session
    if (sessionPromiseRef.current) {
      sessionPromiseRef.current.then(session => session.close());
      sessionPromiseRef.current = null;
    }

    setIsActive(false);
    setStatus('disconnected');
    setVolume(0);
  };

  const startAudio = async () => {
    try {
      setStatus('connecting');

      // Initialize Audio Contexts
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      inputAudioContextRef.current = new AudioContextClass({ sampleRate: 16000 });
      outputAudioContextRef.current = new AudioContextClass({ sampleRate: 24000 });

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const ai = getLiveClient();
      
      sessionPromiseRef.current = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks: {
          onopen: () => {
            console.log('Live Session Opened');
            setStatus('connected');
            setIsActive(true);
            
            // Setup Input Stream
            if (!inputAudioContextRef.current) return;
            
            const source = inputAudioContextRef.current.createMediaStreamSource(stream);
            sourceRef.current = source;
            
            const processor = inputAudioContextRef.current.createScriptProcessor(4096, 1, 1);
            processorRef.current = processor;
            
            processor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              
              // Simple volume calculation for visualizer
              let sum = 0;
              for(let i=0; i<inputData.length; i++) sum += inputData[i] * inputData[i];
              setVolume(Math.sqrt(sum / inputData.length));

              const pcmBlob = createPcmBlob(inputData);
              sessionPromiseRef.current?.then(session => {
                session.sendRealtimeInput({ media: pcmBlob });
              });
            };

            source.connect(processor);
            processor.connect(inputAudioContextRef.current.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
             // Handle Interruption
             const interrupted = message.serverContent?.interrupted;
             if (interrupted) {
               audioQueueRef.current.forEach(src => {
                 try { src.stop(); } catch(e) {}
               });
               audioQueueRef.current.clear();
               nextStartTimeRef.current = 0;
               return;
             }

             // Handle Audio Output
             const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
             if (base64Audio && outputAudioContextRef.current) {
                const ctx = outputAudioContextRef.current;
                const audioBuffer = await decodeAudioData(
                  base64ToUint8Array(base64Audio),
                  ctx,
                  24000
                );
                
                nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
                
                const source = ctx.createBufferSource();
                source.buffer = audioBuffer;
                source.connect(ctx.destination);
                
                source.addEventListener('ended', () => {
                  audioQueueRef.current.delete(source);
                });

                source.start(nextStartTimeRef.current);
                nextStartTimeRef.current += audioBuffer.duration;
                audioQueueRef.current.add(source);
             }
          },
          onclose: () => {
            console.log('Live Session Closed');
            stopAudio();
          },
          onerror: (e) => {
            console.error('Live Session Error', e);
            stopAudio();
          }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          systemInstruction: `شما بیزنس‌متر هستید. یک مشاور کسب و کار هوشمند. 
          شما به صورت صوتی با کاربر صحبت می‌کنید. 
          لحن شما باید حرفه‌ای، با انرژی و کمی آینده‌نگرانه باشد. 
          پاسخ‌های کوتاه و مفید بدهید چون این یک مکالمه صوتی است.`,
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } }
          }
        }
      });

    } catch (err) {
      console.error("Failed to start audio session", err);
      setStatus('disconnected');
    }
  };

  function base64ToUint8Array(base64: string) {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  }

  // Visualizer Effect
  useEffect(() => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    const draw = () => {
      const width = canvasRef.current!.width;
      const height = canvasRef.current!.height;
      ctx.clearRect(0, 0, width, height);

      if (isActive) {
        ctx.fillStyle = '#a855f7'; // Purple-500
        const barCount = 20;
        const spacing = width / barCount;
        
        for (let i = 0; i < barCount; i++) {
          // Simulate frequency bars based on volume + noise
          const h = Math.min(height, (volume * 500) * (Math.random() * 0.5 + 0.5));
          const x = i * spacing;
          const y = (height - h) / 2;
          
          // Draw rounded pill
          ctx.beginPath();
          ctx.roundRect(x + 2, y, spacing - 4, h, 10);
          ctx.fill();
        }
      }
      animationId = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(animationId);
  }, [isActive, volume]);

  return (
    <div className="flex flex-col items-center justify-center h-full w-full p-8 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-900/30 rounded-full blur-[100px] animate-pulse"></div>
      </div>

      <div className="z-10 flex flex-col items-center gap-8">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold text-white tracking-tight flex items-center gap-2 justify-center">
             <Activity className="w-8 h-8 text-purple-400" />
             مکالمه زنده
          </h2>
          <p className="text-gray-400 max-w-md">
            برای مشاوره سریع و تعاملی، با بیزنس‌متر صحبت کنید.
          </p>
        </div>

        {/* Visualizer Canvas */}
        <div className="relative w-80 h-40 bg-black/40 backdrop-blur-md rounded-2xl border border-white/10 flex items-center justify-center shadow-[0_0_30px_rgba(168,85,247,0.2)]">
           <canvas ref={canvasRef} width={320} height={160} className="w-full h-full rounded-2xl" />
           {!isActive && (
             <div className="absolute inset-0 flex items-center justify-center text-gray-500 text-sm">
               در انتظار اتصال...
             </div>
           )}
        </div>

        {/* Controls */}
        <div className="flex gap-6">
          {status === 'disconnected' ? (
            <button
              onClick={startAudio}
              className="group relative flex items-center justify-center w-20 h-20 rounded-full bg-purple-600 hover:bg-purple-500 text-white transition-all shadow-[0_0_20px_rgba(168,85,247,0.6)] hover:scale-105"
            >
              <Mic className="w-8 h-8" />
              <span className="absolute -bottom-10 text-sm text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">شروع صحبت</span>
            </button>
          ) : (
            <button
              onClick={stopAudio}
              className="group relative flex items-center justify-center w-20 h-20 rounded-full bg-red-600 hover:bg-red-500 text-white transition-all shadow-[0_0_20px_rgba(239,68,68,0.6)] hover:scale-105"
            >
              {status === 'connecting' ? (
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <MicOff className="w-8 h-8" />
              )}
              <span className="absolute -bottom-10 text-sm text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">قطع تماس</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default LiveVoiceInterface;