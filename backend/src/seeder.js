const dotenv = require('dotenv');
dotenv.config();

const db = require('./config/db');
const User = require('./models/User');
const Product = require('./models/Product');
const Post = require('./models/Post');
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

const posts = [
  {
    title: 'The Art of Dressing with Intention',
    content: `In a world saturated with fast fashion and fleeting trends, dressing with intention has become a quiet act of resistance. It means choosing pieces that speak to who you are — not who the algorithm thinks you should be.

True style is not about volume. It is about precision. A single impeccably cut coat, worn with conviction, communicates more than a wardrobe full of impulse purchases. At Daftk, we believe every garment should earn its place.

Ask yourself before each purchase: will I wear this in five years? Does it fit how I actually live? Does the quality justify the cost? These are not restrictive questions — they are liberating ones. They clear the noise and leave only what matters.

The result is a wardrobe that feels like home every time you open it.`,
    image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200',
    tags: ['style', 'editorial', 'philosophy'],
  },
  {
    title: 'Cashmere: What Separates Good from Exceptional',
    content: `Not all cashmere is equal. The difference between a pilling, shapeless sweater and a sweater that looks better after ten years of wear comes down to three things: fibre grade, ply, and finishing.

Fibre grade is measured in microns. Premium cashmere sits at 14–16 microns — finer than a human hair. Most commercial cashmere sits at 19+ microns, which is why it pills within months. Two-ply construction doubles the longevity without significantly adding weight.

Finishing determines drape and hand-feel. Garments that are washed and blocked by hand retain shape far longer than those processed by machine.

At Daftk, our cashmere pieces are sourced from Inner Mongolia, graded, and finished by hand in Portugal. This is why we can offer a five-year guarantee on every piece.`,
    image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=1200',
    tags: ['materials', 'craftsmanship', 'cashmere'],
  },
  {
    title: 'Building a Capsule Wardrobe That Actually Works',
    content: `The capsule wardrobe concept has been romanticised to the point of uselessness. Most guides give you a list of 30 generic items and call it a philosophy. That is not a capsule — that is a shopping list.

A real capsule wardrobe starts with your life. What do you actually do each day? Where do you actually go? What temperature do you live in? Once you have honest answers, you can identify the gaps.

From there, the principle is simple: buy the best version of what you need, in colours that work together, and stop. Neutrals anchor; one or two colour accents add personality.

The goal is not minimalism for its own sake. It is to eliminate the paralysis of too many choices and replace it with quiet confidence every morning.`,
    image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1200',
    tags: ['guide', 'capsule', 'wardrobe'],
  },
  {
    title: 'Why Leather Gets Better With Age',
    content: `Leather is the only material that actively improves with use. Synthetic alternatives cannot replicate this: they degrade. Full-grain leather develops a patina — a deepening of colour and character that is unique to each owner.

The key is full-grain. This means the outermost layer of the hide is left intact, preserving the natural grain and allowing the leather to breathe and age. Corrected-grain and bonded leather are processed to hide imperfections, and in doing so, lose the ability to develop character.

Care is straightforward: condition every few months with a natural leather conditioner, keep away from prolonged moisture, and let it dry naturally when wet. That is all.

A well-cared-for full-grain leather bag or shoe is not a purchase — it is an inheritance.`,
    image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=1200',
    tags: ['leather', 'materials', 'care'],
  },
  {
    title: 'The Return of Considered Luxury',
    content: `The past decade saw luxury become a logo. Giant initials on canvas bags. Brand names embossed on every surface. The signal replaced the substance.

That era is ending. A new generation of clients — in Tbilisi, in London, in Seoul — is returning to considered luxury: pieces without obvious branding, made with extraordinary care, by craftspeople whose names you can learn.

This is not anti-logo. It is pro-substance. It is choosing a blazer because the chest canvas is hand-sewn, not because the buttons carry a crest.

Daftk was built around this conviction. Our pieces are not advertisements. They are arguments — for quality, for longevity, for the belief that the best things do not need to announce themselves.`,
    image: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=1200',
    tags: ['editorial', 'luxury', 'brand'],
  },
];

// ─── Seed Runner ─────────────────────────────────────────────────────────────

const importData = async () => {
  try {
    console.log('Clearing existing data...');
    db.exec('DELETE FROM slider_items');
    db.exec('DELETE FROM hero');
    db.exec('DELETE FROM media');
    db.exec('DELETE FROM posts');
    db.exec('DELETE FROM products');
    db.exec("DELETE FROM sqlite_sequence WHERE name IN ('slider_items','hero','media','posts','products','users')");
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

    // ── Posts ──────────────────────────────────────────────────────────────
    console.log('Seeding posts...');
    posts.forEach(p => Post.create(p));

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
    console.log(`  • ${posts.length} posts`);
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
