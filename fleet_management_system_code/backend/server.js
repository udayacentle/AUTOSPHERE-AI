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

const PORT = process.env.PORT ? Number(process.env.PORT) : 5001
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))