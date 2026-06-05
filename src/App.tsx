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
      <div className="min-h-screen bg-[#0F172A] text-slate-200">
        
        {/* Navigation Bar */}
        <div className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50">
          <div className="max-w-6xl mx-auto px-6">
            <div className="flex space-x-8">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`flex items-center py-4 border-b-2 transition-colors font-medium text-sm ${
                  activeTab === 'dashboard' 
                    ? 'border-indigo-500 text-indigo-400' 
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <LayoutDashboard className="w-4 h-4 mr-2" />
                Dashboard Kendali
              </button>
              <button
                onClick={() => setActiveTab('code')}
                className={`flex items-center py-4 border-b-2 transition-colors font-medium text-sm ${
                  activeTab === 'code' 
                    ? 'border-indigo-500 text-indigo-400' 
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <FileCode2 className="w-4 h-4 mr-2" />
                Kode Arduino
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
