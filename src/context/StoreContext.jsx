import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const StoreContext = createContext();

export const useStore = () => useContext(StoreContext);

// Enriched Seed Products for Client-side fallback
const tshirtFiles = import.meta.glob('/public/products/tshirts/*', { eager: true });
const bottleFiles = import.meta.glob('/public/products/water-bottles/*', { eager: true });
const cupFiles = import.meta.glob('/public/products/cups/*', { eager: true });
const mousepadFiles = import.meta.glob('/public/products/mousepads/*', { eager: true });

function getProductsFromFolders() {
  const products = [];
  let idCounter = 1;

  const getCleanPath = (path) => path.replace(/^\/public/, '');

  // Helper to format name
  const formatName = (filename) => {
    // Check known names for premium display
    const knownNames = {
      'nevergiveup': 'Never Give Up Black T-Shirt',
      'nevergiveupp': 'Never Give Up White T-Shirt',
      'deadphool': 'Deadpool Custom White Bottle',
      'deadphooll': 'Deadpool Custom Black Bottle',
      'cups': 'Cute Panda Glass Mug',
      'cupss': 'Cute Panda Ceramic Mug',
      'itachi': 'Itachi Uchiha Custom Mug',
      'itachii': 'Itachi Uchiha Akatsuki Mug',
      'krishana': 'Lord Krishna Custom Mug',
      'krishanaa': 'Lord Krishna Devotional Mug',
      'sukuna': 'Ryomen Sukuna Custom Mug',
      'sukunaa': 'Ryomen Sukuna Jujutsu Mug',
      'magic_cup': 'Magic Color Changing Cup',
      'normal_cup': 'Normal White Ceramic Mug',
      'mousepad1': 'Solo Leveling Shadow Gaming Mousepad',
      'mousepad2': 'Attack on Titan Survey Corps Mousepad',
      'mousepad3': 'Itachi Uchiha Akatsuki Desk Mat',
      'mousepad4': 'Blue Lock Discipline Gaming Mousepad',
      'mousepad5': 'Demon Slayer Tanjiro Gaming Mousepad',
      'mousepad6': 'One Piece Luffy Gear 5 Desk Mat',
      'mousepad7': 'Jujutsu Kaisen Gojo Satoru Mousepad',
      'mousepad8': 'Naruto Sage Mode Gaming Mousepad',
      'mousepad9': 'Cyberpunk Neon City Grid Desk Mat',
      'mousepad10': 'Retro Wave Synthwave Gaming Mousepad'
    };

    const base = filename.split('/').pop().split('.')[0];
    if (knownNames[base]) return knownNames[base];
    
    // Fallback to formatting filename
    return base
      .replace(/[-_]/g, ' ')
      .replace(/\b\w/g, c => c.toUpperCase());
  };

  const getPrice = (name, category) => {
    if (name.includes('T-Shirt')) return 599.00;
    if (category === 'tshirts') return 599.00;
    if (category === 'cups') {
      if (name.includes('Panda') || name.includes('Glass')) return 249.00;
      if (name.includes('Magic')) return 399.00;
      if (name.includes('Normal')) return 199.00;
      return 299.00;
    }
    if (category === 'bottles' || category === 'water-bottles') return 419.00;
    if (category === 'mousepads') return 499.00;
    return 299.00;
  };

  const getOriginalPrice = (price) => {
    return Math.round(price * 1.5 - 0.01);
  };

  const getBadge = (name) => {
    if (name.includes('Never Give Up Black') || name.includes('Panda') || name.includes('Deadpool') || name.includes('Akatsuki')) return 'Best Seller';
    if (name.includes('White') || name.includes('Sukuna') || name.includes('Blue Lock') || name.includes('Luffy')) return 'Trending';
    if (name.includes('Magic') || name.includes('Solo Leveling')) return 'New';
    return '';
  };

  const allTshirtPaths = Object.keys(tshirtFiles).map(getCleanPath);
  const allBottlePaths = Object.keys(bottleFiles).map(getCleanPath);
  const allCupPaths = Object.keys(cupFiles).map(getCleanPath);
  const allMousepadPaths = Object.keys(mousepadFiles).map(getCleanPath);

  const processCategory = (paths, category) => {
    paths.forEach(filePath => {
      const name = formatName(filePath);
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const price = getPrice(name, category);
      
      const baseName = filePath.split('/').pop().split('.')[0];
      let relatedImages = [filePath];
      
      if (baseName === 'nevergiveup') {
        const alt = paths.find(p => p.includes('nevergiveupp'));
        if (alt) relatedImages.push(alt);
      } else if (baseName === 'nevergiveupp') {
        const alt = paths.find(p => p.includes('nevergiveup'));
        if (alt) relatedImages.push(alt);
      } else if (baseName === 'deadphool') {
        const alt = paths.find(p => p.includes('deadphooll'));
        if (alt) relatedImages.push(alt);
      } else if (baseName === 'deadphooll') {
        const alt = paths.find(p => p.includes('deadphool'));
        if (alt) relatedImages.push(alt);
      } else if (baseName === 'cups') {
        const alt = paths.find(p => p.includes('cupss'));
        if (alt) relatedImages.push(alt);
      } else if (baseName === 'cupss') {
        const alt = paths.find(p => p.includes('cups'));
        if (alt) relatedImages.push(alt);
      } else if (baseName === 'itachi') {
        const alt = paths.find(p => p.includes('itachii'));
        if (alt) relatedImages.push(alt);
      } else if (baseName === 'itachii') {
        const alt = paths.find(p => p.includes('itachi'));
        if (alt) relatedImages.push(alt);
      } else if (baseName === 'krishana') {
        const alt = paths.find(p => p.includes('krishanaa'));
        if (alt) relatedImages.push(alt);
      } else if (baseName === 'krishanaa') {
        const alt = paths.find(p => p.includes('krishana'));
        if (alt) relatedImages.push(alt);
      } else if (baseName === 'sukuna') {
        const alt = paths.find(p => p.includes('sukunaa'));
        if (alt) relatedImages.push(alt);
      } else if (baseName === 'sukunaa') {
        const alt = paths.find(p => p.includes('sukuna'));
        if (alt) relatedImages.push(alt);
      }

      relatedImages = Array.from(new Set(relatedImages));
      const stock = baseName.includes('normal') ? 100 : 20;

      let variants = [];
      if (category === 'tshirts') {
        const color = name.toLowerCase().includes('white') ? 'White' : 'Black';
        variants = [
          { size: "S", color, stock: Math.round(stock / 4) },
          { size: "M", color, stock: Math.round(stock / 4) },
          { size: "L", color, stock: Math.round(stock / 4) },
          { size: "XL", color, stock: Math.round(stock / 4) }
        ];
      } else {
        let color = "Black";
        if (name.toLowerCase().includes('white')) color = "White";
        else if (name.toLowerCase().includes('clear') || name.toLowerCase().includes('glass')) color = "Clear";
        else if (name.toLowerCase().includes('green')) color = "Green";
        else if (name.toLowerCase().includes('blue')) color = "Blue";
        else if (name.toLowerCase().includes('orange')) color = "Orange";
        else if (name.toLowerCase().includes('red')) color = "Red";
        else if (name.toLowerCase().includes('purple')) color = "Purple";
        
        variants = [{ size: null, color, stock }];
      }

      products.push({
        id: idCounter++,
        slug,
        name,
        category,
        price,
        originalPrice: getOriginalPrice(price),
        badge: getBadge(name),
        image: filePath,
        images: relatedImages,
        description: `Premium ${category} product featuring high-quality print design. Pre-shrunk, soft and durable.`,
        stock,
        variants,
        inStock: true
      });
    });
  };

  processCategory(allTshirtPaths, 'tshirts');
  processCategory(allBottlePaths, 'bottles');
  processCategory(allCupPaths, 'cups');
  processCategory(allMousepadPaths, 'mousepads');

  return products;
}

