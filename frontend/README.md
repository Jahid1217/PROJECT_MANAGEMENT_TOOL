# Kit Frontend - React + Vite + Tailwind CSS

A modern React frontend application built with Vite and Tailwind CSS for the Kit Project Management Tool.

## Features

- ⚡ **Vite** - Ultra-fast build tool and dev server
- ⚛️ **React 18** - Modern UI library with hooks
- 🎨 **Tailwind CSS** - Utility-first CSS framework
- 🔐 **JWT Authentication** - Secure API communication
- 🎯 **TypeScript** - Type-safe development
- 🍞 **Sonner Toasts** - Beautiful notifications
- ✨ **Framer Motion** - Smooth animations
- 📱 **Responsive Design** - Works on all devices

## Project Structure

```
frontend/
├── src/
│   ├── App.tsx              # Main application component
│   ├── main.tsx             # Application entry point
│   ├── index.css            # Global styles
│   ├── services/
│   │   └── geminiService.ts # AI integration service
│   └── store/
│       └── authStore.ts     # Authentication state management
├── public/                  # Static assets
├── package.json             # Dependencies
├── tsconfig.json            # TypeScript configuration
├── vite.config.ts           # Vite configuration
├── tailwind.config.js       # Tailwind CSS configuration
├── Dockerfile               # Container image for production
├── nginx.conf               # Nginx reverse proxy configuration
└── index.html               # HTML entry point
```

## Local Development

### Prerequisites

- **Node.js** 20+ (includes npm)
- A running backend API on `http://localhost:8080`

### Installation

1. Install dependencies:

```bash
cd frontend/
npm install
```

2. Start the development server:

```bash
npm run dev
```

3. Open your browser:
```
http://localhost:5173
```

## Build for Production

### Build the application:

```bash
npm run build
```

### Preview the production build:

```bash
npm run preview
```

The built artifacts will be in the `dist/` directory, ready to be served by Nginx.

## Available Scripts

### Development

```bash
npm run dev          # Start development server (Vite)
npm run preview      # Preview production build locally
```

### Build

```bash
npm run build        # Build for production
npm run build:ssr    # Build with SSR (if configured)
```

### Linting & Formatting

```bash
npm run lint         # Run ESLint
npm run format       # Format code with Prettier (if configured)
```

### Type Checking

```bash
npm run type-check   # Run TypeScript type checker
```

## Running with Docker

### Build the Docker image:

```bash
docker build -t kit-frontend .
```

### Run the container:

```bash
docker run -p 3000:3000 kit-frontend
```

Access the app at: `http://localhost:3000`

### Using Docker Compose (from root directory):

```bash
docker-compose up frontend
```

## API Communication

The frontend communicates with the backend API at:
- **Development:** `http://localhost:8080/api`
- **Production:** Proxied through Nginx to `/api`

### Authentication Flow

1. User logs in via `/api/auth/login`
2. Backend returns JWT token
3. Token stored in localStorage
4. All subsequent requests include `Authorization: Bearer {token}` header
5. Automatic logout on token expiration

## Environment Variables

Create a `.env.local` file in the `frontend/` directory:

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:8080/api
VITE_APP_NAME=Kit Project Tool

# Feature Flags
VITE_ENABLE_NOTIFICATIONS=true
```

## Nginx Configuration

The `nginx.conf` file is used in production (Docker) to:
- Serve static files from `/dist`
- Proxy API calls from `/api/*` to the backend service
- Handle client-side routing for React SPA
- Provide security headers

### Key Nginx Features

```nginx
# API reverse proxy
location /api/ {
    proxy_pass http://backend:8080;
}

# React SPA routing
location / {
    try_files $uri $uri/ /index.html;
}
```

## Performance Tips

### Development

- Use React DevTools browser extension for debugging
- Enable Fast Refresh for instant updates
- Monitor bundle size with `vite analyze`

### Production

- Code is automatically code-split by Vite
- CSS is minified and optimized
- Assets are cached browser-side

## Common Issues

### CORS Errors

If you see CORS errors when calling the API:

1. Check backend is running on port 8080
2. Verify authentication token is valid
3. Check `Access-Control-Allow-Origin` headers from backend

### Development Server Not Starting

```bash
# Clear node_modules and reinstall
rm -r node_modules package-lock.json
npm install
npm run dev
```

### Port 5173 Already in Use

```bash
npm run dev -- --port 3001
```

## Browser Compatibility

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

## Debugging

### React DevTools
- Install [React DevTools](https://chrome.google.com/webstore/detail/react-developer-tools/) browser extension

### Redux DevTools (if using Redux)
- Install [Redux DevTools](https://chrome.google.com/webstore/detail/redux-devtools/) extension

### Network Debugging
- Use browser DevTools Network tab to inspect API calls
- Check cookies and authentication headers

## Learn More

- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)
- [TypeScript Handbook](https://www.typescriptlang.org/)

## Contributing

When contributing to the frontend:

1. Follow the existing code style
2. Use TypeScript for new components
3. Test components locally before pushing
4. Update this README for new features

## Troubleshooting

### Installation Issues

```bash
# Clear npm cache
npm cache clean --force

# Reinstall dependencies
rm -r node_modules package-lock.json
npm install
```

### Build Issues

```bash
# Check for TypeScript errors
npm run type-check

# Check for linting errors
npm run lint

# Rebuild from scratch
npm run clean
npm install
npm run build
```

### Runtime Errors

Check the browser console and network tab in DevTools for:
- API response errors
- Missing environment variables
- Authentication token issues

## Support

For issues or questions:
1. Check existing GitHub issues
2. Review the [main README](../README.md)
3. Consult [DESIGN.md](../DESIGN.md) for architecture details
