# Dreamweave

A dream-sharing platform where users can submit, share, and explore dreams with location-based insights.

## Features

- User authentication and profiles
- Submit dreams with location data
- Real-time feed of shared dreams
- Analytics dashboard with dream trends and location heatmaps
- Friend system for connecting with other users
- Badge system for achievements

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui
- **Backend**: Express.js, MongoDB Atlas, JWT authentication
- **Testing**: Playwright (e2e), Vitest (unit)
- **Deployment**: Vite build for static hosting

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or bun
- MongoDB Atlas account (for database)

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd noctis-night-feed
   ```

2. Install frontend dependencies:
   ```bash
   npm install
   ```

3. Install backend dependencies:
   ```bash
   cd backend
   npm install
   ```

4. Set up environment variables:
   - Copy `backend/.env.example` to `backend/.env`
   - Configure your MongoDB connection string and JWT secret

5. Start the backend server:
   ```bash
   cd backend
   node server.js
   ```

6. In a new terminal, start the frontend development server:
   ```bash
   cd noctis-night-feed
   npm run dev
   ```

7. Open [http://localhost:8080](http://localhost:8080) in your browser

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm test` - Run unit tests with Vitest
- `npx playwright test` - Run end-to-end tests

### Project Structure

```
noctis-night-feed/
├── src/
│   ├── components/     # Reusable UI components
│   ├── pages/         # Page components
│   ├── services/      # API service functions
│   ├── types/         # TypeScript type definitions
│   └── test/          # Test files
├── backend/           # Express.js server
│   ├── controllers/   # Route controllers
│   ├── models/        # MongoDB models
│   ├── routes/        # API routes
│   └── middleware/    # Custom middleware
└── public/            # Static assets
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.
