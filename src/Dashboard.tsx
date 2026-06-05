import React from 'react';
import { Power, Settings2, Activity, Zap, Info, ShieldCheck, Thermometer, Droplets, Link2, Unlink } from 'lucide-react';
import { useMqtt } from './MqttContext';
import { VoiceController } from './VoiceController';

export function Dashboard() {
  const { brokers, deviceState, sendRelayCommand, sendPatternCommand } = useMqtt();

  return (
    <div className="min-h-screen bg-black text-[#ededed] font-sans pb-12">
      {/* Header */}
      <header className="border-b border-[#333] bg-black flex items-center shrink-0">
        <div className="max-w-6xl mx-auto w-full px-6 py-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 border border-[#333] bg-[#111] rounded-full flex items-center justify-center">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-semibold tracking-tight text-white mb-1">Multi-Broker Hub</h1>
              <p className="text-sm font-medium text-[#888]">IoT Device Controller</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
             {brokers.map(b => (
               <div key={b.id} className="flex items-center space-x-2 bg-[#0a0a0a] px-3 py-1.5 rounded-md border border-[#333] transition-colors hover:bg-[#111] cursor-help" title={b.url}>
                 <div className={`w-2 h-2 rounded-full ${b.connected ? 'bg-[#0070f3] animate-pulse' : 'bg-[#e00]'}`}></div>
                 <span className="text-xs font-medium text-[#888]">{b.name}</span>
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
            <div className="bg-black rounded-lg border border-[#333] overflow-hidden">
              <div className="p-4 border-b border-[#333] bg-[#0a0a0a] flex items-center">
                <Activity className="w-4 h-4 text-[#888] mr-2" />
                <h2 className="text-sm font-medium text-[#ededed]">Sensor Data</h2>
              </div>
              <div className="grid grid-cols-2 divide-x divide-[#333]">
                <div className="p-6 flex flex-col items-center justify-center text-center">
                  <div className="w-10 h-10 border border-[#333] bg-[#0a0a0a] text-white rounded-full flex items-center justify-center mb-3">
                    <Thermometer className="w-4 h-4" />
                  </div>
                  <span className="text-2xl font-semibold text-white tracking-tight">
                    {deviceState.temperature}<span className="text-sm text-[#888] font-normal ml-1">°C</span>
                  </span>
                  <span className="text-xs text-[#888] mt-2 font-medium">Temperature</span>
                </div>
                <div className="p-6 flex flex-col items-center justify-center text-center">
                  <div className="w-10 h-10 border border-[#333] bg-[#0a0a0a] text-white rounded-full flex items-center justify-center mb-3">
                    <Droplets className="w-4 h-4" />
                  </div>
                  <span className="text-2xl font-semibold text-white tracking-tight">
                    {deviceState.humidity}<span className="text-sm text-[#888] font-normal ml-1">%</span>
                  </span>
                  <span className="text-xs text-[#888] mt-2 font-medium">Humidity</span>
                </div>
              </div>
            </div>

            {/* Voice Controller */}
            <VoiceController />

            {/* Info Card */}
             <div className="bg-[#0a0a0a] border border-[#333] rounded-lg p-5">
                <div className="flex items-start">
                   <Info className="w-4 h-4 mr-3 mt-0.5 text-[#fff] shrink-0" />
                   <div>
                      <h4 className="font-semibold mb-2 text-sm text-[#ededed]">System Architecture</h4>
                      <p className="text-sm text-[#888] leading-relaxed mb-3">
                        This system uses a highly available redundant architecture. Commands are broadcast to all configured MQTT brokers simultaneously.
                      </p>
                      <p className="text-sm text-[#888] leading-relaxed">
                        Hardware nodes only require successful connection to a single broker to remain completely operational.
                      </p>
                   </div>
                </div>
             </div>

          </div>

          {/* Right Column: Relays & Logic Controls */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Relays */}
            <div className="bg-black rounded-lg border border-[#333] p-6">
              <div className="flex items-center mb-6 text-sm font-medium">
                <Power className="w-4 h-4 text-[#888] mr-2" />
                <h2 className="text-[#ededed]">Relay Channels</h2>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[0, 1, 2, 3].map((index) => {
                  const isActive = deviceState.relays[index];
                  return (
                    <div 
                      key={index}
                      onClick={() => sendRelayCommand(index, !isActive)}
                      className={`relative flex items-center justify-between rounded-lg border px-5 py-4 transition-colors cursor-pointer group ${
                        isActive 
                          ? 'border-[#fff] bg-[#0a0a0a]' 
                          : 'border-[#333] bg-black hover:border-[#666]'
                      }`}
                    >
                      <div>
                        <h3 className={`text-sm font-medium ${isActive ? 'text-white' : 'text-[#ededed]'}`}>
                          Relay {index + 1}
                        </h3>
                        <p className="text-xs mt-1 text-[#888]">
                          Actuator Unit
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className={`text-xs font-bold ${isActive ? 'text-white' : 'text-[#666]'}`}>
                           {isActive ? 'ENABLED' : 'DISABLED'}
                        </div>
                        <button
                          className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                            isActive 
                              ? 'bg-white text-black group-hover:scale-105' 
                              : 'bg-[#111] text-[#888] border border-[#333] group-hover:bg-[#222]'
                          }`}
                        >
                          <Power className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Logical Routines */}
            <div className="bg-black rounded-lg border border-[#333] p-6">
               <div className="flex items-center mb-6 text-sm font-medium">
                <Settings2 className="w-4 h-4 text-[#888] mr-2" />
                <h2 className="text-[#ededed]">Execution Routines</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 
                 {/* Logic 1 */}
                 <div className="border border-[#333] bg-[#0a0a0a] rounded-lg p-5 hover:border-[#666] transition-colors">
                    <div className="flex justify-between items-start mb-4">
                       <div className="w-8 h-8 rounded-full border border-[#333] bg-black flex items-center justify-center">
                          <Zap className="w-4 h-4 text-[#ededed]" />
                       </div>
                       <button 
                          onClick={() => sendPatternCommand(1)}
                          className="bg-white hover:bg-neutral-200 text-black px-4 py-1.5 rounded-md text-xs font-semibold transition-colors"
                       >
                          Execute
                       </button>
                    </div>
                    <h3 className="font-medium text-sm text-white mb-2">Sequential Sequence</h3>
                    <p className="text-sm text-[#888] leading-relaxed">
                       Activates relays sequentially from 1 to 4 with a 500ms delay between transitions.
                    </p>
                 </div>

                 {/* Logic 2 */}
                 <div className="border border-[#333] bg-[#0a0a0a] rounded-lg p-5 hover:border-[#666] transition-colors">
                    <div className="flex justify-between items-start mb-4">
                       <div className="w-8 h-8 rounded-full border border-[#333] bg-black flex items-center justify-center">
                          <ShieldCheck className="w-4 h-4 text-[#ededed]" />
                       </div>
                       <button 
                          onClick={() => sendPatternCommand(2)}
                          className="bg-white hover:bg-neutral-200 text-black px-4 py-1.5 rounded-md text-xs font-semibold transition-colors"
                       >
                          Execute
                       </button>
                    </div>
                    <h3 className="font-medium text-sm text-white mb-2">Strobe Protocol</h3>
                    <p className="text-sm text-[#888] leading-relaxed">
                       Rapid alternating flip-flop sequence between odd (1, 3) and even (2, 4) channels.
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
