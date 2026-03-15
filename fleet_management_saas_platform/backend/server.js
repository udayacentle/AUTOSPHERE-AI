const express = require("express")
const http = require("http")
const cors = require("cors")
const mongoose = require("mongoose")
const socketIo = require("socket.io")

const vehicleRoutes = require("./routes/vehicleRoutes")

const app = express()
const server = http.createServer(app)
const io = socketIo(server,{cors:{origin:"*"}})

app.use(cors())
app.use(express.json())

mongoose.connect("mongodb://localhost/fleetdb")

app.use("/api/vehicles", vehicleRoutes)

io.on("connection",(socket)=>{
 console.log("Vehicle connected")

 socket.on("gps-update",(data)=>{
   io.emit("vehicle-location",data)
 })

})

server.listen(5000,()=>console.log("Server running"))