import React, { useState } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { DropZone } from '../components/DropZone';
import { FileCard } from '../components/FileCard';
import { FileGateAlerts } from '../components/FileGateAlerts';
import { PageSeo } from '../components/PageSeo';
import { ToolSeoSection } from '../components/ToolSeoSection';
import { usePdfFileGate } from '../hooks/usePdfFileGate';
import {
  inspectPdfEncryption,
  encryptPdfDocument,
  downloadFile,
} from '../services/pdfService';
import {
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Download,
  ShieldCheck,
  Loader2,
} from 'lucide-react';

export const ProtectPage: React.FC = () => {
  const { t } = useLanguage();
  const gate = usePdfFileGate();
  const [file, setFile] = useState<File | null>(null);
  const [userPassword, setUserPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [ownerPassword, setOwnerPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const [algorithm, setAlgorithm] = useState<'AES-256' | 'RC4'>('AES-256');
  const [allowPrinting, setAllowPrinting] = useState(true);
  const [allowCopying, setAllowCopying] = useState(true);
  const [allowModifying, setAllowModifying] = useState(false);
  const [allowFillingForms, setAllowFillingForms] = useState(true);

  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleFileSelected = async (files: File[]) => {
    setError(null);
    setSuccess(false);
    const allowed = gate.checkFileSizes(files);
    if (allowed.length === 0) return;
    const candidate = allowed[0];

    try {
      const status = await inspectPdfEncryption(candidate);
      if (status.encrypted) {
        setError(t.protect.alreadyEncrypted);
        setFile(null);
        return;
      }
      setFile(candidate);
    } catch {
      setFile(candidate);
    }
  };

  const handleProtect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    setError(null);
    setSuccess(false);

    if (!userPassword.trim()) {
      setError(t.protect.passwordRequired);
      return;
    }
    if (userPassword !== confirmPassword) {
      setError(t.protect.passwordMismatch);
      return;
    }

    setIsProcessing(true);
    try {
      const protectedBytes = await encryptPdfDocument(file, userPassword, {
        ownerPassword: ownerPassword.trim() || undefined,
        algorithm,
        allowPrinting,
        allowCopying,
        allowModifying,
        allowFillingForms,
      });

      const outName = file.name.replace(/\.pdf$/i, '') + '_protected.pdf';
      downloadFile(protectedBytes, outName);
      setSuccess(true);
    } catch (err: any) {
      console.error(err);
      if (err?.name === 'AlreadyEncryptedError' || err?.code === 'ALREADY_ENCRYPTED') {
        setError(t.protect.alreadyEncrypted);
      } else if (err?.name === 'PasswordEncodingError') {
        setError(t.protect.rc4LatinOnlyError);
      } else {
        setError(err?.message || t.common.error);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <PageSeo pageKey="protect" />

      {/* Header */}
      <div className="space-y-2 text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 mb-2">
          <Lock className="w-6 h-6" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
          {t.protect.title}
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
          {t.protect.subtitle}
        </p>
      </div>

      <FileGateAlerts warning={gate.sizeWarning} error={gate.blockError} />

      {!file ? (
        <DropZone
          onFilesSelected={handleFileSelected}
          promptText={t.protect.dropPrompt}
          allowedFormatsText="PDF"
        />
      ) : (
        <form onSubmit={handleProtect} className="space-y-6">
          <FileCard
            name={file.name}
            size={file.size}
            onRemove={() => {
              setFile(null);
              setError(null);
              setSuccess(false);
              gate.clearNotices();
            }}
          />

          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-rose-500" />
                {t.protect.algorithmLabel}
              </span>
              <button
                type="button"
                onClick={() => setShowPasswords((v) => !v)}
                className="text-xs font-medium text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 inline-flex items-center gap-1"
              >
                {showPasswords ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                <span>{showPasswords ? 'Hide' : 'Show'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label
                className={`p-3.5 rounded-xl border cursor-pointer transition-all text-xs ${
                  algorithm === 'AES-256'
                    ? 'border-rose-500 bg-rose-50/70 dark:bg-rose-950/30 font-semibold text-rose-900 dark:text-rose-200'
                    : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                <input
                  type="radio"
                  name="algorithm"
                  checked={algorithm === 'AES-256'}
                  onChange={() => setAlgorithm('AES-256')}
                  className="sr-only"
                />
                {t.protect.algoAes256}
              </label>
              <label
                className={`p-3.5 rounded-xl border cursor-pointer transition-all text-xs ${
                  algorithm === 'RC4'
                    ? 'border-rose-500 bg-rose-50/70 dark:bg-rose-950/30 font-semibold text-rose-900 dark:text-rose-200'
                    : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                <input
                  type="radio"
                  name="algorithm"
                  checked={algorithm === 'RC4'}
                  onChange={() => setAlgorithm('RC4')}
                  className="sr-only"
                />
                {t.protect.algoRc4}
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {t.protect.userPasswordLabel}
                </label>
                <input
                  type={showPasswords ? 'text' : 'password'}
                  value={userPassword}
                  onChange={(e) => setUserPassword(e.target.value)}
                  placeholder={t.protect.userPasswordPlaceholder}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {t.protect.confirmPasswordLabel}
                </label>
                <input
                  type={showPasswords ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder={t.protect.confirmPasswordPlaceholder}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                {t.protect.ownerPasswordLabel}
              </label>
              <input
                type={showPasswords ? 'text' : 'password'}
                value={ownerPassword}
                onChange={(e) => setOwnerPassword(e.target.value)}
                placeholder={t.protect.ownerPasswordPlaceholder}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {t.protect.ownerPasswordHint}
              </p>
            </div>

            {/* Permissions */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2.5">
              <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                {t.protect.permissionsTitle}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-slate-700 dark:text-slate-300">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={allowPrinting}
                    onChange={(e) => setAllowPrinting(e.target.checked)}
                    className="rounded text-rose-600 focus:ring-rose-500"
                  />
                  <span>{t.protect.allowPrinting}</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={allowCopying}
                    onChange={(e) => setAllowCopying(e.target.checked)}
                    className="rounded text-rose-600 focus:ring-rose-500"
                  />
                  <span>{t.protect.allowCopying}</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={allowModifying}
                    onChange={(e) => setAllowModifying(e.target.checked)}
                    className="rounded text-rose-600 focus:ring-rose-500"
                  />
                  <span>{t.protect.allowModifying}</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={allowFillingForms}
                    onChange={(e) => setAllowFillingForms(e.target.checked)}
                    className="rounded text-rose-600 focus:ring-rose-500"
                  />
                  <span>{t.protect.allowFillingForms}</span>
                </label>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 text-xs text-emerald-800 dark:text-emerald-300">
              {t.protect.securityNote}
            </div>

            <button
              type="submit"
              disabled={isProcessing}
              className="w-full py-3.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-md shadow-rose-600/20 disabled:opacity-50 transition-colors"
            >
              {isProcessing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              <span>{t.protect.protectBtn}</span>
            </button>
          </div>
        </form>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/60 flex items-center gap-2.5 text-sm text-rose-700 dark:text-rose-300">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-500" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 flex items-center gap-2.5 text-sm text-emerald-800 dark:text-emerald-300">
          <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-500" />
          <span>{t.protect.success}</span>
        </div>
      )}

      <ToolSeoSection pageKey="protect" toolName={t.nav.protect} />
    </div>
  );
};
