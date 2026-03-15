const express = require("express")
const router = express.Router()
const jwt = require("jsonwebtoken")
const User = require("../models/User")

router.post("/login", async(req,res)=>{
 const user = await User.findOne({email:req.body.email})
 if(!user) return res.status(400).send("User not found")
 const token = jwt.sign({id:user._id},"SECRET")
 res.json({token})
})
module.exports = router