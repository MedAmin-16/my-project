# CyberHunt Bug Bounty Platform

## Overview

CyberHunt is a comprehensive bug bounty platform that gamifies cybersecurity vulnerability discovery. The platform connects security researchers with organizations seeking to improve their security posture through a modern, interactive web application built with React and TypeScript.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **Styling**: Tailwind CSS with custom cyberpunk/matrix theme
- **State Management**: React Query for server state management
- **Forms**: React Hook Form with Zod validation
- **UI Components**: Custom component library with Radix UI primitives
- **Build Tool**: Vite for fast development and optimized builds

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Passport.js with session-based auth
- **Security**: Helmet for security headers, rate limiting, CSRF protection
- **File Processing**: Custom vulnerability grading system
- **Email Service**: SendGrid for transactional emails
- **Payment Processing**: Stripe for financial transactions

### Database Schema
- **Users**: Support for both hackers and companies with role-based access
- **Programs**: Bug bounty programs with reward tiers
- **Submissions**: Vulnerability reports with status tracking
- **Activities**: User activity logging and gamification
- **Notifications**: Real-time notification system
- **Wallets**: Financial management for companies and researchers

## Key Components

### Authentication System
- Multi-strategy authentication (local, Google, GitHub, Microsoft)
- Role-based access control (hacker, company, admin)
- Email verification and password reset flows
- Session management with secure cookie handling

### Gamification Engine
- Achievement badges and reputation system
- Leaderboards with multiple ranking criteria
- Activity tracking and progress visualization
- Rank progression system (Newbie → Elite Hunter)

### Vulnerability Management
- Automated vulnerability grading system
- CVSS score calculation
- Severity classification (SV1-SV4)
- Status tracking (Pending → Accepted → Resolved)

### Payment System
- Stripe integration for secure payments
- Company wallet management
- Automated payout processing
- Commission calculation and tracking

### Security Features
- Input validation and sanitization
- Rate limiting on sensitive endpoints
- Encrypted sensitive data storage
- HTTPS enforcement and security headers

## Data Flow

1. **User Registration**: Users choose between hacker or company roles
2. **Program Creation**: Companies create bug bounty programs with reward tiers
3. **Vulnerability Submission**: Researchers submit findings through structured forms
4. **Automated Grading**: System evaluates submissions using predefined criteria
5. **Review Process**: Companies review and validate submissions
6. **Reward Distribution**: Approved submissions trigger automated payouts
7. **Gamification Updates**: User achievements and rankings updated in real-time

## External Dependencies

### Core Services
- **Neon Database**: PostgreSQL hosting with connection pooling
- **SendGrid**: Email delivery service for notifications
- **Stripe**: Payment processing and financial transactions
- **Replit Database**: Fallback storage for session management

### Development Tools
- **Drizzle Kit**: Database migrations and schema management
- **ESBuild**: Fast JavaScript bundling for production
- **PostCSS**: CSS processing with Tailwind CSS

## Deployment Strategy

### Development Environment
- **Runtime**: Node.js 20 with ES modules
- **Dev Server**: Vite dev server with HMR
- **Database**: PostgreSQL with SSL connection
- **Session Storage**: Memory store for development

### Production Environment
- **Build Process**: Vite build + ESBuild for server bundling
- **Deployment**: Replit autoscale deployment
- **Database**: Neon PostgreSQL with connection pooling
- **Static Assets**: Served through Express with caching

### Security Considerations
- Environment variable management for sensitive data
- SSL/TLS encryption for all communications
- Secure session configuration with proper expiration
- Content Security Policy implementation

## Changelog

- June 26, 2025. Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.