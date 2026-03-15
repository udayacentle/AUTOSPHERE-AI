const express = require("express")
const router = express.Router()
const Vehicle = require("../models/Vehicle")

router.get("/", async(req,res)=>{
 const vehicles = await Vehicle.find()
 res.json(vehicles)
})

router.post("/", async(req,res)=>{
 const vehicle = new Vehicle(req.body)
 await vehicle.save()
 res.json(vehicle)
})

module.exports = router