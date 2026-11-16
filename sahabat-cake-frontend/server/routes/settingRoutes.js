import { Router } from 'express';
import { getSettings, updateSettings } from '../controllers/settingController.js';
import { auth } from '../middleware/auth.js';

export const settingRouter = Router();
export const adminSettingRouter = Router();

// Rute Publik (/api/settings)
settingRouter.get('/', getSettings);

// Rute Admin (/api/admin/settings)
adminSettingRouter.use(auth);
adminSettingRouter.put('/', updateSettings);
