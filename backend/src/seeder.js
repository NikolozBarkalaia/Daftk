const dotenv = require('dotenv');
dotenv.config();

const db = require('./config/db');
const User = require('./models/User');
const Product = require('./models/Product');
const Media = require('./models/Media');
const Hero = require('./models/Hero');
const SliderItem = require('./models/SliderItem');

// ─── Seed Data ───────────────────────────────────────────────────────────────

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
    tags: ['blazer', 'velvet', 'luxury', 'new'],
    stock: 12,
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
  },
  {
    name: 'Obsidian Leather Bag',
    description: 'Hand-stitched full-grain leather with brushed gold hardware. Timeless craftsmanship meets contemporary silhouette.',
    price: 890,
    oldPrice: null,
    category: 'Accessories',
    tags: ['bag', 'leather', 'handcrafted'],
    stock: 8,
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
  },
  {
    name: 'Ivory Silk Evening Dress',
    description: 'Pure silk charmeuse with a fluid, body-skimming cut. Effortless elegance for those who refuse to compromise.',
    price: 2150,
    oldPrice: 2600,
    category: 'Clothing',
    tags: ['dress', 'silk', 'evening', 'featured'],
    stock: 5,
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
  },
  {
    name: 'Signature Cashmere Coat',
    description: 'Double-faced Mongolian cashmere in a clean-line silhouette. The coat that defines a wardrobe.',
    price: 3400,
    oldPrice: null,
    category: 'Clothing',
    tags: ['coat', 'cashmere', 'winter', 'luxury'],
    stock: 6,
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
  },
  {
    name: 'Architect Timepiece',
    description: 'Swiss movement encased in hand-finished stainless steel. Every second measured with intention.',
    price: 4200,
    oldPrice: 4800,
    category: 'Accessories',
    tags: ['watch', 'swiss', 'luxury', 'men'],
    stock: 3,
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
  },
  {
    name: 'Suede Chelsea Boots',
    description: 'Goodyear-welted suede boots with a stacked leather heel. Built to last a lifetime, styled for every decade.',
    price: 760,
    oldPrice: 920,
    category: 'Footwear',
    tags: ['boots', 'suede', 'chelsea', 'men'],
    stock: 14,
    isFeatured: false,
    luxuryLabel: null,
    imageUrls: [
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800',
    ],
  },
  {
    name: 'Geometric Gold Earrings',
    description: '18k gold-plated geometric studs with hand-set zirconia. Minimal by design, maximal in presence.',
    price: 340,
    oldPrice: null,
    category: 'Jewellery',
    tags: ['earrings', 'gold', 'minimal', 'women'],
    stock: 20,
    isFeatured: false,
    luxuryLabel: null,
    imageUrls: [
      'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800',
    ],
  },
  {
    name: 'Merino Turtleneck',
    description: 'Superfine 18.5-micron merino in a ribbed turtleneck. The understated anchor of a considered wardrobe.',
    price: 420,
    oldPrice: 520,
    category: 'Clothing',
    tags: ['knitwear', 'merino', 'turtleneck', 'basics'],
    stock: 25,
    isFeatured: false,
    luxuryLabel: null,
    imageUrls: [
      'https://images.unsplash.com/photo-1564859228273-274232fdb516?w=800',
    ],
  },
];

// ─── Seed Runner ─────────────────────────────────────────────────────────────

const importData = async () => {
  try {
    console.log('Clearing existing data...');
    db.exec('DELETE FROM slider_items');
    db.exec('DELETE FROM hero');
    db.exec('DELETE FROM media');
    db.exec('DELETE FROM products');
    db.exec("DELETE FROM sqlite_sequence WHERE name IN ('slider_items','hero','media','products','users')");
    User.deleteAll();

    // ── Admin user ─────────────────────────────────────────────────────────
    console.log('Creating admin user...');
    await User.create({ name: 'Admin User', email: 'admin@daftk.com', password: 'password123', isAdmin: true });

    // ── Media ──────────────────────────────────────────────────────────────
    console.log('Seeding media...');
    const createdMedia = mediaItems.map(m => Media.create(m));

    // ── Products ───────────────────────────────────────────────────────────
    console.log('Seeding products...');
    products.forEach(p => Product.create(p));

    // ── Hero (linked to first media item) ──────────────────────────────────
    console.log('Seeding hero...');
    Hero.create({
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
    sliderData.forEach(s => SliderItem.create(s));

    console.log('\n✓ Seeding complete!');
    console.log(`  • 1 admin user    → admin@daftk.com / password123`);
    console.log(`  • ${createdMedia.length} media items`);
    console.log(`  • ${products.length} products`);
    console.log(`  • 1 hero section`);
    console.log(`  • 3 slider items`);
    process.exit();
  } catch (error) {
    console.error('Seeder error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
};

importData();
