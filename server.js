const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

const STOCKS = ["GOOG","TSLA","AMZN","META","NVDA"];
let prices = {};

const rand = () => +(Math.random() * 900 + 100).toFixed(2);
STOCKS.forEach(s => prices[s] = rand());

setInterval(() => {
  STOCKS.forEach(s => prices[s] = rand());
  io.emit("prices", prices);
}, 1000);

io.on("connection", socket => {
  socket.emit("prices", prices);
});

server.listen(3000, () => console.log("Server running at http://localhost:3000"));