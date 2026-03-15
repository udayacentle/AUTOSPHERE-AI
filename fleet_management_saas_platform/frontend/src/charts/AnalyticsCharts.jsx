import {Bar} from "react-chartjs-2"

export default function AnalyticsCharts({data}){

 return(
  <Bar
   data={{
    labels:["Trips","Fuel","Maintenance"],
    datasets:[{
     label:"Fleet Analytics",
     data:[data.trips,data.fuel,data.maintenance]
    }]
   }}
  />
 )

}