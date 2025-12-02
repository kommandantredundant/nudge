# Nudge - Contact Management PWA

A Progressive Web Application designed to help you maintain meaningful relationships by providing timely reminders to stay in touch with your contacts.

## Overview

Nudge is a contact management system that helps you organize your relationships into different "circles" with customizable reminder intervals. The application evolved from a monolithic architecture to a modular, maintainable structure that follows modern React best practices.

### Key Features

- **Contact Organization**: Group contacts into circles (Family, Close Friends, Friends, Colleagues, Acquaintances)
- **Smart Reminders**: Configurable notification intervals for each circle
- **Birthday Tracking**: Never miss a birthday with automatic notifications
- **PWA Support**: Installable on mobile devices with offline capabilities
- **Theme System**: Light, dark, and auto themes based on system preferences
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## Architecture Transformation

The application has undergone a significant architectural transformation from a monolithic structure to a modular, maintainable system:

### From Monolithic to Modular

**Previous Architecture:**
- All functionality contained within a single large component
- Tight coupling between UI and business logic
- Difficult to maintain and extend
- Limited code reusability

**Current Modular Architecture:**
- Separation of concerns through custom hooks
- Centralized state management with React Context
- Reusable UI components
- Service layer for API interactions
- Utility functions for business logic

## Quick Start

### Using Docker (Recommended)

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd nudge
   ```

2. Start the application with Docker Compose:
   ```bash
   docker-compose up
   ```

3. Access the app at: `http://localhost:8765`

### Manual Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Or build for production:
   ```bash
   npm run build
   npm start
   ```

## Project Structure

```
nudge/
├── public/                 # Static assets
├── src/
│   ├── components/         # Reusable UI components
│   │   ├── common/        # Generic components (Button, Input)
│   │   ├── contacts/      # Contact-specific components
│   │   └── layout/        # Layout components
│   ├── context/           # React Context providers
│   ├── hooks/             # Custom hooks for business logic
│   ├── services/          # API and external service integrations
│   ├── styles/            # CSS and styling
│   └── utils/             # Utility functions
├── data/                  # Data storage (JSON file)
├── server.js              # Express server
└── package.json
```

## Data Storage

All application data is stored in `./data/data.json` on your host system, ensuring persistence across container restarts. This includes:

- Contact information
- Circle configurations
- User settings
- Notification preferences

## Development

### Prerequisites

- Node.js 16+ 
- npm or yarn
- Docker (optional, for containerized deployment)

### Development Scripts

- `npm run dev` - Start development server with hot reload
- `npm run server` - Start only the Express server
- `npm run client` - Start only the React development server
- `npm run build` - Build for production
- `npm start` - Start production server

### Environment Variables

- `PORT` - Server port (default: 8765)
- `NODE_ENV` - Environment mode (development/production)

## Production Deployment

### Docker Deployment

1. Build the Docker image:
   ```bash
   docker build -t nudge-app .
   ```

2. Run with Docker Compose:
   ```bash
   docker-compose up -d
   ```

### NAS Deployment

The application is designed for easy deployment on Network Attached Storage (NAS) devices:

1. Copy all files to your NAS
2. Run `docker-compose up -d`
3. Configure port forwarding if needed
4. Access via your NAS IP address

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For issues and questions:
1. Check the [DOCUMENTATION.md](./DOCUMENTATION.md) for detailed technical information
2. Search existing issues
3. Create a new issue with detailed information