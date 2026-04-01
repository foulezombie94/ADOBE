# Obsidian Engine

A professional-grade web-based video editing engine built with React, TypeScript, and Vite. Obsidian Engine provides a high-performance interactive timeline, advanced color grading tools, and comprehensive audio mixing workspaces.

## Features

- **Interactive Timeline**: Real-time video/audio playback and editing with Framer Motion animations.
- **Advanced Color Grading**: Professional video scopes (Waveform, Parade), color wheels, and curves editor.
- **Audio Workspace**: Multi-channel mixer with waveform visualization and master channel controls.
- **Project Management**: System-level project tracking with status monitoring.
- **Export System**: Detailed export settings and progress tracking.

## Installation & Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```
2. **Launch development server**:
   ```bash
   npm run dev
   ```
3. **Build for production**:
   ```bash
   npm run build
   ```
4. **Typecheck**:
   ```bash
   npm run typecheck
   ```

## Project Structure

- `src/components`: Reusable UI components for layout, editing, and visualization.
- `src/pages`: Major workspace pages (Edit, Color, Audio, Export, Project Manager).
- `src/store`: Modularized Zustand stores for state management.
- `src/types`: Strict TypeScript definitions for timeline, media, and effects.
- `src/utils`: Helper functions for math, canvas drawing, and common utilities.
