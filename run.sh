#!/bin/bash

# Sailing Monorepo - Development Server Runner
# This script starts all projects in the monorepo with fixed ports
# Ctrl+C or closing the script will kill all running processes

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# PID file to track running instance
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PID_FILE="$SCRIPT_DIR/.run.pid"

# Array to store background process PIDs
declare -a PIDS

# Cleanup function to kill all child processes
cleanup() {
    echo -e "\n${YELLOW}Shutting down all services...${NC}"

    # Kill all processes in our process group
    if [ ${#PIDS[@]} -gt 0 ]; then
        for pid in "${PIDS[@]}"; do
            if ps -p $pid > /dev/null 2>&1; then
                echo -e "${BLUE}Stopping process $pid${NC}"
                kill -TERM $pid 2>/dev/null || true
            fi
        done

        # Wait a moment for graceful shutdown
        sleep 2

        # Force kill any remaining processes
        for pid in "${PIDS[@]}"; do
            if ps -p $pid > /dev/null 2>&1; then
                echo -e "${RED}Force killing process $pid${NC}"
                kill -9 $pid 2>/dev/null || true
            fi
        done
    fi

    # Remove PID file
    rm -f "$PID_FILE"

    echo -e "${GREEN}All services stopped${NC}"
    exit 0
}

# Kill existing run.sh instance if it exists
if [ -f "$PID_FILE" ]; then
    OLD_PID=$(cat "$PID_FILE")
    if ps -p $OLD_PID > /dev/null 2>&1; then
        echo -e "${YELLOW}Killing existing run.sh instance (PID: $OLD_PID)...${NC}"
        kill -TERM $OLD_PID 2>/dev/null || true
        sleep 2
        # Force kill if still running
        if ps -p $OLD_PID > /dev/null 2>&1; then
            kill -9 $OLD_PID 2>/dev/null || true
        fi
        echo -e "${GREEN}✓ Previous instance stopped${NC}"
    fi
    rm -f "$PID_FILE"
fi

# Store our PID
echo $$ > "$PID_FILE"

# Set up trap to catch Ctrl+C and script exit
trap cleanup SIGINT SIGTERM EXIT

echo -e "${GREEN}================================${NC}"
echo -e "${GREEN}Sailing Monorepo - Starting...${NC}"
echo -e "${GREEN}================================${NC}"
echo ""

# Project: wind-map (Port 3000)
echo -e "${BLUE}Starting wind-map on port 3000...${NC}"
cd wind-map
PORT=3000 npm start &
WIND_MAP_PID=$!
PIDS+=($WIND_MAP_PID)
cd ..
echo -e "${GREEN}✓ wind-map started (PID: $WIND_MAP_PID)${NC}"
echo ""

# Add more projects here as you create them
# Example:
# echo -e "${BLUE}Starting route-planner on port 3001...${NC}"
# cd route-planner
# PORT=3001 npm start &
# ROUTE_PLANNER_PID=$!
# PIDS+=($ROUTE_PLANNER_PID)
# cd ..
# echo -e "${GREEN}✓ route-planner started (PID: $ROUTE_PLANNER_PID)${NC}"
# echo ""

echo -e "${GREEN}================================${NC}"
echo -e "${GREEN}All services running!${NC}"
echo -e "${GREEN}================================${NC}"
echo ""
echo -e "${YELLOW}Services:${NC}"
echo -e "  wind-map:        ${BLUE}http://localhost:3000${NC}"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop all services${NC}"
echo ""

# Wait for all background processes
# This keeps the script running until interrupted
wait