const initialLocalProducts = getProductsFromFolders();

// Initial Banners
const initialBanners = [
  {
    category: "tshirts",
    title: "Printed T-Shirts",
    subtitle: "Premium Cotton Collection",
    offerText: "BUY ANY 3 T-SHIRTS FOR ₹1199",
    buttonText: "Shop Collection",
    buttonLink: "/shop?category=tshirts",
    image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=1200"
  },
  {
    category: "cups",
    title: "Custom Cups",
    subtitle: "Premium Custom Printed Mugs",
    offerText: "CUSTOM PRINTED MUGS STARTING AT ₹199",
    buttonText: "Shop Collection",
    buttonLink: "/shop?category=cups",
    image: "https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?auto=format&fit=crop&q=80&w=1200"
  },
  {
    category: "bottles",
    title: "Water Bottles",
    subtitle: "Custom Engraved & Insulated Bottles",
    offerText: "CUSTOM BOTTLES STARTING AT ₹299",
    buttonText: "Shop Collection",
    buttonLink: "/shop?category=bottles",
    image: "https://images.unsplash.com/photo-1523362628745-0c100150b504?auto=format&fit=crop&q=80&w=1200"
  },
  {
    category: "mousepads",
    title: "Gaming Mousepads",
    subtitle: "Professional Smooth Desk Mats",
    offerText: "PREMIUM GAMING MOUSEPADS STARTING AT ₹399",
    buttonText: "Shop Collection",
    buttonLink: "/shop?category=mousepads",
    image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=1200"
  }
];

