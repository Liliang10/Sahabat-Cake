import { Routes, Route, Navigate } from 'react-router-dom';
import { SettingsProvider } from './components/Settings.jsx';
import Layout from './components/Layout.jsx';
import Home from './pages/Home.jsx';
import About from './pages/About.jsx';
import Catalog from './pages/Catalog.jsx';
import Custom from './pages/Custom.jsx';
import Gallery from './pages/Gallery.jsx';
import AdminLayout from './admin/AdminLayout.jsx';
import Summary from './admin/Summary.jsx';
import Products from './admin/Products.jsx';
import Manage from './admin/Manage.jsx';

export default function App() {
  return (
    <SettingsProvider>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="tentang-kami" element={<About />} />
          <Route path="katalog-tart" element={<Catalog category="tart" />} />
          <Route path="custom-tart" element={<Custom />} />
          <Route path="kue-basah" element={<Catalog category="kue-basah" />} />
          <Route path="galeri-kontak" element={<Gallery />} />
        </Route>
        <Route path="admin" element={<AdminLayout />}>
          <Route index element={<Summary />} />
          <Route path="produk" element={<Products />} />
          <Route path="pengaturan" element={<Manage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </SettingsProvider>
  );
}
