const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")

const authRoutes = require("./routes/authRoutes")
const vehicleRoutes = require("./routes/vehicleRoutes")

const app = express()
app.use(cors())
app.use(express.json())

mongoose.connect("mongodb://localhost/fleetdb")

app.use("/api/auth", authRoutes)
app.use("/api/vehicles", vehicleRoutes)

app.listen(5000, ()=>console.log("Server running on port 5000"))