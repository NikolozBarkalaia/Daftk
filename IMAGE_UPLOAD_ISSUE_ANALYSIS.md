# Image Upload Issue - Root Cause Analysis

## Issue Summary
Product images are not being properly uploaded, saved, or displayed in the admin panel and frontend.

---

## Root Causes Identified

### ❌ ROOT CAUSE #1: MULTER DESTINATION PATH
**File:** `backend/src/middleware/uploadMiddleware.js`

**Problem:**
```javascript
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, 'uploads/'); // ❌ WRONG - relative path!
  },
  filename(req, file, cb) {
    cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
  }
});
```

**Why this breaks:**
- Multer saves relative to process.cwd() (where node command was run)
- If you run `npm start` from `backend/`, it saves to `backend/uploads/` ✓
- If you run `npm start` from project root, it saves to `./uploads/` ✗
- Express static middleware looks for `backend/uploads/` (absolute path)
- **Result:** Files save in wrong location, express.static can't find them

**Fix:**
Use absolute path that always points to `backend/uploads/`:
```javascript
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, path.join(__dirname, '../../uploads')); // ✓ CORRECT
  },
  filename(req, file, cb) {
    cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
  }
});
```

---

### ❌ ROOT CAUSE #2: AXIOS CONTENT-TYPE HEADER
**File:** `frontend/src/services/api.js`

**Problem:**
```javascript
const api = axios.create({
  baseURL: 'http://localhost:5001/api',
  headers: {
    'Content-Type': 'application/json', // ❌ BREAKS FormData!
  },
});
```

**Why this breaks:**
- When sending FormData, Content-Type should be `multipart/form-data` with boundary
- Hardcoding `application/json` overrides multipart/form-data
- Multer expects multipart/form-data to parse the request
- **Result:** Server never receives the file, req.file is undefined

**Fix:**
For non-FormData requests, axios automatically sets application/json.  
Remove explicit Content-Type header and let axios handle it:
```javascript
const api = axios.create({
  baseURL: 'http://localhost:5001/api',
  // Don't set Content-Type - let axios handle it based on data type
});
```

---

### ❌ ROOT CAUSE #3: MISSING DIRECTORY CREATION
**File:** `backend/src/middleware/uploadMiddleware.js`

**Problem:**
- Multer doesn't create the destination directory if it doesn't exist
- If `backend/uploads/` folder is missing, upload fails silently

**Fix:**
Ensure uploads directory exists and is writable (see below)

---

## Files That Need Fixing

| File | Issue | Status |
|------|-------|--------|
| `backend/src/middleware/uploadMiddleware.js` | Wrong upload destination path | ❌ NEEDS FIX |
| `frontend/src/services/api.js` | Hardcoded Content-Type breaks FormData | ❌ NEEDS FIX |

---

## Complete Fixed Code

### Fix #1: uploadMiddleware.js
```javascript
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Storage engine
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, uploadsDir); // ✓ ABSOLUTE PATH
  },
  filename(req, file, cb) {
    cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
  }
});

// Check file type
function checkFileType(file, cb) {
  const filetypes = /jpg|jpeg|png|webp|gif|mp4|webm|avi/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb('Images and Videos only!');
  }
}

const upload = multer({
  storage,
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  }
});

module.exports = upload;
```

### Fix #2: api.js
```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5001/api',
  // Don't set Content-Type header here - let axios handle it
  // For JSON: axios will auto-set 'application/json'
  // For FormData: axios will auto-set 'multipart/form-data'
});

// Interceptor to add auth token
api.interceptors.request.use((config) => {
  const userInfo = localStorage.getItem('userInfo');
  if (userInfo) {
    const { token } = JSON.parse(userInfo);
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;

// Returns a usable image/video URL whether the stored value is a relative
// upload path (/uploads/...) or an already-absolute external URL.
export const getMediaUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `http://localhost:5001${url}`;
};

// ─── Order API ───────────────────────────────────────────────
export const createOrder = (orderData) => api.post('/orders', orderData);
export const getMyOrders = () => api.get('/orders/myorders');
export const getOrderById = (id) => api.get(`/orders/${id}`);
export const getAllOrders = () => api.get('/orders');
export const updateOrderStatus = (id, status) => api.put(`/orders/${id}/status`, { status });
```

---

## Verification Steps

After applying fixes:

1. **Restart backend server** (must run from backend directory or use npm script)
   ```bash
   cd backend
   npm start
   ```

2. **Test upload in admin panel**
   - Go to Admin > Products
   - Create new product
   - Upload an image
   - Check browser DevTools Network tab - should see 201 response

3. **Verify file on disk**
   - Check `backend/uploads/` folder
   - Should see files like: `file-1234567890.jpg`

4. **Verify API returns correct URL**
   - In Network tab, check response: `{ url: "/uploads/file-1234567890.jpg" }`

5. **Verify image displays on frontend**
   - Product card should show image
   - getMediaUrl() converts `/uploads/...` to `http://localhost:5001/uploads/...`
   - Browser should load the image

---

## Summary of Changes

| Issue | Root Cause | Fix |
|-------|-----------|-----|
| Files save in wrong location | Multer using relative path | Use absolute path: `path.join(__dirname, '../../uploads')` |
| Multer never receives files | FormData sent as application/json | Remove hardcoded Content-Type header from api.js |
| Uploads directory missing | Not auto-created | Add fs.mkdirSync() with recursive option |

All fixes are minimal and preserve existing functionality.
