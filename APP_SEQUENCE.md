# FinGuard App - Complete Communication Sequence

## Overview
This document explains the complete flow of how data moves through the FinGuard application, from user interaction to database and back.

---

## 1. USER LOGIN FLOW (Step by Step)

### Step 1: User Opens Login Page
```
Browser → Vite App Loads → App.tsx → Router → <Route path="/login" element={<Login />} />
```

### Step 2: User Enters Credentials & Clicks Submit
```
Login.tsx (React Component)
├─ User types email & password
├─ Component stores in local state: { email, password }
└─ User clicks "Sign In" button
   └─ handleSubmit() function triggers
```

### Step 3: Dispatch Redux Action
```
Login.tsx (Component)
  ↓
dispatch(login(credentials))  // Redux Thunk
  ↓
authSlice.ts (Redux Store)
```

**Code Example:**
```typescript
// Login.tsx
const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  const result = await dispatch(login(form));  // ← STARTS HERE
  if (login.fulfilled.match(result)) navigate('/dashboard');
};
```

### Step 4: Redux Calls Auth Service
```
authSlice.ts (Redux Thunk - login function)
  ↓
loginUser(credentials)  // Function call
  ↓
authService.ts (Authentication Service)
```

**Code Example:**
```typescript
// authSlice.ts
export const login = createAsyncThunk(
  'auth/login', 
  async (credentials: LoginCredentials, { rejectWithValue }) => {
    try {
      return await loginUser(credentials);  // ← CALLS authService
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Login failed');
    }
  }
);
```

### Step 5: Auth Service Makes HTTP Request
```
authService.ts (Service Layer)
  ↓
api.post('/auth/login', credentials)  // HTTP POST
  ↓
api.ts (Axios Instance)
```

**Code Example:**
```typescript
// authService.ts
export const loginUser = async (credentials: LoginCredentials): Promise<User> => {
  const { data } = await api.post('/auth/login', credentials);  // ← HTTP REQUEST
  localStorage.setItem('user', JSON.stringify(data));
  return data;
};
```

### Step 6: API Instance Adds Authorization Header
```
api.ts (Axios Interceptor)
  ↓
Request Interceptor:
├─ Gets user from localStorage
├─ Extracts token
└─ Adds header: "Authorization: Bearer <token>"
  ↓
HTTP POST Request Sent
```

**Code Example:**
```typescript
// api.ts
api.interceptors.request.use((config) => {
  const user = localStorage.getItem('user');
  if (user) {
    const { token } = JSON.parse(user);
    config.headers.Authorization = `Bearer ${token}`;  // ← ADDS TOKEN
  }
  return config;
});
```

### Step 7: HTTP Request Sent to Backend
```
FRONTEND ───────────────────────────> BACKEND
HTTP POST: http://localhost:5000/api/auth/login
Body: { email: "user@example.com", password: "password123" }
```

### Step 8: Backend Server Receives Request
```
Backend Server (Node.js/Express)
  ↓
index.ts (Express App)
  ↓
app.use('/api/auth', authRoutes)  // Routes request
  ↓
auth.ts (Route Handler)
```

**Code Example:**
```typescript
// index.ts
app.use('/api/auth', authRoutes);  // ← REQUEST MATCHES THIS

// auth.ts
router.post('/login', login);  // ← CALLS login() from controller
```

### Step 9: Route Calls Controller
```
auth.ts (Routes)
  ↓
authController.ts (Business Logic)
  ↓
login() function
```

**Code Example:**
```typescript
// auth.ts
router.post('/login', login);  // Calls login() from authController

// authController.ts
export const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;  // ← RECEIVES CREDENTIALS
  // ... controller logic ...
};
```

### Step 10: Controller Queries Database
```
authController.ts (Login function)
  ↓
User.findOne({ email })  // MongoDB Query
  ↓
User.ts (Database Model)
  ↓
MongoDB Database
  ↓
Returns user document or null
```

**Code Example:**
```typescript
// authController.ts - login()
const user = await User.findOne({ email });  // ← DATABASE QUERY
if (!user) {
  res.status(401).json({ message: 'Invalid credentials' });
  return;
}
```

### Step 11: Controller Validates Password
```
authController.ts
  ↓
bcrypt.compare(password, user.password)
  ↓
Returns: true or false
```

