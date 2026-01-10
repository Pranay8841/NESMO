# NESMO Portal Development Guide

## Project Overview
NESMO Portal is an alumni management platform with membership management, event registration, payment processing, and helpline services. Built as a monorepo with separate backend (Express/MongoDB) and frontend (React/TypeScript/Vite).

## Architecture

### Backend Structure (Node.js + Express + MongoDB)
- **Entry Point**: [backend/src/app.js](backend/src/app.js) - Initializes Express, CORS, Passport, and connects to MongoDB
- **ES Modules**: Project uses `"type": "module"` - always use `import/export` syntax
- **Route Prefix**: All API routes are mounted under `/api/*` (e.g., `/api/auth`, `/api/membership`, `/api/events`)
- **Environment**: [backend/src/config/env.js](backend/src/config/env.js) loads `.env` from backend root using ESM-compatible path resolution

### Authentication & Authorization Pattern
- **JWT-based auth** with Bearer token in Authorization header
- **Middleware**: [backend/src/middleware/auth.js](backend/src/middleware/auth.js)
  - `protect`: Validates JWT, checks user status (blocks if `BLOCKED`)
  - `authorize(...roles)`: Role-based access control (VISITOR, MEMBER, EVENT_LEAD, ADMIN)
- **OAuth**: Google OAuth via Passport.js - links existing accounts by email or creates new ones
- **User Model**: [backend/src/models/user.js](backend/src/models/user.js) - Has separate `User` and `Profile` models (1:1 relationship)

### User Roles & Status
- **Roles**: `VISITOR` (default) → `MEMBER` (after payment) → `EVENT_LEAD` or `ADMIN`
- **Status**: `ACTIVE` or `BLOCKED` (separate from role)
- **Admin Bootstrap**: One-time setup via `/api/admin/bootstrap` (no auth required, should be removed in production)

### Payment Integration (Razorpay)
- **Flow**: Create order → Frontend integration → Verify signature server-side
- **Signature Verification**: Uses HMAC SHA256 with `orderId|paymentId` format
- **Membership**: Single plan `ANNUAL` at ₹500 for 365 days (see [backend/src/config/membershipPlans.js](backend/src/config/membershipPlans.js))

### File Uploads (Cloudinary)
- **Middleware**: Uses `express-fileupload` with temp files
- **Helper**: [backend/src/utils/imageUploader.js](backend/src/utils/imageUploader.js) - Uploads to Cloudinary with folder, height, quality options
- **Config**: [backend/src/config/cloudinary.js](backend/src/config/cloudinary.js)

### Notification System
- **Service**: [backend/src/service/notification.js](backend/src/service/notification.js) - Batch creates notifications for multiple recipients
- **Model**: [backend/src/models/notification.js](backend/src/models/notification.js) - Stores in-app notifications with type, link, meta fields

### Frontend Structure (React 19 + TypeScript + Vite)
- **Router**: React Router v7 with Layout wrapper ([frontend/src/App.tsx](frontend/src/App.tsx))
- **Layout**: [frontend/src/components/Layout.tsx](frontend/src/components/Layout.tsx) - Navbar + Outlet + Footer structure
- **Styling**: Tailwind CSS v4 (configured with PostCSS)
- **Icons**: `lucide-react` package
- **Type Safety**: Explicit `JSX.Element` return types in all components

## Development Workflows

### Starting Development
```bash
# Backend (from root or backend/)
cd backend
npm run dev  # Uses nodemon to watch src/app.js

# Frontend (from root or frontend/)
cd frontend
npm run dev  # Vite dev server with HMR
```

### Database Indexes
Models define indexes for frequently queried fields:
- Profile: `currentAddress`, `occupation`, `jnvBatch`, `bloodGroup`
- User: `email` (unique), `googleId` (unique, sparse)

### Error Handling Pattern
Controllers return JSON with `{ message: "..." }` for errors. Common status codes:
- `400`: Invalid input/bad request
- `401`: Unauthorized (missing/invalid token)
- `403`: Forbidden (blocked account or insufficient role)
- `500`: Internal server error

## Key Conventions

### Backend
- **No TypeScript in runtime**: DevDependencies include TS types but backend runs plain JS with ES modules
- **Password Security**: User password field has `select: false` - must explicitly select in queries
- **Mongoose ObjectId**: Always use `mongoose.Schema.Types.ObjectId` for references
- **Route Protection**: Admin routes MUST use both `protect` and `authorize("ADMIN")` middleware

### Frontend
- **Component Structure**: Group related components in subdirectories (e.g., `About/`, `LandingPage/`)
- **JSX Return Type**: Always annotate function return as `JSX.Element`
- **Responsive Design**: Use Tailwind's responsive prefixes (`sm:`, `md:`, `lg:`) consistently

## External Integrations
- **MongoDB**: Connection via Mongoose with async startup pattern
- **Cloudinary**: Media storage for profile photos, event images, albums
- **Razorpay**: Payment gateway (test/live mode via env variables)
- **Google OAuth**: Optional authentication provider (config in passport.js)

## Critical Files Reference
- User & Profile schemas: [backend/src/models/user.js](backend/src/models/user.js), [backend/src/models/profile.js](backend/src/models/profile.js)
- Auth middleware: [backend/src/middleware/auth.js](backend/src/middleware/auth.js)
- Admin routes: [backend/src/routes/admin.js](backend/src/routes/admin.js) - Bootstrap, user management, payments, news
- Membership controller: [backend/src/controllers/membership.js](backend/src/controllers/membership.js)

## Environment Variables Required
Backend `.env` must include:
- `PORT`, `JWT_SECRET`
- `MONGO_URI`
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
- `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` (optional)
