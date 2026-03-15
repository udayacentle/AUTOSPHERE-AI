import React,{useEffect,useState} from "react"
import axios from "axios"

export default function Vehicles(){

 const [vehicles,setVehicles] = useState([])

 useEffect(()=>{
  axios.get("http://localhost:5000/api/vehicles")
  .then(res=>setVehicles(res.data))
 },[])

 return(
  <div>
   <h2>Vehicles</h2>
   {vehicles.map(v=>(
     <div key={v._id}>{v.plateNumber} - {v.model}</div>
   ))}
  </div>
 )
}