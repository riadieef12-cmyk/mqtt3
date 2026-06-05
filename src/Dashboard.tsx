import React from 'react';
import { Power, Settings2, Activity, Zap, Info, ShieldCheck, Thermometer, Droplets, Link2, Unlink } from 'lucide-react';
import { useMqtt } from './MqttContext';
import { VoiceController } from './VoiceController';

export function Dashboard() {
  const { brokers, deviceState, sendRelayCommand, sendPatternCommand } = useMqtt();

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-200 font-sans pb-12">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 flex items-center shrink-0">
        <div className="max-w-6xl mx-auto w-full px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight">SISTEM KENDALI IOT <span className="text-indigo-400 font-medium tracking-normal">Multi-Broker</span></h1>
            </div>
          </div>
          <div className="flex gap-2">
             {brokers.map(b => (
               <div key={b.id} className="flex items-center space-x-1 bg-slate-800/50 px-3 py-1.5 rounded-full border border-slate-700 backdrop-blur-sm shadow-sm transition-all hover:bg-slate-800 cursor-help" title={b.url}>
                 {b.connected ? <Link2 className="w-3.5 h-3.5 text-emerald-400" /> : <Unlink className="w-3.5 h-3.5 text-rose-400" />}
                 <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">{b.name}</span>
               </div>
             ))}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column: Sensors & Voice */}
          <div className="space-y-6">
            
            {/* Sensor Panel */}
            <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
              <div className="p-4 border-b border-slate-800 bg-slate-800/30 flex items-center">
                <Activity className="w-5 h-5 text-indigo-400 mr-2" />
                <h2 className="font-semibold text-slate-300">Telemetri Sensor</h2>
              </div>
              <div className="grid grid-cols-2 divide-x divide-slate-800">
                <div className="p-6 flex flex-col items-center justify-center text-center">
                  <div className="w-12 h-12 bg-slate-800 text-indigo-400 rounded-full flex items-center justify-center mb-3">
                    <Thermometer className="w-6 h-6" />
                  </div>
                  <span className="text-3xl font-bold text-slate-200 tracking-tight">
                    {deviceState.temperature}<span className="text-lg text-indigo-500 font-normal"> °C</span>
                  </span>
                  <span className="text-[10px] text-slate-500 mt-2 uppercase tracking-widest font-black">Suhu</span>
                </div>
                <div className="p-6 flex flex-col items-center justify-center text-center">
                  <div className="w-12 h-12 bg-slate-800 text-indigo-400 rounded-full flex items-center justify-center mb-3">
                    <Droplets className="w-6 h-6" />
                  </div>
                  <span className="text-3xl font-bold text-slate-200 tracking-tight">
                    {deviceState.humidity}<span className="text-lg text-indigo-500 font-normal">%</span>
                  </span>
                  <span className="text-[10px] text-slate-500 mt-2 uppercase tracking-widest font-black">Kelembapan</span>
                </div>
              </div>
            </div>

            {/* Voice Controller */}
            <VoiceController />

            {/* Info Card */}
             <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-slate-300">
                <div className="flex items-start">
                   <Info className="w-5 h-5 mr-3 mt-0.5 text-indigo-400 shrink-0" />
                   <div>
                      <h4 className="font-semibold mb-1 text-sm text-slate-200">Informasi Koneksi</h4>
                      <p className="text-xs text-slate-400 leading-relaxed mb-2">
                        Sistem ini menggunakan arsitektur redundansi. Perintah yang dikirimkan melalui web akan disiarkan ke <strong>ketiga broker MQTT</strong> sekaligus.
                      </p>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        Perangkat keras IoT Anda hanya perlu terhubung ke salah satu broker yang aktif untuk menerima perintah.
                      </p>
                   </div>
                </div>
             </div>

          </div>

          {/* Right Column: Relays & Logic Controls */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Relays */}
            <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6">
              <div className="flex items-center mb-6">
                <Power className="w-5 h-5 text-slate-400 mr-2" />
                <h2 className="font-semibold text-slate-200 text-lg">Modul Relay Aktuator</h2>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[0, 1, 2, 3].map((index) => {
                  const isActive = deviceState.relays[index];
                  return (
                    <div 
                      key={index}
                      className={`relative overflow-hidden rounded-xl border p-5 transition-all duration-300 ${
                        isActive 
                          ? 'border-white/10 bg-indigo-600 shadow-lg' 
                          : 'border-slate-800 bg-slate-900 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex justify-between items-center relative z-10 w-full">
                        <div>
                          <p className={`text-[10px] uppercase font-black tracking-[0.2em] mb-2 ${isActive ? 'text-indigo-200' : 'text-slate-500'}`}>
                            Relay Channel 0{index + 1}
                          </p>
                          <div className={`text-2xl font-bold ${isActive ? 'text-white' : 'text-slate-300 opacity-80'}`}>
                             {isActive ? 'ON' : 'OFF'}
                          </div>
                        </div>
                        
                        <button
                          onClick={() => sendRelayCommand(index, !isActive)}
                          className={`px-4 py-2 font-bold rounded-xl text-sm transition-all duration-300 shadow-sm ${
                            isActive 
                              ? 'bg-white text-indigo-600 hover:scale-105' 
                              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                          }`}
                        >
                          <Power className="w-5 h-5 mx-auto" />
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Logical Routines */}
            <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6">
               <div className="flex items-center mb-6">
                <Settings2 className="w-5 h-5 text-slate-400 mr-2" />
                <h2 className="font-semibold text-slate-200 text-lg">Logika Kombinasi Kendali</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 
                 {/* Logic 1 */}
                 <div className="border border-slate-800 bg-slate-800/10 rounded-xl p-5 hover:border-indigo-500/50 hover:bg-slate-800/30 transition-all group">
                    <div className="flex justify-between items-start mb-4">
                       <div className="bg-indigo-900/50 p-2.5 rounded-lg text-indigo-400 group-hover:scale-110 transition-transform">
                          <Zap className="w-5 h-5" />
                       </div>
                       <button 
                          onClick={() => sendPatternCommand(1)}
                          className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors"
                       >
                          Eksekusi
                       </button>
                    </div>
                    <h3 className="font-bold text-slate-200 mb-1">Kombinasi 1: Kiri ke Kanan</h3>
                    <p className="text-sm text-slate-400 leading-relaxed">
                       Menyalakan relay secara berurutan dari Relay 1 hingga Relay 4 dengan jeda 500ms setiap transisi.
                    </p>
                 </div>

                 {/* Logic 2 */}
                 <div className="border border-slate-800 bg-slate-800/10 rounded-xl p-5 hover:border-indigo-500/50 hover:bg-slate-800/30 transition-all group">
                    <div className="flex justify-between items-start mb-4">
                       <div className="bg-indigo-900/50 p-2.5 rounded-lg text-indigo-400 group-hover:scale-110 transition-transform">
                          <ShieldCheck className="w-5 h-5" />
                       </div>
                       <button 
                          onClick={() => sendPatternCommand(2)}
                          className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors"
                       >
                          Eksekusi
                       </button>
                    </div>
                    <h3 className="font-bold text-slate-200 mb-1">Kombinasi 2: Mode Strobo</h3>
                    <p className="text-sm text-slate-400 leading-relaxed">
                       Kendali flip-flop bergantian antara ganjil (1, 3) dan genap (2, 4) secara cepat selama 5 detik.
                    </p>
                 </div>

              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
