/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { LanguageProvider, useLanguage } from './i18n/LanguageContext';
import { ThemeProvider } from './theme/ThemeContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { OfflineIndicator } from './components/OfflineIndicator';
import { CommandPalette } from './components/CommandPalette';
import { ToolErrorBoundary } from './components/ToolErrorBoundary';

const HomePage = lazy(() => import('./pages/Home').then((m) => ({ default: m.HomePage })));
const ToolsDirectory = lazy(() =>
  import('./pages/ToolsDirectory').then((m) => ({ default: m.ToolsDirectory }))
);
const ReaderPage = lazy(() =>
  import('./pages/ReaderPage').then((m) => ({ default: m.ReaderPage }))
);
const OrganizePage = lazy(() =>
  import('./pages/OrganizePage').then((m) => ({ default: m.OrganizePage }))
);
const MergePage = lazy(() =>
  import('./pages/MergePage').then((m) => ({ default: m.MergePage }))
);
const SplitPage = lazy(() =>
  import('./pages/SplitPage').then((m) => ({ default: m.SplitPage }))
);
const CompressPage = lazy(() =>
  import('./pages/CompressPage').then((m) => ({ default: m.CompressPage }))
);
const PageNumbersPage = lazy(() =>
  import('./pages/PageNumbersPage').then((m) => ({ default: m.PageNumbersPage }))
);
const WatermarkPage = lazy(() =>
  import('./pages/WatermarkPage').then((m) => ({ default: m.WatermarkPage }))
);
const CropPage = lazy(() => import('./pages/CropPage').then((m) => ({ default: m.CropPage })));
const ImagesToPdfPage = lazy(() =>
  import('./pages/ImagesToPdfPage').then((m) => ({ default: m.ImagesToPdfPage }))
);
const AnnotatePage = lazy(() =>
  import('./pages/AnnotatePage').then((m) => ({ default: m.AnnotatePage }))
);
const ConvertPage = lazy(() =>
  import('./pages/ConvertPage').then((m) => ({ default: m.ConvertPage }))
);
const PdfToWordPage = lazy(() =>
  import('./pages/PdfToWordPage').then((m) => ({ default: m.PdfToWordPage }))
);
const OcrPage = lazy(() => import('./pages/OcrPage').then((m) => ({ default: m.OcrPage })));
const SecurityPage = lazy(() =>
  import('./pages/SecurityPage').then((m) => ({ default: m.SecurityPage }))
);
const ProtectPage = lazy(() =>
  import('./pages/ProtectPage').then((m) => ({ default: m.ProtectPage }))
);
const UnlockPage = lazy(() =>
  import('./pages/UnlockPage').then((m) => ({ default: m.UnlockPage }))
);
const RedactPage = lazy(() =>
  import('./pages/RedactPage').then((m) => ({ default: m.RedactPage }))
);
const FormFillerPage = lazy(() =>
  import('./pages/FormFillerPage').then((m) => ({ default: m.FormFillerPage }))
);
const FlattenPage = lazy(() =>
  import('./pages/FlattenPage').then((m) => ({ default: m.FlattenPage }))
);
const ComparePage = lazy(() =>
  import('./pages/ComparePage').then((m) => ({ default: m.ComparePage }))
);
const ExtractImagesPage = lazy(() =>
  import('./pages/ExtractImagesPage').then((m) => ({ default: m.ExtractImagesPage }))
);
const HeaderFooterPage = lazy(() =>
  import('./pages/HeaderFooterPage').then((m) => ({ default: m.HeaderFooterPage }))
);
const PrivacyPage = lazy(() =>
  import('./pages/PrivacyPage').then((m) => ({ default: m.PrivacyPage }))
);
const AboutPage = lazy(() =>
  import('./pages/AboutPage').then((m) => ({ default: m.AboutPage }))
);

const RouteLoadingFallback: React.FC = () => {
  const { t } = useLanguage();
  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3 px-4 py-16 text-slate-500 dark:text-slate-400">
      <Loader2 className="w-7 h-7 animate-spin text-rose-600" />
      <span className="text-sm font-medium">{t.common.loading}</span>
    </div>
  );
};

const AppRoutes: React.FC = () => {
  const location = useLocation();
  const wrapTool = (element: React.ReactNode) => (
    <ToolErrorBoundary resetKey={location.pathname}>{element}</ToolErrorBoundary>
  );

  return (
    <Suspense fallback={<RouteLoadingFallback />}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/tools" element={<ToolsDirectory />} />
        <Route path="/reader" element={wrapTool(<ReaderPage />)} />
        <Route path="/organize" element={wrapTool(<OrganizePage />)} />
        <Route path="/merge" element={wrapTool(<MergePage />)} />
        <Route path="/split" element={wrapTool(<SplitPage />)} />
        <Route path="/compress" element={wrapTool(<CompressPage />)} />
        <Route path="/page-numbers" element={wrapTool(<PageNumbersPage />)} />
        <Route path="/watermark" element={wrapTool(<WatermarkPage />)} />
        <Route path="/crop" element={wrapTool(<CropPage />)} />
        <Route path="/images-to-pdf" element={wrapTool(<ImagesToPdfPage />)} />
        <Route path="/annotate" element={wrapTool(<AnnotatePage />)} />
        <Route path="/redact" element={wrapTool(<RedactPage />)} />
        <Route path="/form-filler" element={wrapTool(<FormFillerPage />)} />
        <Route path="/flatten" element={wrapTool(<FlattenPage />)} />
        <Route path="/header-footer" element={wrapTool(<HeaderFooterPage />)} />
        <Route path="/compare" element={wrapTool(<ComparePage />)} />
        <Route path="/extract-images" element={wrapTool(<ExtractImagesPage />)} />
        <Route path="/convert" element={wrapTool(<ConvertPage />)} />
        <Route path="/pdf-to-word" element={wrapTool(<PdfToWordPage />)} />
        <Route path="/ocr" element={wrapTool(<OcrPage />)} />
        <Route path="/security" element={wrapTool(<SecurityPage />)} />
        <Route path="/protect" element={wrapTool(<ProtectPage />)} />
        <Route path="/unlock" element={wrapTool(<UnlockPage />)} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <BrowserRouter>
          <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors selection:bg-rose-500/20 selection:text-rose-600 dark:selection:text-rose-300">
            <Header />
            <CommandPalette />
            <main className="flex-1">
              <AppRoutes />
            </main>
            <Footer />
            <OfflineIndicator />
          </div>
        </BrowserRouter>
      </LanguageProvider>
    </ThemeProvider>
  );
}
