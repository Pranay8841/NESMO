# NESMO Portal - AI Agent Guide

## Architecture Overview
Monorepo alumni platform: `backend/` (Express + MongoDB + ES Modules) and `frontend/` (React 19 + TypeScript + Vite).

**Critical**: Backend uses ES Modules (`"type": "module"`) — always use `import/export`, never `require()`.

## Quick Start
```bash
cd backend && npm run dev   # Express on :5000, watches src/app.js
cd frontend && npm run dev  # Vite on :5173 with HMR
```

## Backend Patterns

### Route Structure
All routes mount under `/api/*` in [backend/src/app.js](backend/src/app.js):
```javascript
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);  // Protected: protect + authorize("ADMIN")
```

### Auth Middleware (backend/src/middleware/auth.js)
```javascript
// Protected route pattern
router.get("/resource", protect, someController);
// Admin-only pattern
router.patch("/admin-action", protect, authorize("ADMIN"), adminController);
```
- `protect`: Validates JWT Bearer token, blocks if user status is `BLOCKED`
- `authorize(...roles)`: Checks role is one of: `VISITOR`, `MEMBER`, `EVENT_LEAD`, `ADMIN`

### User Model Gotcha
Password field uses `select: false` — explicitly include when needed:
```javascript
const user = await User.findOne({ email }).select("+password");
```

### Error Response Pattern
Always return `{ message: "..." }` with appropriate status:
- `400` bad input, `401` no/invalid token, `403` blocked/unauthorized role, `500` server error

### File Uploads
Use `express-fileupload` → [backend/src/utils/imageUploader.js](backend/src/utils/imageUploader.js) → Cloudinary

## Frontend Patterns

### Redux State (frontend/src/redux/)
```typescript
import { useAppSelector, useAppDispatch } from '../redux/hooks';
const { user, token } = useAppSelector(state => state.auth);
```
- Token persisted to `localStorage` and synced to state
- Use `createAsyncThunk` in services (see [frontend/src/services/authService.ts](frontend/src/services/authService.ts))

### API Endpoints
All endpoints defined in [frontend/src/utils/api.ts](frontend/src/utils/api.ts) — add new endpoints there, not inline.
Use `apiConnector` from [frontend/src/utils/APIsConnector.ts](frontend/src/utils/APIsConnector.ts) for requests.

### Component Conventions
- Group by feature: `components/LandingPage/`, `components/Authentication/`
- Icons: `lucide-react` package
- Styling: Tailwind CSS v4

## Key Domain Logic

### User Lifecycle
`VISITOR` (signup) → pay membership → `MEMBER` → can be promoted to `EVENT_LEAD` or `ADMIN`

### Payment Flow (Razorpay)
1. Backend creates order → 2. Frontend opens Razorpay modal → 3. Backend verifies signature (HMAC SHA256: `orderId|paymentId`)

### Data Relationships
- `User` ↔ `Profile` (1:1, separate collections)
- User references Profile via `profile: ObjectId`

## Environment Variables
**Backend** (`backend/.env`): `PORT`, `JWT_SECRET`, `MONGO_URI`, `CLOUDINARY_*`, `RAZORPAY_*`, `GOOGLE_*` (optional)  
**Frontend** (`frontend/.env`): `VITE_API_URL` (default: http://localhost:5000/api), `VITE_RAZORPAY_KEY_ID`
