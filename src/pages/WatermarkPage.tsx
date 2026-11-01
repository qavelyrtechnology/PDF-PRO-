import React, { useState } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { DropZone } from '../components/DropZone';
import { FileCard } from '../components/FileCard';
import { StatusBanner } from '../components/StatusBanner';
import {
  loadPdfJsDocument,
  addWatermarkToPdf,
  shareOrDownloadFile,
  WatermarkOptions,
} from '../services/pdfService';
import { Stamp, Download, Share2, Type, Image as ImageIcon } from 'lucide-react';

export const WatermarkPage: React.FC = () => {
  const { t, isRtl } = useLanguage();
  const [file, setFile] = useState<File | null>(null);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [type, setType] = useState<'text' | 'image'>('text');
  const [text, setText] = useState('CONFIDENTIAL');
  const [imageDataUrl, setImageDataUrl] = useState<string>('');
  const [opacity, setOpacity] = useState(0.25);
  const [rotation, setRotation] = useState(45);
  const [fontSize, setFontSize] = useState(42);
  const [colorHex, setColorHex] = useState('#e11d48');

  const [isProcessing, setIsProcessing] = useState(false);
  const [watermarkedBytes, setWatermarkedBytes] = useState<Uint8Array | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleFileSelected = async (files: File[]) => {
    if (files.length === 0) return;
    const selected = files[0];
    setFile(selected);
    setWatermarkedBytes(null);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const doc = await loadPdfJsDocument(selected);
      setTotalPages(doc.numPages);
    } catch (err: any) {
      console.error('Watermark load error:', err);
      setErrorMessage(t.reader.pageRenderError);
      setFile(null);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setImageDataUrl(ev.target?.result as string);
    };
    reader.readAsDataURL(f);
  };

  const handleApplyWatermark = async () => {
    if (!file) return;

    if (type === 'text' && !text.trim()) {
      setErrorMessage('Please enter watermark text.');
      return;
    }

    if (type === 'image' && !imageDataUrl) {
      setErrorMessage('Please select a watermark image.');
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const bytes = await addWatermarkToPdf(file, {
        type,
        text,
        imageDataUrl,
        opacity,
        rotationDegrees: rotation,
        fontSize,
        colorHex,
      });
      setWatermarkedBytes(bytes);
      setSuccessMessage('Watermark applied successfully across all pages!');
    } catch (err: any) {
      console.error('Watermark error:', err);
      setErrorMessage(err?.message || t.common.error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!watermarkedBytes || !file) return;
    const baseName = file.name.replace(/\.pdf$/i, '');
    shareOrDownloadFile(watermarkedBytes, `${baseName}_watermarked.pdf`);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-5">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Stamp className="w-7 h-7 text-rose-600" />
          {t.watermark.title}
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          {t.watermark.subtitle}
        </p>
      </div>

      {errorMessage && (
        <StatusBanner
          type="error"
          message={errorMessage}
          onDismiss={() => setErrorMessage(null)}
        />
      )}

      {successMessage && (
        <StatusBanner
          type="success"
          message={successMessage}
          onDismiss={() => setSuccessMessage(null)}
        />
      )}

      {/* Upload DropZone */}
      {!file && (
        <DropZone
          onFilesSelected={handleFileSelected}
          promptText={t.watermark.dropPrompt}
          allowedFormatsText="PDF"
          multiple={false}
        />
      )}

      {file && (
        <div className="space-y-6">
          <FileCard
            name={file.name}
            size={file.size}
            pageCount={totalPages}
            onRemove={() => {
              setFile(null);
              setWatermarkedBytes(null);
            }}
          />

          {/* Watermark Configuration */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-5">
            {/* Watermark Type Selector */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setType('text')}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                  type === 'text'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200'
                }`}
              >
                <Type className="w-3.5 h-3.5" />
                <span>{t.watermark.typeText}</span>
              </button>

              <button
                type="button"
                onClick={() => setType('image')}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                  type === 'image'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200'
                }`}
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>{t.watermark.typeImage}</span>
              </button>
            </div>

            {/* Text Mode */}
            {type === 'text' ? (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {t.watermark.watermarkText}
                  </label>
                  <input
                    type="text"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder={t.watermark.watermarkTextPlaceholder}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-900 dark:text-white"
                  />
                </div>

                {/* Quick Presets */}
                <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500">
                  <span className="text-[11px] text-slate-400">Presets:</span>
                  {['CONFIDENTIAL', 'DRAFT', 'DO NOT COPY', 'سري للغاية', 'مسودة', 'نسخة تجريبية'].map(
                    (p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setText(p)}
                        className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700 hover:bg-rose-50 dark:hover:bg-rose-950 text-slate-700 dark:text-slate-300 hover:text-rose-600 text-[11px]"
                      >
                        {p}
                      </button>
                    )
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Font Size ({fontSize} pt)
                    </label>
                    <input
                      type="range"
                      min={24}
                      max={72}
                      value={fontSize}
                      onChange={(e) => setFontSize(Number(e.target.value))}
                      className="w-full accent-rose-600"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      {t.watermark.color}
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={colorHex}
                        onChange={(e) => setColorHex(e.target.value)}
                        className="w-8 h-8 rounded-lg cursor-pointer border-0 p-0"
                      />
                      <span className="text-xs font-mono text-slate-500">{colorHex}</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Image Mode */
              <div className="space-y-3">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {t.watermark.watermarkImagePrompt}
                </label>
                <input
                  type="file"
                  accept="image/png,image/jpeg"
                  onChange={handleImageUpload}
                  className="text-xs text-slate-600 dark:text-slate-400 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-rose-50 file:text-rose-700 hover:file:bg-rose-100 dark:file:bg-rose-950 dark:file:text-rose-300"
                />
                {imageDataUrl && (
                  <div className="w-24 h-24 p-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <img
                      src={imageDataUrl}
                      alt="Watermark preview"
                      className="w-full h-full object-contain"
                    />
                  </div>
                )}
              </div>
            )}

            {/* Sliders: Opacity & Angle */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100 dark:border-slate-700/60">
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <span>{t.watermark.opacity}</span>
                  <span className="font-mono text-rose-600">{Math.round(opacity * 100)}%</span>
                </div>
                <input
                  type="range"
                  min={10}
                  max={90}
                  step={5}
                  value={opacity * 100}
                  onChange={(e) => setOpacity(Number(e.target.value) / 100)}
                  className="w-full accent-rose-600"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <span>{t.watermark.rotation}</span>
                  <span className="font-mono text-rose-600">{rotation}°</span>
                </div>
                <input
                  type="range"
                  min={-90}
                  max={90}
                  step={15}
                  value={rotation}
                  onChange={(e) => setRotation(Number(e.target.value))}
                  className="w-full accent-rose-600"
                />
              </div>
            </div>

            {/* Action buttons */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              {!watermarkedBytes ? (
                <button
                  type="button"
                  onClick={handleApplyWatermark}
                  disabled={isProcessing}
                  className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs shadow-md shadow-rose-600/20 disabled:opacity-50"
                >
                  {t.watermark.addWatermarkBtn}
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleDownload}
                    className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-md shadow-emerald-600/20"
                  >
                    <Download className="w-4 h-4" />
                    <span>{t.common.downloadPdf}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const baseName = file.name.replace(/\.pdf$/i, '');
                      shareOrDownloadFile(watermarkedBytes, `${baseName}_watermarked.pdf`);
                    }}
                    className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200"
                    title={t.common.share}
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
