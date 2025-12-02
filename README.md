# Nudge PWA

Nudge helps you stay connected to your beloved ones, even if you struggle to keep up the conversation! Simple reminders to contact the people around you, organized in a beautiful dashboard. 
A minimal Progressive Web App with centralized storage for NAS deployment.

## Quick Start

1. Copy all files to your desired directory
2. Run: `docker-compose up`
3. Access the app at: `http://localhost:8765`

## Features

- Simple todo list functionality
- Data persistence through centralized JSON storage
- PWA capabilities (installable on mobile devices)
- Single container deployment

## Data Storage

All data is stored in `./data/data.json` on your host system, ensuring persistence across container restarts.

## Development

For development with hot reload:
```bash
npm install
npm run dev
```

## Production

For production deployment:
```bash
docker-compose up -d