import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import mqtt, { MqttClient } from 'mqtt';
import { BrokerInfo, DeviceState } from './types';

// Topic Definitions
const TOPIC_BASE = 'iot_project_tugas_akhir_2026';
export const TOPICS = {
  SENSORS: `${TOPIC_BASE}/sensors`,
  RELAY_CMD: `${TOPIC_BASE}/relays/cmd`, // Send commands like [0,1,0,1]
  PATTERN_CMD: `${TOPIC_BASE}/pattern/cmd`, // Send pattern commands (1 or 2)
};

const INITIAL_BROKERS: BrokerInfo[] = [
  { id: 'mosquitto', name: 'Eclipse Mosquitto', url: 'wss://test.mosquitto.org:8081', connected: false },
  { id: 'eclipse', name: 'Eclipse Foundation', url: 'wss://mqtt.eclipseprojects.io:443/mqtt', connected: false },
  { id: 'mqtthq', name: 'MQTTHQ Public', url: 'wss://public.mqtthq.com:8084/mqtt', connected: false }
];

type MqttContextType = {
  brokers: BrokerInfo[];
  deviceState: DeviceState;
  sendRelayCommand: (index: number, state: boolean) => void;
  sendPatternCommand: (pattern: 1 | 2) => void;
};

const MqttContext = createContext<MqttContextType | null>(null);

export function MqttProvider({ children }: { children: React.ReactNode }) {
  const [brokers, setBrokers] = useState<BrokerInfo[]>(INITIAL_BROKERS);
  const [clients, setClients] = useState<Record<string, MqttClient>>({});
  const [deviceState, setDeviceState] = useState<DeviceState>({
    temperature: 0,
    humidity: 0,
    relays: [false, false, false, false],
  });

  useEffect(() => {
    const newClients: Record<string, MqttClient> = {};

    INITIAL_BROKERS.forEach(broker => {
      const client = mqtt.connect(broker.url, {
        clientId: `webclient_${Math.random().toString(16).slice(3)}`,
        reconnectPeriod: 5000,
      });

      client.on('connect', () => {
        console.log(`Connected to ${broker.name}`);
        setBrokers(prev => prev.map(b => b.id === broker.id ? { ...b, connected: true } : b));
        client.subscribe(TOPICS.SENSORS);
      });

      client.on('offline', () => {
        setBrokers(prev => prev.map(b => b.id === broker.id ? { ...b, connected: false } : b));
      });

      client.on('message', (topic, message) => {
        if (topic === TOPICS.SENSORS) {
          try {
            const data = JSON.parse(message.toString());
            setDeviceState(prev => ({
              ...prev,
              temperature: data.temperature ?? prev.temperature,
              humidity: data.humidity ?? prev.humidity,
              // Only update relays if they are reported by Arduino, otherwise we assume web-side is master
            }));
          } catch (e) {
            console.error('Failed to parse sensor data', e);
          }
        }
      });

      newClients[broker.id] = client;
    });

    setClients(newClients);

    // Initial dummy data for visual testing since we might not have a hardware device connected
    const dummyTimer = setInterval(() => {
      setDeviceState(prev => ({
        ...prev,
        temperature: +(25 + Math.random() * 5).toFixed(1),
        humidity: +(50 + Math.random() * 10).toFixed(1)
      }));
    }, 5000);

    return () => {
      clearInterval(dummyTimer);
      Object.values(newClients).forEach(c => c.end());
    };
  }, []);

  // When sending commands, send to all connected brokers to ensure delivery regardless of which broker the Arduino picked
  const sendToAll = useCallback((topic: string, message: string) => {
    Object.values(clients).forEach(client => {
      if (client.connected) {
        client.publish(topic, message);
      }
    });
  }, [clients]);

  const sendRelayCommand = useCallback((index: number, state: boolean) => {
    setDeviceState(prev => {
      const newRelays = [...prev.relays] as [boolean, boolean, boolean, boolean];
      newRelays[index] = state;
      sendToAll(TOPICS.RELAY_CMD, JSON.stringify(newRelays));
      return { ...prev, relays: newRelays };
    });
  }, [sendToAll]);

  const sendPatternCommand = useCallback((pattern: 1 | 2) => {
    sendToAll(TOPICS.PATTERN_CMD, JSON.stringify({ pattern }));
    
    // Simulate web state update based on pattern (arduino would usually handle logic)
    setDeviceState(prev => {
      if (pattern === 1) { // Left to Right
        return { ...prev, relays: [true, true, true, true] };
      } else { // Strobo
        return { ...prev, relays: [false, true, false, true] };
      }
    });
    
    setTimeout(() => {
       setDeviceState(prev => ({ ...prev, relays: [false, false, false, false] }));
    }, 2000);
  }, [sendToAll]);

  return (
    <MqttContext.Provider value={{ brokers, deviceState, sendRelayCommand, sendPatternCommand }}>
      {children}
    </MqttContext.Provider>
  );
}

export function useMqtt() {
  const context = useContext(MqttContext);
  if (!context) throw new Error('useMqtt must be used within MqttProvider');
  return context;
}
