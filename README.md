# Contact Reminder PWA

A Progressive Web App for managing contact reminders with push notifications.

## Features

- Add and manage contacts with phone, email, and notes
- Set custom reminder intervals for each contact
- Receive push notifications when it's time to contact someone
- Mark contacts as contacted to reset the reminder timer
- Data persists using Claude's storage API
- Works offline as a PWA
- Mobile-friendly responsive design

## Installation on NAS

1. Copy all files to your NAS
2. Ensure Docker and Docker Compose are installed
3. Run: `docker-compose up -d`
4. Access the app at: `http://your-nas-ip:8765`

## Setup for PWA

1. Open the app in your browser
2. Click "Enable Notifications" when prompted
3. On mobile: Use browser menu > "Add to Home Screen"
4. The app will work offline and send notifications

## Project Structure

```
/redthread
├── docker-compose.yml
├── Dockerfile
├── nginx.conf
├── package.json
├── public/
│   ├── index.html
│   ├── manifest.json
│   ├── service-worker.js
│   └── icons/
└── src/
    └── App.jsx
```

## Building for Production

```bash
# Install dependencies
npm install

# Build for production
npm run build

# Build Docker image
docker-compose build

# Start container
docker-compose up -d
```

## Configuration

- Change the port in `docker-compose.yml` (default: 8765)
- Customize notification intervals per contact (default: 30 days)
- Notifications check every minute for due reminders

## Browser Compatibility

- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Requires iOS 16.4+ for full PWA support

## Notes

- Notifications require HTTPS in production (works on localhost for testing)
- For NAS deployment, consider setting up a reverse proxy with SSL
- Data is stored locally in the browser using Claude's storage API