**Code Example:**
```typescript
// authController.ts - login()
const match = await bcrypt.compare(password, user.password);  // ← VALIDATES
if (!match) {
  res.status(401).json({ message: 'Invalid credentials' });
  return;
}
```

### Step 12: Controller Generates JWT Token
```
authController.ts
  ↓
generateToken(user._id)
  ↓
jwt.sign({ id }, JWT_SECRET, { expiresIn: '7d' })
  ↓
Returns: signed JWT token
```

**Code Example:**
```typescript
// authController.ts
const generateToken = (id: string): string => {
  return jwt.sign({ id }, process.env.JWT_SECRET as string, {
    expiresIn: '7d',
  });
};
```

### Step 13: Controller Sends Response
```
authController.ts (login())
  ↓
res.json({
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  token: generateToken(user._id.toString())
})
  ↓
Sends JSON Response
```

### Step 14: HTTP Response Returns to Frontend
```
BACKEND ───────────────────────────> FRONTEND
HTTP 200 OK
Body: { 
  _id: "...", 
  name: "John", 
  email: "john@example.com",
  role: "user",
  token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Step 15: Auth Service Stores in localStorage
```
authService.ts (loginUser)
  ↓
localStorage.setItem('user', JSON.stringify(data))
  ↓
Browser localStorage
```

**Code Example:**
```typescript
// authService.ts - loginUser()
const { data } = await api.post('/auth/login', credentials);
localStorage.setItem('user', JSON.stringify(data));  // ← STORES DATA
return data;
```

### Step 16: Redux Updates State
```
authSlice.ts (login.fulfilled)
  ↓
state.loading = false
state.user = action.payload  // User data from backend
state.error = null
```

**Code Example:**
```typescript
// authSlice.ts - extraReducers
.addCase(login.fulfilled, (state, action) => { 
  state.loading = false; 
  state.user = action.payload;  // ← STATE UPDATED
})
```

### Step 17: Component Re-renders with New State
```
Login.tsx (Component)
  ↓
useSelector reads updated Redux state
  ↓
Component re-renders
```

### Step 18: Navigate to Dashboard
```
Login.tsx (handleSubmit)
  ↓
if (login.fulfilled.match(result)) navigate('/dashboard')
  ↓
Browser navigates to /dashboard
  ↓
Dashboard component loads
  ↓
useSelector reads state.auth.user
  ↓
Displays user's dashboard
```

---

## 2. COMPLETE SEQUENCE DIAGRAM

```
┌─────────────┐
│    User     │
└──────┬──────┘
       │ 1. Enters credentials & clicks submit
       ↓
┌─────────────────────┐
│   Login.tsx         │
│  (React Component)  │
└──────┬──────────────┘
       │ 2. dispatch(login(credentials))
       ↓
┌──────────────────────┐
│  authSlice.ts        │
│  (Redux - Thunk)     │
└──────┬───────────────┘
       │ 3. await loginUser(credentials)
       ↓
┌──────────────────────┐
│  authService.ts      │
│  (Service Layer)     │
└──────┬───────────────┘
       │ 4. api.post('/auth/login', credentials)
       ↓
┌──────────────────────┐
│   api.ts             │
│  (Axios Instance)    │
│  + Interceptor       │
└──────┬───────────────┘
       │ 5. Adds Authorization header
       │    (JWT token from localStorage)
       ↓
╔══════════════════════════════════════════════════════════════════╗
║                    NETWORK REQUEST                              ║
║  HTTP POST: http://localhost:5000/api/auth/login                ║
║  Headers: { Authorization: "Bearer <token>" }                   ║
║  Body: { email: "...", password: "..." }                        ║
╚══════════════════════════════════════════════════════════════════╝
       ↓
┌──────────────────────┐
│  index.ts            │
│  (Express Server)    │
└──────┬───────────────┘
       │ 6. Routes request
       ↓
┌──────────────────────┐
│  auth.ts             │
│  (Route Handler)     │
└──────┬───────────────┘
       │ 7. router.post('/login', login)
       ↓
┌────────────────────────────┐
│  authController.ts         │
│  (Business Logic)          │
└──────┬─────────────────────┘
       │ 8. const user = await User.findOne({ email })
       ↓
┌────────────────────────────┐
│  User.ts (Model)           │
│  MongoDB Database          │
└──────┬─────────────────────┘
       │ 9. Returns user document
       ↓
