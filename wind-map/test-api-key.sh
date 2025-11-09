#!/bin/bash

# Test OpenWeatherMap API Key
# This script checks if your API key is working

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}Testing OpenWeatherMap API Key...${NC}\n"

# Load API key from .env file
if [ -f .env ]; then
    API_KEY=$(grep REACT_APP_OPENWEATHER_API_KEY .env | cut -d '=' -f2)
    echo -e "${BLUE}API Key found:${NC} ${API_KEY:0:8}...${API_KEY: -4}"
else
    echo -e "${RED}Error: .env file not found${NC}"
    exit 1
fi

if [ -z "$API_KEY" ]; then
    echo -e "${RED}Error: API key not found in .env file${NC}"
    exit 1
fi

# Test API call
echo -e "\n${BLUE}Testing API call to Oceanside Marina...${NC}\n"

RESPONSE=$(curl -s "https://api.openweathermap.org/data/2.5/weather?lat=33.2095&lon=-117.3895&appid=$API_KEY&units=imperial")

# Check for errors
if echo "$RESPONSE" | grep -q '"cod":401'; then
    echo -e "${RED}❌ API Key Not Active${NC}"
    echo -e "${YELLOW}Your API key is not yet activated.${NC}"
    echo -e "${YELLOW}OpenWeatherMap keys can take up to 2 hours to activate after creation.${NC}"
    echo -e "${YELLOW}Please wait and try again later.${NC}\n"
    echo -e "Response: $RESPONSE\n"
    exit 1
elif echo "$RESPONSE" | grep -q '"cod":200'; then
    echo -e "${GREEN}✅ API Key Working!${NC}\n"

    # Extract and display wind data
    WIND_SPEED=$(echo "$RESPONSE" | grep -o '"speed":[0-9.]*' | cut -d':' -f2)
    WIND_DEG=$(echo "$RESPONSE" | grep -o '"deg":[0-9]*' | cut -d':' -f2 | head -1)
    LOCATION=$(echo "$RESPONSE" | grep -o '"name":"[^"]*"' | cut -d'"' -f4)

    echo -e "${BLUE}Location:${NC} $LOCATION"
    echo -e "${BLUE}Wind Speed:${NC} $WIND_SPEED mph"
    echo -e "${BLUE}Wind Direction:${NC} $WIND_DEG degrees"
    echo -e "\n${GREEN}Your wind-map app should work correctly!${NC}\n"
else
    echo -e "${RED}❌ Unexpected API Response${NC}"
    echo -e "Response: $RESPONSE\n"
    exit 1
fi
