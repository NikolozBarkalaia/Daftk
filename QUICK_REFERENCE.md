# Quick Reference - Files Modified/Created

## Backend Files

### NEW Models
- ✅ `backend/src/models/Hero.js` - Hero section configuration
- ✅ `backend/src/models/SliderItem.js` - Slider items with ordering

### UPDATED Models
- ✅ `backend/src/models/Product.js` - Extended with new fields

### NEW Controllers
- ✅ `backend/src/controllers/heroController.js` - Hero CRUD operations
- ✅ `backend/src/controllers/sliderController.js` - Slider CRUD + reorder

### UPDATED Controllers
- ✅ `backend/src/controllers/productController.js` - Extended with image management

### NEW Routes
- ✅ `backend/src/routes/heroRoutes.js` - Hero endpoints
- ✅ `backend/src/routes/sliderRoutes.js` - Slider endpoints

### UPDATED Routes
- ✅ `backend/src/routes/productRoutes.js` - Extended with new endpoints
- ✅ `backend/src/routes/mediaRoutes.js` - Made media GET public

### UPDATED Main File
- ✅ `backend/src/index.js` - Added hero and slider routes

---

## Frontend Files

### NEW Admin Pages
- ✅ `frontend/src/pages/Admin/HeroManager.js` - Hero section admin
- ✅ `frontend/src/pages/Admin/SliderManager.js` - Slider admin
- ✅ `frontend/src/pages/Admin/ProductsManager.js` - Products admin

### UPDATED Admin Components
- ✅ `frontend/src/components/Admin/Sidebar.js` - Added nav items
- ✅ `frontend/src/pages/Admin/Dashboard.js` - Added product/slider stats

### UPDATED App Structure
- ✅ `frontend/src/App.js` - Added new admin routes

### UPDATED Public Pages
- ✅ `frontend/src/pages/Home.js` - Fetches hero and slider data
- ✅ `frontend/src/pages/Shop.js` - Full API integration with pagination
- ✅ `frontend/src/pages/Product.js` - Complete product detail page
- ✅ `frontend/src/pages/Cart.js` - Full cart management with localStorage

---

## Key Implementation Details

### Product.js Model Fields
```javascript
{
  name: String (required),
  description: String (required),
  price: Number (required),
  oldPrice: Number (optional),
  imageUrls: [String] (array for multiple images),
  category: String (required),
  tags: [String] (array),
  stock: Number (required),
  isFeatured: Boolean,
  luxuryLabel: String (enum: new, exclusive, limited, bestseller)
}
```

### Hero.js Model Fields
```javascript
{
  title: String (default: "Redefining Luxury"),
  subtitle: String,
  buttonText: String,
  buttonLink: String,
  mediaType: String (enum: video, image),
  mediaId: ObjectId (reference to Media),
  isActive: Boolean
}
```

### SliderItem.js Model Fields
```javascript
{
  title: String (required),
  subtitle: String,
  description: String,
  buttonText: String,
  buttonLink: String,
  mediaType: String (enum: video, image),
  mediaId: ObjectId (required, reference to Media),
  order: Number (for sorting),
  isActive: Boolean
}
```

---

## API Endpoints Overview

### Public Endpoints (No Auth Required)
```
GET  /api/hero              - Get hero section
GET  /api/slider            - Get all slider items
GET  /api/products          - Get products (paginated)
GET  /api/products/:id      - Get single product
GET  /api/products/featured - Get featured products
GET  /api/media             - Get media files
```

### Admin Endpoints (Token Required + isAdmin:true)
```
PUT  /api/hero                           - Update hero
POST /api/slider                         - Create slider item
PUT  /api/slider/:id                     - Update slider item
DELETE /api/slider/:id                   - Delete slider item
PUT  /api/slider/reorder                 - Reorder slider items
POST /api/products                       - Create product
PUT  /api/products/:id                   - Update product
DELETE /api/products/:id                 - Delete product
PUT  /api/products/:id/images            - Add product image
DELETE /api/products/:id/images/:index   - Remove product image
POST /api/media/upload                   - Upload media file
DELETE /api/media/:id                    - Delete media file
```

---

## Critical Route Ordering

### Product Routes (IMPORTANT)
Order matters! More specific routes first:
1. `GET /featured` - specific
2. `GET /`         - all products
3. `GET /:id`      - single product
4. `DELETE /:id/images/:index` - most specific
5. `PUT /:id/images` - specific
6. `PUT /:id`      - generic
7. `DELETE /:id`   - generic

