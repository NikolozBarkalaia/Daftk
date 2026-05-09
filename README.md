# DaftK - Luxury E-Commerce Platform

A production-ready, full-stack luxury e-commerce platform built with React, Express, MongoDB, and Tailwind CSS. Features a sophisticated admin panel for managing hero sections, product sliders, and complete product inventory.

## Features

### 🎯 Core Functionality
- **Dynamic Hero Section Management** - Admins control hero content with video/image uploads
- **Slider/Featured Items Management** - Create and reorder featured product sliders
- **Complete Product Management** - Full CRUD with multi-image galleries
- **Shopping Cart** - Persistent cart with quantity management
- **Product Details** - Rich product pages with image galleries and related products
- **Public Product Browsing** - No authentication required for customers

### 🎨 Design
- Luxury minimal aesthetic with serif typography
- Responsive design maintained across all screen sizes
- Smooth animations and transitions
- Professional admin panel
- Dark theme for admin interface

### 🔐 Security
- JWT-based authentication
- Role-based access control (admin vs. customer)
- Protected admin endpoints
- Public API for product viewing

---

## Tech Stack

### Frontend
- **React 18** with React Router v6
- **Tailwind CSS** for styling
- **Axios** for API communication
- **Swiper** for carousel/slider
- **Lucide React** for icons

### Backend
- **Node.js** with Express.js
- **MongoDB** for database
- **Mongoose** for ODM
- **JWT** for authentication
- **Multer** for file uploads

---

## Project Structure

```
DaftK/
├── frontend/                 # React client application
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   └── Admin/       # Admin components (Sidebar, Layout, etc.)
│   │   ├── pages/
│   │   │   ├── Admin/       # Hero, Slider, Products managers
│   │   │   ├── Home.js      # Dynamic hero + slider display
│   │   │   ├── Shop.js      # Product listing
│   │   │   ├── Product.js   # Product details
│   │   │   └── Cart.js      # Shopping cart
│   │   ├── context/
│   │   │   └── AuthContext.js
│   │   ├── services/
│   │   │   └── api.js       # Axios configuration
│   │   └── index.css        # Global styles + Tailwind
│   └── package.json
│
├── backend/                  # Node.js/Express server
│   ├── src/
│   │   ├── models/
│   │   │   ├── Hero.js      # NEW
│   │   │   ├── SliderItem.js # NEW
│   │   │   ├── Product.js   # Updated
│   │   │   ├── User.js
│   │   │   ├── Post.js
│   │   │   └── Media.js
│   │   ├── controllers/
│   │   │   ├── heroController.js      # NEW
│   │   │   ├── sliderController.js    # NEW
│   │   │   └── productController.js   # Extended
│   │   ├── routes/
│   │   │   ├── heroRoutes.js          # NEW
│   │   │   ├── sliderRoutes.js        # NEW
│   │   │   └── productRoutes.js       # Updated
│   │   ├── middleware/
│   │   │   ├── authMiddleware.js
│   │   │   └── uploadMiddleware.js
│   │   ├── config/
│   │   │   └── db.js
│   │   └── index.js         # Main server file
│   ├── uploads/             # Static media storage
│   └── package.json
│
├── IMPLEMENTATION_GUIDE.md   # Comprehensive feature guide
├── QUICK_REFERENCE.md        # Developer quick reference
└── README.md                 # This file
```

---

## Getting Started

### Prerequisites
- Node.js (v14+)
- MongoDB running locally or MongoDB Atlas connection
- npm or yarn

### Installation

#### Backend Setup
```bash
cd backend
npm install
cp .env.example .env  # Configure environment variables
npm run start
```

#### Frontend Setup
```bash
cd frontend
npm install
npm start
```

The frontend will open at `http://localhost:3000`
The backend API runs at `http://localhost:5000`

### Environment Variables

