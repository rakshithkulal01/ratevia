import prisma from '../config/prisma.js';
import { Prisma } from '@prisma/client';

const SETTING_KEY = 'RATEVIA_PRICE';
const DEFAULT_PRICE = 1000;
const DEFAULT_CURRENCY = 'INR';

export const pricingService = {
  /**
   * Fetch current public Ratevia price from database setting.
   * Auto-initializes if not yet set in database.
   */
  getPublicPrice: async () => {
    let setting = await prisma.appSetting.findUnique({
      where: { key: SETTING_KEY },
    });

    if (!setting) {
      setting = await prisma.appSetting.create({
        data: {
          key: SETTING_KEY,
          value: { price: DEFAULT_PRICE, currency: DEFAULT_CURRENCY },
        },
      });
    }

    const priceValue = typeof setting.value === 'object' && setting.value !== null
      ? Number(setting.value.price ?? DEFAULT_PRICE)
      : Number(setting.value ?? DEFAULT_PRICE);

    const currencyValue = typeof setting.value === 'object' && setting.value !== null
      ? String(setting.value.currency || DEFAULT_CURRENCY)
      : DEFAULT_CURRENCY;

    return {
      price: priceValue,
      currency: currencyValue,
    };
  },

  /**
   * Fetch admin pricing details including update timestamp.
   */
  getAdminPricing: async () => {
    let setting = await prisma.appSetting.findUnique({
      where: { key: SETTING_KEY },
    });

    if (!setting) {
      setting = await prisma.appSetting.create({
        data: {
          key: SETTING_KEY,
          value: { price: DEFAULT_PRICE, currency: DEFAULT_CURRENCY },
        },
      });
    }

    const priceValue = typeof setting.value === 'object' && setting.value !== null
      ? Number(setting.value.price ?? DEFAULT_PRICE)
      : Number(setting.value ?? DEFAULT_PRICE);

    const currencyValue = typeof setting.value === 'object' && setting.value !== null
      ? String(setting.value.currency || DEFAULT_CURRENCY)
      : DEFAULT_CURRENCY;

    return {
      price: priceValue,
      currency: currencyValue,
      updatedAt: setting.updatedAt,
    };
  },

  /**
   * Update Ratevia price (Admin only).
   * Validates non-negative numeric value, saves AppSetting, and records PriceHistory.
   */
  updatePrice: async ({ newPrice, currency = 'INR', adminUser }) => {
    const numericPrice = Number(newPrice);
    if (isNaN(numericPrice) || numericPrice < 0) {
      const err = new Error('Price must be a valid non-negative number.');
      err.status = 400;
      throw err;
    }

    // Two decimal places precision for currency
    const formattedPrice = Math.round(numericPrice * 100) / 100;

    let existingSetting = await prisma.appSetting.findUnique({
      where: { key: SETTING_KEY },
    });

    const oldPriceValue = existingSetting && typeof existingSetting.value === 'object' && existingSetting.value !== null
      ? Number(existingSetting.value.price ?? DEFAULT_PRICE)
      : DEFAULT_PRICE;

    // Transaction to update setting and record audit history
    const result = await prisma.$transaction(async (tx) => {
      const updatedSetting = await tx.appSetting.upsert({
        where: { key: SETTING_KEY },
        create: {
          key: SETTING_KEY,
          value: { price: formattedPrice, currency },
        },
        update: {
          value: { price: formattedPrice, currency },
        },
      });

      const history = await tx.priceHistory.create({
        data: {
          oldPrice: new Prisma.Decimal(oldPriceValue),
          newPrice: new Prisma.Decimal(formattedPrice),
          currency,
          changedById: adminUser?.id || null,
        },
      });

      return { updatedSetting, history };
    });

    console.log(
      `[PricingService] Price updated from ₹${oldPriceValue} to ₹${formattedPrice} by ${adminUser?.email || 'Admin'}`
    );

    return {
      price: formattedPrice,
      currency,
      updatedAt: result.updatedSetting.updatedAt,
    };
  },

  /**
   * Fetch audit trail of price changes.
   */
  getPriceHistory: async () => {
    const history = await prisma.priceHistory.findMany({
      orderBy: { changedAt: 'desc' },
      take: 50,
      include: {
        changedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return history.map((h) => ({
      id: h.id,
      oldPrice: Number(h.oldPrice),
      newPrice: Number(h.newPrice),
      currency: h.currency,
      changedAt: h.changedAt,
      changedBy: h.changedBy,
    }));
  },
};

export default pricingService;
