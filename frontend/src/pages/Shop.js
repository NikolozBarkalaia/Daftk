import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Check } from 'lucide-react';
import api, { getMediaUrl } from '../services/api';
import { useCart } from '../context/CartContext';

/* ─── Product Card with quick-add ─────────────────────────── */
const ProductCard = ({ product }) => {
  const { addToCart, isInCart } = useCart();
  const [justAdded, setJustAdded] = useState(false);

  const handleQuickAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1800);
  };

  const inCart = isInCart(product._id);

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
          {product.luxuryLabel && (
            <div className="absolute top-3 right-3 bg-amber-500 text-white px-3 py-1 text-xs font-semibold uppercase rounded">
              {product.luxuryLabel}
            </div>
          )}
          {inCart && !justAdded && (
            <div className="shop-card__in-cart-badge">In bag</div>
          )}
        </div>

        {/* Quick-add overlay */}
        <button
          className={`shop-card__quick-add ${justAdded ? 'shop-card__quick-add--done' : ''}`}
          onClick={handleQuickAdd}
          disabled={product.stock <= 0 || justAdded}
          aria-label={`Add ${product.name} to bag`}
        >
          {justAdded ? (
            <><Check size={16} /> Added</>
          ) : product.stock <= 0 ? (
            'Out of Stock'
          ) : (
            <><ShoppingBag size={16} /> Quick Add</>
          )}
        </button>
      </Link>

      <div className="product-info">
        <Link to={`/product/${product._id}`} className="product-name">{product.name}</Link>
        <div className="flex gap-2 items-center">
          <span className="product-price">€{product.price}</span>
          {product.oldPrice && (
            <span className="text-gray-dark line-through text-sm">€{product.oldPrice}</span>
          )}
        </div>
      </div>
    </div>
  );
};

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
              <ProductCard key={product._id} product={product} />
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
