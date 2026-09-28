import { useState, useEffect } from 'react';
import { publicService } from '../services/publicService.js';

let cachedPrice = 1000;
let cachedCurrency = 'INR';
let hasLoaded = false;

/**
 * usePlatformPrice
 * Dynamic hook providing the admin-configured Ratevia price across public and protected pages.
 */
export function usePlatformPrice() {
  const [price, setPrice] = useState(cachedPrice);
  const [currency, setCurrency] = useState(cachedCurrency);
  const [loading, setLoading] = useState(!hasLoaded);

  useEffect(() => {
    let mounted = true;
    publicService
      .getPublicPrice()
      .then((data) => {
        if (!mounted || !data) return;
        cachedPrice = data.price;
        cachedCurrency = data.currency || 'INR';
        hasLoaded = true;
        setPrice(data.price);
        setCurrency(data.currency || 'INR');
      })
      .catch((err) => {
        console.warn('[usePlatformPrice] Could not fetch public price, using fallback:', err);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  return {
    price,
    currency,
    loading,
    formattedPrice: `₹${Number(price).toLocaleString('en-IN')}`,
  };
}

export default usePlatformPrice;
