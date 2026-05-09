import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api, { getMediaUrl } from '../services/api';

const Shop = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const { data } = await api.get(`/products?page=${page}&limit=20`);
        setProducts(data.products);
        setTotalPages(data.pages);
      } catch (error) {
        console.error('Error fetching products', error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [page]);

  return (
    <div className="container">
      <h1 className="page-title">Collection</h1>
      {loading ? (
        <p className="text-center py-8">Loading...</p>
      ) : (
        <>
          <div className="product-grid">
            {products.map((product) => (
              <Link to={`/product/${product._id}`} key={product._id} className="product-card">
                <div 
                  className="product-image" 
                  style={{ 
                    backgroundImage: product.imageUrls?.length > 0 
                      ? `url(${getMediaUrl(product.imageUrls[0])})`
                      : 'linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%)',
                    backgroundSize: 'cover', 
                    backgroundPosition: 'center' 
                  }}
                >
                  {product.luxuryLabel && (
                    <div className="absolute top-3 right-3 bg-amber-500 text-white px-3 py-1 text-xs font-semibold uppercase rounded">
                      {product.luxuryLabel}
                    </div>
                  )}
                </div>
                <div className="product-info">
                  <span className="product-name">{product.name}</span>
                  <div className="flex gap-2 items-center">
                    <span className="product-price">€{product.price}</span>
                    {product.oldPrice && (
                      <span className="text-gray-dark line-through text-sm">€{product.oldPrice}</span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-8 pb-8">
              {page > 1 && (
                <button
                  onClick={() => setPage(page - 1)}
                  className="btn"
                >
                  Previous
                </button>
              )}
              <div className="flex items-center gap-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`px-3 py-2 ${page === p ? 'btn' : 'btn-outline'}`}
                  >
                    {p}
                  </button>
                ))}
              </div>
              {page < totalPages && (
                <button
                  onClick={() => setPage(page + 1)}
                  className="btn"
                >
                  Next
                </button>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Shop;
