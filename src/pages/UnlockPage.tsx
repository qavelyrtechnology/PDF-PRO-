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
  unlockPdfBytes,
  downloadFile,
} from '../services/pdfService';
import {
  Unlock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Info,
  Download,
  Loader2,
} from 'lucide-react';

export const UnlockPage: React.FC = () => {
  const { t } = useLanguage();
  const gate = usePdfFileGate();
  const [file, setFile] = useState<File | null>(null);
  const [encryptionInfo, setEncryptionInfo] = useState<{
    checked: boolean;
    encrypted: boolean;
    algorithm?: string;
  }>({ checked: false, encrypted: false });

  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleFileSelected = async (files: File[]) => {
    setError(null);
    setSuccess(false);
    setPassword('');
    const allowed = gate.checkFileSizes(files);
    if (allowed.length === 0) return;

    const selected = allowed[0];
    setFile(selected);
    setIsChecking(true);

    try {
      const status = await inspectPdfEncryption(selected);
      setEncryptionInfo({
        checked: true,
        encrypted: status.encrypted,
        algorithm: status.algorithm || (status.keyLength ? `${status.keyLength}-bit` : 'PDF Encryption'),
      });
    } catch {
      setEncryptionInfo({ checked: true, encrypted: true, algorithm: 'PDF Encryption' });
    } finally {
      setIsChecking(false);
    }
  };

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    setError(null);
    setSuccess(false);
    setIsProcessing(true);

    try {
      const unlockedBytes = await unlockPdfBytes(file, password);
      const outName = file.name.replace(/\.pdf$/i, '') + '_unlocked.pdf';
      downloadFile(unlockedBytes, outName);
      setSuccess(true);
    } catch (err: any) {
      console.error(err);
      const msg = (err?.message || '').toLowerCase();
      if (err?.name === 'InvalidPdfPasswordError' || msg.includes('password')) {
        setError(t.unlock.wrongPassword);
      } else {
        setError(err?.message || t.common.error);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <PageSeo pageKey="unlock" />

      {/* Header */}
      <div className="space-y-2 text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 mb-2">
          <Unlock className="w-6 h-6" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
          {t.unlock.title}
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
          {t.unlock.subtitle}
        </p>
      </div>

      <FileGateAlerts warning={gate.sizeWarning} error={gate.blockError} />

      {!file ? (
        <DropZone
          onFilesSelected={handleFileSelected}
          promptText={t.unlock.dropPrompt}
          allowedFormatsText="PDF"
        />
      ) : (
        <div className="space-y-6">
          <FileCard
            name={file.name}
            size={file.size}
            onRemove={() => {
              setFile(null);
              setPassword('');
              setError(null);
              setSuccess(false);
              setEncryptionInfo({ checked: false, encrypted: false });
              gate.clearNotices();
            }}
          />

          {isChecking && (
            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
              <Loader2 className="w-4 h-4 animate-spin text-rose-500" />
              <span>{t.unlock.checkingStatus}</span>
            </div>
          )}

          {encryptionInfo.checked && !encryptionInfo.encrypted && (
            <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 flex items-center gap-2.5 text-sm text-emerald-800 dark:text-emerald-300">
              <Info className="w-5 h-5 shrink-0 text-emerald-500" />
              <span>{t.unlock.notEncryptedNotice}</span>
            </div>
          )}

          {encryptionInfo.checked && encryptionInfo.encrypted && (
            <form
              onSubmit={handleUnlock}
              className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-5"
            >
              <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 text-xs text-amber-800 dark:text-amber-300">
                {t.unlock.encryptedDetected.replace('{algo}', encryptionInfo.algorithm || 'PDF')}
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {t.unlock.passwordLabel}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t.unlock.passwordPlaceholder}
                    required
                    className="w-full px-3.5 py-2.5 pr-10 rtl:pr-3.5 rtl:pl-10 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-2.5 rtl:right-auto rtl:left-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 text-xs text-emerald-800 dark:text-emerald-300">
                {t.unlock.securityNote}
              </div>

              <button
                type="submit"
                disabled={isProcessing || !password}
                className="w-full py-3.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-md shadow-rose-600/20 disabled:opacity-50 transition-colors"
              >
                {isProcessing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
                <span>{t.unlock.unlockBtn}</span>
              </button>
            </form>
          )}
        </div>
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
          <span>{t.unlock.success}</span>
        </div>
      )}

      <ToolSeoSection pageKey="unlock" toolName={t.nav.unlock} />
    </div>
  );
};
