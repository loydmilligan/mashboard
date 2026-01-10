-- Initialize databases for Mashb0ard services
-- This script runs on first PostgreSQL startup

-- Create Vikunja database (mashboard database is created by POSTGRES_DB env var)
CREATE DATABASE vikunja;

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE vikunja TO mashboard;
