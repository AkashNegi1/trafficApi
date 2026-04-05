import { prisma } from "../prismaService.js";
import dotenv from "dotenv";
import { getTrafficData } from "../services/directions.js";

dotenv.config();
console.log("GOOGLE_API_KEY:", process.env.GOOGLE_API_KEY);
   console.log("DB_URL:", process.env.DB_URL);
function enrichRecords(record){
    const ts = new Date(record.timeStamp);
    const weekday = ts.getDay(); 
    const hour = ts.getHours();
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

  // If not found, create it
  if (!route) {
    route = await prisma.route.create({
      data: { origin, destination },
    });
  }

  return route.id;
}
async function runCollector() {
  const routes = [
    ["Sector 17, Chandigarh", "Sector 43, Chandigarh"],
    ["ISBT Chandigarh", "Elante Mall Chandigarh"]
  ];
  console.log("here");
  
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
