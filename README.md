# Arduino Setup

Download the [arduino IDE](https://www.arduino.cc/en/main/software). I recommend installing on windows.



## Available Scripts

In the project directory, you can run:

### `npm run localtunnel`

This will use localtunnel to create a publicly accessbile url that will proxy requests to the local node server. An attempt will be made to use the locatunnel subdomain provided in the .env file.

### `npm run ngrok`

This will use ngrok to create a publicly accessbile url that will proxy requests to the local node server. A randomly generate url will be provided by ngrok. The sensor server will then report this url to SeeO2 backend.