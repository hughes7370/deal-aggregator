# Frontend Directory Structure

```
frontend/
├── src/                      # Main source code directory
│   ├── app/                  # Next.js app directory (pages and routing)
│   ├── components/           # React components
│   │   ├── alerts/          # Alert and notification components
│   │   ├── forms/           # Form-related components
│   │   ├── home/            # Homepage-specific components
│   │   ├── icons/           # Icon components
│   │   ├── layout/          # Layout components
│   │   ├── Header.tsx       # Main header component
│   │   ├── Footer.tsx       # Main footer component
│   │   └── Logo.tsx         # Logo component
│   ├── constants/           # Application constants
│   ├── lib/                 # Shared utilities and libraries
│   └── middleware.ts        # Next.js middleware configuration
├── public/                  # Static files (images, fonts, etc.)
├── project_details_frontend/# Project documentation
├── node_modules/           # Dependencies
├── .next/                  # Next.js build output
├── next.config.js         # Next.js configuration
├── package.json           # Project dependencies and scripts
├── tailwind.config.ts     # Tailwind CSS configuration
├── tsconfig.json          # TypeScript configuration
├── postcss.config.mjs     # PostCSS configuration
├── eslint.config.mjs      # ESLint configuration
└── next-env.d.ts         # Next.js TypeScript declarations
```

## Key Components

### Source Code (`src/`)
- `app/`: Next.js 13+ app directory containing pages and routing logic
- `components/`: Reusable React components organized by feature/type
  - `alerts/`: Notification and alert components
  - `forms/`: Form components and form-related utilities
  - `home/`: Components specific to the homepage
  - `icons/`: SVG icons and icon components
  - `layout/`: Layout components (containers, grids, etc.)
- `constants/`: Application-wide constants and configuration values
- `lib/`: Shared utilities, hooks, and helper functions

### Configuration Files
- `next.config.js`: Next.js framework configuration
- `tailwind.config.ts`: Tailwind CSS styling configuration
- `tsconfig.json`: TypeScript compiler options
- `postcss.config.mjs`: PostCSS plugins configuration
- `eslint.config.mjs`: ESLint rules and settings

### Build and Development
- `.next/`: Build output directory
- `node_modules/`: External dependencies
- `public/`: Static assets
- `package.json`: Project metadata and dependencies

## Component Organization

The components follow a hierarchical structure:
1. Layout Components: Base layout elements
2. Feature Components: Feature-specific implementations
3. Shared Components: Reusable across features
4. UI Components: Basic UI elements

## Styling

The project uses:
- Tailwind CSS for utility-first styling
- PostCSS for processing CSS
- CSS Modules for component-scoped styles

## Type System

TypeScript is used throughout the project with:
- Strict type checking enabled
- Path aliases configured
- Next.js type definitions included
