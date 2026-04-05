import dotenv from "dotenv";
import "./jobs/collector.js";


// Try to load .env with explicit path

dotenv.config();
console.log("Traffic data collector started...");
