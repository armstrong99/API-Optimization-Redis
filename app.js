const express = require("express");
const axios = require("axios");
const redis = require("redis");
const responseTime = require("response-time");
const { promisify } = require("util");

const app = express();

app.use(responseTime());

const client = redis.createClient({
  host: "127.0.0.1",
  port: 6379,
});

const GET_ASYNC = promisify(client.get).bind(client);

const SET_ASYNC = promisify(client.setex).bind(client);

app.get("/rockets", async (req, res, next) => {

  try {
        const reply = await GET_ASYNC('rockets')
 
        if (reply) {

            console.log('using cache data')
            res.send(JSON.parse(reply))
            return 
        }


     const {data} = await axios.get("https://api.spacexdata.com/v3/rockets");

     let stRes = JSON.stringify(data)
  
    const saveResult = await SET_ASYNC(
      "rockets",
      100,
      stRes,
      );

    console.log("new data saved", saveResult);

    res.send(data);

  } catch (error) {
    res.send(error.message);
  }
});
app.listen(3001, () => {
  console.log("server is running");
});
