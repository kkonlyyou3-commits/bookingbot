import { Router } from 'express';
import { getRobuxRate, getMinOrderRobux, getListingMarkup } from '../utils/pricing';
import { config } from '../config';

export const metaRouter = Router();

metaRouter.get('/', (_req, res) => {
  res.json({
    shopName: config.shopName,
    managerUsername: config.managerUsername,
    robuxRateUah: getRobuxRate(),
    minOrderRobux: getMinOrderRobux(),
    listingMarkup: getListingMarkup(),
  });
});
