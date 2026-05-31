import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import api, { getMediaUrl, getProductTypes } from '../services/api';
import { useSettings } from '../context/SettingsContext';
import { Search, X } from 'lucide-react';
import CustomSelect from '../components/CustomSelect';

/* ─── Product Card with quick-add ─────────────────────────── */
const ProductCard = ({ product }) => {
  return (
    <div className="product-card shop-card">
      <Link to={`/product/${product._id}`} className="shop-card__img-wrap">
        <div
          className="product-image shop-card__img"
          style={{
            backgroundImage: product.imageUrls?.length > 0
              ? `url(${getMediaUrl(product.imageUrls[0])})`
              : 'linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          {product.hasBadge && product.badgeText && (
            <div
              className="absolute top-3 left-3 px-3 py-1 text-xs font-semibold uppercase rounded"
              style={{
                backgroundColor: product.badgeBgColor,
                color: product.badgeTextColor,
              }}
            >
              {product.badgeText}
            </div>
          )}

          {product.luxuryLabel && (
            <div className="absolute top-3 right-3 bg-amber-500 text-white px-3 py-1 text-xs font-semibold uppercase rounded">
              {product.luxuryLabel}
            </div>
          )}
        </div>
      </Link>

      <div className="product-info">
        <Link to={`/product/${product._id}`} className="product-name">{product.name}</Link>
        <div className="flex gap-2 items-center">
          <span className="product-price">₾{product.price}</span>
          {product.oldPrice && (
            <span className="text-gray-dark line-through text-sm">₾{product.oldPrice}</span>
          )}
        </div>
      </div>
    </div>
  );
};

const Shop = () => {
  const { settings } = useSettings();
  const [allProducts, setAllProducts] = useState([]);
  const [productTypes, setProductTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const productsPerPage = 12;

  // Filters
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [productsRes, typesRes] = await Promise.all([
          api.get('/products?limit=1000'),
          getProductTypes().catch(() => ({ data: [] })),
        ]);
        setAllProducts(productsRes.data.products);
        setProductTypes(typesRes.data || []);
      } catch (error) {
        console.error('Error fetching products', error);
        setAllProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Reset to first page whenever filters change
  useEffect(() => {
    setPage(1);
  }, [search, selectedType, minPrice, maxPrice, sortBy]);

  // Price bounds available for products (used as placeholders)
  const priceBounds = useMemo(() => {
    if (allProducts.length === 0) return { min: 0, max: 0 };
    const prices = allProducts.map(p => Number(p.price) || 0);
    return { min: Math.min(...prices), max: Math.max(...prices) };
  }, [allProducts]);

  const filteredProducts = useMemo(() => {
    const term = search.trim().toLowerCase();
    const min = minPrice !== '' ? parseFloat(minPrice) : null;
    const max = maxPrice !== '' ? parseFloat(maxPrice) : null;

    let result = allProducts.filter(p => {
      // Search by name, description, category, tags
      if (term) {
        const haystack = [
          p.name,
          p.description,
          p.category,
          p.productType,
          ...(p.tags || []),
        ].filter(Boolean).join(' ').toLowerCase();
        if (!haystack.includes(term)) return false;
      }
      // Type filter
      if (selectedType && p.productType !== selectedType) return false;
      // Price range
      const price = Number(p.price) || 0;
      if (min !== null && price < min) return false;
      if (max !== null && price > max) return false;
      return true;
    });

    result = [...result].sort((a, b) => {
      switch (sortBy) {
        case 'price_asc':
          return (a.price || 0) - (b.price || 0);
        case 'price_desc':
          return (b.price || 0) - (a.price || 0);
        case 'popular':
          return (b.views || 0) - (a.views || 0);
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return (b._id || 0) - (a._id || 0);
      }
    });

    return result;
  }, [allProducts, search, selectedType, minPrice, maxPrice, sortBy]);

  const hasActiveFilters = search || selectedType || minPrice || maxPrice || sortBy !== 'newest';

  const clearFilters = () => {
    setSearch('');
    setSelectedType('');
    setMinPrice('');
    setMaxPrice('');
    setSortBy('newest');
  };

  // Calculate pagination values
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
  const indexOfLastProduct = page * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);

  const handlePageChange = (newPage) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="container">
      <h1 className="page-title">{settings.shop_collection_title}</h1>

      {/* Filter Bar */}
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row gap-3 lg:items-end">
          {/* Search */}
          <div className="flex-1">
            <label className="block text-xs uppercase tracking-widest text-gray-dark mb-2">Search</label>
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-dark" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products..."
                className="w-full pl-10 pr-3 py-2 border border-gray-300 focus:border-black outline-none text-sm"
              />
            </div>
          </div>

          {/* Type filter */}
          {productTypes.length > 0 && (
            <div>
              <CustomSelect
                label="Type"
                value={selectedType}
                onChange={setSelectedType}
                options={[
                  { value: '', label: 'All Types' },
                  ...productTypes.map(t => ({ value: t.name, label: t.name })),
                ]}
                placeholder="All Types"
                minWidth="160px"
              />
            </div>
          )}

          {/* Price range */}
          <div>
            <label className="block text-xs uppercase tracking-widest text-gray-dark mb-2">Price (₾)</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                placeholder={priceBounds.min ? `${priceBounds.min}` : 'Min'}
                min="0"
                className="w-20 px-3 py-2 border border-gray-300 focus:border-black outline-none text-sm"
              />
              <span className="text-gray-dark">–</span>
              <input
                type="number"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                placeholder={priceBounds.max ? `${priceBounds.max}` : 'Max'}
                min="0"
                className="w-20 px-3 py-2 border border-gray-300 focus:border-black outline-none text-sm"
              />
            </div>
          </div>

          {/* Sort */}
          <div>
            <CustomSelect
              label="Sort"
              value={sortBy}
              onChange={setSortBy}
              options={[
                { value: 'newest',     label: 'Newest' },
                { value: 'popular',    label: 'Most Popular' },
                { value: 'price_asc',  label: 'Price: Low to High' },
                { value: 'price_desc', label: 'Price: High to Low' },
                { value: 'name',       label: 'Name (A–Z)' },
              ]}
              minWidth="200px"
            />
          </div>

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1 px-4 py-2 text-sm border border-gray-300 hover:bg-black hover:text-white transition-colors"
            >
              <X size={14} /> Clear
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <p className="text-center py-20">Loading Collection...</p>
      ) : (
        <>
          <p className="text-sm text-gray-dark mb-6">
            {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'}
          </p>

          <div className="product-grid">
            {currentProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <p className="text-center py-20 text-gray-dark">No products match your filters.</p>
          )}

          <br />
          <br />

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-12 pb-12">
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1}
                className={`px-4 py-2 border border-black text-xs uppercase tracking-widest transition-all ${page === 1 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-black hover:text-white'
                  }`}
              >
                {'<'}
              </button>

              <div className="flex gap-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                  <button
                    key={p}
                    onClick={() => handlePageChange(p)}
                    className={`w-8 h-8 flex items-center justify-center text-xs transition-all ${page === p
                      ? 'bg-black text-white font-bold'
                      : 'hover:bg-gray-light border border-transparent hover:border-gray-dark'
                      }`}
                  >
                    {p}
                  </button>
                ))}
              </div>

              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={page === totalPages}
                className={`px-4 py-2 border border-black text-xs uppercase tracking-widest transition-all ${page === totalPages ? 'opacity-30 cursor-not-allowed' : 'hover:bg-black hover:text-white'
                  }`}
              >
                {'>'}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Shop;
