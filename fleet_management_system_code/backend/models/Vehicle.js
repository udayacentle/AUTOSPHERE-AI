const mongoose = require("mongoose")
const VehicleSchema = new mongoose.Schema({
 plateNumber:String,
 model:String,
 status:String,
 latitude:Number,
 longitude:Number
})
module.exports = mongoose.model("Vehicle",VehicleSchema)