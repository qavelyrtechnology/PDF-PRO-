import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../i18n/LanguageContext';
import { DropZone } from '../components/DropZone';
import { FileCard } from '../components/FileCard';
import { StatusBanner } from '../components/StatusBanner';
import {
  inspectPdfFormFields,
  fillPdfFormFields,
  shareOrDownloadFile,
  FormFieldInfo,
} from '../services/pdfService';
import { CheckSquare, Download, Share2, PenTool, FileText, CheckCircle2 } from 'lucide-react';

export const FormFillerPage: React.FC = () => {
  const { t } = useLanguage();
  const [file, setFile] = useState<File | null>(null);
  const [fields, setFields] = useState<FormFieldInfo[]>([]);
  const [formValues, setFormValues] = useState<Record<string, string | boolean>>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [filledPdfBytes, setFilledPdfBytes] = useState<Uint8Array | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleFileSelected = async (files: File[]) => {
    if (files.length === 0) return;
    const selected = files[0];
    setFile(selected);
    setFilledPdfBytes(null);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const detectedFields = await inspectPdfFormFields(selected);
      setFields(detectedFields);

      const initialValues: Record<string, string | boolean> = {};
      detectedFields.forEach((f) => {
        initialValues[f.name] = f.currentValue;
      });
      setFormValues(initialValues);
    } catch (err: any) {
      console.error('Inspect form error:', err);
      setErrorMessage('Failed to read document form fields.');
      setFile(null);
    }
  };

  const handleFieldChange = (name: string, val: string | boolean) => {
    setFormValues((prev) => ({ ...prev, [name]: val }));
  };

  const handleSaveFilled = async () => {
    if (!file) return;

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const bytes = await fillPdfFormFields(file, formValues);
      setFilledPdfBytes(bytes);
      setSuccessMessage('Form filled and saved successfully!');
      const baseName = file.name.replace(/\.pdf$/i, '');
      shareOrDownloadFile(bytes, `${baseName}_filled.pdf`);
    } catch (err: any) {
      console.error('Fill form error:', err);
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
          <CheckSquare className="w-7 h-7 text-rose-600" />
          {t.formFiller.title}
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          {t.formFiller.subtitle}
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

      {!file && (
        <DropZone
          onFilesSelected={handleFileSelected}
          promptText={t.formFiller.dropPrompt}
          allowedFormatsText="PDF"
          multiple={false}
        />
      )}

      {file && (
        <div className="space-y-6">
          <FileCard
            name={file.name}
            size={file.size}
            onRemove={() => {
              setFile(null);
              setFields([]);
              setFilledPdfBytes(null);
            }}
          />

          {fields.length === 0 ? (
            <div className="p-8 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-center space-y-4">
              <FileText className="w-10 h-10 text-slate-400 mx-auto" />
              <p className="text-sm text-slate-600 dark:text-slate-300 max-w-md mx-auto">
                {t.formFiller.noFieldsFound}
              </p>
              <Link
                to="/annotate"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs transition-all shadow-xs"
              >
                <PenTool className="w-4 h-4" />
                <span>{t.nav.annotate} &rarr;</span>
              </Link>
            </div>
          ) : (
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  {t.formFiller.fieldsCount.replace('{count}', fields.length.toString())}
                </span>
              </div>

              {/* Form Fields Generator */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {fields.map((f, idx) => (
                  <div
                    key={`${f.name}-${idx}`}
                    className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 space-y-1.5"
                  >
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 truncate" title={f.name}>
                      {f.name}
                    </label>

                    {f.type === 'checkbox' ? (
                      <label className="flex items-center gap-2 cursor-pointer pt-1">
                        <input
                          type="checkbox"
                          checked={Boolean(formValues[f.name])}
                          onChange={(e) => handleFieldChange(f.name, e.target.checked)}
                          className="rounded text-rose-600 focus:ring-rose-500 w-4 h-4"
                        />
                        <span className="text-xs text-slate-600 dark:text-slate-400">Check / Enable</span>
                      </label>
                    ) : f.type === 'dropdown' && f.options ? (
                      <select
                        value={String(formValues[f.name] || '')}
                        onChange={(e) => handleFieldChange(f.name, e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                      >
                        {f.options.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        value={String(formValues[f.name] || '')}
                        onChange={(e) => handleFieldChange(f.name, e.target.value)}
                        placeholder="Enter text..."
                        className="w-full px-3 py-2 text-xs rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                      />
                    )}
                  </div>
                ))}
              </div>

              {/* Action */}
              <div className="pt-2 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={handleSaveFilled}
                  disabled={isProcessing}
                  className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs shadow-md shadow-rose-600/20 disabled:opacity-50 transition-all"
                >
                  {t.formFiller.saveFilledPdf}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
