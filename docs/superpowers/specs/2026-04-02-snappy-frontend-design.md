# Snappy Frontend Design Specification

## Overview
A minimal "Hello World" frontend application scaffolded to provide a solid foundation for future development.

## Architecture & Tech Stack
- **Framework:** React
- **Language:** TypeScript
- **Bundler:** Vite
- **Package Manager:** pnpm
- **Styling:** Tailwind CSS
- **Code Quality:** ESLint, Prettier

## Components
- **Main Application Component (`App.tsx`):** A full-screen container that renders "Hello World" perfectly centered on the screen utilizing Tailwind CSS utility classes (e.g., `flex h-screen items-center justify-center`).

## Data Flow
- Static display only. No external data fetching or state management required for this initial phase.

## Testing & Quality
- The project will be strictly typed via TypeScript.
- Code style and formatting will be enforced via ESLint and Prettier.

## Out of Scope
- Backend integration, routing, or complex state management.
