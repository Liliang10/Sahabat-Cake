import { Router } from 'express';
import {
  createCustomRequest,
  createCatalogOrder,
  getAdminOrders,
  updateAdminOrder,
} from '../controllers/orderController.js';
import { auth } from '../middleware/auth.js';
import { upload } from '../config/multer.js';

export const orderRouter = Router();
export const customRequestRouter = Router();
export const adminOrderRouter = Router();

// Rute Publik untuk pesanan katalog (/api/orders)
orderRouter.post('/', createCatalogOrder);

// Rute Publik untuk permintaan custom tart (/api/custom-requests)
customRequestRouter.post('/', upload.single('referensi'), createCustomRequest);

// Rute Admin untuk manajemen pesanan (/api/admin/orders)
adminOrderRouter.use(auth);
adminOrderRouter.get('/', getAdminOrders);
adminOrderRouter.patch('/:id', updateAdminOrder);