// Seed Reviews
const initialLocalReviews = [
  { id: "rev-1", productId: 1, name: "Rahul Sharma", rating: 5, comment: "Amazing print quality and fabric quality.", date: "2026-06-11T12:00:00Z", approved: true },
  { id: "rev-2", productId: 1, name: "Sneha Patel", rating: 4, comment: "Great fit! Colors are extremely bright. Will order again.", date: "2026-06-10T10:00:00Z", approved: true },
  { id: "rev-3", productId: 2, name: "Aditya Roy", rating: 5, comment: "Glitch print is insane! The hoodie is soft and comfortable.", date: "2026-06-08T09:00:00Z", approved: true },
  { id: "rev-4", productId: 4, name: "Priya Das", rating: 4, comment: "Mug looks premium. Customizable options worked easily.", date: "2026-06-07T14:30:00Z", approved: true },
  { id: "rev-5", productId: 7, name: "Kunal Sen", rating: 5, comment: "Stitched borders are perfect. Mouse moves like butter.", date: "2026-06-06T18:00:00Z", approved: true }
];

// Seed Coupons
const initialLocalCoupons = [
  { id: "c-1", code: "WELCOME10", discountType: "percentage", discountValue: 10, expiryDate: "2026-12-31" },
  { id: "c-2", code: "SAVE20", discountType: "percentage", discountValue: 20, expiryDate: "2026-12-31" },
  { id: "c-3", code: "FLAT150", discountType: "fixed", discountValue: 150, expiryDate: "2026-12-31" }
];

// Backend URL removed — all calls now go through Supabase SDK

