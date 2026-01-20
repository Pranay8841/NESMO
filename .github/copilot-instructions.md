# NESMO Portal - AI Agent Guide

## Architecture Overview
Monorepo alumni platform: `backend/` (Express 5 + MongoDB + ES Modules) and `frontend/` (React 19 + TypeScript + Vite).

**Critical**: Backend uses ES Modules (`"type": "module"`) — always use `import/export`, never `require()`.

## Quick Start
```bash
cd backend && npm run dev   # Express on :5000, nodemon watches src/app.js
cd frontend && npm run dev  # Vite on :5173 with HMR
```

## Backend Patterns

### Route Structure
All routes mount under `/api/*` in [backend/src/app.js](backend/src/app.js):
```javascript
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);  // Protected: protect + authorize("ADMIN")
app.use("/api/profile", profileRoutes);
app.use("/api/membership", membershipRoutes);
app.use("/api/events", eventRoutes);
```

### Auth Middleware ([backend/src/middleware/auth.js](backend/src/middleware/auth.js))
```javascript
// Protected route pattern
router.get("/resource", protect, someController);
// Admin-only pattern (use router-level middleware for entire file)
router.use(protect);
router.use(authorize("ADMIN"));
```
- `protect`: Validates JWT Bearer token, attaches `req.user = { id, role }`, blocks `BLOCKED` users
- `authorize(...roles)`: Roles are `VISITOR`, `MEMBER`, `EVENT_LEAD`, `ADMIN`

### Model Conventions
- Password uses `select: false` — include explicitly: `User.findOne({ email }).select("+password")`
- User ↔ Profile: 1:1 relationship via `profile: ObjectId` reference (separate collections)
- All models use `{ timestamps: true }` for `createdAt`/`updatedAt`

### Controller Response Pattern
Always return `{ message: "..." }` JSON:
```javascript
res.status(400).json({ message: "Invalid input" });    // 400 bad input
res.status(401).json({ message: "Not authorized" });   // 401 no/invalid token
res.status(403).json({ message: "Account blocked" });  // 403 blocked/unauthorized
res.status(500).json({ message: "Internal error" });   // 500 server error
```

### File Uploads
Use `express-fileupload` (configured in app.js) → `uploadImageToCloudinary()` from [backend/src/utils/imageUploader.js](backend/src/utils/imageUploader.js):
```javascript
import uploadImageToCloudinary from "../utils/imageUploader.js";
const result = await uploadImageToCloudinary(req.files.image, "folder-name");
```

## Frontend Patterns

### Redux State ([frontend/src/redux/](frontend/src/redux/))
```typescript
import { useAppSelector, useAppDispatch } from '../redux/hooks';
const { user, token } = useAppSelector(state => state.auth);
```
- Token persisted to `localStorage` as JSON string
- Use `createAsyncThunk` for async actions in `services/` (see [authService.ts](frontend/src/services/authService.ts))

### API Layer (CRITICAL)
1. Define endpoints in [frontend/src/utils/api.ts](frontend/src/utils/api.ts) — never hardcode URLs
2. Use `apiConnector(method, url, body, headers, params)` from [APIsConnector.ts](frontend/src/utils/APIsConnector.ts)
3. Services dispatch Redux actions and show toasts via `react-hot-toast`

```typescript
// Correct pattern in services
const response = await apiConnector('POST', USER_API.LOGIN, credentials);
dispatch(setToken(response.data.token));
localStorage.setItem('token', JSON.stringify(response.data.token));
```

### Component Organization
- Feature-grouped: `components/Dashboard/`, `components/Authentication/`, `components/LandingPage/`
- Pages in `pages/` use components, handle routing
- Icons: `lucide-react` package
- Styling: Tailwind CSS v4 (PostCSS integration)

## Key Domain Logic

### User Lifecycle & Roles
`VISITOR` (signup) → pay membership → `MEMBER` → can be promoted to `EVENT_LEAD` or `ADMIN`

User status: `ACTIVE` or `BLOCKED` (blocked users get 403 on all protected routes)

### Razorpay Payment Flow
1. Backend creates order via `razorpay.orders.create()` → returns `orderId`
2. Frontend opens Razorpay checkout modal
3. Backend verifies: `HMAC_SHA256(orderId|paymentId, secret) === signature`

See [backend/src/controllers/membership.js](backend/src/controllers/membership.js) for implementation.

### OAuth (Google)
Passport.js configured in [backend/src/config/passport.js](backend/src/config/passport.js). Callback redirects to frontend `/oauth/success` or `/oauth/error`.

## Environment Variables
**Backend** (`backend/.env`):
- `PORT`, `JWT_SECRET`, `MONGO_URI`
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
- `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` (optional)

**Frontend** (`frontend/.env`):
- `VITE_API_URL` (default: `http://localhost:5000/api`)
- `VITE_RAZORPAY_KEY_ID`

## Adding New Features Checklist
1. **Backend**: Model → Controller → Route (import in app.js) → Add auth middleware as needed
2. **Frontend**: Add endpoint to `api.ts` → Create service with thunk → Add Redux slice if new state → Build component
