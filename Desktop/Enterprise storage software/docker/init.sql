-- Enterprise Storage Database Initialization
-- This file is executed when PostgreSQL container starts for the first time

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create database if it doesn't exist (though it's already created via environment)
-- This is just for completeness

-- Set default permissions
GRANT ALL PRIVILEGES ON DATABASE enterprise_storage TO postgres;

-- Create a basic health check function
CREATE OR REPLACE FUNCTION health_check()
RETURNS TEXT AS $$
BEGIN
    RETURN 'Database is healthy';
END;
$$ LANGUAGE plpgsql;
