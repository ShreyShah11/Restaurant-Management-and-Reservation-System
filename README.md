# Restaurant Management & Reservation System

A full-stack, enterprise-grade restaurant reservation platform that connects customers with restaurants, enabling seamless table bookings while providing restaurant owners with comprehensive management tools. The system implements a multi-tenant architecture with role-based access control for customers, restaurant owners, and administrators.

---

## Core Features & Functionality

### For Customers
- **Secure Authentication & Profiles** – JWT-based authentication with encrypted password management and secure session handling  
- **Advanced Restaurant Discovery** – Search and filter restaurants by cuisine, location, ratings, and availability with geo-location proximity search  
- **Intelligent Table Reservations** – Real-time table availability checking, multi-slot reservation system with secure token-based payment processing  
- **Reservation Management** – Complete reservation lifecycle tracking with status updates (confirmed, canceled, completed) and booking history  
- **Menu Browsing** – Dynamic menu exploration with dish details, categorization, dietary labels, and real-time availability status  
- **Reviews & Ratings System** – Authenticated review submissions linked to completed reservations, average rating calculations, and customer feedback aggregation  
- **Loyalty & Rewards Program** – Point accumulation and redemption system for repeat bookings (framework implemented)  

### For Restaurant Owners
- **Complete Restaurant Profile Management** – Add, update, and manage restaurant details including name, location, cuisine type, contact information, working hours, and table configurations  
- **Menu & Inventory Management** – Add, update, delete menu items with detailed attributes (name, description, cuisine type, availability status, pricing)  
- **Reservation & Table Management** – Centralized dashboard displaying all incoming reservations with customer details, booking status management, and real-time table allocation  
- **Business Analytics Dashboard** – Key performance metrics including total reservations, peak booking times, cancellation rates, and trend analysis with visual graphs/charts  
- **Walk-in & Waitlist Management** – Support for walk-in reservations and automated waitlist management with customer notifications  

### For System
- **Real-time Notifications** – WebSocket integration via Socket.io for instant reservation updates, availability alerts, and status changes  
- **Payment Integration** – Razorpay payment gateway integration for secure transaction processing and refund management  
- **AI-Powered Insights** – Review summarization and actionable suggestions for restaurant owners using Google Gemini AI SDK  
- **Geo-location Services** – Node-geocoder integration for location-based restaurant discovery and proximity searching  
- **Admin Management** – Super admin capabilities for account verification, platform monitoring, dispute resolution, and content moderation  

---

## Technical Architecture

### Frontend Architecture
- **Framework** – Next.js 16.0 with React 19.2.0 (App Router pattern)  
- **Styling & Components** – Tailwind CSS v4 with Radix UI component library (20+ accessible, unstyled components)  
- **State Management** – Zustand for lightweight, TypeScript-first global state management with persistence middleware  
- **Form Handling** – React Hook Form with Zod validation schema for end-to-end type safety  
- **HTTP Client** – Axios for API communication with request/response interceptors  
- **Real-time Communication** – Socket.io client for WebSocket-based live updates  
- **UI Enhancements** – Motion animations, Sonner toast notifications, Lucide React icons, Embla carousel, React Datepicker  
- **Type Safety** – Full TypeScript implementation with strict type checking  

### Backend Architecture
- **Runtime** – Node.js with Express.js 5.1.0 server framework  
- **Database** – MongoDB with Mongoose ODM for schema modeling and data validation  
- **Authentication & Security** – JWT (JSON Web Tokens) with bcrypt password hashing, role-based middleware (protectRoute, protectOwner)  
- **Rate Limiting** – express-rate-limit with Redis backend for DDoS protection and API throttling  
- **Caching & Sessions** – Redis integration for distributed caching and rate limit storage  
- **Email Service** – SendGrid integration (@sendgrid/mail) for transactional emails  
- **Payment Processing** – Razorpay SDK for secure payment gateway integration  
- **Real-time Updates** – Socket.io server for bi-directional communication  
- **Logging & Monitoring** – Winston logger with daily rotating file logs for production diagnostics  
- **AI Integration** – Vercel AI SDK with Google Gemini API for review analysis and suggestions  
- **Validation** – Zod schema validation for request payload verification  
- **Type Safety** – Full TypeScript with tsconfig-paths for path aliases  

---

## DevOps & Quality Assurance
- **Package Manager** – pnpm 10.22.0 for monorepo workspace management  
- **Testing** – Jest 30.2.0 with React Testing Library for unit and component testing  
- **Test Coverage** – HTML test reports and custom high-coverage reporting scripts  
- **Code Quality** – ESLint with TypeScript plugin, Prettier for code formatting  
- **Development Tools** – Nodemon for hot-reloading, Babel for transpilation  
- **Build & Compilation** – TypeScript compilation with tsc-alias for path resolution, Next.js build optimization  
- **CI/CD Ready** – Modular monorepo structure supporting automated testing and deployment  

---

## Database Schema Design
- **User Model** – Customer and owner authentication with role-based access  
- **Restaurant Model** – Complete restaurant entity with embedded address, opening hours, social media, and account information  
- **Menu Items** – Menu management with cuisine categorization and availability tracking  
- **Reservations** – Booking records with customer details, time slots, and status tracking  
- **Reviews** – Customer feedback linked to completed reservations  
- **Payments** – Transaction records with Razorpay integration  
- **Waitlist** – Queue management for unavailable time slots  

---

## Key Technical Achievements
- Monorepo Architecture with shared validation schemas using pnpm workspaces  
- End-to-end TypeScript implementation ensuring full type safety  
- Real-time synchronization using WebSocket-based updates  
- Scalable backend with Redis caching, rate limiting, and stateless API design  
- Mobile-first responsive UI with Tailwind CSS and Radix UI  
- Comprehensive testing with Jest and HTML reporting  
- Production-ready security with JWT authentication, bcrypt hashing, and input validation  
- AI-powered features using Gemini API for review analysis and recommendations  
- Clean modular architecture with separation of concerns  

---

## Tech Stack for Resume / Portfolio

### Frontend
- React 19.2.0 | Next.js 16.0 (App Router) | TypeScript 5  
- Tailwind CSS v4 | Radix UI Components  
- Zustand | React Hook Form + Zod  
- Axios | Socket.io Client  
- Jest | React Testing Library  
- Motion | Sonner | Lucide React  

### Backend
- Node.js | Express.js 5.1.0 | TypeScript  
- MongoDB | Mongoose ODM  
- JWT Authentication | Bcrypt  
- Redis (Caching & Rate Limiting)  
- Socket.io (Real-time Updates)  
- Razorpay (Payment Integration)  
- SendGrid (Email Service)  
- Google Gemini AI SDK  
- Winston Logging  

### DevOps & Tools
- pnpm (Monorepo Management)  
- Docker-ready | Nodemon | Babel  
- ESLint | Prettier  
- Jest + HTML Test Reports  
