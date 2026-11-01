import React, { useState } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { DropZone } from '../components/DropZone';
import { FileCard } from '../components/FileCard';
import { ProgressBar } from '../components/ProgressBar';
import { StatusBanner } from '../components/StatusBanner';
import { performOcr, OcrLanguage } from '../services/ocrService';
import { downloadFile } from '../services/pdfService';
import { ScanText, Copy, Download, Check, AlertCircle, Info } from 'lucide-react';

export const OcrPage: React.FC = () => {
  const { t } = useLanguage();
  const [file, setFile] = useState<File | null>(null);
  const [language, setLanguage] = useState<OcrLanguage>('eng');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('');
  const [extractedText, setExtractedText] = useState('');
  const [copied, setCopied] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleFileSelected = (files: File[]) => {
    if (files.length === 0) return;
    const selected = files[0];
    setFile(selected);
    setExtractedText('');
    setErrorMessage(null);
  };

  const handleStartOcr = async () => {
    if (!file) return;

    setIsProcessing(true);
    setProgress(5);
    setStatusText(t.ocr.ocrProgress);
    setErrorMessage(null);
    setExtractedText('');

    try {
      const text = await performOcr(file, language, (info) => {
        setProgress(info.progress);
        setStatusText(info.status);
      });

      if (!text.trim()) {
        setErrorMessage(t.ocr.noTextFound);
      } else {
        setExtractedText(text);
      }
    } catch (err: any) {
      console.error('OCR failure:', err);
      setErrorMessage(
        'OCR failed to complete. Please ensure language data can be retrieved and the document is legible.'
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopyText = async () => {
    if (!extractedText) return;
    try {
      await navigator.clipboard.writeText(extractedText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error('Copy failed:', err);
    }
  };

  const handleDownloadTxt = () => {
    if (!extractedText || !file) return;
    const baseName = file.name.replace(/\.[^/.]+$/, '');
    const blob = new Blob([extractedText], { type: 'text/plain;charset=utf-8' });
    downloadFile(blob, `${baseName}_extracted_text.txt`, 'text/plain');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-5">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <ScanText className="w-7 h-7 text-rose-600" />
          {t.ocr.title}
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          {t.ocr.subtitle}
        </p>
      </div>

      {/* Tesseract.js Explanation Notice */}
      <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 flex items-start gap-3 text-xs text-blue-900 dark:text-blue-200">
        <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
        <div>
          <h4 className="font-semibold mb-1">Local Browser OCR Engine</h4>
          <p className="leading-relaxed opacity-90">{t.ocr.ocrNotice}</p>
        </div>
      </div>

      {errorMessage && (
        <StatusBanner
          type="error"
          message={errorMessage}
          onDismiss={() => setErrorMessage(null)}
        />
      )}

      {/* File Upload Zone */}
      {!file && (
        <DropZone
          onFilesSelected={handleFileSelected}
          promptText={t.ocr.dropPrompt}
          accept=".pdf,application/pdf,image/png,image/jpeg,image/webp"
          allowedFormatsText="PDF, PNG, JPG, WebP"
          multiple={false}
        />
      )}

      {/* Document Loaded & OCR Setup */}
      {file && (
        <div className="space-y-6">
          <FileCard
            name={file.name}
            size={file.size}
            type={file.type}
            onRemove={() => {
              setFile(null);
              setExtractedText('');
            }}
          />

          {/* Language Selector */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {t.ocr.selectLanguage}
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { id: 'eng', label: t.ocr.langEnglish, desc: 'Latin characters, numbers' },
                { id: 'ara', label: t.ocr.langArabic, desc: 'نصوص عربية كاملة' },
                { id: 'eng+ara', label: t.ocr.langBoth, desc: 'Bilingual document' },
              ].map((opt) => (
                <label
                  key={opt.id}
                  className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                    language === opt.id
                      ? 'border-rose-500 bg-rose-50/40 dark:bg-rose-950/30'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="ocrLanguage"
                    value={opt.id}
                    checked={language === opt.id}
                    onChange={() => setLanguage(opt.id as OcrLanguage)}
                    className="mt-1 text-rose-600 focus:ring-rose-500"
                  />
                  <div>
                    <span className="font-semibold text-sm text-slate-900 dark:text-white block">
                      {opt.label}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {opt.desc}
                    </span>
                  </div>
                </label>
              ))}
            </div>

            {/* Run button */}
            {!extractedText && (
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleStartOcr}
                  disabled={isProcessing}
                  className="px-6 py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-sm shadow-md shadow-rose-600/20 disabled:opacity-50 transition-all"
                >
                  {t.ocr.startOcrBtn}
                </button>
              </div>
            )}
          </div>

          {/* Progress Bar */}
          {isProcessing && (
            <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <ProgressBar progress={progress} statusText={statusText} />
            </div>
          )}

          {/* Extracted Text Output Area */}
          {extractedText && (
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  {t.ocr.resultTitle}
                </h3>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCopyText}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-all"
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-500" />
                        <span>{t.common.copied}</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>{t.ocr.copyToClipboard}</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleDownloadTxt}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-all"
                  >
                    <Download className="w-4 h-4" />
                    <span>{t.ocr.downloadTextFile}</span>
                  </button>
                </div>
              </div>

              {/* Editable Text Area */}
              <textarea
                value={extractedText}
                onChange={(e) => setExtractedText(e.target.value)}
                rows={12}
                className="w-full p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-mono leading-relaxed text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};
