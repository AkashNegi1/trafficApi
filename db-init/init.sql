CREATE TABLE IF NOT EXISTS traffic_data (
  id SERIAL PRIMARY KEY,
  timestamp TIMESTAMP NOT NULL,
  origin TEXT NOT NULL,
  destination TEXT NOT NULL,
  duration_normal INT,
  duration_in_traffic INT
);
