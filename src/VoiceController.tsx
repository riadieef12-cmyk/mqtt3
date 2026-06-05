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
    <div className="bg-black border border-[#333] rounded-lg p-6 relative">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-sm font-medium text-[#ededed] flex items-center">
          <Volume2 className="w-4 h-4 mr-2" />
          Voice AI Assistant
        </h3>
        
        <button
          onClick={toggleListening}
          className={`relative flex items-center justify-center w-10 h-10 rounded-full transition-colors ${
            isListening 
              ? 'bg-[#e00] text-white hover:bg-red-600' 
              : 'bg-white text-black hover:bg-gray-200'
          }`}
        >
           {isListening ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
        </button>
      </div>

      <div className="bg-[#111] border border-[#333] rounded-md p-4 min-h-[100px] flex flex-col justify-center">
         {!isListening && !transcript && (
            <p className="text-[#888] text-center text-sm">
               Click microphone to start voice commands
            </p>
         )}
         {isListening && !transcript && (
            <div className="flex justify-center flex-col items-center gap-3">
               <div className="flex space-x-1.5">
                 <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                 <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                 <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
               </div>
               <p className="text-[#888] text-xs">Listening...</p>
            </div>
         )}
         {transcript && (
           <p className="text-white text-center font-medium italic text-sm">
             "{transcript}"
           </p>
         )}
      </div>

      <div className="mt-4">
        <p className="text-xs text-[#888] mb-2 font-medium">Examples:</p>
        <div className="flex flex-wrap gap-2">
           <span className="px-2 py-1 bg-[#111] text-[#ededed] border border-[#333] text-xs rounded-md">"Nyalakan relay 1"</span>
           <span className="px-2 py-1 bg-[#111] text-[#ededed] border border-[#333] text-xs rounded-md">"Matikan relay 2"</span>
           <span className="px-2 py-1 bg-[#111] text-white border border-[#666] text-xs rounded-md">"Baca suhu"</span>
        </div>
      </div>
    </div>
  );
}
