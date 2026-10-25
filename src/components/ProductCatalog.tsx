/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { useGrocery } from '../context/GroceryContext';
import { translations } from '../utils/translations';
import { Product } from '../types/grocery';
import { Plus, Minus, Info, AlertTriangle, Check, X, MapPin } from 'lucide-react';

interface ProductCatalogProps {
  searchQuery: string;
}

export const ProductCatalog: React.FC<ProductCatalogProps> = ({ searchQuery }) => {
  const { products, cart, addToCart, updateCartQuantity, language } = useGrocery();
  const t = translations[language];

  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [filterOrganic, setFilterOrganic] = useState(false);
  const [filterVegan, setFilterVegan] = useState(false);
  const [filterGlutenFree, setFilterGlutenFree] = useState(false);
  const [inspectingProduct, setInspectingProduct] = useState<Product | null>(null);

  const categories = ['All', 'Produce', 'Bakery', 'Dairy', 'Pantry', 'Beverages'];

  const filteredProducts = useMemo(() => {
    return products.filter((prod) => {
      // Category filter
      if (selectedCategory !== 'All' && prod.category !== selectedCategory) {
        return false;
      }
      // Dietary filters
      if (filterOrganic && !prod.organic) return false;
      if (filterVegan && !prod.vegan) return false;
      if (filterGlutenFree && !prod.glutenFree) return false;
      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        return (
          prod.name.toLowerCase().includes(query) ||
          prod.description.toLowerCase().includes(query) ||
          prod.aisle.toLowerCase().includes(query) ||
          prod.origin.toLowerCase().includes(query)
        );
      }
      return true;
    });
  }, [products, selectedCategory, filterOrganic, filterVegan, filterGlutenFree, searchQuery]);

  // Helper to get current quantity in cart
  const getCartQuantity = (productId: string) => {
    const item = cart.find((i) => i.product.id === productId);
    return item ? item.quantity : 0;
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Category Segmented Controls & Dietary Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-200 pb-5">
        
        {/* Category Tabs (Segmented interactive buttons as permitted in frontend-design) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200 hover:text-stone-900'
              }`}
            >
              {cat === 'All' ? t.allCategories : cat}
            </button>
          ))}
        </div>

        {/* Dietary Filters */}
        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={() => setFilterOrganic(!filterOrganic)}
            className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
              filterOrganic
                ? 'bg-emerald-50 border-emerald-500 text-emerald-800'
                : 'border-stone-200 text-stone-600 hover:bg-stone-50'
            }`}
          >
            Organic Only
          </button>
          <button
            onClick={() => setFilterVegan(!filterVegan)}
            className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
              filterVegan
                ? 'bg-emerald-50 border-emerald-500 text-emerald-800'
                : 'border-stone-200 text-stone-600 hover:bg-stone-50'
            }`}
          >
            Vegan
          </button>
          <button
            onClick={() => setFilterGlutenFree(!filterGlutenFree)}
            className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
              filterGlutenFree
                ? 'bg-emerald-50 border-emerald-500 text-emerald-800'
                : 'border-stone-200 text-stone-600 hover:bg-stone-50'
            }`}
          >
            Gluten-Free
          </button>
        </div>

      </div>

      {/* Product Results Counter & Live Indicator */}
      <div className="flex items-center justify-between text-xs text-stone-500">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-stone-900">{filteredProducts.length} items</span>
          <span>·</span>
          <span>Live stock updated in real time</span>
        </div>
        {searchQuery && (
          <span>Showing results for &ldquo;{searchQuery}&rdquo;</span>
        )}
      </div>

      {/* Product Grid (3-column desktop as recommended in e-commerce guidelines) */}
      {filteredProducts.length === 0 ? (
        <div className="py-20 text-center text-stone-500 space-y-3">
          <p className="text-base font-semibold text-stone-800">No groceries match your filter</p>
          <p className="text-xs">Try clearing search terms or resetting dietary preferences.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => {
            const inCart = getCartQuantity(product.id);
            const isLowStock = product.stock > 0 && product.stock <= product.reorderThreshold;
            const isOutOfStock = product.stock <= 0;

            return (
              <div
                key={product.id}
                className="group bg-white rounded-2xl border border-stone-200/90 overflow-hidden hover:shadow-md transition-all duration-200 flex flex-col justify-between"
              >
                {/* Visual Header / Lead with visual on neutral solid backdrop */}
                <div
                  className={`h-48 relative flex items-center justify-center bg-gradient-to-br ${product.imageFallback.bgGradient} border-b border-stone-100 cursor-pointer overflow-hidden`}
                  onClick={() => setInspectingProduct(product)}
                >
                  {/* Subtle background glow */}
                  <div
                    className="absolute w-32 h-32 rounded-full blur-2xl opacity-40 transition-transform duration-300 group-hover:scale-125"
                    style={{ backgroundColor: product.imageFallback.accentColor }}
                  />

                  {/* Primary Product Icon Display */}
                  <span className="text-6xl relative z-10 transition-transform duration-200 group-hover:scale-110 select-none">
                    {product.imageFallback.emoji}
                  </span>

                  {/* Stock Status text (Zero-pill discipline: unboxed clean text) */}
                  <div className="absolute top-3 right-3 text-xs">
                    {isOutOfStock ? (
                      <span className="text-rose-700 font-semibold bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                        {t.outOfStock}
                      </span>
                    ) : isLowStock ? (
                      <span className="text-amber-800 font-medium bg-amber-50 px-2 py-0.5 rounded border border-amber-200 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3 text-amber-600" />
                        <span>Only {product.stock} {t.unitsLeft}</span>
                      </span>
                    ) : (
                      <span className="text-stone-600 text-[11px] bg-white/90 backdrop-blur-xs px-2 py-0.5 rounded border border-stone-200 font-mono-numbers">
                        {product.stock} in stock
                      </span>
                    )}
                  </div>

                  {/* Info button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setInspectingProduct(product);
                    }}
                    className="absolute bottom-3 right-3 p-1.5 bg-white/80 hover:bg-white text-stone-600 rounded-lg shadow-xs backdrop-blur-xs transition-colors"
                    title="View Farm Origin & Nutrition"
                  >
                    <Info className="w-4 h-4" />
                  </button>
                </div>

                {/* Body Content */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    {/* Category & Origin Unboxed Metadata */}
                    <div className="text-[11px] text-stone-500 uppercase tracking-wider font-semibold mb-1 flex items-center gap-1.5">
                      <span>{product.category}</span>
                      <span aria-hidden="true">·</span>
                      <span className="truncate">{product.origin}</span>
                    </div>

                    <h3
                      onClick={() => setInspectingProduct(product)}
                      className="font-display text-base font-bold text-stone-900 group-hover:text-emerald-800 transition-colors cursor-pointer leading-snug"
                    >
                      {product.name}
                    </h3>

                    <p className="text-xs text-stone-500 mt-0.5">{product.unit}</p>

                    <p className="text-xs text-stone-600 line-clamp-2 mt-2 leading-relaxed">
                      {product.description}
                    </p>
                  </div>

                  {/* Price & Purchase Action Row */}
                  <div className="mt-5 pt-4 border-t border-stone-100 flex items-center justify-between">
                    <div>
                      <div className="flex items-baseline gap-2">
                        <span className="font-mono-numbers text-lg font-bold text-stone-900">
                          ${product.price.toFixed(2)}
                        </span>
                        {product.originalPrice && (
                          <span className="font-mono-numbers text-xs text-stone-400 line-through">
                            ${product.originalPrice.toFixed(2)}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-stone-400 font-mono block">
                        {product.aisle}
                      </span>
                    </div>

                    {/* Stepper or Add Button */}
                    {inCart > 0 ? (
                      <div className="flex items-center gap-2 bg-stone-100 rounded-lg p-1 border border-stone-200">
                        <button
                          onClick={() => updateCartQuantity(product.id, inCart - 1)}
                          className="w-7 h-7 rounded bg-white text-stone-700 flex items-center justify-center hover:bg-stone-50 shadow-2xs transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="text-xs font-bold font-mono-numbers px-1 text-stone-900">
                          {inCart}
                        </span>
                        <button
                          onClick={() => addToCart(product, 1)}
                          disabled={inCart >= product.stock}
                          className="w-7 h-7 rounded bg-emerald-800 text-white flex items-center justify-center hover:bg-emerald-900 disabled:bg-stone-300 shadow-2xs transition-colors"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => addToCart(product, 1)}
                        disabled={isOutOfStock}
                        className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-800 hover:bg-emerald-900 disabled:bg-stone-200 text-white disabled:text-stone-400 rounded-lg text-xs font-semibold shadow-xs active:scale-95 transition-all"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>{isOutOfStock ? t.outOfStock : t.addToCart}</span>
                      </button>
                    )}
                  </div>

                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Product Detail Modal */}
      {inspectingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-stone-200">
            <div className={`p-8 text-center relative bg-gradient-to-br ${inspectingProduct.imageFallback.bgGradient}`}>
              <button
                onClick={() => setInspectingProduct(null)}
                className="absolute top-4 right-4 p-1.5 bg-white/80 hover:bg-white text-stone-600 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="text-7xl mb-2">{inspectingProduct.imageFallback.emoji}</div>
              <h3 className="font-display text-xl font-bold text-stone-900">
                {inspectingProduct.name}
              </h3>
              <p className="text-xs text-stone-600 mt-1">{inspectingProduct.unit}</p>
            </div>

            <div className="p-6 space-y-4 text-xs text-stone-700">
              <p className="text-sm text-stone-600 leading-relaxed">
                {inspectingProduct.description}
              </p>

              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-stone-100">
                <div className="p-2.5 bg-stone-50 rounded-lg">
                  <span className="text-stone-400 block text-[10px]">FARM ORIGIN</span>
                  <span className="font-semibold text-stone-800 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span className="truncate">{inspectingProduct.origin}</span>
                  </span>
                </div>
                <div className="p-2.5 bg-stone-50 rounded-lg">
                  <span className="text-stone-400 block text-[10px]">AISLE / SHELF</span>
                  <span className="font-semibold text-stone-800 mt-0.5 block truncate">
                    {inspectingProduct.aisle}
                  </span>
                </div>
                <div className="p-2.5 bg-stone-50 rounded-lg">
                  <span className="text-stone-400 block text-[10px]">NUTRITION</span>
                  <span className="font-semibold text-stone-800 mt-0.5 block">
                    {inspectingProduct.calories}
                  </span>
                </div>
                <div className="p-2.5 bg-stone-50 rounded-lg">
                  <span className="text-stone-400 block text-[10px]">CURRENT STOCK</span>
                  <span className="font-semibold text-emerald-800 font-mono-numbers mt-0.5 block">
                    {inspectingProduct.stock} units live
                  </span>
                </div>
              </div>

              {/* Dietary Flags */}
              <div className="flex items-center gap-2 pt-2">
                {inspectingProduct.organic && (
                  <span className="flex items-center gap-1 text-[11px] text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
                    <Check className="w-3 h-3 text-emerald-600" /> Certified Organic
                  </span>
                )}
                {inspectingProduct.vegan && (
                  <span className="flex items-center gap-1 text-[11px] text-stone-700 bg-stone-100 px-2.5 py-1 rounded">
                    100% Vegan
                  </span>
                )}
                {inspectingProduct.glutenFree && (
                  <span className="flex items-center gap-1 text-[11px] text-stone-700 bg-stone-100 px-2.5 py-1 rounded">
                    Gluten-Free
                  </span>
                )}
              </div>
            </div>

            <div className="px-6 py-4 bg-stone-50 border-t border-stone-200 flex items-center justify-between">
              <span className="font-mono-numbers text-xl font-bold text-stone-900">
                ${inspectingProduct.price.toFixed(2)}
              </span>
              <button
                onClick={() => {
                  addToCart(inspectingProduct, 1);
                  setInspectingProduct(null);
                }}
                disabled={inspectingProduct.stock <= 0}
                className="px-5 py-2.5 bg-emerald-800 hover:bg-emerald-900 disabled:bg-stone-300 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
              >
                {inspectingProduct.stock <= 0 ? t.outOfStock : t.addToCart}
              </button>
            </div>
          </div>
        </div>
      )}

    </section>
  );
};
