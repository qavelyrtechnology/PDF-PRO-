import React, { useState } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { DropZone } from '../components/DropZone';
import { FileCard } from '../components/FileCard';
import { StatusBanner } from '../components/StatusBanner';
import {
  inspectAndSanitizeMetadata,
  downloadFile,
  PdfMetadata,
} from '../services/pdfService';
import { ShieldCheck, Download, Trash2, Info, CheckCircle2 } from 'lucide-react';

export const SecurityPage: React.FC = () => {
  const { t } = useLanguage();
  const [file, setFile] = useState<File | null>(null);
  const [metadata, setMetadata] = useState<PdfMetadata | null>(null);
  const [author, setAuthor] = useState('');
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [keywords, setKeywords] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [sanitizedBytes, setSanitizedBytes] = useState<Uint8Array | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleFileSelected = async (files: File[]) => {
    if (files.length === 0) return;
    const selected = files[0];
    setFile(selected);
    setSanitizedBytes(null);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const { current } = await inspectAndSanitizeMetadata(selected);
      setMetadata(current);
      setAuthor(current.author || '');
      setTitle(current.title || '');
      setSubject(current.subject || '');
      setKeywords(current.keywords ? current.keywords.join(', ') : '');
    } catch (err: any) {
      console.error('Metadata read error:', err);
      setErrorMessage('Could not read PDF metadata. The file may be encrypted or corrupted.');
      setFile(null);
    }
  };

  const handleSanitizeAndSave = async (clearAll = false) => {
    if (!file) return;

    setIsProcessing(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const newMeta = clearAll
        ? {
            title: '',
            author: '',
            subject: '',
            keywords: [],
            creator: 'Free PDF Studio (Sanitized)',
            producer: 'Free PDF Studio (Client-Side)',
          }
        : {
            title,
            author,
            subject,
            keywords: keywords.split(',').map((s) => s.trim()).filter(Boolean),
            creator: metadata?.creator,
            producer: metadata?.producer,
          };

      const { updatedBytes } = await inspectAndSanitizeMetadata(file, newMeta);
      if (updatedBytes) {
        setSanitizedBytes(updatedBytes);
        setSuccessMessage(t.security.metadataUpdatedSuccess);
        const baseName = file.name.replace(/\.pdf$/i, '');
        downloadFile(updatedBytes, `${baseName}_sanitized.pdf`);
      }
    } catch (err: any) {
      console.error('Sanitize error:', err);
      setErrorMessage(err?.message || t.common.error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-5">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <ShieldCheck className="w-7 h-7 text-rose-600" />
          {t.security.title}
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          {t.security.subtitle}
        </p>
      </div>

      {/* Privacy Tip */}
      <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/60 flex items-start gap-3 text-xs text-purple-900 dark:text-purple-200">
        <Info className="w-5 h-5 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
        <div>
          <h4 className="font-semibold mb-1">Metadata Privacy Protection</h4>
          <p className="leading-relaxed opacity-90">{t.security.privacyNote}</p>
        </div>
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

      {/* Upload Drop Zone */}
      {!file && (
        <DropZone
          onFilesSelected={handleFileSelected}
          promptText={t.security.dropPrompt}
          allowedFormatsText="PDF"
          multiple={false}
        />
      )}

      {/* Document Properties Form */}
      {file && metadata && (
        <div className="space-y-6">
          <FileCard
            name={file.name}
            size={file.size}
            pageCount={metadata.pageCount}
            onRemove={() => {
              setFile(null);
              setMetadata(null);
            }}
          />

          <div className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {t.security.metadataTitle}
              </h2>
              <button
                type="button"
                onClick={() => {
                  setAuthor('');
                  setTitle('');
                  setSubject('');
                  setKeywords('');
                }}
                className="text-xs text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear Fields</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {t.security.metadataAuthor}
                </label>
                <input
                  type="text"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  placeholder="e.g. John Doe (or leave blank to remove)"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {t.security.metadataTitleProp}
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Document Title"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {t.security.metadataSubject}
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Subject or Summary"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {t.security.metadataKeywords}
                </label>
                <input
                  type="text"
                  value={keywords}
                  onChange={(e) => setKeywords(e.target.value)}
                  placeholder="Comma separated tags"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            {/* Read-only system metadata */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 text-xs space-y-1 border border-slate-200/60 dark:border-slate-800">
              <div className="flex justify-between text-slate-500">
                <span>{t.security.metadataCreator}:</span>
                <span className="font-mono text-slate-800 dark:text-slate-200">
                  {metadata.creator || 'Not specified'}
                </span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>{t.security.metadataProducer}:</span>
                <span className="font-mono text-slate-800 dark:text-slate-200">
                  {metadata.producer || 'Not specified'}
                </span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => handleSanitizeAndSave(false)}
                disabled={isProcessing}
                className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs shadow-md shadow-rose-600/20 disabled:opacity-50 transition-all"
              >
                {t.security.updateMetadataBtn}
              </button>

              <button
                type="button"
                onClick={() => handleSanitizeAndSave(true)}
                disabled={isProcessing}
                className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 font-semibold text-xs transition-all"
              >
                Completely Strip All Metadata & Download
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
