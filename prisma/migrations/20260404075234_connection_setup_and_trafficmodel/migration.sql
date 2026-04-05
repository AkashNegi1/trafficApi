-- CreateTable
CREATE TABLE "TrafficData" (
    "id" SERIAL NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "weekday" INTEGER NOT NULL,
    "hour" INTEGER NOT NULL,
    "origin" TEXT NOT NULL,
    "destination" TEXT NOT NULL,
    "routeId" INTEGER NOT NULL,
    "distanceKm" DOUBLE PRECISION,
    "durationNormal" INTEGER,
    "durationInTraffic" INTEGER,
    "congestionRatio" DOUBLE PRECISION,

    CONSTRAINT "TrafficData_pkey" PRIMARY KEY ("id")
);
