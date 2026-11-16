import { Router } from 'express';
import {
  getGallery,
  createGallery,
  deleteGallery,
} from '../controllers/galleryController.js';
import { auth } from '../middleware/auth.js';
import { upload } from '../config/multer.js';

export const galleryRouter = Router();
export const adminGalleryRouter = Router();

// Rute Publik (/api/gallery)
galleryRouter.get('/', getGallery);

// Rute Admin (/api/admin/gallery)
adminGalleryRouter.use(auth);
adminGalleryRouter.post('/', upload.single('image'), createGallery);
adminGalleryRouter.delete('/:id', deleteGallery);
