import { Router } from 'express';
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../controllers/productController.js';
import { auth } from '../middleware/auth.js';
import { upload } from '../config/multer.js';

export const productRouter = Router();
export const adminProductRouter = Router();

// Rute Publik (/api/products)
productRouter.get('/', getProducts);
productRouter.get('/:id', getProductById);

// Rute Admin (/api/admin/products)
adminProductRouter.use(auth);
adminProductRouter.post('/', upload.single('image'), createProduct);
adminProductRouter.put('/:id', upload.single('image'), updateProduct);
adminProductRouter.delete('/:id', deleteProduct);
