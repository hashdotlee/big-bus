#!/bin/bash
set -e

# Create multiple databases for microservices
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    -- Auth Service Database
    CREATE DATABASE auth_db;
    GRANT ALL PRIVILEGES ON DATABASE auth_db TO postgres;

    -- Booking Service Database
    CREATE DATABASE booking_db;
    GRANT ALL PRIVILEGES ON DATABASE booking_db TO postgres;

    -- Vehicle Service Database
    CREATE DATABASE vehicle_db;
    GRANT ALL PRIVILEGES ON DATABASE vehicle_db TO postgres;

    -- Payment Service Database
    CREATE DATABASE payment_db;
    GRANT ALL PRIVILEGES ON DATABASE payment_db TO postgres;

    -- Analytics Service Database
    CREATE DATABASE analytics_db;
    GRANT ALL PRIVILEGES ON DATABASE analytics_db TO postgres;
EOSQL

echo "✅ All databases created successfully!"
