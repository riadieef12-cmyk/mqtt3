/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState } from 'react';
import { MqttProvider } from './MqttContext';
import { Dashboard } from './Dashboard';
import { ArduinoCode } from './ArduinoCode';
import { LayoutDashboard, FileCode2 } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'code'>('dashboard');

  return (
    <MqttProvider>
      <div className="min-h-screen bg-black text-[#ededed] selection:bg-[#fff] selection:text-[#000] font-sans antialiased">
        
        {/* Navigation Bar */}
        <div className="bg-black/50 backdrop-blur-md border-b border-[#333] sticky top-0 z-50">
          <div className="max-w-6xl mx-auto px-6">
            <div className="flex space-x-8">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`flex items-center py-4 border-b-2 transition-all text-sm font-medium ${
                  activeTab === 'dashboard' 
                    ? 'border-white text-white' 
                    : 'border-transparent text-[#888] hover:text-white'
                }`}
              >
                <LayoutDashboard className="w-4 h-4 mr-2" />
                Dashboard
              </button>
              <button
                onClick={() => setActiveTab('code')}
                className={`flex items-center py-4 border-b-2 transition-all text-sm font-medium ${
                  activeTab === 'code' 
                    ? 'border-white text-white' 
                    : 'border-transparent text-[#888] hover:text-white'
                }`}
              >
                <FileCode2 className="w-4 h-4 mr-2" />
                Arduino Code
              </button>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        {activeTab === 'dashboard' ? <Dashboard /> : <ArduinoCode />}
        
      </div>
    </MqttProvider>
  );
}
