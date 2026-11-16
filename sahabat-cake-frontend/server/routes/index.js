import { Router } from 'express';
import authRoutes from './authRoutes.js';
import { productRouter, adminProductRouter } from './productRoutes.js';
import { orderRouter, customRequestRouter, adminOrderRouter } from './orderRoutes.js';
import { galleryRouter, adminGalleryRouter } from './galleryRoutes.js';
import { settingRouter, adminSettingRouter } from './settingRoutes.js';
import summaryRoutes from './summaryRoutes.js';

const apiRouter = Router();

// Rute Publik
apiRouter.use('/products', productRouter);
apiRouter.use('/gallery', galleryRouter);
apiRouter.use('/settings', settingRouter);
apiRouter.use('/custom-requests', customRequestRouter);
apiRouter.use('/orders', orderRouter);

// Rute Admin
apiRouter.use('/admin', authRoutes);
apiRouter.use('/admin/summary', summaryRoutes);
apiRouter.use('/admin/orders', adminOrderRouter);
apiRouter.use('/admin/products', adminProductRouter);
apiRouter.use('/admin/settings', adminSettingRouter);
apiRouter.use('/admin/gallery', adminGalleryRouter);

export default apiRouter;
