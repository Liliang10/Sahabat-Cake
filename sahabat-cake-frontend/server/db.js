import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { seed } from './data/seed.js';

const dir = path.dirname(fileURLToPath(import.meta.url));
const file = path.join(dir, 'data', 'db.json');

if (!fs.existsSync(file)) fs.writeFileSync(file, JSON.stringify(seed, null, 2));

export const db = JSON.parse(fs.readFileSync(file, 'utf8'));
export const save = () => fs.writeFileSync(file, JSON.stringify(db, null, 2));
