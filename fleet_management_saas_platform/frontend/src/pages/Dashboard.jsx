import React from "react"
import AnalyticsCharts from "../charts/AnalyticsCharts"

export default function Dashboard(){

 const data={trips:120,fuel:80,maintenance:30}

 return(
   <div>
     <h1>Fleet Dashboard</h1>
     <AnalyticsCharts data={data}/>
   </div>
 )
}