#!/bin/bash

# Get the directory of the script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}========================================================${NC}"
echo -e "${GREEN}  Starting Admission Suggestor Application${NC}"
echo -e "${GREEN}========================================================${NC}"

# Function to kill processes on specific ports
kill_port() {
    local port=$1
    local pid=$(lsof -t -i:$port)
    if [ -n "$pid" ]; then
        echo -e "${YELLOW}Killing process on port $port (PID: $pid)...${NC}"
        kill -9 $pid 2>/dev/null
    fi
}

# Cleanup function
cleanup() {
    echo ""
    echo -e "${YELLOW}Stopping servers...${NC}"
    if [ -n "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null
    fi
    if [ -n "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null
    fi
    exit
}

# Trap Ctrl+C (SIGINT) to run cleanup
trap cleanup SIGINT

# 1. PRE-FLIGHT CHECKS
echo -e "${GREEN}[1/4] Checking Environment...${NC}"

# Check directories
if [ ! -d "backend" ]; then
    echo -e "${RED}[ERROR] 'backend' directory not found!${NC}"
    exit 1
fi

if [ ! -d "frontend" ]; then
    echo -e "${RED}[ERROR] 'frontend' directory not found!${NC}"
    exit 1
fi

# Clean up existing ports
kill_port 8000
kill_port 5173

# 2. BACKEND SETUP & START
echo -e "${GREEN}[2/4] Setting up Backend...${NC}"
cd backend

# Check for venv (optional, but good practice if existed, here we assume system python or user manages it)
# We will just install requirements if uvicorn is missing or just to be safe

# Install dependencies if needed (quietly)
echo "Ensuring backend dependencies are installed..."
pip3 install -r requirements.txt > /dev/null 2>&1

echo "Launching Backend Server (FastAPI)..."
python3 -m uvicorn main:app --reload --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!
cd ..

# Wait for backend to be ready
echo "Waiting for Backend to start..."
while ! curl -s http://localhost:8000/ > /dev/null; do
    sleep 1
    # Check if process is still running
    if ! ps -p $BACKEND_PID > /dev/null; then
        echo -e "${RED}Backend failed to start. Check logs.${NC}"
        cleanup
    fi
done
echo -e "${GREEN}Backend is UP!${NC}"

# 3. FRONTEND SETUP & START
echo -e "${GREEN}[3/4] Setting up Frontend...${NC}"
cd frontend

if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}node_modules not found. Installing dependencies...${NC}"
    npm install
fi

echo "Launching Frontend Application (React/Vite)..."
npm run dev &
FRONTEND_PID=$!
cd ..

# 4. READY
echo ""
echo -e "${GREEN}========================================================${NC}"
echo -e "${GREEN}  Application is Running!${NC}"
echo -e "${GREEN}========================================================${NC}"
echo -e "  - Backend:  ${YELLOW}http://localhost:8000${NC}"
echo -e "  - Frontend: ${YELLOW}http://localhost:5173${NC}"
echo ""
echo "  Press Ctrl+C to stop both servers."
echo "========================================================"

# Wait for both processes
wait