#### Backend (.env)
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/daftk
JWT_SECRET=your_jwt_secret_key
NODE_ENV=development
```

---

## API Endpoints

### Public Endpoints (No Auth Required)
```
GET  /api/hero              - Get hero section
GET  /api/slider            - Get all slider items
GET  /api/products          - Get products (paginated)
GET  /api/products/:id      - Get single product
GET  /api/products/featured - Get featured products
```

### Admin Endpoints (Authentication Required)
```
PUT  /api/hero                           - Update hero section
POST /api/slider                         - Create slider item
PUT  /api/slider/:id                     - Update slider item
DELETE /api/slider/:id                   - Delete slider item
PUT  /api/slider/reorder                 - Reorder slider items
POST /api/products                       - Create product
PUT  /api/products/:id                   - Update product
DELETE /api/products/:id                 - Delete product
PUT  /api/products/:id/images            - Add product image
DELETE /api/products/:id/images/:index   - Remove product image
```

---

## Admin Panel Routes

Access the admin panel at `/admin` (requires login with admin account)

### Available Sections
- **Dashboard** (`/admin`) - Overview and statistics
- **Products** (`/admin/products`) - Manage product catalog
- **Hero Section** (`/admin/hero`) - Configure homepage hero
- **Slider** (`/admin/slider`) - Manage featured items slider
- **Posts** (`/admin/posts`) - Manage blog posts
- **Media** (`/admin/media`) - Upload and manage media files

---

## Key Features in Detail

### 1. Hero Section Management
- Upload video or image background
- Customize title, subtitle, button text, and link
- Live preview in admin panel
- Automatically displays on homepage

### 2. Slider Management
- Create unlimited featured items
- Each item includes: title, subtitle, description, button
- Support for video and image media
- Reorder items for custom display
- Full CRUD operations

### 3. Product Management
- Complete CRUD operations
- Upload multiple product images (gallery)
- Set regular price and old price (calculates discount%)
- Add product description, category, tags
- Set stock quantity
- Mark products as featured
- Apply luxury labels (new, exclusive, limited, bestseller)

### 4. Shopping Cart
- Persistent cart using localStorage
- Add products from shop or product detail page
- Update quantities
- Remove items
- Automatic total calculation
- Complimentary shipping indicator

### 5. Product Details Page
- Image gallery with thumbnail selection
- Quantity selector with stock validation
- Related products from same category
- Product information display
- One-click add to cart

---

## Authentication

The platform uses JWT (JSON Web Tokens) for authentication:

1. Users register or login via `/register` or `/login`
2. Upon successful authentication, JWT token is stored in localStorage
3. Token is automatically included in all API requests via axios interceptor
4. Admin endpoints require `isAdmin: true` flag on user account

### Creating Admin User
Admin users must be created manually or promoted in MongoDB:
```javascript
db.users.updateOne(
  { email: "admin@example.com" },
  { $set: { isAdmin: true } }
)
```

---

## File Upload

Product images and media files are uploaded via:
1. Multer middleware processes the upload
2. Files stored in `/uploads` directory
3. Relative path stored in database
4. Frontend accesses via `http://localhost:5000/uploads/filename`

Supported file types: jpg, jpeg, png, webp, gif, mp4, webm, avi

---

## Data Models

### Product
```javascript
{
  name: String,
  description: String,
  price: Number,
  oldPrice: Number,
  imageUrls: [String],
  category: String,
  tags: [String],
  stock: Number,
  isFeatured: Boolean,
  luxuryLabel: String // new, exclusive, limited, bestseller
}
```

### Hero
```javascript
{
  title: String,
  subtitle: String,
  buttonText: String,
  buttonLink: String,
  mediaType: String, // video or image
  mediaId: ObjectId  // reference to Media
}
```

### SliderItem
```javascript
{
  title: String,
  subtitle: String,
  description: String,
  buttonText: String,
  buttonLink: String,
  mediaType: String,
  mediaId: ObjectId,
  order: Number
}
```

---

## Styling & Design System

The platform uses a luxury minimal design system:

**Colors:**
- Primary: Black (#050505)
- Accent: Gold/Amber
- Background: White
- Borders: Light Gray (#e0e0e0)

**Typography:**
- Headings: Playfair Display (serif)
- Body: Inter (sans-serif)

**Components:**
- Buttons: Black background, white text, gold border
- Forms: Clean input fields with focus states
- Cards: White background, subtle shadow

All styling uses existing CSS classes and Tailwind utilities for consistency.

---

## Development

### Running Tests
```bash
# Backend tests (if configured)
cd backend
npm test

# Frontend tests (if configured)
cd frontend
npm test
```

### Building for Production
```bash
# Backend
cd backend
npm run build

# Frontend
cd frontend
npm run build
```

---

## Performance Optimizations

- Product pagination (20 items/page)
- Static file serving for uploads
- MongoDB indexes on common queries
- JWT token caching in localStorage
- Efficient component re-rendering with React hooks

---

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

---

## Troubleshooting

### Images Not Displaying
- Verify files exist in `/uploads` folder
- Check MongoDB media records exist
- Ensure backend server is running

### Authentication Issues
- Clear localStorage and re-login
- Verify JWT_SECRET in .env
- Check user has isAdmin flag set

### API Connection Errors
- Verify backend server is running on port 5000
- Check CORS configuration
- Verify MongoDB connection

---

## Contributing

This is a production-ready codebase. When making changes:
1. Follow existing code conventions
2. Maintain luxury/minimal design aesthetic
3. Update documentation
4. Test all features thoroughly

---

## License

Proprietary - All rights reserved

---

## Support

For issues or questions about DaftK:
- Check IMPLEMENTATION_GUIDE.md for detailed feature documentation
- See QUICK_REFERENCE.md for developer reference
- Review existing code patterns in the codebase

---

## Changelog

### Version 1.1.0 (May 9, 2026)
✅ Added dynamic Hero Section management
✅ Added Slider/Featured items management
✅ Implemented complete Product management system
✅ Built comprehensive admin panel
✅ Created shopping cart with persistence
✅ Developed product detail pages with galleries
✅ Set up public API endpoints
✅ Maintained luxury brand consistency

### Version 1.0.0
- Initial project setup with base architecture

---

## Project Statistics

- **Backend Files:** 15+ files (models, controllers, routes, middleware)
- **Frontend Pages:** 8+ pages (home, shop, product, cart, admin sections)
- **Admin Sections:** 3 new (hero, slider, products)
- **API Endpoints:** 20+ endpoints (public and admin)
- **Database Models:** 5+ models
- **Lines of Code:** 3000+ lines of production-ready code

---

**Built with ❤️ for luxury brands**

DaftK - Redefining E-Commerce Excellence
#   D a f t k  
 