┌────────────────────────────┐
│  authController.ts         │
│  (Validate password)       │
└──────┬─────────────────────┘
       │ 10. bcrypt.compare(password, hashed)
       │     if match: generate JWT
       ↓
┌────────────────────────────┐
│  Send Response             │
│  res.json({                │
│    _id, name, email,       │
│    role, token             │
│  })                        │
└──────┬─────────────────────┘
       │
╔══════════════════════════════════════════════════════════════════╗
║                    NETWORK RESPONSE                             ║
║  HTTP 200 OK                                                    ║
║  Body: { _id, name, email, role, token }                        ║
╚══════════════════════════════════════════════════════════════════╝
       ↓
┌──────────────────────┐
│  authService.ts      │
│  (Service Layer)     │
└──────┬───────────────┘
       │ 11. localStorage.setItem('user', JSON.stringify(data))
       │     return data
       ↓
┌──────────────────────┐
│  authSlice.ts        │
│  (Redux - Thunk)     │
└──────┬───────────────┘
       │ 12. login.fulfilled action triggered
       │     state.user = response data
       ↓
┌──────────────────────┐
│  Redux Store         │
│  (Global State)      │
└──────┬───────────────┘
       │ 13. State updated
       ↓
┌──────────────────────┐
│  Login.tsx           │
│  (Component)         │
└──────┬───────────────┘
       │ 14. Re-renders with new state
       │     navigate('/dashboard')
       ↓
┌──────────────────────┐
│  Dashboard.tsx       │
│  (New Page)          │
└──────┬───────────────┘
       │ 15. Loads & displays user data
       │     from Redux state
       ↓
┌──────────────────────┐
│    User              │
│  (Logged In)         │
└──────────────────────┘
```

---

## 3. DATA STORAGE LOCATIONS

### Frontend (Client-side)
```
┌─────────────────────────────────────────────────────────┐
│                  FRONTEND DATA STORAGE                  │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  1. Redux Store (authSlice)                             │
│     ├─ state.user (current logged-in user)             │
│     ├─ state.loading (API call in progress?)           │
│     └─ state.error (any error message)                 │
│                                                         │
│  2. Browser localStorage                                │
│     └─ 'user' key stores: { _id, name, email, ..., token }
│        (persists across page refresh)                  │
│                                                         │
│  3. Component Local State (Login.tsx)                   │
│     └─ form: { email, password }                       │
│        (temporary, cleared on navigation)              │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Backend (Server-side)
```
┌─────────────────────────────────────────────────────────┐
│                  BACKEND DATA STORAGE                   │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  MongoDB Database                                       │
│  ├─ Users Collection                                    │
│  │  └─ Documents:                                       │
│  │     {                                                │
│  │       _id: ObjectId,                                 │
│  │       name: String,                                  │
│  │       email: String (unique),                        │
│  │       password: String (hashed with bcrypt),         │
│  │       role: String ('user', 'admin', etc)            │
│  │     }                                                │
│  │                                                     │
│  └─ Each request stores/retrieves from this database   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 4. TOKEN FLOW (JWT Authentication)

### How Token is Created
```
Backend (authController.ts)
  ↓
generateToken(user._id)
  ↓
jwt.sign(
  { id: user._id },           // Payload
  process.env.JWT_SECRET,     // Secret key
  { expiresIn: '7d' }         // Options
)
  ↓
Returns encrypted token string
  ↓
Example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY..."
```

### How Token is Stored
```
Backend Response
  ↓
{ _id, name, email, role, token }
  ↓
Frontend receives response
  ↓
authService.ts stores in localStorage
  ↓
localStorage.setItem('user', JSON.stringify(data))
```

### How Token is Used
```
Next API Request
  ↓
api.ts Interceptor runs:
  ├─ Gets user from localStorage
  ├─ Extracts: const { token } = JSON.parse(user)
  └─ Adds header: Authorization: "Bearer {token}"
  ↓
Example Header:
Authorization: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY..."
  ↓
Backend receives request with token
  ↓
authMiddleware validates token
  ↓
If valid: proceed to controller
If invalid: return 401 Unauthorized
```

---

## 5. ERROR HANDLING FLOW

### Frontend Error Handling
```
Try-Catch in Redux Thunk (authSlice.ts)
  ↓
