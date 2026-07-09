#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <WiFiClient.h>

// ==========================================
// BINWATCH FIRMWARE - NODE MCU ESP8266
// ==========================================
// Replace these with your actual credentials
const char* WIFI_SSID     = "YOUR_WIFI_SSID"; 
const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";

// Replace with your actual Server URL and Dustbin ID
// IMPORTANT: If running locally, you must use your computer's IP address (e.g., http://192.168.1.5:3000/api/dustbins/update)
// If deployed, use your production URL (e.g., https://binwatch-api.onrender.com/api/dustbins/update)
const String SERVER_URL   = "https://your-production-url.com/api/dustbins/update"; 
const String DUSTBIN_ID   = "DBN-XXXXXX"; 

// Hardware configuration (HC-SR04 Ultrasonic Sensor)
#define TRIG_PIN D1
#define ECHO_PIN D2

// Dustbin capacity configuration (in cm)
const int BIN_DEPTH = 100; // Total depth of the dustbin in cm
const int FULL_THRESHOLD = 20; // If distance is less than 20cm, it's considered FULL
const int EMPTY_THRESHOLD = 80; // If distance is more than 80cm, it's considered EMPTY

// Hardcoded location (or you can attach a GPS module)
const String LATITUDE  = "28.6139";
const String LONGITUDE = "77.2090";

void setup() {
  Serial.begin(115200);  
  
  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);
  
  WiFi.mode(WIFI_STA); 
  connectToWiFi();
}

void loop() {
  if (WiFi.status() != WL_CONNECTED) {
    connectToWiFi();
  }

  // 1. Measure Distance
  long duration, distance;
  
  // Clear the TRIG_PIN
  digitalWrite(TRIG_PIN, LOW);
  delayMicroseconds(2);
  
  // Set the TRIG_PIN HIGH for 10 microseconds
  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);
  
  // Read the ECHO_PIN, return the sound wave travel time in microseconds
  duration = pulseIn(ECHO_PIN, HIGH);
  
  // Calculate the distance (Speed of sound is 340 m/s or 0.034 cm/microsecond)
  distance = duration * 0.034 / 2;

  Serial.print("Measured Distance: ");
  Serial.print(distance);
  Serial.println(" cm");

  // 2. Determine Status
  String status = "Half";
  if (distance <= FULL_THRESHOLD) {
    status = "Full";
  } else if (distance >= EMPTY_THRESHOLD) {
    status = "Empty";
  }

  // 3. Send Data to Node.js Backend
  sendToBackend(status, distance);

  // Wait 30 seconds before next update to prevent spamming the server
  delay(30000); 
}

void connectToWiFi() {
  Serial.print("\nAttempting to connect to SSID: ");
  Serial.println(WIFI_SSID);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    Serial.print(".");
    delay(1000);
    attempts++;
  }
  
  if(WiFi.status() == WL_CONNECTED) {
    Serial.println("\nWiFi Connected successfully!");
    Serial.print("IP Address: ");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println("\nFailed to connect to WiFi. Will retry in main loop.");
  }
}

void sendToBackend(String status, long distance) {
  if (WiFi.status() == WL_CONNECTED) {
    WiFiClient client;
    HTTPClient http;

    Serial.println("\n--- Sending Data to Server ---");
    Serial.println("URL: " + SERVER_URL);
    
    http.begin(client, SERVER_URL);
    http.addHeader("Content-Type", "application/json");

    // Construct JSON Payload
    String jsonPayload = "{";
    jsonPayload += "\"dustbinId\":\"" + DUSTBIN_ID + "\",";
    jsonPayload += "\"status\":\"" + status + "\",";
    jsonPayload += "\"lat\":\"" + LATITUDE + "\",";
    jsonPayload += "\"lng\":\"" + LONGITUDE + "\",";
    jsonPayload += "\"distance\":" + String(distance);
    jsonPayload += "}";

    Serial.println("Payload: " + jsonPayload);

    // Send POST Request
    int httpResponseCode = http.POST(jsonPayload);

    if (httpResponseCode > 0) {
      Serial.print("HTTP Response Code: ");
      Serial.println(httpResponseCode);
      String response = http.getString();
      Serial.println("Server Response: " + response);
    } else {
      Serial.print("Error code: ");
      Serial.println(httpResponseCode);
      Serial.println("Failed to send data to server.");
    }
    
    http.end(); // Free resources
  } else {
    Serial.println("Error: WiFi Disconnected");
  }
}
