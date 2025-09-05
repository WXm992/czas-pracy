# Overview

This is a Polish time tracking and workforce management system designed for construction companies. The application manages employees, construction site managers, projects, equipment, and time tracking across multiple construction sites. Built with React, TypeScript, and modern web technologies, it provides comprehensive workforce management capabilities including credential tracking, equipment assignments, and detailed reporting.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **React with TypeScript**: Component-based architecture using React 18 with strict TypeScript configuration
- **UI Framework**: Shadcn/ui components built on Radix UI primitives for consistent, accessible design
- **Styling**: Tailwind CSS with CSS custom properties for theming and dark mode support
- **State Management**: React hooks and local state with React Query for server state management
- **Routing**: React Router for client-side navigation

## Component Structure
- **Form Components**: Reusable forms for employee, manager, and project management
- **Management Components**: Specialized components for equipment tracking, time management, and assignments
- **UI Components**: Complete Shadcn/ui library including cards, tables, dialogs, and form controls
- **Layout**: Tab-based interface for organizing different functional areas

## Data Storage Strategy
- **Local Storage**: Primary data persistence using browser localStorage for offline-first approach
- **Supabase Integration**: Configured for cloud database capabilities with equipment and user management tables
- **Hybrid Approach**: Local storage for core functionality with Supabase for advanced features like equipment tracking

## Key Features Architecture
- **Time Tracking**: Multi-employee time entry with project assignments and different work types
- **Equipment Management**: Complete lifecycle tracking including insurance, leasing, and maintenance
- **Employee Management**: Comprehensive profiles with credential tracking and project assignments
- **Project Management**: Construction site management with manager assignments and equipment allocation
- **Reporting**: Excel export capabilities and monthly reporting views

## Authentication & Authorization
- **User Management**: Role-based system with permissions for different access levels
- **Credential Tracking**: Employee certification and qualification management
- **Session Management**: Local storage-based session persistence

# External Dependencies

## Core Framework Dependencies
- **React & TypeScript**: Primary application framework with strict typing
- **Vite**: Build tool and development server for fast development experience
- **React Router**: Client-side routing for single-page application navigation

## UI & Styling
- **Shadcn/ui**: Complete component library built on Radix UI primitives
- **Tailwind CSS**: Utility-first CSS framework with custom design system
- **Radix UI**: Headless UI components for accessibility and interaction patterns
- **Lucide React**: Icon library for consistent iconography

## Data & State Management
- **Supabase**: Cloud database and authentication service
- **TanStack React Query**: Server state management and caching
- **React Hook Form**: Form state management with validation

## Utilities & Tools
- **date-fns**: Date manipulation and formatting library
- **XLSX**: Excel file generation for reports export
- **class-variance-authority**: Utility for component variant management
- **clsx & tailwind-merge**: CSS class composition utilities

## Development Tools
- **ESLint**: Code linting with React and TypeScript rules
- **PostCSS**: CSS processing with Tailwind CSS plugin
- **Lovable Tagger**: Development-time component identification

## Third-party Integrations
- **Neon Database**: Serverless PostgreSQL database for Supabase backend
- **WebSocket Support**: Real-time capabilities through Supabase
- **Excel Export**: Client-side spreadsheet generation for reporting