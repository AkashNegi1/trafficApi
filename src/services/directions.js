import { timeStamp } from "console";
import fetch from "node-fetch";

export async function getTrafficData(origin,destination,apikey){
    const url = `https://maps.googleapis.com/maps/api/directions/json?departure_time=now&destination=${encodeURIComponent(destination)}&origin=${encodeURIComponent(origin)}&key=${apikey}`;
    const res = await fetch(url);
    const data = await res.json();

    if(data.routes?.length > 0){
        const leg = data.routes[0].legs[0];
        return {
            timeStamp: new Date(),
            origin,
            destination,
            durationNormal: leg.duration?.value || null,
            durationInTraffic: leg.duration_in_traffic?.value || null,
            distance: leg.distance?.value || null
        }
    }

    return null;
}