dispatch(login(credentials))
  │
  ├─ Success → login.fulfilled action
  │           → state.user = data
  │           → navigate to /dashboard
  │
  └─ Error → login.rejected action
             → Catch block runs
             → rejectWithValue(err.response?.data?.message)
             → state.error = error message
             → Login component re-renders
             → Shows error message to user
```

### Backend Error Responses
```
authController.ts - Different scenarios

1. Email not found:
   res.status(401).json({ message: 'Invalid credentials' })

2. Password doesn't match:
   res.status(401).json({ message: 'Invalid credentials' })

3. Email already registered (register endpoint):
   res.status(400).json({ message: 'Email already registered' })

4. Server error:
   res.status(500).json({ message: 'Server error', error })
```

---

## 6. FILE DEPENDENCY TREE

```
Login.tsx (User Entry Point)
  ├─ imports store types from: store/index.ts
  ├─ dispatches actions from: store/authSlice.ts
  │  └─ authSlice.ts imports: services/authService.ts
  │     └─ authService.ts imports: services/api.ts
  │        └─ api.ts (Axios instance to backend)
  │
  ├─ subscribes to: store/authSlice.ts (Redux state)
  ├─ navigates to: /dashboard
  └─ renders error from: Redux state.error

Backend Flow:
  index.ts (Server entry)
  ├─ imports: routes/auth.ts
  │  ├─ imports: controllers/authController.ts
  │  │  ├─ imports: models/User.ts (MongoDB model)
  │  │  └─ uses: bcryptjs, jsonwebtoken
  │  └─ defines: POST /auth/login, /auth/register
  │
  └─ imports: middleware/authMiddleware.ts
     └─ protects: routes/protected.ts
```

---

## 7. KEY TECHNOLOGIES & THEIR ROLES

| Technology | File(s) | Purpose |
|-----------|---------|---------|
| **React** | Login.tsx, Dashboard.tsx | UI Components & User Interaction |
| **Redux Toolkit** | authSlice.ts, store/index.ts | Global State Management |
| **Axios** | api.ts | HTTP Client |
| **TypeScript** | All .ts files | Type Safety |
| **Express** | index.ts, routes/ | Backend Server & Routing |
| **MongoDB** | User.ts model | Database Storage |
| **bcryptjs** | authController.ts | Password Hashing & Validation |
| **JWT (jsonwebtoken)** | authController.ts | Token Generation & Validation |
| **Vite** | vite.config.ts | Frontend Build Tool |

---

## 8. ENVIRONMENT VARIABLES

### Frontend (.env.local or .env)
```
VITE_API_URL=http://localhost:5000/api
```
Used by: `api.ts` for setting axios baseURL

### Backend (.env)
```
PORT=5000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/finguard
JWT_SECRET=your-secret-key-here
NODE_ENV=development
```

---

## 9. COMMON SCENARIOS

### Scenario 1: User Logs In Successfully
```
✓ User enters valid credentials
✓ Backend validates and returns token
✓ Token stored in localStorage
✓ Redux state.user updated
✓ Navigation to /dashboard
✓ Dashboard displays user info
```

### Scenario 2: User Enters Wrong Password
```
✗ User enters incorrect password
✗ Backend compares password (fails)
✗ Backend sends 401 response
✗ authSlice catches error
✗ state.error = "Invalid credentials"
✗ Login component re-renders
✗ Error message displayed to user
✗ No navigation
```

### Scenario 3: User Refreshes Page While Logged In
```
✓ Page refreshes
✓ authSlice checks localStorage on init
✓ Finds stored user object
✓ Initializes state.user with stored data
✓ Redux has user data immediately
✓ api.ts interceptor has token available
✓ User stays logged in (persistent login)
```

### Scenario 4: User Logs Out
```
✓ User clicks logout button
✓ dispatch(logout()) called
✓ authService.logoutUser() removes from localStorage
✓ state.user set to null
✓ api.ts interceptor won't find token
✓ Navigation to /login
✓ User is now logged out
```

---

## 10. SUMMARY

**Request Journey:**
1. User interacts with React component
2. Component dispatches Redux action
3. Redux calls service function
4. Service makes HTTP request via Axios
5. Axios adds auth token via interceptor
6. HTTP request travels to backend
7. Express routes to controller
8. Controller queries database
9. Response sent back to frontend
10. Service stores response in localStorage
11. Redux updates global state
12. Component re-renders
13. UI updates for user

**This entire flow ensures secure, scalable authentication with persistent user sessions and proper separation of concerns!**