export const StoreProvider = ({ children }) => {
  const [isBackendOnline, setIsBackendOnline] = useState(false);
  const [products, setProducts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [banners, setBanners] = useState([]);
  const [shippingSettings, setShippingSettings] = useState({
    freeShippingThreshold: 799,
    shippingCharge: 99,
    estimatedDeliveryDays: '3-7 Days'
  });
  const [coupons, setCoupons] = useState([]);
  const [wishlist, setWishlist] = useState(() => {
    const saved = localStorage.getItem('wishlist');
    return saved ? JSON.parse(saved) : [];
  });
  const [recentlyViewed, setRecentlyViewed] = useState(() => {
    const saved = localStorage.getItem('recentlyViewed');
    return saved ? JSON.parse(saved) : [];
  });
  
  // Local Orders list (for offline simulation)
  const [localOrders, setLocalOrders] = useState(() => {
    const saved = localStorage.getItem('localOrders');
    return saved ? JSON.parse(saved) : [];
  });

  // Verify backend status and load initial state
  useEffect(() => {
    const initStore = async () => {
      try {
        const { data: prodData, error: prodErr } = await supabase
          .from('products')
          .select('*, product_images(image_url, is_primary), product_variants(color, size, stock_quantity)');
        if (!prodErr) {
          setIsBackendOnline(true);
          console.log('✅ Connected to Supabase Backend successfully.');
          
          const mappedProducts = (prodData || []).map(p => {
            // Find primary image or fallback to first image
            const primaryImgObj = p.product_images?.find(img => img.is_primary) || p.product_images?.[0];
            let image = primaryImgObj ? primaryImgObj.image_url : null;
            let images = p.product_images?.map(img => img.image_url) || [];

            // Robust local file fallbacks if no images exist in DB
            if (!image) {
              if (p.name.toLowerCase().includes('black t-shirt')) {
                image = '/products/nevergiveup.jpeg';
                images = ['/products/nevergiveup.jpeg', '/products/nevergiveupp.jpeg'];
              } else if (p.name.toLowerCase().includes('white t-shirt')) {
                image = '/products/nevergiveupp.jpeg';
                images = ['/products/nevergiveupp.jpeg', '/products/nevergiveup.jpeg'];
              } else if (p.category.toLowerCase() === 'cups' || p.name.toLowerCase().includes('cup') || p.name.toLowerCase().includes('mug')) {
                image = '/products/cups.jpeg';
                images = ['/products/cups.jpeg', '/products/cupss.jpeg'];
              } else if (p.category.toLowerCase() === 'water bottles' || p.category.toLowerCase() === 'bottles' || p.name.toLowerCase().includes('bottle') || p.name.toLowerCase().includes('steel')) {
                image = '/products/deadphool.jpeg';
                images = ['/products/deadphool.jpeg', '/products/deadphooll.jpeg'];
              } else {
                image = 'https://placehold.co/400x400/1a1a2e/00f3ff?text=VERZ';
              }
            }

            // Map database categories to lowercase category tags used in frontend
            let category = p.category;
            const catLower = p.category.toLowerCase();
            if (catLower === 't-shirts' || catLower === 'tshirts') {
              category = 'tshirts';
            } else if (catLower === 'cups') {
              category = 'cups';
            } else if (catLower === 'water bottles' || catLower === 'bottles') {
              category = 'bottles';
            } else if (catLower === 'gaming mousepads' || catLower === 'mousepads') {
              category = 'mousepads';
            }

            // Map variants from database schema to format expected by the frontend
            const variants = p.product_variants ? p.product_variants.map(v => ({
              size: v.size === 'One Size' ? null : v.size,
              color: v.color,
              stock: v.stock_quantity
            })) : [];

            // Calculate total stock
            const totalStock = p.product_variants && p.product_variants.length > 0
              ? p.product_variants.reduce((sum, v) => sum + v.stock_quantity, 0)
              : 0;

            return {
              ...p,
              image,
              images,
              category,
              variants,
              stock: totalStock,
              inStock: totalStock > 0 || (p.product_variants && p.product_variants.length === 0)
            };
          });

          // Merge Supabase products with local products, keeping Supabase ones first and avoiding duplicates by name or slug
          const dbProductSlugs = new Set(mappedProducts.map(p => p.slug || p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')));
          const uniqueLocalProducts = initialLocalProducts.filter(lp => !dbProductSlugs.has(lp.slug));
          setProducts([...mappedProducts, ...uniqueLocalProducts]);

          const { data: banData } = await supabase.from('banners').select('*');
          setBanners(banData && banData.length > 0 ? banData : initialBanners);

          const { data: shipData } = await supabase.from('shipping_settings').select('*').single();
          if (shipData) setShippingSettings(shipData);

          const { data: revData } = await supabase.from('reviews').select('*');
          setReviews(revData && revData.length > 0 ? revData : initialLocalReviews);

          const { data: coupData } = await supabase.from('coupons').select('*');
          setCoupons(coupData && coupData.length > 0 ? coupData : initialLocalCoupons);
        } else {
          loadOfflineFallback();
        }
      } catch (err) {
        console.warn('⚠️ Supabase Backend Server offline or failed. Falling back to local offline state.');
        loadOfflineFallback();
      }
    };

    const loadOfflineFallback = () => {
      setIsBackendOnline(false);
      
      const localProds = localStorage.getItem('localProducts');
      const localRevs = localStorage.getItem('localReviews');
      const localBans = localStorage.getItem('localBanners');
      const localCoups = localStorage.getItem('localCoupons');
      const localShip = localStorage.getItem('localShipping');

      const parsedProds = localProds ? JSON.parse(localProds) : null;
      setProducts(parsedProds && parsedProds.length > 0 ? parsedProds : initialLocalProducts);

      const parsedRevs = localRevs ? JSON.parse(localRevs) : null;
      setReviews(parsedRevs && parsedRevs.length > 0 ? parsedRevs : initialLocalReviews);

      const parsedBans = localBans ? JSON.parse(localBans) : null;
      setBanners(parsedBans && parsedBans.length > 0 ? parsedBans : initialBanners);

      const parsedCoups = localCoups ? JSON.parse(localCoups) : null;
      setCoupons(parsedCoups && parsedCoups.length > 0 ? parsedCoups : initialLocalCoupons);
      
      if (localShip) setShippingSettings(JSON.parse(localShip));
    };

    initStore();
  }, []);

  // Persist local state whenever changed (for offline backup)
  useEffect(() => {
    if (!isBackendOnline && products.length > 0) {
      localStorage.setItem('localProducts', JSON.stringify(products));
    }
  }, [products, isBackendOnline]);

  useEffect(() => {
    if (!isBackendOnline) {
      localStorage.setItem('localReviews', JSON.stringify(reviews));
    }
  }, [reviews, isBackendOnline]);

  useEffect(() => {
    if (!isBackendOnline) {
      localStorage.setItem('localBanners', JSON.stringify(banners));
    }
  }, [banners, isBackendOnline]);

  useEffect(() => {
    if (!isBackendOnline) {
      localStorage.setItem('localCoupons', JSON.stringify(coupons));
    }
  }, [coupons, isBackendOnline]);

  useEffect(() => {
    localStorage.setItem('localShipping', JSON.stringify(shippingSettings));
  }, [shippingSettings]);

  useEffect(() => {
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  useEffect(() => {
    localStorage.setItem('recentlyViewed', JSON.stringify(recentlyViewed));
  }, [recentlyViewed]);

  useEffect(() => {
    localStorage.setItem('localOrders', JSON.stringify(localOrders));
  }, [localOrders]);

  // Dynamic Slug Generator
  const generateSlug = (name) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  // Image WebP compression utility
  const optimizeAndCompressImage = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
          const MAX_WIDTH = 1000;
          const MAX_HEIGHT = 1000;
          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          
          // WebP output under 500KB
          const dataUrl = canvas.toDataURL('image/webp', 0.6);
          resolve(dataUrl);
        };
        img.onerror = (err) => reject(err);
      };
      reader.onerror = (err) => reject(err);
    });
  };

  // Product CRUD
  const addProduct = async (productData) => {
    const productSlug = generateSlug(productData.name);
    const enrichedProduct = {
      ...productData,
      slug: productSlug,
      inStock: productData.stock > 0
    };

    if (isBackendOnline) {
      try {
        const { data, error } = await supabase.from('products').insert([enrichedProduct]).select().single();
        if (!error && data) {
          setProducts(prev => [...prev, data]);
          return true;
        }
      } catch (err) {
        console.error('Supabase insert failed, saving locally:', err);
      }
    }

    // Local fallback
    const id = products.length > 0 ? Math.max(...products.map(p => p.id || 0)) + 1 : 1;
    const localProd = { ...enrichedProduct, id, _id: `local-prod-${id}` };
    setProducts(prev => [...prev, localProd]);
    return true;
  };

  const updateProduct = async (id, productData) => {
    const productSlug = productData.name ? generateSlug(productData.name) : undefined;
    const updatedFields = {
      ...productData,
      ...(productSlug && { slug: productSlug }),
      inStock: productData.stock > 0
    };

    if (isBackendOnline) {
      try {
        const { data, error } = await supabase.from('products').update(updatedFields).eq('id', id).select().single();
        if (!error && data) {
          setProducts(prev => prev.map(p => (p._id === id || p.id === id) ? data : p));
          return true;
        }
      } catch (err) {
        console.error('Supabase update failed, saving locally:', err);
      }
    }

    // Local fallback
    setProducts(prev => prev.map(p => (p._id === id || p.id === id) ? { ...p, ...updatedFields } : p));
    return true;
  };

  const deleteProduct = async (id) => {
    if (isBackendOnline) {
      try {
        const { error } = await supabase.from('products').delete().eq('id', id);
        if (!error) {
          setProducts(prev => prev.filter(p => p._id !== id && p.id !== id));
          return true;
        }
      } catch (err) {
        console.error('Supabase delete failed, saving locally:', err);
      }
    }

    // Local fallback
    setProducts(prev => prev.filter(p => p._id !== id && p.id !== id));
    return true;
  };

  // Wishlist Actions
  const addToWishlist = (product) => {
    if (!wishlist.some(item => item.id === product.id)) {
      setWishlist(prev => [...prev, product]);
    }
  };

  const removeFromWishlist = (productId) => {
    setWishlist(prev => prev.filter(item => item.id !== productId));
  };

  const isInWishlist = (productId) => {
    return wishlist.some(item => item.id === productId);
  };

  // Recently Viewed
  const addToRecentlyViewed = (product) => {
    setRecentlyViewed(prev => {
      const filtered = prev.filter(p => p.id !== product.id);
      return [product, ...filtered].slice(0, 4); // Limit to 4 items
    });
  };

  // Reviews CRUD & Approval
  const addReview = async (productId, reviewData) => {
    const enrichedReview = {
      productId,
      name: reviewData.name,
      rating: reviewData.rating,
      comment: reviewData.comment,
      date: new Date().toISOString(),
      approved: reviewData.approved || false // default unapproved
    };

    if (isBackendOnline) {
      try {
        const { data, error } = await supabase.from('reviews').insert([enrichedReview]).select().single();
        if (!error && data) {
          setReviews(prev => [data, ...prev]);
          return true;
        }
      } catch (err) {
        console.error('Supabase reviews insert failed:', err);
      }
    }

    // Local fallback
    const id = `rev-${reviews.length + 1}`;
    setReviews(prev => [{ ...enrichedReview, id }, ...prev]);
    return true;
  };

  const approveReview = async (reviewId) => {
    if (isBackendOnline) {
      try {
        const { error } = await supabase.from('reviews').update({ approved: true }).eq('id', reviewId);
        if (!error) {
          setReviews(prev => prev.map(r => (r.id === reviewId || r._id === reviewId) ? { ...r, approved: true } : r));
          return true;
        }
      } catch (err) {
        console.error('Supabase review approval failed:', err);
      }
    }

    setReviews(prev => prev.map(r => r.id === reviewId ? { ...r, approved: true } : r));
    return true;
  };

  const rejectReview = async (reviewId) => {
    if (isBackendOnline) {
      try {
        const { error } = await supabase.from('reviews').update({ approved: false }).eq('id', reviewId);
        if (!error) {
          setReviews(prev => prev.map(r => (r.id === reviewId || r._id === reviewId) ? { ...r, approved: false } : r));
          return true;
        }
      } catch (err) {
        console.error('Supabase review rejection failed:', err);
      }
    }

    setReviews(prev => prev.map(r => r.id === reviewId ? { ...r, approved: false } : r));
    return true;
  };

  const deleteReview = async (reviewId) => {
    if (isBackendOnline) {
      try {
        const { error } = await supabase.from('reviews').delete().eq('id', reviewId);
        if (!error) {
          setReviews(prev => prev.filter(r => r._id !== reviewId && r.id !== reviewId));
          return true;
        }
      } catch (err) {
        console.error('Supabase review deletion failed:', err);
      }
    }

    setReviews(prev => prev.filter(r => r.id !== reviewId && r._id !== reviewId));
    return true;
  };

  // Coupons CRUD
  const addCoupon = async (couponData) => {
    if (isBackendOnline) {
      try {
        const { data, error } = await supabase.from('coupons').insert([couponData]).select().single();
        if (!error && data) {
          setCoupons(prev => [...prev, data]);
          return true;
        }
      } catch (err) {
        console.error(err);
      }
    }

    const id = `c-${coupons.length + 1}`;
    setCoupons(prev => [...prev, { ...couponData, id }]);
    return true;
  };

  const editCoupon = async (couponId, couponData) => {
    if (isBackendOnline) {
      try {
        const { data, error } = await supabase.from('coupons').update(couponData).eq('id', couponId).select().single();
        if (!error && data) {
          setCoupons(prev => prev.map(c => (c.id === couponId || c._id === couponId) ? data : c));
          return true;
        }
      } catch (err) {
        console.error(err);
      }
    }

    setCoupons(prev => prev.map(c => (c.id === couponId || c._id === couponId) ? { ...c, ...couponData } : c));
    return true;
  };

  const deleteCoupon = async (couponId) => {
    if (isBackendOnline) {
      try {
        const { error } = await supabase.from('coupons').delete().eq('id', couponId);
        if (!error) {
          setCoupons(prev => prev.filter(c => c._id !== couponId && c.id !== couponId));
          return true;
        }
      } catch (err) {
        console.error(err);
      }
    }

    setCoupons(prev => prev.filter(c => c.id !== couponId && c._id !== couponId));
    return true;
  };

  const validateCoupon = async (code) => {
    if (isBackendOnline) {
      try {
        const { data, error } = await supabase.from('coupons').select('*').ilike('code', code).single();
        if (!error && data) {
          if (new Date(data.expiryDate || data.expiry_date) >= new Date()) {
            return { success: true, code: data.code, discountType: data.discountType || data.discount_type, discountValue: data.discountValue || data.discount_value };
          }
        }
      } catch (err) {
        console.error(err);
      }
    }

    // Local validation
    const coupon = coupons.find(c => c.code.toUpperCase() === code.toUpperCase());
    if (coupon) {
      if (new Date(coupon.expiryDate) >= new Date()) {
        return {
          success: true,
          code: coupon.code,
          discountType: coupon.discountType,
          discountValue: coupon.discountValue
        };
      }
    }
    return { success: false, message: 'Invalid or expired coupon code' };
  };

  // Category Banners CRUD
  const updateCategoryBanner = async (category, bannerData) => {
    if (isBackendOnline) {
      try {
        const { data, error } = await supabase.from('banners').update(bannerData).eq('category', category).select().single();
        if (!error && data) {
          setBanners(prev => prev.map(b => b.category === category ? data : b));
          return true;
        }
      } catch (err) {
        console.error(err);
      }
    }

    setBanners(prev => prev.map(b => b.category === category ? { ...b, ...bannerData } : b));
    return true;
  };

  // Shipping settings CRUD
  const updateShippingSettings = async (settingsData) => {
    if (isBackendOnline) {
      try {
        const { data, error } = await supabase.from('shipping_settings').upsert(settingsData).select().single();
        if (!error && data) {
          setShippingSettings(data);
          return true;
        }
      } catch (err) {
        console.error(err);
      }
    }

    setShippingSettings(settingsData);
    return true;
  };

  // Simulate place order (offline)
  const placeMockOrder = (orderData) => {
    const orderId = `vz_${Math.floor(100000 + Math.random() * 900000)}`;
    const newOrder = {
      _id: `mock-ord-${Date.now()}`,
      razorpayOrderId: orderId,
      user: JSON.parse(localStorage.getItem('user')) || { name: 'Guest User', email: 'guest@example.com' },
      items: orderData.items,
      amount: orderData.amount,
      discountAmount: orderData.discountAmount || 0,
      shippingCharge: orderData.shippingCharge || 0,
      couponApplied: orderData.couponApplied,
      status: 'confirmed',
      paymentStatus: 'paid',
      shippingAddress: orderData.shippingAddress,
      shippingInfo: {
        courierCompany: 'Express Delivery Services',
        trackingNumber: `TRK-${Math.floor(100000000 + Math.random() * 900000000)}`,
        dispatchDate: new Date().toISOString(),
        estimatedDeliveryDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString()
      },
      timeline: [
        { status: 'pending', note: 'Order initiated', timestamp: new Date().toISOString() },
        { status: 'confirmed', note: 'Order payment successfully completed', timestamp: new Date().toISOString() }
      ],
      createdAt: new Date().toISOString()
    };

    setLocalOrders(prev => [newOrder, ...prev]);
    return newOrder;
  };

  const updateMockOrderStatus = (orderId, status, note) => {
    setLocalOrders(prev => prev.map(o => {
      if (o._id === orderId || o.razorpayOrderId === orderId) {
        const updatedTimeline = [...o.timeline, { status, note: note || `Status updated to ${status}`, timestamp: new Date().toISOString() }];
        
        let paymentStatus = o.paymentStatus;
        if (status === 'delivered') paymentStatus = 'paid';
        if (status === 'refunded') paymentStatus = 'refunded';
        if (status === 'cancelled' && o.paymentStatus === 'paid') paymentStatus = 'refunded';

        return { ...o, status, paymentStatus, timeline: updatedTimeline };
      }
      return o;
    }));
  };

  const updateMockOrderShipping = (orderId, courier, tracking) => {
    setLocalOrders(prev => prev.map(o => {
      if (o._id === orderId || o.razorpayOrderId === orderId) {
        const timeline = [...o.timeline, { status: 'shipped', note: `Dispatched via ${courier} (Tracking: ${tracking})`, timestamp: new Date().toISOString() }];
        return {
          ...o,
          status: 'shipped',
          shippingInfo: {
            courierCompany: courier,
            trackingNumber: tracking,
            dispatchDate: new Date().toISOString(),
            estimatedDeliveryDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString()
          },
          timeline
        };
      }
      return o;
    }));
  };

  // Dynamic values
  return (
    <StoreContext.Provider value={{
      isBackendOnline,
      products,
      reviews,
      banners,
      shippingSettings,
      coupons,
      wishlist,
      recentlyViewed,
      localOrders,
      
      // Methods
      addProduct,
      updateProduct,
      deleteProduct,
      addToWishlist,
      removeFromWishlist,
      isInWishlist,
      addToRecentlyViewed,
      addReview,
      approveReview,
      rejectReview,
      deleteReview,
      addCoupon,
      editCoupon,
      deleteCoupon,
      validateCoupon,
      updateCategoryBanner,
      updateShippingSettings,
      optimizeAndCompressImage,
      
      // Offline helpers
      placeMockOrder,
      updateMockOrderStatus,
      updateMockOrderShipping
    }}>
      {children}
    </StoreContext.Provider>
  );
};
