import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Mic, MicOff, Volume2 } from 'lucide-react';
import { useMqtt } from './MqttContext';

// Define SpeechRecognition types as they aren't built-in perfectly
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export function VoiceController() {
  const { deviceState, sendRelayCommand } = useMqtt();
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'id-ID'; // Indonesian

      recognition.onresult = (event: any) => {
        let currentTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        setTranscript(currentTranscript);
        
        if (event.results[event.results.length - 1].isFinal) {
          handleCommand(event.results[event.results.length - 1][0].transcript.toLowerCase());
        }
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
         if (isListening) {
             recognition.start(); // Auto-restart if still "listening"
         }
      };

      recognitionRef.current = recognition;
    }
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [isListening]); // Only depend on listening state for the end handler

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current?.start();
        setIsListening(true);
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handleCommand = useCallback((command: string) => {
    console.log('Voice Command:', command);
    
    // Relay Control Commands
    if (command.includes('nyalakan relay 1') || command.includes('hidupkan relay 1')) {
      sendRelayCommand(0, true);
      speak('Relay 1 dinyalakan');
    } else if (command.includes('matikan relay 1')) {
      sendRelayCommand(0, false);
      speak('Relay 1 dimatikan');
    } else if (command.includes('nyalakan relay 2') || command.includes('hidupkan relay 2')) {
      sendRelayCommand(1, true);
      speak('Relay 2 dinyalakan');
    } else if (command.includes('matikan relay 2')) {
      sendRelayCommand(1, false);
      speak('Relay 2 dimatikan');
    } else if (command.includes('nyalakan relay 3') || command.includes('hidupkan relay 3')) {
      sendRelayCommand(2, true);
      speak('Relay 3 dinyalakan');
    } else if (command.includes('matikan relay 3')) {
      sendRelayCommand(2, false);
      speak('Relay 3 dimatikan');
    } else if (command.includes('nyalakan relay 4') || command.includes('hidupkan relay 4')) {
      sendRelayCommand(3, true);
      speak('Relay 4 dinyalakan');
    } else if (command.includes('matikan relay 4')) {
      sendRelayCommand(3, false);
      speak('Relay 4 dimatikan');
    } 
    // Sensor Reading Command
    else if (command.includes('baca sensor') || command.includes('suhu') || command.includes('kelembapan')) {
      speak(`Suhu saat ini adalah ${Math.round(deviceState.temperature)} derajat celcius, dengan kelembapan ${Math.round(deviceState.humidity)} persen.`);
    }
  }, [sendRelayCommand, deviceState]);

  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      // Pause listening temporarily to prevent hearing itself
      if (recognitionRef.current && isListening) {
          recognitionRef.current.abort();
      }

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'id-ID';
      
      utterance.onend = () => {
         if (isListening && recognitionRef.current) {
             try { recognitionRef.current.start(); } catch(e){}
         }
      };

      window.speechSynthesis.speak(utterance);
    }
  };

  if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
    return (
      <div className="bg-red-50 text-red-500 p-4 rounded-xl border border-red-100 flex items-center shadow-sm">
        Browser Anda tidak mendukung Web Speech API. Silakan gunakan Google Chrome.
      </div>
    );
  }

  return (
    <div className="bg-indigo-950/30 border-2 border-indigo-500/30 rounded-2xl p-6 relative overflow-hidden">
      <div className="absolute -right-10 -top-10 w-40 h-40 bg-indigo-500/10 blur-[80px] rounded-full pointer-events-none"></div>
      
      <div className="flex items-center justify-between mb-6 relative z-10 w-full">
        <h3 className="text-xs font-bold text-indigo-300 uppercase tracking-widest flex items-center">
          <Volume2 className="w-4 h-4 mr-2 text-indigo-400" />
          Kontrol Suara AI
        </h3>
        
        <button
          onClick={toggleListening}
          className={`relative flex items-center justify-center w-12 h-12 rounded-full shadow-lg transition-all duration-300 ${
            isListening 
              ? 'bg-red-500 hover:bg-red-600 animate-pulse text-white' 
              : 'bg-indigo-500 hover:bg-indigo-600 text-white'
          }`}
        >
           {isListening ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
        </button>
      </div>

      <div className="bg-slate-900/80 border border-indigo-500/20 rounded-xl p-4 min-h-[100px] flex flex-col justify-center relative shadow-inner">
         {!isListening && !transcript && (
            <p className="text-slate-500 text-center italic text-sm">
               Klik tombol mic untuk memulai perintah suara...
            </p>
         )}
         {isListening && !transcript && (
            <div className="flex justify-center flex-col items-center gap-2">
               <div className="flex space-x-1">
                 <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                 <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                 <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
               </div>
               <p className="text-indigo-400 text-sm font-medium tracking-widest uppercase text-[10px]">Mendengarkan...</p>
            </div>
         )}
         {transcript && (
           <p className="text-indigo-200 text-center font-medium italic text-lg shadow-sm">
             "{transcript}"
           </p>
         )}
      </div>

      <div className="mt-4 relative z-10">
        <p className="text-xs text-slate-500 mb-2 font-bold uppercase tracking-widest">Contoh Perintah:</p>
        <div className="flex flex-wrap gap-2">
           <span className="px-2 py-1 bg-slate-800 text-slate-300 border border-slate-700 text-xs rounded-md shadow-sm">"Nyalakan relay 1"</span>
           <span className="px-2 py-1 bg-slate-800 text-slate-300 border border-slate-700 text-xs rounded-md shadow-sm">"Matikan relay 2"</span>
           <span className="px-2 py-1 bg-indigo-900/50 text-indigo-300 border border-indigo-500/30 text-xs rounded-md shadow-sm">"Baca suhu"</span>
        </div>
      </div>
    </div>
  );
}
