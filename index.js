require('dotenv').config()
const express = require("express");
const app = express();
const axios = require("axios")
const localtunnel = require('localtunnel');
const ngrok = require('ngrok')
const DEFAULT_ARDUINO_IP = 'http://192.168.0.18'
const PORT = 3001;
const args = process.argv.slice(2);
let BACKEND_URL = 'http://localhost:8001';
if(args.includes('remote-server')){
  BACKEND_URL = 'https://see-o2-backend.herokuapp.com/';
}
console.log(`Reporting to backend at ${BACKEND_URL}`)

let arduinoIP = DEFAULT_ARDUINO_IP;
if(process.env.ARDUINO_ADDRESS !== "null"){
  arduinoIP = process.env.ARDUINO_ADDRESS;
}

app.get("/", async (req, res) => {
  try {
    const data = await axios.get(arduinoIP, { timeout: 3000 })
    console.log(data.data)

    res.send(data.data)
  } catch (e) {
    res.status(400).send({
      message: 'Arduino offline'
    })
    console.log(e.message)
  }
});

app.get("/reset", async (req, res) => {
  try {
    const data = await axios.get(arduinoIP + '/reset', { timeout: 6000 })
    console.log(data.data)
    res.send(data.data)
  } catch (e) {
    res.status(400).send({
      message: 'Reset command failed, Arduino offline?'
    })
    console.log(e.message)
  }
});

app.listen(PORT, async () => {
  console.log(`Server listening on port ${PORT}!\n`)
  console.log(`Arduino is at ${arduinoIP}`)
  //Use either local tunnel or ngrok depening on command line args
  if (args.includes("localtunnel")) {
    establishLocaltunnelConnection()
  } else {
    establishNgrokConnection()
  }
});

const establishNgrokConnection = async () => {
  try {
    const url = await ngrok.connect({
      addr: PORT
    });
    console.log(`ngrok url is: ${url}\n`)

    //Report the ngrok url to the SeeO2 backend
    const response = await axios({
      method: 'post',
      url: BACKEND_URL,
      data: {
        url: url,
        id: process.env.SENSOR_ID
      }
    });
    console.log(response.data)
  } catch (e) {
    console.log(e.message)
    console.log(`Expected SeeO2 backend to be running on ${BACKEND_URL}`)
  }
}

const establishLocaltunnelConnection = async () => {
  try {
    const tunnel = await localtunnel({ port: PORT, subdomain: process.env.TUNNEL_SUBDOMAIN });
    console.log(`localtunnel url is : ${tunnel.url}\n`)

    tunnel.on('close', () => {
      // tunnels are closed
    });

    tunnel.on('error', async (err) => {
      console.log(err)
    });

    const response = await axios({
      method: 'post',
      url: BACKEND_URL,
      data: {
        url: tunnel.url,
        id: process.env.SENSOR_ID
      }
    });
    console.log(response.data)
  } catch (e) {
    console.log(e.message)
    console.log(`Expected SeeO2 backend to be running on ${BACKEND_URL}`)
  }
}