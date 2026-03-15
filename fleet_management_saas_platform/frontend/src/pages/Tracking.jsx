import {GoogleMap,Marker,LoadScript} from "@react-google-maps/api"
import {useEffect,useState} from "react"
import io from "socket.io-client"

const socket = io("http://localhost:5000")

export default function Tracking(){

 const [vehicles,setVehicles]=useState([])

 useEffect(()=>{
  socket.on("vehicle-location",(data)=>{
   setVehicles(v=>[...v,data])
  })
 },[])

 return(
 <LoadScript googleMapsApiKey="YOUR_GOOGLE_MAP_KEY">
 <GoogleMap zoom={10} center={{lat:37.77,lng:-122.41}}
 mapContainerStyle={{height:"500px"}}>

 {vehicles.map((v,i)=>(
   <Marker key={i} position={{lat:v.lat,lng:v.lng}}/>
 ))}

 </GoogleMap>
 </LoadScript>
 )
}