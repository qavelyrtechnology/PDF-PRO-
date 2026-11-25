import { useState, useRef, useCallback } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { validateFileSize } from '../utils/fileUtils';
import { inspectPdfEncryption, unlockPdfBytes } from '../services/pdfService';

interface PendingPrompt {
  file: File;
  resolve: (unlockedFile: File | null) => void;
}

export function usePdfFileGate() {
  const { t } = useLanguage();
  const [sizeWarning, setSizeWarning] = useState<string | null>(null);
  const [blockError, setBlockError] = useState<string | null>(null);
  const [activePrompt, setActivePrompt] = useState<PendingPrompt | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [isUnlocking, setIsUnlocking] = useState(false);

  const resolverRef = useRef<((unlockedFile: File | null) => void) | null>(null);

  const clearNotices = useCallback(() => {
    setSizeWarning(null);
    setBlockError(null);
  }, []);

  const promptForUnlockedFile = useCallback((file: File): Promise<File | null> => {
    return new Promise((resolve) => {
      resolverRef.current = resolve;
      setPasswordError(null);
      setActivePrompt({ file, resolve });
    });
  }, []);

  const handlePasswordSubmit = useCallback(
    async (password: string) => {
      if (!activePrompt) return;
      setIsUnlocking(true);
      setPasswordError(null);
      try {
        const unlockedBytes = await unlockPdfBytes(activePrompt.file, password);
        const unlockedFile = new File([unlockedBytes as unknown as BlobPart], activePrompt.file.name, {
          type: 'application/pdf',
          lastModified: activePrompt.file.lastModified,
        });
        const resolve = resolverRef.current;
        resolverRef.current = null;
        setActivePrompt(null);
        setIsUnlocking(false);
        resolve?.(unlockedFile);
      } catch (err: any) {
        setIsUnlocking(false);
        const msg = (err?.message || '').toLowerCase();
        if (err?.name === 'InvalidPdfPasswordError' || msg.includes('password')) {
          setPasswordError(t.passwordDialog.wrongPassword);
        } else {
          setPasswordError(t.passwordDialog.unsupportedEncryption);
        }
      }
    },
    [activePrompt, t]
  );

  const handlePasswordCancel = useCallback(() => {
    const resolve = resolverRef.current;
    resolverRef.current = null;
    setActivePrompt(null);
    setPasswordError(null);
    setIsUnlocking(false);
    resolve?.(null);
  }, []);

  /**
   * Validate file sizes (warn > 50 MB, block > 200 MB) and decrypt any encrypted PDFs via modal prompt.
   * For image files (non-PDF), validates size and passes them through cleanly.
   */
  const prepareFiles = useCallback(
    async (files: File[]): Promise<File[]> => {
      setBlockError(null);
      let hasWarned = false;
      const accepted: File[] = [];

      for (const file of files) {
        const sizeCheck = validateFileSize(file);
        if (sizeCheck.status === 'blocked') {
          setBlockError(
            t.fileLimits.blockTooLarge
              .replace('{name}', file.name)
              .replace('{size}', sizeCheck.formattedSize)
          );
          continue;
        }
        if (sizeCheck.status === 'warn' && !hasWarned) {
          hasWarned = true;
          setSizeWarning(t.fileLimits.warnLargeFile.replace('{size}', sizeCheck.formattedSize));
        }

        const isPdf =
          file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
        if (!isPdf) {
          accepted.push(file);
          continue;
        }

        try {
          const status = await inspectPdfEncryption(file);
          if (!status.encrypted) {
            accepted.push(file);
          } else {
            const unlocked = await promptForUnlockedFile(file);
            if (unlocked) {
              accepted.push(unlocked);
            }
          }
        } catch {
          // If inspection fails on an unusual header, pass to tool which will report a structured error
          accepted.push(file);
        }
      }

      if (!hasWarned && accepted.length > 0 && files.every((f) => validateFileSize(f).status === 'ok')) {
        setSizeWarning(null);
      }

      return accepted;
    },
    [promptForUnlockedFile, t]
  );

  /**
   * Validate size only (for tools like Reader that handle PDF.js PasswordException directly, or Unlock PDF).
   */
  const checkFileSizes = useCallback(
    (files: File[]): File[] => {
      setBlockError(null);
      let hasWarned = false;
      const allowed: File[] = [];
      for (const file of files) {
        const sizeCheck = validateFileSize(file);
        if (sizeCheck.status === 'blocked') {
          setBlockError(
            t.fileLimits.blockTooLarge
              .replace('{name}', file.name)
              .replace('{size}', sizeCheck.formattedSize)
          );
          continue;
        }
        if (sizeCheck.status === 'warn' && !hasWarned) {
          hasWarned = true;
          setSizeWarning(t.fileLimits.warnLargeFile.replace('{size}', sizeCheck.formattedSize));
        }
        allowed.push(file);
      }
      if (!hasWarned && allowed.length > 0) {
        setSizeWarning(null);
      }
      return allowed;
    },
    [t]
  );

  return {
    sizeWarning,
    blockError,
    clearNotices,
    setSizeWarning,
    setBlockError,
    prepareFiles,
    checkFileSizes,
    passwordModalProps: {
      isOpen: Boolean(activePrompt),
      filename: activePrompt?.file.name || '',
      errorMessage: passwordError,
      isSubmitting: isUnlocking,
      onSubmit: handlePasswordSubmit,
      onCancel: handlePasswordCancel,
    },
  };
}
