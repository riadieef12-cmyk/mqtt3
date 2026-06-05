export type BrokerInfo = {
  id: string;
  name: string;
  url: string;
  connected: boolean;
};

export type DeviceState = {
  temperature: number;
  humidity: number;
  relays: [boolean, boolean, boolean, boolean];
};

export type AppCommand = 
  | { type: 'SET_RELAY'; index: number; state: boolean }
  | { type: 'TRIGGER_PATTERN'; pattern: 1 | 2 }
  | { type: 'READ_SENSORS' }
  | { type: 'UPDATE_SENSORS'; temperature: number; humidity: number };
