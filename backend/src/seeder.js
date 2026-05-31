const dotenv = require('dotenv');
dotenv.config();

const { pool, init } = require('./config/db');
const User = require('./models/User');
const Product = require('./models/Product');
const ProductType = require('./models/ProductType');
const Media = require('./models/Media');
const Hero = require('./models/Hero');
const SliderItem = require('./models/SliderItem');

// ─── Product Types ────────────────────────────────────────────────────────────

const productTypes = [
  { name: 'Blazers',    displayOrder: 0 },
  { name: 'Dresses',   displayOrder: 1 },
  { name: 'Coats',     displayOrder: 2 },
  { name: 'Knitwear',  displayOrder: 3 },
  { name: 'Boots',     displayOrder: 4 },
  { name: 'Bags',      displayOrder: 5 },
  { name: 'Jewellery', displayOrder: 6 },
  { name: 'Watches',   displayOrder: 7 },
];

// ─── Seed Data ────────────────────────────────────────────────────────────────

const mediaItems = [
  { filename: 'hero-bg.jpg',      url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1600', type: 'image/jpeg', size: 320000 },
  { filename: 'slider-1.jpg',     url: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=1400', type: 'image/jpeg', size: 280000 },
  { filename: 'slider-2.jpg',     url: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1400', type: 'image/jpeg', size: 295000 },
  { filename: 'slider-3.jpg',     url: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=1400', type: 'image/jpeg', size: 310000 },
  { filename: 'gallery-1.jpg',    url: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=900',  type: 'image/jpeg', size: 180000 },
  { filename: 'gallery-2.jpg',    url: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=900',  type: 'image/jpeg', size: 175000 },
  { filename: 'gallery-3.jpg',    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=900',  type: 'image/jpeg', size: 160000 },
  { filename: 'gallery-4.jpg',    url: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=900',  type: 'image/jpeg', size: 190000 },
];

const products = [
  {
    name: 'Midnight Velvet Blazer',
    description: 'Crafted from the finest Italian velvet, this blazer blends bold sophistication with impeccable tailoring. A statement piece for the modern connoisseur.',
    price: 1290,
    oldPrice: 1650,
    category: 'Clothing',
    productType: 'Blazers',
    tags: ['blazer', 'velvet', 'luxury', 'new'],
    stock: 12,
    sizeStock: { XS: 1, S: 3, M: 4, L: 3, XL: 1 },
    isFeatured: true,
    luxuryLabel: 'Exclusive Edition',
    imageUrls: [
      'https://images.unsplash.com/photo-1594938298603-c8148c4b5571?w=800',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800',
    ],
    hasBadge: true,
    badgeText: 'NEW',
    badgeBgColor: '#ef4444',
    badgeTextColor: '#ffffff',
    views: 342,
  },
  {
    name: 'Obsidian Leather Bag',
    description: 'Hand-stitched full-grain leather with brushed gold hardware. Timeless craftsmanship meets contemporary silhouette.',
    price: 890,
    oldPrice: null,
    category: 'Accessories',
    productType: 'Bags',
    tags: ['bag', 'leather', 'handcrafted'],
    stock: 8,
    sizeStock: { XS: 0, S: 2, M: 3, L: 2, XL: 1 },
    isFeatured: true,
    luxuryLabel: null,
    imageUrls: [
      'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800',
      'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800',
    ],
    hasBadge: false,
    badgeText: null,
    badgeBgColor: '#000000',
    badgeTextColor: '#ffffff',
    views: 218,
  },
  {
    name: 'Ivory Silk Evening Dress',
    description: 'Pure silk charmeuse with a fluid, body-skimming cut. Effortless elegance for those who refuse to compromise.',
    price: 2150,
    oldPrice: 2600,
    category: 'Clothing',
    productType: 'Dresses',
    tags: ['dress', 'silk', 'evening', 'featured'],
    stock: 5,
    sizeStock: { XS: 1, S: 2, M: 2, L: 0, XL: 0 },
    isFeatured: true,
    luxuryLabel: 'Haute Collection',
    imageUrls: [
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800',
      'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=800',
    ],
    hasBadge: true,
    badgeText: 'SALE',
    badgeBgColor: '#f59e0b',
    badgeTextColor: '#ffffff',
    views: 519,
  },
  {
    name: 'Signature Cashmere Coat',
    description: 'Double-faced Mongolian cashmere in a clean-line silhouette. The coat that defines a wardrobe.',
    price: 3400,
    oldPrice: null,
    category: 'Clothing',
    productType: 'Coats',
    tags: ['coat', 'cashmere', 'winter', 'luxury'],
    stock: 6,
    sizeStock: { XS: 0, S: 1, M: 2, L: 2, XL: 1 },
    isFeatured: true,
    luxuryLabel: 'Limited Run',
    imageUrls: [
      'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800',
      'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=800',
    ],
    hasBadge: true,
    badgeText: 'LIMITED',
    badgeBgColor: '#8b5cf6',
    badgeTextColor: '#ffffff',
    views: 407,
  },
  {
    name: 'Architect Timepiece',
    description: 'Swiss movement encased in hand-finished stainless steel. Every second measured with intention.',
    price: 4200,
    oldPrice: 4800,
    category: 'Accessories',
    productType: 'Watches',
    tags: ['watch', 'swiss', 'luxury', 'men'],
    stock: 3,
    sizeStock: { XS: 0, S: 1, M: 1, L: 1, XL: 0 },
    isFeatured: true,
    luxuryLabel: 'Prestige Series',
    imageUrls: [
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800',
      'https://images.unsplash.com/photo-1594534475808-b18fc33b045e?w=800',
    ],
    hasBadge: true,
    badgeText: 'EXCLUSIVE',
    badgeBgColor: '#1f2937',
    badgeTextColor: '#fbbf24',
    views: 631,
  },
  {
    name: 'Suede Chelsea Boots',
    description: 'Goodyear-welted suede boots with a stacked leather heel. Built to last a lifetime, styled for every decade.',
    price: 760,
    oldPrice: 920,
    category: 'Footwear',
    productType: 'Boots',
    tags: ['boots', 'suede', 'chelsea', 'men'],
    stock: 14,
    sizeStock: { XS: 2, S: 3, M: 4, L: 3, XL: 2 },
    isFeatured: false,
    luxuryLabel: null,
    imageUrls: [
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800',
    ],
    views: 183,
  },
  {
    name: 'Geometric Gold Earrings',
    description: '18k gold-plated geometric studs with hand-set zirconia. Minimal by design, maximal in presence.',
    price: 340,
    oldPrice: null,
    category: 'Jewellery',
    productType: 'Jewellery',
    tags: ['earrings', 'gold', 'minimal', 'women'],
    stock: 20,
    sizeStock: { XS: 3, S: 5, M: 6, L: 4, XL: 2 },
    isFeatured: false,
    luxuryLabel: null,
    imageUrls: [
      'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800',
    ],
    views: 95,
  },
  {
    name: 'Merino Turtleneck',
    description: 'Superfine 18.5-micron merino in a ribbed turtleneck. The understated anchor of a considered wardrobe.',
    price: 420,
    oldPrice: 520,
    category: 'Clothing',
    productType: 'Knitwear',
    tags: ['knitwear', 'merino', 'turtleneck', 'basics'],
    stock: 25,
    sizeStock: { XS: 3, S: 6, M: 8, L: 6, XL: 2 },
    isFeatured: false,
    luxuryLabel: null,
    imageUrls: [
      'https://images.unsplash.com/photo-1564859228273-274232fdb516?w=800',
    ],
    views: 267,
  },
];

// ─── Seed Runner ─────────────────────────────────────────────────────────────

const importData = async () => {
  try {
    await init();
    console.log('Clearing existing data...');
    await pool.execute('DELETE FROM slider_items');
    await pool.execute('DELETE FROM hero');
    await pool.execute('DELETE FROM media');
    await pool.execute('DELETE FROM products');
    await pool.execute('DELETE FROM product_types');
    await pool.execute('DELETE FROM orders');
    await pool.execute('DELETE FROM contact_messages');
    await pool.execute('DELETE FROM users');
    // Reset auto-increment counters
    for (const t of ['slider_items','hero','media','products','product_types','orders','contact_messages','users']) {
      await pool.execute(`ALTER TABLE ${t} AUTO_INCREMENT = 1`);
    }

    // ── Admin user ─────────────────────────────────────────────────────────
    console.log('Creating admin user...');
    await User.create({ name: 'Admin User', email: 'admin@daftk.com', password: 'password123', isAdmin: true });

    // ── Product Types ──────────────────────────────────────────────────────
    console.log('Seeding product types...');
    for (const t of productTypes) {
      await ProductType.create(t);
    }

    // ── Media ──────────────────────────────────────────────────────────────
    console.log('Seeding media...');
    const createdMedia = [];
    for (const m of mediaItems) {
      createdMedia.push(await Media.create(m));
    }

    // ── Products ───────────────────────────────────────────────────────────
    console.log('Seeding products...');
    for (const p of products) {
      const created = await Product.create(p);
      // Set seeded view counts directly (create() defaults to 0)
      if (p.views) {
        await pool.execute('UPDATE products SET views = ? WHERE id = ?', [p.views, created._id]);
      }
    }

    // ── Hero (linked to first media item) ──────────────────────────────────
    console.log('Seeding hero...');
    await Hero.create({
      title: 'Wear What You Mean',
      subtitle: 'A curated edit of exceptional pieces for those who choose with care.',
      buttonText: 'Explore the Collection',
      buttonLink: '/shop',
      mediaType: 'image',
      mediaId: createdMedia[0].id,
      isActive: true,
    });

    // ── Slider Items (linked to media 1, 2, 3) ─────────────────────────────
    console.log('Seeding slider...');
    const sliderData = [
      {
        title: 'New Season',
        subtitle: 'Autumn / Winter 2026',
        description: 'Considered pieces built for the long run.',
        buttonText: 'Shop Now',
        buttonLink: '/shop',
        mediaType: 'image',
        mediaId: createdMedia[1].id,
        order: 0,
      },
      {
        title: 'The Leather Edit',
        subtitle: 'Full-grain. Hand-finished. Yours for life.',
        description: 'Bags, boots, and belts that age with grace.',
        buttonText: 'Discover',
        buttonLink: '/shop?category=Accessories',
        mediaType: 'image',
        mediaId: createdMedia[2].id,
        order: 1,
      },
      {
        title: 'Eveningwear',
        subtitle: 'Silk. Velvet. Intention.',
        description: 'For occasions worth remembering.',
        buttonText: 'View Collection',
        buttonLink: '/shop?category=Clothing',
        mediaType: 'image',
        mediaId: createdMedia[3].id,
        order: 2,
      },
    ];
    for (const s of sliderData) {
      await SliderItem.create(s);
    }

    console.log('\n✓ Seeding complete!');
    console.log(`  • 1 admin user    → admin@daftk.com / password123`);
    console.log(`  • ${productTypes.length} product types`);
    console.log(`  • ${createdMedia.length} media items`);
    console.log(`  • ${products.length} products (with types & views)`);
    console.log(`  • 1 hero section`);
    console.log(`  • 3 slider items`);
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('Seeder error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
};

importData();
