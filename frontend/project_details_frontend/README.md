# Deal Aggregator Frontend

A modern, responsive Next.js application that provides a user interface for discovering and analyzing business acquisition opportunities. Built with React, TypeScript, and Tailwind CSS, this frontend delivers a seamless experience for users to find, track, and analyze potential business deals.

## Features

- **Modern Tech Stack**
  - Next.js 13+ with App Router
  - React with TypeScript
  - Tailwind CSS for styling
  - Framer Motion for animations
  - Clerk for authentication

- **Key Functionality**
  - Deal discovery and filtering
  - AI-powered deal analysis
  - Real-time alerts and notifications
  - Interactive dashboards
  - Deal comparison tools
  - ROI calculator
  - Custom deal tracking

## Core Components

- **Deal Discovery**
  - Automated deal sourcing from multiple platforms
  - Smart filtering and search capabilities
  - Early access to new listings

- **Analysis Tools**
  - AI-powered deal analysis
  - Market comparables
  - Risk assessment
  - Performance tracking
  - Tech stack evaluation

- **User Experience**
  - Responsive design
  - Animated transitions
  - Intuitive navigation
  - Real-time updates

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
Create a `.env.local` file with:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_key
```

3. Run development server:
```bash
npm run dev
```

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build production version
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript checks

### Key Directories

- `src/app` - Next.js pages and routing
- `src/components` - React components
- `src/lib` - Utilities and helpers
- `src/constants` - Application constants

## Architecture

The frontend follows a component-based architecture with:

- Modular components for reusability
- Type-safe development with TypeScript
- Server-side rendering with Next.js
- Responsive design with Tailwind CSS
- Smooth animations with Framer Motion

## Design System

- Consistent color scheme using Tailwind's color palette
- Responsive typography
- Component-based design patterns
- Animated transitions and interactions
- Mobile-first approach

## Authentication

User authentication is handled through Clerk, providing:
- Secure sign-up/sign-in
- Session management
- Protected routes
- User profile management

## State Management

- Server-side state with Next.js
- Client-side state with React hooks
- Real-time updates via Supabase

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

[License Type] - See LICENSE file for details
