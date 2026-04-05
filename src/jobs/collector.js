import { prisma } from "../prismaService.js";
import dotenv from "dotenv";
import { getTrafficData } from "../services/directions.js";

dotenv.config();

function enrichRecords(record){
    const ts = new Date(record.timeStamp);
    const weekday = ts.getDay(); 
    const hour = (ts.getHours()+5.5)%24;
    const distancekm = record.distance ? record.distance / 1000 : null;
    const congestionRatio = record.durationNormal && record.durationInTraffic 
                            ? record.durationInTraffic / record.durationNormal : null;
    return {
        timestamp: record.timeStamp,
        origin: record.origin,
        destination: record.destination,
        weekday,
        hour,
        distanceKm: distancekm,
        durationNormal: record.durationNormal,
        durationInTraffic: record.durationInTraffic,
        congestionRatio
    }    
}

async function ensureRoute(origin, destination) {
  // Try to find existing route
  let route = await prisma.route.findUnique({
    where: { origin_destination: { origin, destination } },
  });
  //if polyline is null, update it
  if(route && !route.polyline){
   await prisma.route.update({
    data : { polyline: enriched.polyline },});
   }
  // If not found, create it
  if (!route) {
    route = await prisma.route.create({
      data: { 
        origin, 
        destination,
        polyline: enriched.polyline
     },
    });
  }

  return route.id;
}
async function runCollector() {
  const routes = [
  // Commercial & Shopping (6)
  ["Sector 17, Chandigarh", "Elante Mall, Chandigarh"],
  ["Sector 22, Chandigarh", "Elante Mall, Chandigarh"],
  ["Sector 35, Chandigarh", "Elante Mall, Chandigarh"],
  ["ISBT Chandigarh", "Elante Mall, Chandigarh"],
  ["Sector 43, Chandigarh", "Sector 17, Chandigarh"],
  ["Sector 17, Chandigarh", "Sector 22, Chandigarh"],
  
  // Educational Institutions (5)
  ["PGI Chandigarh", "Sector 12, Chandigarh"],
  ["PGIMER Chandigarh", "Sector 17, Chandigarh"],
  ["Chandigarh University, Gharuan", "Sector 43, Chandigarh"],
  ["Punjab University, Sector 14", "Sector 17, Chandigarh"],
  ["DCET, Chandigarh", "Sector 22, Chandigarh"],
  
  // Transport Hubs (4)
  ["Chandigarh Railway Station", "Sector 17, Chandigarh"],
  ["ISBT Chandigarh", "Sector 43, Chandigarh"],
  ["Chandigarh Airport", "Sector 17, Chandigarh"],
  ["Chandigarh Airport", "Elante Mall, Chandigarh"],
  
  // Tourist & Recreation (5)
  ["Rock Garden, Chandigarh", "Sukhna Lake, Chandigarh"],
  ["Sukhna Lake, Chandigarh", "Sector 17, Chandigarh"],
  ["Capitol Complex, Chandigarh", "Sector 17, Chandigarh"],
  ["Zoo, Chandigarh", "Sector 1, Chandigarh"],
  ["Rose Garden, Sector 16", "Sector 17, Chandigarh"],
  
  // Major Commuter Routes (5)
  ["Sector 56, Chandigarh", "Sector 17, Chandigarh"],
  ["Housing Board, Chandigarh", "IT Park, Chandigarh"],
  ["Manimajra, Chandigarh", "Sector 17, Chandigarh"],
  ["Dhanas, Chandigarh", "Sector 22, Chandigarh"],
  ["Maloya, Chandigarh", "Sector 17, Chandigarh"],
  
  // Kharar Routes (5)
  ["Kharar, Punjab", "Chandigarh Sector 17"],
  ["Kharar, Punjab", "Elante Mall, Chandigarh"],
  ["Kharar, Punjab", "IT Park, Chandigarh"],
  ["Chandigarh Sector 43", "Kharar, Punjab"],
  ["Kharar, Punjab", "PGI Chandigarh"]
];
  
  for (const [origin, destination] of routes) {
    const record = await getTrafficData(origin, destination, process.env.GOOGLE_API_KEY);
    console.log(record);
    
    if (record) {
        console.log(record);
        
        const enriched = enrichRecords(record);
        const routeId = await ensureRoute(origin, destination);
      await prisma.trafficData.create(
        { data: {...enriched, routeId} }
    );
      console.log("Saved enriched record:", enriched);
    } else {
      console.log("No data for route:", origin, "→", destination);
    }
  }
}

// Run every 5 minutes
runCollector();
setInterval(runCollector, 5 * 60 * 1000);
