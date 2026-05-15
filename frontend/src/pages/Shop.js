import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api, { getMediaUrl } from '../services/api';
import { useSettings } from '../context/SettingsContext';

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
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const productsPerPage = 12;

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        // Fetch all products (using a high limit to get everything)
        const { data } = await api.get('/products?limit=1000');
        setAllProducts(data.products);
      } catch (error) {
        console.error('Error fetching products', error);
        setAllProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Calculate pagination values
  const totalPages = Math.ceil(allProducts.length / productsPerPage);
  const indexOfLastProduct = page * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = allProducts.slice(indexOfFirstProduct, indexOfLastProduct);

  const handlePageChange = (newPage) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="container">
      <h1 className="page-title">{settings.shop_collection_title}</h1>
      {loading ? (
        <p className="text-center py-20">Loading Collection...</p>
      ) : (
        <>
          <div className="product-grid">
            {currentProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>

          {allProducts.length === 0 && (
            <p className="text-center py-20 text-gray-dark">No products found in the collection.</p>
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
