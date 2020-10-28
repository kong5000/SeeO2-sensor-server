require('dotenv').config()
const express = require("express");
const app = express();
const axios = require("axios")
const bodyParser = require("body-parser")
const localtunnel = require('localtunnel');

const ARDUINO_STATIC_IP = 'http://192.168.0.18';

app.get("/", async (req, res) => {
  try{
    const data = await axios.get(ARDUINO_STATIC_IP, {timeout: 3000})
    console.log(data.data)
  
    res.send(data.data)
  }catch(e){
    res.status(400).send({
      message: 'Arduino offline'
    })
    console.log(e.message)
  }
});

app.get("/reset", async (req, res) => {
  try{
    const data = await axios.get(ARDUINO_STATIC_IP + '/reset', {timeout: 6000})
    console.log(data.data)
    res.send(data.data)
  }catch(e){
    res.status(400).send({
      message: 'Reset command failed, Arduino offline?'
    })
    console.log(e.message)
  }
});

app.listen(3000, async () => {
  console.log("Server listening on port 3000!")
  let tunnel = await localtunnel({ port: 3000, subdomain: process.env.TUNNEL_SUBDOMAIN });
  console.log(tunnel.url)
  tunnel.on('close', () => {
    // tunnels are closed
  });

  tunnel.on('error', () => {
    //attempt to reconnect
    tunnel = await localtunnel({ port: 3000, subdomain: process.env.TUNNEL_SUBDOMAIN });
  });

});