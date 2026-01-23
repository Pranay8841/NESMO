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
All routes mount under `/api/*` in `backend/src/app.js`. Add new routes by:
1. Creating route file in `backend/src/routes/`
2. Importing and mounting in app.js: `app.use("/api/newroute", newRoutes);`

### Auth Middleware (`backend/src/middleware/auth.js`)
```javascript
// Protected route pattern
router.get("/resource", protect, someController);
// Admin-only pattern (use router-level middleware for entire route file)
router.use(protect);
router.use(authorize("ADMIN"));
```
- `protect`: Validates JWT Bearer token, attaches `req.user = { id, role }`, blocks `BLOCKED` users with 403
- `authorize(...roles)`: Roles are `VISITOR`, `MEMBER`, `EVENT_LEAD`, `ADMIN`

### Model Conventions
- Password uses `select: false` — include explicitly: `User.findOne({ email }).select("+password")`
- User ↔ Profile: 1:1 relationship via `profile: ObjectId` reference (separate collections)
- Profile created first during registration, then linked to User
- All models use `{ timestamps: true }` for `createdAt`/`updatedAt`

### Controller Response Pattern
Always return `{ message: "..." }` JSON:
```javascript
res.status(400).json({ message: "Invalid input" });
res.status(401).json({ message: "Not authorized" });
res.status(403).json({ message: "Account blocked" });
res.status(500).json({ message: "Internal server error" });
```

### File Uploads
Use `express-fileupload` (configured in app.js with temp files) → `uploadImageToCloudinary()`:
```javascript
import uploadImageToCloudinary from "../utils/imageUploader.js";
const result = await uploadImageToCloudinary(req.files.image, "folder-name");
// Access: result.secure_url
```

## Frontend Patterns

### Redux State (`frontend/src/redux/`)
```typescript
import { useAppSelector, useAppDispatch } from '../redux/hooks';
const { user, token } = useAppSelector(state => state.auth);
```
- Token persisted to `localStorage` as **JSON string**: `JSON.stringify(token)`
- Slices: `authSlice` (user/token/loading/pendingVerificationEmail), `alumniSlice`, `profileSlice`
- Use `createAsyncThunk` for async actions in `services/`

### API Layer (CRITICAL)
1. Define ALL endpoints in `frontend/src/utils/api.ts` — never hardcode URLs
2. Use `apiConnector(method, url, body, headers, params)` from `frontend/src/utils/APIsConnector.ts`
3. Services dispatch Redux actions and show toasts via `react-hot-toast`

```typescript
// Service pattern (see authService.ts for full example)
const toastId = toast.loading('Loading...');
try {
  const response = await apiConnector('POST', USER_API.LOGIN, credentials);
  dispatch(setToken(response.data.token));
  localStorage.setItem('token', JSON.stringify(response.data.token));
  toast.success('Success!', { id: toastId });
} catch (error: any) {
  toast.error(error.response?.data?.message || 'Failed', { id: toastId });
}
```

### Component Organization
- Feature-grouped: `components/Dashboard/`, `components/Authentication/`, `components/LandingPage/`
- Pages in `pages/` consume components and handle routing
- Icons: `lucide-react` package
- Styling: Tailwind CSS v4 (PostCSS integration)

## Key Domain Logic

### User Lifecycle & Roles
- `VISITOR` (signup) → email verification required → pay membership → `MEMBER`
- Can be promoted to `EVENT_LEAD` or `ADMIN`
- User status: `ACTIVE` or `BLOCKED` (blocked users get 403 on all protected routes)

### Email Verification Flow
Registration creates user with `isEmailVerified: false` and sends verification email. User cannot login until verified. Frontend handles `EMAIL_NOT_VERIFIED` error code via `pendingVerificationEmail` state.

### Razorpay Payment Flow
1. Backend creates order via `razorpay.orders.create()` → returns `orderId`
2. Frontend opens Razorpay checkout modal with key from env
3. Backend verifies: `HMAC_SHA256(orderId|paymentId, secret) === signature`

### Admin Bootstrap
One-time admin creation via `POST /api/admin/bootstrap` (no auth required).

## Environment Variables
**Backend** (`backend/.env`): `PORT`, `JWT_SECRET`, `MONGO_URI`, `CLOUDINARY_*`, `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`

**Frontend** (`frontend/.env`): `VITE_API_URL` (default: `http://localhost:5000/api`), `VITE_RAZORPAY_KEY_ID`

## Adding New Features Checklist
1. **Backend**: Model (`models/`) → Controller (`controllers/`) → Route (`routes/`, import in app.js) → Add auth middleware
2. **Frontend**: Add endpoint to `api.ts` → Create service with thunk (`services/`) → Add Redux slice if needed → Build component
