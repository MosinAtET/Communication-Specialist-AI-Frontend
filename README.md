# Social Media AI Dashboard - Frontend

A modern React + TypeScript + Tailwind CSS dashboard for managing social media posts, comments, and AI responses.

## Features

- 📊 **Dashboard Overview** - Real-time stats and platform status
- 📅 **Scheduled Posts** - Manage and schedule social media posts
- 💬 **Comments Management** - Monitor and respond to comments
- 🎯 **Events Management** - Create and manage events
- 🤖 **AI Responses** - Configure AI response templates
- 📈 **Analytics** - View performance metrics
- 🔍 **Monitoring** - Real-time comment monitoring
- ⚙️ **Settings** - Application configuration

## Tech Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **React Router** - Navigation
- **Axios** - HTTP client
- **Lucide React** - Icons
- **Vite** - Build tool

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Backend API running on `http://localhost:8000`

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser and navigate to `http://localhost:5173`

### Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Project Structure

```
src/
├── components/          # Reusable UI components
│   └── Layout.tsx      # Main layout with sidebar
├── pages/              # Page components
│   └── Dashboard.tsx   # Main dashboard page
├── services/           # API services
│   └── api.ts         # API client and endpoints
├── types/              # TypeScript type definitions
│   └── index.ts       # Interface definitions
├── App.tsx            # Main app component with routing
├── main.tsx           # App entry point
└── index.css          # Global styles and Tailwind
```

## API Integration

The frontend communicates with the FastAPI backend through the following endpoints:

- `GET /dashboard/stats` - Dashboard statistics
- `GET /posts/scheduled` - Get scheduled posts
- `POST /posts/schedule` - Schedule a new post
- `GET /comments/pending` - Get pending comments
- `POST /comments/{id}/respond` - Respond to a comment
- `GET /events` - Get events
- `GET /platforms/status` - Get platform connection status

## Development

### Adding New Pages

1. Create a new component in `src/pages/`
2. Add the route to `src/App.tsx`
3. Add navigation item to `src/components/Layout.tsx`

### Styling

The project uses Tailwind CSS with custom components defined in `src/index.css`. Use the predefined classes:

- `.btn-primary` - Primary button style
- `.btn-secondary` - Secondary button style
- `.card` - Card container style
- `.input-field` - Input field style

### TypeScript

All API responses and component props are typed. Add new types to `src/types/index.ts` as needed.

## Environment Variables

Create a `.env` file in the frontend directory:

```env
VITE_API_BASE_URL=http://localhost:8000
```

## Contributing

1. Follow the existing code style
2. Add TypeScript types for new features
3. Use Tailwind CSS for styling
4. Test your changes thoroughly

## License

This project is part of the Social Media AI application.