### Slider Routes (IMPORTANT)
Order matters! More specific routes first:
1. `GET /`         - public get all
2. `PUT /reorder`  - specific admin
3. `POST /`        - create
4. `PUT /:id`      - update
5. `DELETE /:id`   - delete

---

## Component Props

### HeroManager
- Fetches existing hero data
- Displays form with media selection dropdown
- Shows preview of selected media

### SliderManager
- Lists all slider items
- Add/edit/delete functionality
- Reorder support
- Media preview thumbnails

### ProductsManager
- Full CRUD interface
- Image upload and management
- Multi-field form with validation
- Product card display with images

---

## Frontend State Management

### Cart State
- Stored in: `localStorage` (key: 'cart')
- Format: Array of `{_id, name, price, image, quantity}`
- Persists across: page refreshes, browser restarts
- Updated by: Product page, Cart page

### User Auth
- Stored in: `localStorage` (key: 'userInfo')
- Managed by: AuthContext
- Contains: user data + JWT token
- Used for: API requests via interceptor

---

## Styling Classes Used

### Existing Classes Reused
- `.container` - max-width wrapper
- `.btn` - primary button
- `.btn-outline` - secondary button
- `.input-field` - form inputs
- `.page-title` - page headings
- `.product-grid` - responsive product grid
- `.product-card` - individual product card
- `.product-image` - product image container
- `.product-info` - product details section
- `.product-details-container` - 2-column layout
- `.product-details-image` - large product image
- `.product-details-info` - product details sidebar

### New Classes Added
- None - all styling uses existing Tailwind + custom CSS

---

## Icons Used (from lucide-react)

- `Plus` - Add button
- `Trash2` - Delete button
- `Edit2` - Edit button
- `GripVertical` - Drag/reorder
- `Upload` - File upload
- `ShoppingCart` - Cart
- `Minus` - Quantity decrease
- `Plus` - Quantity increase
- `Film` - Hero/video
- `ShoppingBag` - Products
- `FileText` - Posts
- `Image` - Media/Images
- `LayoutDashboard` - Dashboard
- `LogOut` - Logout

---

## Environment Variables

No new environment variables required. Uses existing:
- `REACT_APP_API_URL` - Already set to http://localhost:5000/api
- `PORT` (backend) - Already set to 5000
- `JWT_SECRET` - Already configured

---

## Testing Checklist

✅ Hero Section
- [ ] Admin can update title/subtitle
- [ ] Admin can select video/image
- [ ] Homepage displays updated hero
- [ ] Video/image renders with overlay

✅ Slider
- [ ] Admin can add slider items
- [ ] Items display on homepage
- [ ] Admin can reorder items
- [ ] Admin can edit/delete items

✅ Products
- [ ] Admin can create product
- [ ] Admin can upload multiple images
- [ ] Products display in shop
- [ ] Product detail page shows all info
- [ ] Related products show correctly

✅ Cart
- [ ] Add to cart works
- [ ] Cart persists after refresh
- [ ] Quantity updates work
- [ ] Remove item works
- [ ] Clear cart works

✅ Public Access
- [ ] Products visible without login
- [ ] Hero displays without login
- [ ] Slider displays without login

---

## Troubleshooting

### Images Not Loading
- Check: Image URLs start with http://localhost:5000
- Check: Files exist in /uploads folder
- Check: Media records exist in MongoDB

### Hero Not Updating
- Check: Media exists in database
- Check: Hero record exists (created on first PUT)
- Check: Admin user has isAdmin: true

### Slider Items Missing
- Check: Media files are uploaded
- Check: Slider items have valid mediaId references
- Check: Order field is set

### Cart Not Persisting
- Check: Browser localStorage is enabled
- Check: Cart key in localStorage is 'cart'
- Check: JSON serialization working

---

## Performance Notes

- Product pagination: 20 items per page (configurable)
- Images stored in /uploads (static serving)
- No image compression (client-side display)
- Lazy loading not implemented yet
- All queries use MongoDB indexes

---

## Security Reminders

✅ Public routes have no auth requirement
✅ Admin routes require JWT token
✅ Admin routes require isAdmin flag
✅ File uploads filtered by extension
✅ CORS enabled for localhost:3000

---

Generated for: DaftK Luxury E-Commerce Platform
Date: 2026-05-09
Status: Implementation Complete ✅
