/*
  With code from Simple Web Server WiFi WiFiNINA example
  by Tom Igoe and Adafruit's PM25 example.
*/

#define ARDUINO_NAME "SET YOUR NAME HERE"
#define USE_STATIC_IP true

#include <SPI.h>
#include <WiFiNINA.h>
#include <ArduinoJson.h>
#include "Adafruit_PM25AQI.h"
#include "arduino_secrets.h"

///////please enter your sensitive data in the Secret tab/arduino_secrets.h
char ssid[] = SECRET_SSID;        // your network SSID (name)
char pass[] = SECRET_PASS;    // your network password (use for WPA, or use as key for WEP)
int keyIndex = 0;                 // your network key Index number (needed only for WEP)

int pm25 = 0;
int pm10 = 0;

PM25_AQI_Data data;
Adafruit_PM25AQI aqi = Adafruit_PM25AQI();

int status = WL_IDLE_STATUS;
WiFiServer server(80);

IPAddress local_IP(192, 168, 0, 18); //The static ip address used if USE_STATIC_IP is true


void setup() {
  pinMode(LED_BUILTIN, OUTPUT);

  Serial.begin(9600);      // initialize serial communication

  if (! aqi.begin_I2C()) {      // connect to the sensor over I2C
    Serial.println("Could not find PM 2.5 sensor!");
    while (1) delay(10);
  }
  Serial.println("PM25 found!");


  // check for the WiFi module:
  if (WiFi.status() == WL_NO_MODULE) {
    Serial.println("Communication with WiFi module failed!");
    // don't continue
    while (true);
  }

  if (USE_STATIC_IP) {
    // Configures static IP address
    WiFi.config(local_IP);
  }

  // attempt to connect to Wifi network:
  while (status != WL_CONNECTED) {
    Serial.print("Attempting to connect to Network named: ");
    Serial.println(ssid);                   // print the network name (SSID);

    // Connect to WPA/WPA2 network. Change this line if using open or WEP network:
    status = WiFi.begin(ssid, pass);
    // wait 10 seconds for connection:
    delay(10000);
  }
  server.begin();                           // start the web server on port 80
  printWifiStatus();                        // you're connected now, so print out the status
}

void loop() {
  WiFiClient client = server.available();   // listen for incoming clients

  if (client) {                             // if you get a client,
    Serial.println("new client");           // print a message out the serial port
    String currentLine = "";                // make a String to hold incoming data from the client
    while (client.connected()) {            // loop while the client's connected
      if (client.available()) {             // if there's bytes to read from the client,
        char c = client.read();             // read a byte, then
        Serial.write(c);                    // print it out the serial monitor

        if (currentLine.endsWith("GET /reset")) {
          StaticJsonDocument<200> doc;
          doc["message"] = "Successfully reset sensor";
          client.println(F("HTTP/1.0 200 OK"));
          client.println(F("Content-Type: application/json"));
          client.println(F("Connection: close"));
          client.print(F("Content-Length: "));
          client.println(measureJsonPretty(doc));
          client.println();
          serializeJsonPretty(doc, client);
          client.println();
          Serial.println("hello");
          Serial.println("hello");
          Serial.println(currentLine);
        }


        if (c == '\n') {                    // if the byte is a newline character

          // if the current line is blank, you got two newline characters in a row.
          // that's the end of the client HTTP request, so send a response:
          if (currentLine.length() == 0) {

            if (! aqi.read(&data)) {
              Serial.println("Could not read from AQI");
            }

            pm25 = data.pm25_standard;
            Serial.print("PM2.5: ");
            Serial.print(pm25);
            pm10 = data.pm100_standard;
            Serial.print("PM10: ");
            Serial.print(pm10);

            StaticJsonDocument<200> doc;
            doc["name"] = ARDUINO_NAME;
            doc["pm25"] = pm25;
            doc["pm10"] = pm10;

            serializeJson(doc, Serial);
            client.println(F("HTTP/1.0 200 OK"));
            client.println(F("Content-Type: application/json"));
            client.println(F("Connection: close"));
            client.print(F("Content-Length: "));
            client.println(measureJsonPretty(doc));
            client.println();

            serializeJsonPretty(doc, client);

            // The HTTP response ends with another blank line:
            client.println();
            // break out of the while loop:
            break;
          } else {    // if you got a newline, then clear currentLine:
            currentLine = "";
          }
        } else if (c != '\r') {  // if you got anything else but a carriage return character,
          currentLine += c;      // add it to the end of the currentLine
        }

      }
    }
    // close the connection:
    client.stop();
    Serial.println("client disonnected");
  }
}


void printWifiStatus() {
  // print the SSID of the network you're attached to:
  Serial.print("SSID: ");
  Serial.println(WiFi.SSID());

  // print your board's IP address:
  IPAddress ip = WiFi.localIP();
  Serial.print("IP Address: ");
  Serial.println(ip);

  // print the received signal strength:
  long rssi = WiFi.RSSI();
  Serial.print("signal strength (RSSI):");
  Serial.print(rssi);
  Serial.println(" dBm");
  // print where to go in a browser:
  Serial.print("To see this page in action, open a browser to http://");
  Serial.println(ip);
}