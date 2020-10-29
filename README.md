# Arduino Setup

Download and install the [arduino IDE](https://www.arduino.cc/en/main/software). I recommend installing on windows.

### Install arduino libraries
Open the arduino IDE and click Tools-> Manage Libraries
Enter WiFiNINA into the search bar and install the WiFiNINA library
!["ArduinoLibraryInstall"](https://github.com/kong5000/SeeO2-sensor-server/blob/master/docs/arduino_library.png?raw=true)

Similarly search for and install the Adafruit PM25 AQI and Adafruit BusIO libraries.

Finally search for and install the ArduinoJson library.

### Install board specific libraries
click Tools->Board -> Boards Manager

Search for Arduino megaAVR Boards and install the package.


### Code Setup
In the arduino IDE click File->Open and open the Arduino folder from this github project.

Edit the arduino_secrets.h file to add your wifi name and password.


### Uploading Code to Arduino
Connect the Arduino to your computer.

Click Tools->Board->Arduino megaAVR Boards -> Arduino Uno WiFi Rev 2

Click the upload button. Arduino will take about 10 seconds to initialize the sensor and connect to WiFI.

The default static ip is http://192.168.0.18 , visit this page to see if you get a JSON response from the arduino.

You can read messages the arduino is outputting by clicking Tools -> Serial Monitor.

# Server Setup

### Environment Variables

Copy the .env.example file to .env and add your desired subdomain name and sensor id.

## Available Scripts to start the server

With the arduino up and running, in the project directory, you can run:

### `npm run localtunnel`

This will use localtunnel to create a publicly accessbile url that will proxy requests to the local node server. An attempt will be made to use the locatunnel subdomain provided in the .env file.

### `npm run ngrok`

This will use ngrok to create a publicly accessbile url that will proxy requests to the local node server. A randomly generated url will be provided by ngrok. The sensor server will then report this url to SeeO2 backend.