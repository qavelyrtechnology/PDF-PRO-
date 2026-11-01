/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LanguageProvider } from './i18n/LanguageContext';
import { ThemeProvider } from './theme/ThemeContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { OfflineIndicator } from './components/OfflineIndicator';
import { CommandPalette } from './components/CommandPalette';

import { HomePage } from './pages/Home';
import { ToolsDirectory } from './pages/ToolsDirectory';
import { ReaderPage } from './pages/ReaderPage';
import { OrganizePage } from './pages/OrganizePage';
import { MergePage } from './pages/MergePage';
import { SplitPage } from './pages/SplitPage';
import { CompressPage } from './pages/CompressPage';
import { PageNumbersPage } from './pages/PageNumbersPage';
import { WatermarkPage } from './pages/WatermarkPage';
import { CropPage } from './pages/CropPage';
import { ImagesToPdfPage } from './pages/ImagesToPdfPage';
import { AnnotatePage } from './pages/AnnotatePage';
import { ConvertPage } from './pages/ConvertPage';
import { OcrPage } from './pages/OcrPage';
import { SecurityPage } from './pages/SecurityPage';
import { RedactPage } from './pages/RedactPage';
import { FormFillerPage } from './pages/FormFillerPage';
import { FlattenPage } from './pages/FlattenPage';
import { ComparePage } from './pages/ComparePage';
import { ExtractImagesPage } from './pages/ExtractImagesPage';
import { HeaderFooterPage } from './pages/HeaderFooterPage';
import { PrivacyPage } from './pages/PrivacyPage';
import { AboutPage } from './pages/AboutPage';

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <BrowserRouter>
          <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors selection:bg-rose-500/20 selection:text-rose-600 dark:selection:text-rose-300">
            <Header />
            <CommandPalette />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/tools" element={<ToolsDirectory />} />
                <Route path="/reader" element={<ReaderPage />} />
                <Route path="/organize" element={<OrganizePage />} />
                <Route path="/merge" element={<MergePage />} />
                <Route path="/split" element={<SplitPage />} />
                <Route path="/compress" element={<CompressPage />} />
                <Route path="/page-numbers" element={<PageNumbersPage />} />
                <Route path="/watermark" element={<WatermarkPage />} />
                <Route path="/crop" element={<CropPage />} />
                <Route path="/images-to-pdf" element={<ImagesToPdfPage />} />
                <Route path="/annotate" element={<AnnotatePage />} />
                <Route path="/redact" element={<RedactPage />} />
                <Route path="/form-filler" element={<FormFillerPage />} />
                <Route path="/flatten" element={<FlattenPage />} />
                <Route path="/header-footer" element={<HeaderFooterPage />} />
                <Route path="/compare" element={<ComparePage />} />
                <Route path="/extract-images" element={<ExtractImagesPage />} />
                <Route path="/convert" element={<ConvertPage />} />
                <Route path="/ocr" element={<OcrPage />} />
                <Route path="/security" element={<SecurityPage />} />
                <Route path="/privacy" element={<PrivacyPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
            <Footer />
            <OfflineIndicator />
          </div>
        </BrowserRouter>
      </LanguageProvider>
    </ThemeProvider>
  );
}
