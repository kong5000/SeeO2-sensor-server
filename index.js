require('dotenv').config()
const express = require("express");
const app = express();
const axios = require("axios")
const localtunnel = require('localtunnel');
const ngrok = require('ngrok')

const args = process.argv.slice(2);
const ARDUINO_STATIC_IP = 'http://192.168.0.18';
const BACKEND_URL = 'http://localhost:8001';

app.get("/", async (req, res) => {
  try {
    const data = await axios.get(ARDUINO_STATIC_IP, { timeout: 3000 })
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
    const data = await axios.get(ARDUINO_STATIC_IP + '/reset', { timeout: 6000 })
    console.log(data.data)
    res.send(data.data)
  } catch (e) {
    res.status(400).send({
      message: 'Reset command failed, Arduino offline?'
    })
    console.log(e.message)
  }
});

app.listen(3000, async () => {
  console.log("Server listening on port 3000!")
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
      addr: 3000
    });
    console.log(`ngrok url is: ${url}`)

    //Report the ngrok url to the SeeO2 backend
    const response = await axios({
      method: 'post',
      url: BACKEND_URL,
      data: {
        url: url,
        id: 1
      }
    });
    console.log(response.data)
  } catch (e) {
    console.log(e.message)
  }
}

const establishLocaltunnelConnection = async () => {
  try {
    const tunnel = await localtunnel({ port: 3000, subdomain: process.env.TUNNEL_SUBDOMAIN });
    console.log(`localtunnel url is : ${tunnel.url}`)

    tunnel.on('close', () => {
      // tunnels are closed
    });

    tunnel.on('error', async (err) => {
      //attempt to reconnect
      console.log(err)
      try {
        const response = await axios({
          method: 'post',
          url: BACKEND_URL,
          data: {
            url: tunnel.url,
            id: 1
          }
        });
        console.log(response.data)
      } catch (e) {
        console.log(e.message)
      }
    });

    const response = await axios({
      method: 'post',
      url: BACKEND_URL,
      data: {
        url: tunnel.url,
        id: 1
      }
    });
    console.log(response.data)
  } catch (e) {
    console.log(e.message)
  }
}