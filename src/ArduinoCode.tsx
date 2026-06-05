import React from 'react';
import { Copy, CheckCircle2, Code2 } from 'lucide-react';

const ARDUINO_CODE = `
#include <ESP8266WiFi.h> // Atau <WiFi.h> untuk ESP32
#include <PubSubClient.h>
#include <DHT.h>

// --- KONFIGURASI WIFI ---
const char* ssid = "WIFI_SSID_ANDA";
const char* password = "WIFI_PASSWORD_ANDA";

// --- KONFIGURASI 3 MQTT BROKER ---
const char* broker1 = "test.mosquitto.org"; 
const int port1 = 1883;

const char* broker2 = "mqtt.eclipseprojects.io";
const int port2 = 1883;

const char* broker3 = "public.mqtthq.com";
const int port3 = 1883;

// Gunakan salah satu broker saat ini. 
// Web interface mengirim ke ketiganya secara redundan.
const char* activeBroker = broker1; 
const int activePort = port1;

// --- TOPIK MQTT ---
const char* topic_sensors = "iot_project_tugas_akhir_2026/sensors";
const char* topic_relay_cmd = "iot_project_tugas_akhir_2026/relays/cmd";
const char* topic_pattern_cmd = "iot_project_tugas_akhir_2026/pattern/cmd";

// --- KONFIRGURASI PIN ---
#define DHTPIN D1      // Pin sensor DHT
#define DHTTYPE DHT11  // atau DHT22
DHT dht(DHTPIN, DHTTYPE);

const int relayPins[4] = {D2, D3, D4, D5}; // Sesuaikan dengan NodeMCU/ESP Anda

WiFiClient espClient;
PubSubClient client(espClient);

unsigned long lastMsg = 0;

void setup() {
  Serial.begin(115200);
  dht.begin();

  for(int i=0; i<4; i++) {
    pinMode(relayPins[i], OUTPUT);
    digitalWrite(relayPins[i], HIGH); // Asumsi relay aktif LOW
  }

  setup_wifi();
  
  client.setServer(activeBroker, activePort);
  client.setCallback(callback);
}

void setup_wifi() {
  delay(10);
  Serial.println();
  Serial.print("Connecting to ");
  Serial.println(ssid);
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\\nWiFi connected");
}

void callback(char* topic, byte* payload, unsigned int length) {
  String message;
  for (int i = 0; i < length; i++) {
    message += (char)payload[i];
  }
  
  Serial.print("Pesan masuk [");
  Serial.print(topic);
  Serial.print("]: ");
  Serial.println(message);

  if (String(topic) == topic_relay_cmd) {
    // Parsing manual array boolean dari web: [true,false,true,false]
    int relayIndex = 0;
    int searchPos = 0;
    
    while (relayIndex < 4 && searchPos < message.length()) {
      int nextTrue = message.indexOf("true", searchPos);
      int nextFalse = message.indexOf("false", searchPos);
      
      if (nextTrue == -1 && nextFalse == -1) break; // Tidak ada lagi data
      
      // Jika "true" ditemukan lebih dulu
      if (nextTrue != -1 && (nextFalse == -1 || nextTrue < nextFalse)) {
         digitalWrite(relayPins[relayIndex], LOW); // Asumsi Aktif LOW
         searchPos = nextTrue + 4;
         relayIndex++;
      } 
      // Jika "false" ditemukan lebih dulu
      else if (nextFalse != -1 && (nextTrue == -1 || nextFalse < nextTrue)) {
         digitalWrite(relayPins[relayIndex], HIGH); // Asumsi Mati HIGH
         searchPos = nextFalse + 5;
         relayIndex++;
      }
    }
  } 
  else if (String(topic) == topic_pattern_cmd) {
    if (message.indexOf("1") >= 0) {
      patternSatu();
    } else if (message.indexOf("2") >= 0) {
      patternDua();
    }
  }
}

void reconnect() {
  while (!client.connected()) {
    Serial.print("Attempting MQTT connection...");
    // Create a random client ID
    String clientId = "ESP8266Client-";
    clientId += String(random(0, 0xffff), HEX);
    
    if (client.connect(clientId.c_str())) {
      Serial.println("connected");
      client.subscribe(topic_relay_cmd);
      client.subscribe(topic_pattern_cmd);
    } else {
      Serial.print("failed, rc=");
      Serial.print(client.state());
      Serial.println(" try again in 5 seconds");
      delay(5000);
    }
  }
}

void patternSatu() {
  // Kombinasi 1: Kiri ke Kanan
  for(int i=0; i<4; i++){
    digitalWrite(relayPins[i], LOW);
    delay(500);
    digitalWrite(relayPins[i], HIGH);
  }
}

void patternDua() {
  // Kombinasi 2: Strobo Flip Flop
  for(int j=0; j<5; j++){
    digitalWrite(relayPins[0], LOW); digitalWrite(relayPins[2], LOW);
    digitalWrite(relayPins[1], HIGH); digitalWrite(relayPins[3], HIGH);
    delay(200);
    digitalWrite(relayPins[0], HIGH); digitalWrite(relayPins[2], HIGH);
    digitalWrite(relayPins[1], LOW); digitalWrite(relayPins[3], LOW);
    delay(200);
  }
  // Matikan semua
  for(int i=0; i<4; i++) digitalWrite(relayPins[i], HIGH);
}

void loop() {
  if (!client.connected()) {
    reconnect();
  }
  client.loop();

  unsigned long now = millis();
  if (now - lastMsg > 5000) { // Kirim sensor tiap 5 detik
    lastMsg = now;
    float h = dht.readHumidity();
    float t = dht.readTemperature();

    if (!isnan(h) && !isnan(t)) {
      String payload = "{\\"temperature\\":" + String(t) + ",\\"humidity\\":" + String(h) + "}";
      client.publish(topic_sensors, payload.c_str());
    }
  }
}
`;

export function ArduinoCode() {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(ARDUINO_CODE);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <div className="bg-black rounded-lg overflow-hidden border border-[#333]">
        <div className="bg-[#0a0a0a] px-6 py-4 flex justify-between items-center border-b border-[#333]">
          <div className="flex items-center">
            <Code2 className="w-4 h-4 text-white mr-2" />
            <h2 className="text-white font-medium text-sm">Arduino / ESP8266 Source Code</h2>
          </div>
          <button
            onClick={handleCopy}
            className="flex items-center text-xs bg-white text-black hover:bg-gray-200 px-3 py-1.5 rounded-md transition-colors"
          >
            {copied ? (
              <><CheckCircle2 className="w-3.5 h-3.5 mr-1.5 text-black" /> Copied</>
            ) : (
              <><Copy className="w-3.5 h-3.5 mr-1.5" /> Copy Code</>
            )}
          </button>
        </div>
        <div className="p-6 overflow-x-auto bg-black">
          <pre className="text-sm text-[#888] font-mono leading-relaxed">
            <code>{ARDUINO_CODE}</code>
          </pre>
        </div>
      </div>
    </div>
  );
}
