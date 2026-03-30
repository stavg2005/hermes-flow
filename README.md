Hermes-Flow Client

The frontend application for the Hermes-Flow Audio Over IP system. This client provides a modern, node-based, drag-and-drop web interface that allows operators to configure, manage, and monitor real-time audio processing graphs without writing any code.

Key Features

Visual Workflow Builder: Build complex audio processing and routing workflows using an intuitive drag-and-drop node interface.

Real-Time Monitoring: Track active audio sessions and DSP engine status via WebSocket integration.

Media Management: Upload and manage audio files directly from the browser, integrated with the Node.js middleware and MinIO storage layer.

Dynamic Node Configuration: Adjust parameters for DSP components (e.g., Mixers, Pitch Shifters, File Inputs) on the fly.

Responsive UI: Built with a clean, technology-focused design tailored for operational environments.

Tech Stack

Framework: React

Language: TypeScript

Build Tool: Vite

Styling: Tailwind CSS

State Management: Redux Toolkit

Component Library: shadcn/ui (Radix UI primitives)

Prerequisites

Node.js (v18 or higher recommended)

npm (Node Package Manager)

Installation and Setup

Install the project dependencies:

npm install


Configure your environment variables. Create a .env.development file in the root directory based on the provided .env.example file:

VITE_API_URL=http://localhost:3000
VITE_WS_URL=ws://localhost:8080
VITE_MINIO_URL=http://localhost:9000


Start the development server:

npm run dev


Open your browser and navigate to the URL provided by Vite (typically http://localhost:5173).

Available Scripts

npm run dev: Starts the local development server with Hot Module Replacement (HMR).

npm run build: Compiles the TypeScript code and builds the application for production into the dist folder.

npm run lint: Runs ESLint to analyze the code for potential errors and style violations.

npm run preview: Boots up a local web server to serve the production build created by npm run build.

Project Structure

The project follows a feature-sliced design architecture to maintain modularity and scalability:

/src/app: Global application setup, Redux store configuration, and main entry points.

/src/components: Reusable, generic UI components (e.g., buttons, modals, dropdowns).

/src/features: Domain-specific modules containing their own components, hooks, and types (e.g., flow, nodes).

/src/hooks: Global custom React hooks.

/src/lib: Utility functions and generic API wrappers.

/src/store: Redux slices for global state management.

/src/config: Application-wide configuration and environment variable validation.

Development Guidelines

Typing: Ensure all new components and functions are strictly typed using TypeScript interfaces or types.

Styling: Use Tailwind CSS utility classes for styling. Avoid writing custom CSS files unless absolutely necessary.

State: Keep component state local where possible. Use Redux primarily for global state that needs to be accessed across different feature modules.
