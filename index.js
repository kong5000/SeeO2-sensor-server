const express = require("express");
const app = express();
const axios = require("axios")
const bodyParser = require("body-parser")

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

app.listen(3000, () => console.log("Server listening on port 3000!"));