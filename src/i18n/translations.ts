export type Language = 'en' | 'ar';

export interface Translations {
  appName: string;
  appTagline: string;
  appDescription: string;
  nav: {
    home: string;
    tools: string;
    reader: string;
    organize: string;
    merge: string;
    split: string;
    compress: string;
    pageNumbers: string;
    watermark: string;
    crop: string;
    redact: string;
    formFiller: string;
    flatten: string;
    compare: string;
    extractImages: string;
    headerFooter: string;
    imagesToPdf: string;
    annotate: string;
    convert: string;
    ocr: string;
    security: string;
    privacy: string;
    about: string;
  };
  common: {
    selectFile: string;
    selectFiles: string;
    dropHere: string;
    orBrowse: string;
    supportedFormats: string;
    download: string;
    share: string;
    processing: string;
    cancel: string;
    reset: string;
    clear: string;
    remove: string;
    moveUp: string;
    moveDown: string;
    fileName: string;
    fileSize: string;
    pageCount: string;
    page: string;
    of: string;
    pages: string;
    success: string;
    error: string;
    warning: string;
    info: string;
    copied: string;
    copyText: string;
    downloadTxt: string;
    downloadZip: string;
    downloadPdf: string;
    loading: string;
    backToHome: string;
    tryAgain: string;
    noFileSelected: string;
    apply: string;
    save: string;
    preview: string;
    zoomIn: string;
    zoomOut: string;
    fitWidth: string;
    rotate: string;
    privacyNotice: string;
    allTools: string;
  };
  home: {
    heroBadge: string;
    heroTitle: string;
    heroTitleHighlight: string;
    heroSubtitle: string;
    getStartedBtn: string;
    exploreToolsBtn: string;
    privacyPill: string;
    offlinePill: string;
    freePill: string;
    quickToolsTitle: string;
    quickToolsSubtitle: string;
    whyChooseUsTitle: string;
    whyChooseUsSubtitle: string;
    featurePrivacyTitle: string;
    featurePrivacyDesc: string;
    featureSpeedTitle: string;
    featureSpeedDesc: string;
    featureFreeTitle: string;
    featureFreeDesc: string;
    featureOpenTitle: string;
    featureOpenDesc: string;
    trustedBanner: string;
  };
  reader: {
    title: string;
    subtitle: string;
    openPdf: string;
    firstPage: string;
    previousPage: string;
    nextPage: string;
    lastPage: string;
    jumpToPage: string;
    zoom: string;
    fitPage: string;
    pageRenderError: string;
    passwordRequired: string;
    emptyReaderPrompt: string;
    thumbnails: string;
  };
  organize: {
    title: string;
    subtitle: string;
    dropPrompt: string;
    reorderHint: string;
    rotatePage: string;
    deletePage: string;
    restoreAll: string;
    saveChangesBtn: string;
    deletedCount: string;
    savingProgress: string;
  };
  pageNumbers: {
    title: string;
    subtitle: string;
    dropPrompt: string;
    position: string;
    posBottomCenter: string;
    posBottomRight: string;
    posBottomLeft: string;
    posTopRight: string;
    posTopCenter: string;
    format: string;
    formatPageXofY: string;
    formatXofY: string;
    formatNumberOnly: string;
    skipFirst: string;
    fontSize: string;
    color: string;
    addNumbersBtn: string;
    progress: string;
  };
  watermark: {
    title: string;
    subtitle: string;
    dropPrompt: string;
    typeText: string;
    typeImage: string;
    watermarkText: string;
    watermarkTextPlaceholder: string;
    watermarkImagePrompt: string;
    opacity: string;
    rotation: string;
    color: string;
    addWatermarkBtn: string;
    progress: string;
  };
  crop: {
    title: string;
    subtitle: string;
    dropPrompt: string;
    marginAmount: string;
    marginSmall: string;
    marginMedium: string;
    marginLarge: string;
    cropNotice: string;
    applyCropBtn: string;
    progress: string;
  };
  redact: {
    title: string;
    subtitle: string;
    dropPrompt: string;
    drawBoxHint: string;
    boxColor: string;
    colorBlack: string;
    colorWhite: string;
    clearBoxes: string;
    burnRedactionBtn: string;
    securityNoticeTitle: string;
    warningPermanent: string;
    noMarksWarning: string;
    success: string;
  };
  formFiller: {
    title: string;
    subtitle: string;
    dropPrompt: string;
    noFieldsFound: string;
    fieldsCount: string;
    saveFilledPdf: string;
    fieldLabel: string;
    fieldValue: string;
  };
  flatten: {
    title: string;
    subtitle: string;
    dropPrompt: string;
    explanation: string;
    flattenBtn: string;
    success: string;
  };
  compare: {
    title: string;
    subtitle: string;
    dropPromptA: string;
    dropPromptB: string;
    originalDoc: string;
    revisedDoc: string;
    pageNav: string;
    syncScroll: string;
  };
  extractImages: {
    title: string;
    subtitle: string;
    dropPrompt: string;
    extractBtn: string;
    noImagesFound: string;
    foundCount: string;
    downloadAllZip: string;
    progress: string;
  };
  headerFooter: {
    title: string;
    subtitle: string;
    dropPrompt: string;
    topLeft: string;
    topCenter: string;
    topRight: string;
    bottomLeft: string;
    bottomCenter: string;
    bottomRight: string;
    applyBtn: string;
  };
  merge: {
    title: string;
    subtitle: string;
    dropPrompt: string;
    fileListTitle: string;
    reorderHint: string;
    mergeButton: string;
    needAtLeastTwo: string;
    mergedSuccess: string;
    mergingProgress: string;
  };
  split: {
    title: string;
    subtitle: string;
    dropPrompt: string;
    modeTitle: string;
    modeCustomRanges: string;
    modeEveryPage: string;
    rangeInputLabel: string;
    rangeInputPlaceholder: string;
    rangeInputHelp: string;
    invalidRangeError: string;
    splitButton: string;
    splittingProgress: string;
    extractedCount: string;
  };
  compress: {
    title: string;
    subtitle: string;
    dropPrompt: string;
    disclaimerTitle: string;
    disclaimerDesc: string;
    modeTitle: string;
    modeStructure: string;
    modeStructureDesc: string;
    modeRaster: string;
    modeRasterDesc: string;
    rasterWarningTitle: string;
    rasterWarningDesc: string;
    compressionLevel: string;
    levelLow: string;
    levelLowDesc: string;
    levelMedium: string;
    levelMediumDesc: string;
    levelHigh: string;
    levelHighDesc: string;
    compressBtn: string;
    compressingProgress: string;
    originalSize: string;
    compressedSize: string;
    savedPercentage: string;
    sizeChangeTitle: string;
    sizeIncreasedNotice: string;
    sizeDecreasedNotice: string;
    noReductionNotice: string;
    downloadResult: string;
  };
  imagesToPdf: {
    title: string;
    subtitle: string;
    dropPrompt: string;
    pageSize: string;
    sizeA4: string;
    sizeLetter: string;
    sizeFitImage: string;
    orientation: string;
    orientationAuto: string;
    orientationPortrait: string;
    orientationLandscape: string;
    margin: string;
    marginNone: string;
    marginSmall: string;
    marginNormal: string;
    generatePdfBtn: string;
    generatingProgress: string;
  };
  annotate: {
    title: string;
    subtitle: string;
    dropPrompt: string;
    toolPen: string;
    toolText: string;
    toolDate: string;
    toolClearDrawing: string;
    penColor: string;
    penWidth: string;
    fontSize: string;
    textContentPlaceholder: string;
    applyAnnotationBtn: string;
    disclaimerSignature: string;
    embedNotice: string;
    signStudio: string;
    tabDraw: string;
    tabType: string;
    tabUpload: string;
    removeWhiteBg: string;
    saveSignature: string;
    savedSignatures: string;
    useSaved: string;
  };
  convert: {
    title: string;
    subtitle: string;
    pdfToImagesTab: string;
    imagesToPdfTab: string;
    dropPrompt: string;
    exportFormat: string;
    exportFormatPng: string;
    exportFormatJpg: string;
    exportQuality: string;
    convertBtn: string;
    convertingProgress: string;
    honestDisclaimerTitle: string;
    honestDisclaimerText: string;
  };
  ocr: {
    title: string;
    subtitle: string;
    dropPrompt: string;
    selectLanguage: string;
    langEnglish: string;
    langArabic: string;
    langBoth: string;
    ocrNotice: string;
    startOcrBtn: string;
    ocrProgress: string;
    resultTitle: string;
    noTextFound: string;
    downloadTextFile: string;
    copyToClipboard: string;
  };
  security: {
    title: string;
    subtitle: string;
    dropPrompt: string;
    infoTab: string;
    metadataTitle: string;
    metadataAuthor: string;
    metadataTitleProp: string;
    metadataSubject: string;
    metadataKeywords: string;
    metadataCreator: string;
    metadataProducer: string;
    updateMetadataBtn: string;
    metadataUpdatedSuccess: string;
    privacyNote: string;
  };
  privacy: {
    title: string;
    subtitle: string;
    badge100Local: string;
    summary: string;
    section1Title: string;
    section1Text: string;
    section2Title: string;
    section2Text: string;
    section3Title: string;
    section3Text: string;
    section4Title: string;
    section4Text: string;
    section5Title: string;
    section5Text: string;
  };
  about: {
    title: string;
    subtitle: string;
    missionTitle: string;
    missionText: string;
    featuresListTitle: string;
    openTechTitle: string;
    openTechText: string;
    faqTitle: string;
    faq1Q: string;
    faq1A: string;
    faq2Q: string;
    faq2A: string;
    faq3Q: string;
    faq3A: string;
    faq4Q: string;
    faq4A: string;
  };
  footer: {
    tagline: string;
    quickLinks: string;
    tools: string;
    legal: string;
    clientSideNotice: string;
    allRightsReserved: string;
  };
}

export const translations: Record<Language, Translations> = {
  en: {
    appName: 'Free PDF Studio',
    appTagline: '100% Private, In-Browser PDF Suite',
    appDescription: 'Professional, free, and completely local PDF tools. Merge, split, compress, read, annotate, organize, redact, and convert without uploading files to any server.',
    nav: {
      home: 'Home',
      tools: 'All Tools',
      reader: 'Reader',
      organize: 'Organize Pages',
      merge: 'Merge',
      split: 'Split',
      compress: 'Compress',
      pageNumbers: 'Page Numbers',
      watermark: 'Watermark',
      crop: 'Crop Margins',
      redact: 'Redact & Blackout',
      formFiller: 'Form Filler',
      flatten: 'Flatten PDF',
      compare: 'Compare PDFs',
      extractImages: 'Extract Images',
      headerFooter: 'Header & Footer',
      imagesToPdf: 'Images to PDF',
      annotate: 'Annotate & Sign',
      convert: 'Convert',
      ocr: 'OCR Text',
      security: 'Security & Info',
      privacy: 'Privacy Guarantee',
      about: 'About',
    },
    common: {
      selectFile: 'Select PDF File',
      selectFiles: 'Select PDF Files',
      dropHere: 'Drag & drop files here',
      orBrowse: 'or click to browse your device',
      supportedFormats: 'Supported formats',
      download: 'Download File',
      share: 'Share Document',
      processing: 'Processing...',
      cancel: 'Cancel',
      reset: 'Reset',
      clear: 'Clear',
      remove: 'Remove',
      moveUp: 'Move Up',
      moveDown: 'Move Down',
      fileName: 'File Name',
      fileSize: 'File Size',
      pageCount: 'Pages',
      page: 'Page',
      of: 'of',
      pages: 'pages',
      success: 'Operation completed successfully!',
      error: 'An error occurred while processing the file.',
      warning: 'Warning',
      info: 'Information',
      copied: 'Copied to clipboard!',
      copyText: 'Copy Text',
      downloadTxt: 'Download (.txt)',
      downloadZip: 'Download All (.zip)',
      downloadPdf: 'Download PDF',
      loading: 'Loading document...',
      backToHome: 'Back to Home',
      tryAgain: 'Try Again',
      noFileSelected: 'No file selected yet',
      apply: 'Apply Changes',
      save: 'Save',
      preview: 'Preview',
      zoomIn: 'Zoom In',
      zoomOut: 'Zoom Out',
      fitWidth: 'Fit Width',
      rotate: 'Rotate Clockwise',
      privacyNotice: 'Files are processed locally in your browser. Nothing is ever uploaded.',
      allTools: 'Explore All Tools',
    },
    home: {
      heroBadge: 'Zero Uploads • 100% Client-Side Privacy',
      heroTitle: 'Work with PDFs Safely,',
      heroTitleHighlight: 'Entirely in Your Browser.',
      heroSubtitle: 'Free PDF Studio provides professional PDF tools that process your documents locally using modern WebAssembly and JavaScript. No subscriptions, no file size server traps, and absolute privacy.',
      getStartedBtn: 'Explore PDF Tools',
      exploreToolsBtn: 'Open PDF Reader',
      privacyPill: '100% Local Processing',
      offlinePill: 'Works Completely In-Browser',
      freePill: 'Truly Free Forever',
      quickToolsTitle: 'Popular PDF Tools',
      quickToolsSubtitle: 'Pick a tool below or drop a PDF to get started instantly.',
      whyChooseUsTitle: 'Why Free PDF Studio?',
      whyChooseUsSubtitle: 'Engineered for people who value privacy, speed, and genuine reliability.',
      featurePrivacyTitle: 'Zero-Knowledge Privacy',
      featurePrivacyDesc: 'Your sensitive contracts, financial statements, and personal IDs never leave your computer. Processing happens inside your browser RAM.',
      featureSpeedTitle: 'Blazing Fast Performance',
      featureSpeedDesc: 'No upload waiting time, no queue delays, and no server timeouts. Processing starts instantaneously on your device.',
      featureFreeTitle: 'Truly Free & Unlimited',
      featureFreeDesc: 'No trial periods, no watermarks, no credit card prompts, and no daily page limits.',
      featureOpenTitle: 'Transparent & Trustworthy',
      featureOpenDesc: 'Built on tested open-source engines like pdf-lib, PDF.js, and Tesseract.js. No hidden tracking or deceptive ads.',
      trustedBanner: 'All operations execute in your browser sandbox. Original files are never modified or overwritten.',
    },
    reader: {
      title: 'PDF Reader',
      subtitle: 'Fast, smooth in-browser document viewer with zoom, rotation, thumbnails, and navigation.',
      openPdf: 'Open a PDF Document',
      firstPage: 'First Page',
      previousPage: 'Previous Page',
      nextPage: 'Next Page',
      lastPage: 'Last Page',
      jumpToPage: 'Go to page',
      zoom: 'Zoom',
      fitPage: 'Fit to Page',
      pageRenderError: 'Failed to render page. The file may be damaged or password-protected.',
      passwordRequired: 'This document is protected with a password. Password removal is required.',
      emptyReaderPrompt: 'Select a PDF to view and read its contents directly.',
      thumbnails: 'Page Thumbnails',
    },
    organize: {
      title: 'Organize & Delete Pages',
      subtitle: 'Visually rearrange, rotate, or remove pages from your PDF with instant previews.',
      dropPrompt: 'Drop a PDF file to reorder or delete pages',
      reorderHint: 'Reorder pages, rotate individual sheets, or delete unwanted pages.',
      rotatePage: 'Rotate 90°',
      deletePage: 'Delete Page',
      restoreAll: 'Reset to Original Order',
      saveChangesBtn: 'Save & Download Organized PDF',
      deletedCount: '{count} page(s) removed',
      savingProgress: 'Constructing newly organized PDF...',
    },
    pageNumbers: {
      title: 'Add Page Numbers',
      subtitle: 'Number pages automatically with customizable positions, formats, and fonts.',
      dropPrompt: 'Drop a PDF file to add page numbers',
      position: 'Number Position',
      posBottomCenter: 'Bottom Center',
      posBottomRight: 'Bottom Right',
      posBottomLeft: 'Bottom Left',
      posTopRight: 'Top Right',
      posTopCenter: 'Top Center',
      format: 'Numbering Format',
      formatPageXofY: 'Page X of Y',
      formatXofY: 'X / Y',
      formatNumberOnly: 'Number Only (1, 2, 3...)',
      skipFirst: 'Skip first page (Cover page)',
      fontSize: 'Font Size',
      color: 'Text Color',
      addNumbersBtn: 'Insert Numbers & Download',
      progress: 'Adding page numbers...',
    },
    watermark: {
      title: 'Add Watermark',
      subtitle: 'Stamp text or image watermarks across your document with angle and opacity control.',
      dropPrompt: 'Drop a PDF file to add watermark',
      typeText: 'Text Watermark',
      typeImage: 'Image Watermark (PNG/JPG)',
      watermarkText: 'Watermark Text',
      watermarkTextPlaceholder: 'e.g. CONFIDENTIAL, DRAFT, DO NOT COPY',
      watermarkImagePrompt: 'Select watermark image (PNG or JPG)',
      opacity: 'Transparency / Opacity',
      rotation: 'Watermark Angle',
      color: 'Watermark Color',
      addWatermarkBtn: 'Apply Watermark & Download',
      progress: 'Stamping watermark across pages...',
    },
    crop: {
      title: 'Crop Margins',
      subtitle: 'Trim excess blank outer margins for optimal reading on phones and tablets.',
      dropPrompt: 'Drop a PDF file to trim margins',
      marginAmount: 'Margin Trim Amount',
      marginSmall: 'Gentle Trim (20 pt)',
      marginMedium: 'Balanced Trim (40 pt)',
      marginLarge: 'Deep Trim (60 pt)',
      cropNotice: 'Cropping adjusts the visual viewport boundary (CropBox) losslessly without deleting content.',
      applyCropBtn: 'Crop Document & Download',
      progress: 'Adjusting document viewports...',
    },
    redact: {
      title: 'Redact & Blackout Sensitive Info',
      subtitle: 'Permanently blackout private data, SSNs, and confidential clauses with unrecoverable pixel redactions.',
      dropPrompt: 'Drop a PDF file to redact sensitive information',
      drawBoxHint: 'Click and drag across the page to place blackout or whiteout redaction boxes.',
      boxColor: 'Redaction Box Color',
      colorBlack: 'Blackout (Solid Black)',
      colorWhite: 'Whiteout (Clean White)',
      clearBoxes: 'Clear Redaction Marks',
      burnRedactionBtn: 'Burn Redactions & Download PDF',
      securityNoticeTitle: 'Secure Pixel Redaction Sanitization',
      warningPermanent: 'Security Notice: Redacted pages are flattened into high-resolution images, permanently destroying hidden text streams and vector glyphs to prevent text extraction.',
      noMarksWarning: 'Please mark at least one redaction box to enable export.',
      success: 'Redactions permanently applied to document!',
    },
    formFiller: {
      title: 'Fill PDF Forms',
      subtitle: 'Fill out interactive PDF application forms, tax documents, and surveys directly in-browser.',
      dropPrompt: 'Drop an interactive PDF form to fill',
      noFieldsFound: 'No interactive form fields detected. You can use the Annotate & Sign tool to place text anywhere.',
      fieldsCount: 'Detected {count} interactive field(s)',
      saveFilledPdf: 'Save & Download Filled Form',
      fieldLabel: 'Field Name',
      fieldValue: 'Value / Text',
    },
    flatten: {
      title: 'Flatten PDF Form Fields',
      subtitle: 'Permanently lock interactive form fields and signatures into standard read-only printable pages.',
      dropPrompt: 'Drop a PDF file with form fields or annotations to flatten',
      explanation: 'Flattening merges all form fields, checkboxes, and interactive widgets directly into page content, preventing any future modification.',
      flattenBtn: 'Flatten Document & Download',
      success: 'Document flattened successfully!',
    },
    compare: {
      title: 'Compare Two PDFs',
      subtitle: 'View two document versions side-by-side with synchronized page navigation to spot revisions.',
      dropPromptA: 'Drop Document A (Original Version)',
      dropPromptB: 'Drop Document B (Revised Version)',
      originalDoc: 'Document A (Original)',
      revisedDoc: 'Document B (Revised)',
      pageNav: 'Synchronized Page Navigation',
      syncScroll: 'Synchronized Scrolling & Zoom',
    },
    extractImages: {
      title: 'Extract Images from PDF',
      subtitle: 'Extract all embedded raster photos, figures, and graphics from your PDF in original resolution.',
      dropPrompt: 'Drop a PDF file to extract embedded images',
      extractBtn: 'Scan & Extract All Images',
      noImagesFound: 'No embedded raster graphics were found in this document.',
      foundCount: 'Found {count} embedded image(s)',
      downloadAllZip: 'Download All Images (.zip)',
      progress: 'Extracting image assets from document stream...',
    },
    headerFooter: {
      title: 'Headers & Footers',
      subtitle: 'Add professional running headers and footers with page numbers, titles, and dates.',
      dropPrompt: 'Drop a PDF file to add headers and footers',
      topLeft: 'Top Left (e.g. Document Title)',
      topCenter: 'Top Center',
      topRight: 'Top Right (e.g. Date)',
      bottomLeft: 'Bottom Left (e.g. Confidential)',
      bottomCenter: 'Bottom Center',
      bottomRight: 'Bottom Right (e.g. Page Numbers)',
      applyBtn: 'Insert Header & Footer & Download',
    },
    merge: {
      title: 'Merge PDF Files',
      subtitle: 'Combine multiple PDF documents into a single organized file in seconds.',
      dropPrompt: 'Drop multiple PDF files here or browse to select',
      fileListTitle: 'Files to Merge (Order matters)',
      reorderHint: 'Drag or use arrow buttons to arrange files in your desired order.',
      mergeButton: 'Merge PDFs into One File',
      needAtLeastTwo: 'Please select at least 2 PDF files to merge.',
      mergedSuccess: 'Your PDFs were merged into a single document!',
      mergingProgress: 'Combining PDF pages and resolving resources...',
    },
    split: {
      title: 'Split PDF',
      subtitle: 'Extract specific pages, define custom ranges, or separate every page.',
      dropPrompt: 'Drop a PDF file here to split into pages',
      modeTitle: 'Splitting Method',
      modeCustomRanges: 'Custom Page Ranges',
      modeEveryPage: 'Extract Every Page Individually',
      rangeInputLabel: 'Enter page numbers or ranges (e.g. 1-3, 5, 8-10)',
      rangeInputPlaceholder: 'e.g. 1-3, 5, 7-12',
      rangeInputHelp: 'Separate individual pages or ranges with commas. Example: "1, 3-5, 8" extracts page 1, pages 3 through 5, and page 8.',
      invalidRangeError: 'Invalid range syntax. Please use positive integers within document range (e.g. 1-4, 7).',
      splitButton: 'Split and Download',
      splittingProgress: 'Extracting pages into separate documents...',
      extractedCount: 'Extracted {count} document(s)',
    },
    compress: {
      title: 'Compress & Optimize PDF',
      subtitle: 'Optimize PDF file size locally in-browser with lossless structural compression or aggressive image rasterization.',
      dropPrompt: 'Drop a PDF file here to optimize',
      disclaimerTitle: 'Honest In-Browser Compression Notice',
      disclaimerDesc: 'True compression depends on the document type. We separate structural lossless optimization from image rasterization so you never lose searchable text or links by surprise.',
      modeTitle: 'Optimization Method',
      modeStructure: 'Lossless Structural Optimization (Preserves Text & Links)',
      modeStructureDesc: 'Compacts cross-reference tables and object streams. Keeps all vector fonts, searchable text, bookmarks, and links 100% intact.',
      modeRaster: 'Aggressive Image Compression (Converts Pages to JPEGs)',
      modeRasterDesc: 'Re-encodes pages as compressed images for maximum size reduction. Warning: destroys searchable text and hyperlinks.',
      rasterWarningTitle: 'Loss of Searchable Text and Links Notice',
      rasterWarningDesc: 'Converting pages to images removes searchable text, selectable text, and hyperlinks, and reduces vector line crispness.',
      compressionLevel: 'Raster Image Quality & DPI',
      levelLow: 'Gentle Compression (High Quality, 150 DPI)',
      levelLowDesc: 'Best balance for documents meant for printing or presentation.',
      levelMedium: 'Balanced Compression (Standard, 100 DPI)',
      levelMediumDesc: 'Great for email attachments and screen reading.',
      levelHigh: 'Maximum Compression (Compact, 72 DPI)',
      levelHighDesc: 'Aggressive downsizing for strict email and portal file size limits.',
      compressBtn: 'Optimize Document',
      compressingProgress: 'Processing document and optimizing content streams...',
      originalSize: 'Original Size',
      compressedSize: 'Processed Size',
      savedPercentage: 'Saved',
      sizeChangeTitle: 'File Size Comparison',
      sizeIncreasedNotice: 'The processed file is {sizeDiff} ({percentDiff}%) larger than the original. This is normal for small or vector-only documents without embedded images. You can keep your original file.',
      sizeDecreasedNotice: 'Successfully reduced file size by {sizeDiff} ({percentDiff}% smaller)!',
      noReductionNotice: 'This document already has optimal stream compression. Further reduction without image loss is not possible.',
      downloadResult: 'Download Optimized Document',
    },
    imagesToPdf: {
      title: 'Images to PDF',
      subtitle: 'Convert PNG, JPG, or WebP images into a clean, unified PDF document.',
      dropPrompt: 'Drop images (JPG, PNG, WebP) here or click to browse',
      pageSize: 'Page Size',
      sizeA4: 'A4 (210 × 297 mm)',
      sizeLetter: 'US Letter (8.5 × 11 in)',
      sizeFitImage: 'Fit Page to Image Dimensions',
      orientation: 'Orientation',
      orientationAuto: 'Automatic (Based on image ratio)',
      orientationPortrait: 'Portrait',
      orientationLandscape: 'Landscape',
      margin: 'Page Margins',
      marginNone: 'No Margins (Edge-to-edge)',
      marginSmall: 'Small Margin (15pt)',
      marginNormal: 'Standard Margin (30pt)',
      generatePdfBtn: 'Generate and Download PDF',
      generatingProgress: 'Encoding images and assembling PDF pages...',
    },
    annotate: {
      title: 'Annotate & Sign PDF',
      subtitle: 'Draw a signature, stamp dates, or add text directly onto any PDF page.',
      dropPrompt: 'Drop a PDF file here to annotate or sign',
      toolPen: 'Draw / Sign',
      toolText: 'Add Text',
      toolDate: 'Stamp Today\'s Date',
      toolClearDrawing: 'Clear Drawing',
      penColor: 'Ink Color',
      penWidth: 'Pen Width',
      fontSize: 'Font Size',
      textContentPlaceholder: 'Enter text to add to document...',
      applyAnnotationBtn: 'Embed Annotations & Download PDF',
      disclaimerSignature: 'Legal Note: In-browser hand-drawn signatures represent visual electronic marks and do not constitute a qualified cryptographic digital certificate.',
      embedNotice: 'All annotations and drawings are genuinely embedded into the PDF byte stream upon download.',
      signStudio: 'Signature Studio',
      tabDraw: 'Draw Signature',
      tabType: 'Type Signature',
      tabUpload: 'Upload Signature Image',
      removeWhiteBg: 'Auto-remove white background (Transparency)',
      saveSignature: 'Save signature in browser for reuse',
      savedSignatures: 'Saved Signatures',
      useSaved: 'Use Saved Signature',
    },
    convert: {
      title: 'Convert PDF',
      subtitle: 'Extract PDF pages as crisp images or create PDFs from images.',
      pdfToImagesTab: 'PDF to Images (PNG/JPG)',
      imagesToPdfTab: 'Images to PDF',
      dropPrompt: 'Drop a PDF file to convert to images',
      exportFormat: 'Target Image Format',
      exportFormatPng: 'PNG (Lossless, transparent-ready)',
      exportFormatJpg: 'JPEG (Compact file size)',
      exportQuality: 'Resolution Scale',
      convertBtn: 'Convert Pages to Images',
      convertingProgress: 'Rendering PDF pages to high-resolution raster images...',
      honestDisclaimerTitle: 'Transparent Technical Limits',
      honestDisclaimerText: 'Accurate PDF-to-Word (DOCX) or PDF-to-Excel (XLSX) reconstruction requires multi-million dollar OCR heuristic neural models that cannot run reliably purely client-side without sending your private files to third-party servers. To protect your privacy, we provide rock-solid PDF-to-Images and Text/OCR tools without cloud compromises.',
    },
    ocr: {
      title: 'OCR Text Extractor',
      subtitle: 'Extract searchable, editable text from scanned PDFs or images right in your browser.',
      dropPrompt: 'Drop a scanned PDF or image (PNG/JPG) for OCR extraction',
      selectLanguage: 'Recognition Language',
      langEnglish: 'English (Latin script)',
      langArabic: 'Arabic (العربية)',
      langBoth: 'English + Arabic (Mixed text)',
      ocrNotice: 'OCR runs locally via Tesseract.js WebAssembly. The first run downloads lightweight language dictionaries (~2-4 MB) stored in browser cache.',
      startOcrBtn: 'Start Optical Character Recognition',
      ocrProgress: 'Recognizing characters and analyzing layout...',
      resultTitle: 'Extracted Document Text',
      noTextFound: 'No text was recognized in the supplied pages. Ensure the document is oriented right-side up.',
      downloadTextFile: 'Download as .txt',
      copyToClipboard: 'Copy to Clipboard',
    },
    security: {
      title: 'PDF Security & Metadata',
      subtitle: 'Inspect internal document properties, sanitize metadata, and inspect encryption.',
      dropPrompt: 'Drop a PDF file to inspect and update metadata',
      infoTab: 'Document Properties',
      metadataTitle: 'PDF Metadata Information',
      metadataAuthor: 'Author',
      metadataTitleProp: 'Title',
      metadataSubject: 'Subject',
      metadataKeywords: 'Keywords',
      metadataCreator: 'Creator Application',
      metadataProducer: 'PDF Producer',
      updateMetadataBtn: 'Sanitize / Update Metadata & Download',
      metadataUpdatedSuccess: 'Metadata updated and cleaned successfully!',
      privacyNote: 'Removing author and creation tool details from public documents protects your personal anonymity when sharing PDFs.',
    },
    privacy: {
      title: 'Privacy Guarantee',
      subtitle: 'Real privacy through client-side architecture — not marketing slogans.',
      badge100Local: '100% In-Browser Execution',
      summary: 'At Free PDF Studio, we believe your personal documents, tax returns, contracts, medical forms, and IDs should never be transmitted to external servers. This platform runs purely on client-side WebAssembly and modern browser APIs.',
      section1Title: '1. No Server Uploads',
      section1Text: 'When you select or drop a PDF, the file is read into your browser’s temporary memory (RAM) via standard FileReader and Blob APIs. No network requests containing your file bytes are ever made.',
      section2Title: '2. Zero Telemetry & Zero Tracking',
      section2Text: 'We do not embed third-party marketing trackers, session recording software, or telemetry analytics that monitor what you upload or read.',
      section3Title: '3. Tested Open-Source Engines',
      section3Text: 'Every tool is powered by proven, battle-tested open-source libraries: pdf-lib for PDF manipulation, Mozilla’s PDF.js for rendering, and Tesseract.js for optical character recognition.',
      section4Title: '4. Non-Destructive Workflow',
      section4Text: 'Your original input files are strictly read-only and never modified or replaced. Downloaded files are newly synthesized blobs with distinct filenames.',
      section5Title: '5. Works Fully Offline',
      section5Text: 'Once the web page loads in your browser, you can disconnect your internet connection entirely and all PDF manipulation tools will continue to work normally.',
    },
    about: {
      title: 'About Free PDF Studio',
      subtitle: 'A modern, accessible, open PDF toolbox designed for true privacy and everyday ease.',
      missionTitle: 'Our Mission',
      missionText: 'Most commercial PDF tools on the web force users to sign up, restrict downloads behind paywalls, or secretly upload private files to cloud servers. Free PDF Studio was engineered to provide an honest, accessible alternative where everything runs on your own hardware.',
      featuresListTitle: 'Core Capabilities',
      openTechTitle: 'Built on Reliable Web Standards',
      openTechText: 'Utilizing modern browser technologies including WebAssembly, Web Workers, HTML5 Canvas, and modern ECMAScript standards to deliver desktop-grade PDF processing inside your browser tab.',
      faqTitle: 'Frequently Asked Questions',
      faq1Q: 'Is Free PDF Studio really completely free?',
      faq1A: 'Yes. There are no subscriptions, no premium tiers, no daily quotas, and no watermark traps.',
      faq2Q: 'Where are my uploaded files stored?',
      faq2A: 'Nowhere on our servers! Files are never uploaded anywhere. All computations occur right inside your computer or phone browser.',
      faq3Q: 'Is there a file size limit?',
      faq3A: 'Since processing takes place in your browser RAM, the practical limit is dictated by your device memory. Most modern laptops and phones can comfortably handle PDFs with hundreds of pages.',
      faq4Q: 'Does this work on mobile devices?',
      faq4A: 'Yes! The responsive interface is fully tested and optimized for touchscreens, tablets, iPhones, and Android devices.',
    },
    footer: {
      tagline: 'Professional, free, and privacy-first PDF tools running 100% locally in your browser.',
      quickLinks: 'Navigation',
      tools: 'PDF Tools',
      legal: 'Trust & Privacy',
      clientSideNotice: 'Client-side processing • Zero server uploads • No accounts required',
      allRightsReserved: 'Free PDF Studio. All processing occurs locally on your device.',
    },
  },
  ar: {
    appName: 'استوديو بي دي إف المجاني',
    appTagline: 'أدوات PDF احترافية ومجانية بالكامل وتعمل داخل متصفحك',
    appDescription: 'مجموعة أدوات PDF مجانية وموثوقة بنسبة 100%، دمج وتقسيم وضغط وقراءة وتوقيع وتنظيم وحجب البيانات واستخراج نصوص دون رفع أي مستند لخوادم خارجية.',
    nav: {
      home: 'الرئيسية',
      tools: 'كل الأدوات',
      reader: 'قارئ PDF',
      organize: 'تنظيم وحذف الصفحات',
      merge: 'دمج الملفات',
      split: 'تقسيم PDF',
      compress: 'ضغط الملفات',
      pageNumbers: 'ترقيم الصفحات',
      watermark: 'علامة مائية',
      crop: 'اقتصاص الهوامش',
      redact: 'حجب وتسويد البيانات',
      formFiller: 'تعبئة النماذج',
      flatten: 'تسطيح النماذج (Flatten)',
      compare: 'مقارنة مستندين',
      extractImages: 'استخراج الصور',
      headerFooter: 'الرأس والتذييل',
      imagesToPdf: 'صور إلى PDF',
      annotate: 'توقيع وتدوين',
      convert: 'تحويل',
      ocr: 'استخراج النصوص',
      security: 'الأمان والخصائص',
      privacy: 'ضمان الخصوصية',
      about: 'عن المنصة',
    },
    common: {
      selectFile: 'اختر ملف PDF',
      selectFiles: 'اختر ملفات PDF',
      dropHere: 'اسحب وأفلت الملفات هنا',
      orBrowse: 'أو انقر للاستعراض من جهازك',
      supportedFormats: 'الصيغ المدعومة',
      download: 'تحميل الملف',
      share: 'مشاركة المستند',
      processing: 'جارٍ المعالجة...',
      cancel: 'إلغاء',
      reset: 'إعادة تعيين',
      clear: 'مسح',
      remove: 'إزالة',
      moveUp: 'تحريك لأعلى',
      moveDown: 'تحريك لأسفل',
      fileName: 'اسم الملف',
      fileSize: 'حجم الملف',
      pageCount: 'الصفحات',
      page: 'صفحة',
      of: 'من',
      pages: 'صفحات',
      success: 'تمت العملية بنجاح!',
      error: 'حدث خطأ أثناء معالجة الملف.',
      warning: 'تنبيه',
      info: 'معلومات',
      copied: 'تم النسخ إلى الحافظة!',
      copyText: 'نسخ النص',
      downloadTxt: 'تحميل كملف نصي (.txt)',
      downloadZip: 'تحميل الكل (.zip)',
      downloadPdf: 'تحميل ملف PDF',
      loading: 'جارٍ تحميل المستند...',
      backToHome: 'العودة للرئيسية',
      tryAgain: 'حاول مجدداً',
      noFileSelected: 'لم يتم اختيار ملف بعد',
      apply: 'تطبيق التغييرات',
      save: 'حفظ',
      preview: 'معاينة',
      zoomIn: 'تكبير',
      zoomOut: 'تصغير',
      fitWidth: 'ملاءمة العرض',
      rotate: 'تدوير باتجاه عقارب الساعة',
      privacyNotice: 'تتم معالجة جميع الملفات محلياً داخل متصفحك دون رفعها إلى أي خادم إطلاقاً.',
      allTools: 'استكشف جميع الأدوات',
    },
    home: {
      heroBadge: 'صفر عمليات رفع • خصوصية تامة على جهازك 100%',
      heroTitle: 'تعامل مع ملفات PDF بأمان واحترافية،',
      heroTitleHighlight: 'مباشرة داخل متصفحك.',
      heroSubtitle: 'استوديو بي دي إف يوفر حزمة أدوات متكاملة وسريعة لمعالجة مستنداتك محلياً باستخدام تقنيات الويب الحديثة. بدون اشتراكات، وبدون حدود خفية، وبخصوصية مطلقة.',
      getStartedBtn: 'استكشف أدوات PDF',
      exploreToolsBtn: 'فتح قارئ PDF',
      privacyPill: 'معالجة محلية 100%',
      offlinePill: 'يعمل بالكامل داخل المتصفح',
      freePill: 'مجاني بالكامل للأبد',
      quickToolsTitle: 'أهم الأدوات الأكثر استخداماً',
      quickToolsSubtitle: 'اختر أداة من القائمة أدناه أو اسحب ملفك للبدء الفوري.',
      whyChooseUsTitle: 'لماذا استوديو بي دي إف المجاني؟',
      whyChooseUsSubtitle: 'صُمم خصيصاً للمستخدمين الذين يقدّرون الخصوصية العالية والسرعة والمصداقية.',
      featurePrivacyTitle: 'خصوصية دون إفشاء البيانات',
      featurePrivacyDesc: 'عقودك ومستنداتك المالية وهوياتك الشخصية لا تغادر حاسوبك أو هاتفك إطلاقاً، وتتم المعالجة داخل ذاكرة المتصفح فقط.',
      featureSpeedTitle: 'سرعة فائقة وفورية',
      featureSpeedDesc: 'وداعاً للانتظار في قوائم رفع الخوادم والتنزيل البطيء، فالمعالجة تبدأ فورياً وبقوة معالج جهازك.',
      featureFreeTitle: 'مجاني بالكامل وبلا قيود',
      featureFreeDesc: 'بدون بطاقات بنكية، ولا علامات مائية مزعجة، وبلا حد يومي لعدد الصفحات.',
      featureOpenTitle: 'شفافية وموثوقية',
      featureOpenDesc: 'مبني على مكتبات مفتوحة المصدر مشهود لها عالمياً مثل pdf-lib و PDF.js و Tesseract.js دون إعلانات مضللة.',
      trustedBanner: 'تُنفذ كافة العمليات في بيئة معزولة داخل المتصفح. ملفاتك الأصلية تبقى كما هي دون تعديل.',
    },
    reader: {
      title: 'قارئ ملفات PDF',
      subtitle: 'عارض مستندات سريع وسلس داخل المتصفح مع ميزات التكبير والتدوير واللوحة الجانبية للمصغرات.',
      openPdf: 'فتح مستند PDF',
      firstPage: 'الصفحة الأولى',
      previousPage: 'الصفحة السابقة',
      nextPage: 'الصفحة التالية',
      lastPage: 'الصفحة الأخيرة',
      jumpToPage: 'انتقال إلى صفحة',
      zoom: 'نسبة التكبير',
      fitPage: 'ملاءمة الصفحة',
      pageRenderError: 'تعذر عرض الصفحة. قد يكون الملف تالفاً أو محمياً بكلمة مرور.',
      passwordRequired: 'هذا المستند محمي بكلمة مرور. يلزم فك التشفير أولاً.',
      emptyReaderPrompt: 'اختر ملف PDF لقراءته واستعراض محتوياته مباشرة وبدقة عالية.',
      thumbnails: 'مصغرات الصفحات',
    },
    organize: {
      title: 'تنظيم وحذف صفحات PDF',
      subtitle: 'إعادة ترتيب الصفحات، وتدويرها، أو حذف صفحات محددة مع معاينة بصرية كاملة.',
      dropPrompt: 'اسحب ملف PDF هنا لإعادة ترتيب أو حذف الصفحات',
      reorderHint: 'رتب الصفحات بالأسهم، أو دوّر أي صفحة 90°، أو احذف الصفحات غير المرغوبة.',
      rotatePage: 'تدوير 90°',
      deletePage: 'حذف الصفحة',
      restoreAll: 'إعادة الترتيب الأصلي',
      saveChangesBtn: 'حفظ وتحميل الملف المنظم',
      deletedCount: 'تم حذف {count} صفحة(صفحات)',
      savingProgress: 'جارٍ بناء وحفظ المستند المنظم...',
    },
    pageNumbers: {
      title: 'ترقيم صفحات PDF',
      subtitle: 'أضف أرقام الصفحات تلقائياً بمواضع وتنسيقات وألوان مخصصة واحترافية.',
      dropPrompt: 'اسحب ملف PDF هنا لإضافة أرقام الصفحات',
      position: 'موضع الترقيم',
      posBottomCenter: 'أسفل الوسط',
      posBottomRight: 'أسفل اليمين',
      posBottomLeft: 'أسفل اليسار',
      posTopRight: 'أعلى اليمين',
      posTopCenter: 'أعلى الوسط',
      format: 'تنسيق الترقيم',
      formatPageXofY: 'صفحة X من Y',
      formatXofY: 'X / Y',
      formatNumberOnly: 'الرقم فقط (1, 2, 3...)',
      skipFirst: 'تخطي الصفحة الأولى (صفحة الغلاف)',
      fontSize: 'حجم الخط',
      color: 'لون الخط',
      addNumbersBtn: 'إدراج الترقيم وتحميل الملف',
      progress: 'جارٍ إدراج أرقام الصفحات...',
    },
    watermark: {
      title: 'إضافة علامة مائية',
      subtitle: 'أضف علامة مائية نصية أو صورة شفافة فوق صفحات PDF بزاوية وشبه شفافية قابلة للتعديل.',
      dropPrompt: 'اسحب ملف PDF هنا لإضافة علامة مائية',
      typeText: 'علامة مائية نصية',
      typeImage: 'علامة مائية بصورة (PNG/JPG)',
      watermarkText: 'نص العلامة المائية',
      watermarkTextPlaceholder: 'مثال: سري للغاية، مسودة، نسخة للمراجعة',
      watermarkImagePrompt: 'اختر صورة العلامة المائية (PNG أو JPG)',
      opacity: 'درجة الشفافية (Opacity)',
      rotation: 'زاوية الميلان',
      color: 'لون العلامة المائية',
      addWatermarkBtn: 'تطبيق العلامة المائية وتحميل الملف',
      progress: 'جارٍ ختم العلامة المائية على كافة الصفحات...',
    },
    crop: {
      title: 'اقتصاص الهوامش الزائدة',
      subtitle: 'قص الهوامش البيضاء الفارغة لتسهيل القراءة على الشاشات والهواتف الذكية.',
      dropPrompt: 'اسحب ملف PDF هنا لاقتصاص الهوامش',
      marginAmount: 'مقدار قص الهوامش',
      marginSmall: 'قص خفيف (20 نقطة)',
      marginMedium: 'قص متوازن (40 نقطة)',
      marginLarge: 'قص عميق (60 نقطة)',
      cropNotice: 'يتم تعديل إطار العرض (CropBox) بدون فقدان جودة النصوص أو الصور.',
      applyCropBtn: 'اقتصاص وتحميل المستند',
      progress: 'جارٍ ضبط هوامش الصفحات...',
    },
    redact: {
      title: 'حجب وتسويد البيانات الحساسة',
      subtitle: 'تسويد الأرقام والمعلومات الحساسة كأرقام الهويات والحسابات بشكل دائم غير قابل للاسترجاع.',
      dropPrompt: 'اسحب ملف PDF هنا لحجب المعلومات الحساسة',
      drawBoxHint: 'انقر واسحب بالماوس فوق الأرقام أو النصوص لتحديد مربعات التسويد والحجب.',
      boxColor: 'لون التسويد / الحجب',
      colorBlack: 'تسويد كامل (أسود داكن)',
      colorWhite: 'حجب نظيف (أبيض ناصع)',
      clearBoxes: 'مسح علامات الحجب',
      burnRedactionBtn: 'تثبيت الحجب النهائي وتحميل الملف',
      securityNoticeTitle: 'حجب أمني فعلي عبر التسطيح النقطي (Pixel Sanitization)',
      warningPermanent: 'إشعار أمني: الصفحات المحجوبة يتم تسطيحها بالكامل إلى صور نقطية عالية الدقة مع إتلاف طبقات النصوص المتجهة نهائياً من بنية الملف لضمان استحالة استخراجها بأي وسيلة.',
      noMarksWarning: 'يرجى رسم وتحديد علامة حجب واحدة على الأقل لتفعيل تصدير الملف.',
      success: 'تم حجب وتسويد البيانات بنجاح تام وبشكل غير قابل للاسترجاع!',
    },
    formFiller: {
      title: 'تعبئة نماذج PDF التفاعلية',
      subtitle: 'املأ الاستمارات والنماذج الحكومية والطلبات الرسمية التفاعلية مباشرة داخل المتصفح.',
      dropPrompt: 'اسحب نموذج PDF تفاعلي لتعبئته',
      noFieldsFound: 'لم يتم العثور على حقول تفاعلية برمجية في هذا المستند. يمكنك استخدام أداة "التوقيع والتدوين" لإضافة نصوص بحرية.',
      fieldsCount: 'تم اكتشاف {count} حقل(حقول) تفاعلية',
      saveFilledPdf: 'حفظ وتحميل النموذج المعبأ',
      fieldLabel: 'اسم الحقل',
      fieldValue: 'القيمة / الإدخال',
    },
    flatten: {
      title: 'تسطيح حقول PDF (Flatten)',
      subtitle: 'تثبيت وقفل الحقول التفاعلية والتوقيعات لتصبح صفحات عادية غير قابلة للتعديل وجاهزة للطباعة.',
      dropPrompt: 'اسحب ملف PDF يحتوي على نماذج أو تعليقات لتسطيحها',
      explanation: 'التسطيح يقوم بدمج كافة النماذج ومربعات الاختيار نهائياً داخل محتوى الصفحة لتفادي أي تعديل لاحق.',
      flattenBtn: 'تسطيح المستند وتحميله',
      success: 'تم تسطيح وتثبيت حقول المستند بنجاح!',
    },
    compare: {
      title: 'مقارنة مستندين جنباً إلى جنب',
      subtitle: 'استعرض نسختين من ملف PDF للمقارنة البصرية الفورية مع تنقل متزامن بين الصفحات.',
      dropPromptA: 'اسحب المستند الأول (النسخة الأصلية)',
      dropPromptB: 'اسحب المستند الثاني (النسخة المعدلة)',
      originalDoc: 'المستند (أ) - النسخة الأصلية',
      revisedDoc: 'المستند (ب) - النسخة المعدلة',
      pageNav: 'تنقل متزامن بين الصفحات',
      syncScroll: 'عرض متوازي متزامن',
    },
    extractImages: {
      title: 'استخراج الصور من PDF',
      subtitle: 'استخرج كافة الصور والشعارات والرسومات التوضيحية المضمنة بجودتها الأصلية الكاملة.',
      dropPrompt: 'اسحب ملف PDF لاستخراج صوره المضمنة',
      extractBtn: 'فحص واستخراج كافة الصور',
      noImagesFound: 'لم يتم العثور على صور نقطية مضمنة داخل هذا المستند.',
      foundCount: 'تم استخراج {count} صورة(صور)',
      downloadAllZip: 'تحميل جميع الصور كملف مضغوط (.zip)',
      progress: 'جارٍ استخراج أصول الصور من مسارات المستند...',
    },
    headerFooter: {
      title: 'إضافة الرأس والتذييل المخصص',
      subtitle: 'أضف ترويسات وتذييلات احترافية بأعلى وأسفل كل صفحة (العناوين، التواريخ، أرقام الصفحات).',
      dropPrompt: 'اسحب ملف PDF هنا لإضافة الرأس والتذييل',
      topLeft: 'أعلى اليسار (مثال: عنوان المستند)',
      topCenter: 'أعلى الوسط',
      topRight: 'أعلى اليمين (مثال: التاريخ)',
      bottomLeft: 'أسفل اليسار (مثال: سري وخاص)',
      bottomCenter: 'أسفل الوسط',
      bottomRight: 'أسفل اليمين (مثال: رقم الصفحة)',
      applyBtn: 'إدراج الرأس والتذييل وتحميل الملف',
    },
    merge: {
      title: 'دمج ملفات PDF',
      subtitle: 'ادمج عدة مستندات PDF في ملف واحد مرتب وواضح خلال ثوانٍ معدودة.',
      dropPrompt: 'اسحب وأفلت ملفات PDF هنا أو انقر للاختيار',
      fileListTitle: 'الملفات المحددة للدمج (الترتيب مهم)',
      reorderHint: 'يمكنك استخدام الأسهم لإعادة ترتيب الملفات حسب رغبتك قبل الدمج.',
      mergeButton: 'دمج الملفات في مستند واحد',
      needAtLeastTwo: 'يرجى اختيار ملفين PDF على الأقل لإتمام الدمج.',
      mergedSuccess: 'تم دمج الملفات بنجاح في مستند جديد!',
      mergingProgress: 'جارٍ دمج الصفحات وتجميع المستند...',
    },
    split: {
      title: 'تقسيم ملف PDF',
      subtitle: 'استخرج صفحات محددة أو نطاقات مخصصة أو افصل كل صفحة في ملف مستقل.',
      dropPrompt: 'اسحب ملف PDF هنا لتقسيمه إلى صفحات',
      modeTitle: 'طريقة التقسيم',
      modeCustomRanges: 'نطاقات صفحات مخصصة',
      modeEveryPage: 'استخراج كل صفحة كملف مستقل',
      rangeInputLabel: 'أدخل أرقام الصفحات أو النطاقات (مثال: 1-3، 5، 8-10)',
      rangeInputPlaceholder: 'مثال: 1-3, 5, 7-12',
      rangeInputHelp: 'افصل بين الصفحات أو النطاقات بفاصلة. مثال: "1, 3-5, 8" يستخرج الصفحة 1، والصفحات من 3 إلى 5، والصفحة 8.',
      invalidRangeError: 'صيغة النطاق غير صالحة. يرجى إدخال أرقام صحيحة ضمن عدد صفحات الملف (مثال: 1-4, 7).',
      splitButton: 'تقسيم وتحميل الملفات',
      splittingProgress: 'جارٍ استخراج الصفحات وبناء الملفات المنفصلة...',
      extractedCount: 'تم استخراج {count} ملف(ات)',
    },
    compress: {
      title: 'ضغط وتحسين ملف PDF',
      subtitle: 'تقليل حجم ملف PDF محلياً داخل المتصفح عبر التحسين الهيكلي غير الفاقد أو الضغط القوي عبر تحويل الصفحات لصور.',
      dropPrompt: 'اسحب ملف PDF هنا للبدء في ضغطه وتحسينه',
      disclaimerTitle: 'تنبيه المصداقية والشفافية بشأن ضغط PDF',
      disclaimerDesc: 'فاعلية الضغط تعتمد كلياً على نوع المستند. قمنا بفصل التحسين الهيكلي الحافظ للمحتوى عن تحويل الصفحات لصور JPEG، حتى لا تفقد نصوصك القابلة للبحث أو روابطك دون قصد.',
      modeTitle: 'طريقة الضغط والتحسين',
      modeStructure: 'تحسين هيكلي غير فاقد (يحافظ 100% على النصوص والروابط)',
      modeStructureDesc: 'يضغط جداول الكائنات الداخلية للملف. يحافظ تماماً على الخطوط المتجهة والنصوص القابلة للتحديد والبحث والعلامات المرجعية والروابط التشعبية.',
      modeRaster: 'ضغط شديد عبر تحويل الصفحات لصور JPEG',
      modeRasterDesc: 'يعيد تحويل كل صفحة إلى صورة نقطية مضغوطة لتحقيق أقصى تقليص ممكن. تحذير: يؤدي لفقدان النصوص القابلة للبحث والروابط التشعبية.',
      rasterWarningTitle: 'تنبيه فقدان النصوص القابلة للبحث والروابط',
      rasterWarningDesc: 'تحويل الصفحات إلى صور يؤدي إلى حذف طبقة النصوص القابلة للبحث والنسخ وإلغاء الروابط التشعبية، وتقليل حدة الخطوط المتجهة عند التكبير.',
      compressionLevel: 'دقة وجودة الصور النقطية',
      levelLow: 'ضغط خفيف (جودة عالية جداً، 150 DPI)',
      levelLowDesc: 'أفضل توازن للمستندات المخصصة للطباعة والعروض التقديمية.',
      levelMedium: 'ضغط متوازن (دقة قياسية، 100 DPI)',
      levelMediumDesc: 'مثالي للإرفاق في البريد الإلكتروني والقراءة على الشاشات.',
      levelHigh: 'أقصى ضغط (حجم مدمج، 72 DPI)',
      levelHighDesc: 'تقليص مكثف لتلبية حدود الحجم القصوى للبوابات الإلكترونية.',
      compressBtn: 'تحسين وضغط المستند',
      compressingProgress: 'جارٍ معالجة المستند وتحسين تدفق البيانات...',
      originalSize: 'الحجم الفعلي الأصلي',
      compressedSize: 'الحجم الفعلي بعد المعالجة',
      savedPercentage: 'نسبة التوفير',
      sizeChangeTitle: 'مقارنة حجم الملف قبل المعالجة وبعدها',
      sizeIncreasedNotice: 'حجم الملف الناتج أكبر بمقدار {sizeDiff} (+{percentDiff}%). هذا أمر طبيعي للمستندات النصية الصغيرة المتجهة التي لا تحتوي على صور مضمنة. نوصي بالاحتفاظ بملفك الأصلي.',
      sizeDecreasedNotice: 'تم تقليص حجم الملف بنجاح وتوفير {sizeDiff} (تصغير بنسبة {percentDiff}%)!',
      noReductionNotice: 'هذا الملف مُحسّن مسبقاً بالفعل، ولا يمكن تقليل حجمه أكثر من ذلك دون الإضرار بالمحتوى.',
      downloadResult: 'تحميل الملف المُعالج',
    },
    imagesToPdf: {
      title: 'تحويل الصور إلى PDF',
      subtitle: 'حول صورك بصيغ PNG أو JPG أو WebP إلى مستند PDF واحد أنيق ومنظم.',
      dropPrompt: 'اسحب الصور (JPG, PNG, WebP) هنا أو انقر للاستعراض',
      pageSize: 'مقاس الصفحة',
      sizeA4: 'A4 (210 × 297 مم)',
      sizeLetter: 'US Letter (8.5 × 11 إنش)',
      sizeFitImage: 'مطابقة مقاس الصفحة لأبعاد كل صورة',
      orientation: 'اتجاه الصفحة',
      orientationAuto: 'تلقائي (حسب نسبة أبعاد الصورة)',
      orientationPortrait: 'عمودي (Portrait)',
      orientationLandscape: 'أفقي (Landscape)',
      margin: 'هوامش الصفحة',
      marginNone: 'بدون هوامش (من الحافة للحافة)',
      marginSmall: 'هامش صغير (15pt)',
      marginNormal: 'هامش قياسي (30pt)',
      generatePdfBtn: 'إنشاء وتحميل ملف PDF',
      generatingProgress: 'جارٍ تضمين الصور وتوليد صفحات PDF...',
    },
    annotate: {
      title: 'توقيع وتدوين على PDF',
      subtitle: 'ارسم توقيعك بيدك، أو أضف التاريخ، أو دوّن ملاحظات نصية مباشرة على صفحات PDF.',
      dropPrompt: 'اسحب ملف PDF هنا لإضافة توقيع أو تعليق',
      toolPen: 'رسم وتوقيع حر',
      toolText: 'إضافة نص',
      toolDate: 'ختم تاريخ اليوم',
      toolClearDrawing: 'مسح الرسم',
      penColor: 'لون الحبر',
      penWidth: 'سُمك القلم',
      fontSize: 'حجم الخط',
      textContentPlaceholder: 'اكتب النص المراد إضافته إلى الصفحة...',
      applyAnnotationBtn: 'تضمين التعديلات وتحميل ملف PDF',
      disclaimerSignature: 'إشعار قانوني: التوقيع المرسوم باليد عبر المتصفح يمثل علامة إلكترونية بصرية، ولا يُعد شهادة رقمية مشفرة مؤهلة.',
      embedNotice: 'تُدمج جميع الرسومات والتوقيعات والنصوص بشكل حقيقي وثابت داخل بنية ملف PDF عند التنزيل.',
      signStudio: 'استوديو التوقيع الاحترافي',
      tabDraw: 'رسم باليد',
      tabType: 'كتابة الاسم كخط توقيع',
      tabUpload: 'رفع صورة التوقيع',
      removeWhiteBg: 'إزالة خلفية الورقة البيضاء تلقائياً (شفافية كاملة)',
      saveSignature: 'حفظ التوقيع في المتصفح لإعادة استخدامه دائماً',
      savedSignatures: 'التوقيعات المحفوظة',
      useSaved: 'استخدام التوقيع المحفوظ',
    },
    convert: {
      title: 'تحويل مستندات PDF',
      subtitle: 'استخرج صفحات PDF كصور عالية الدقة أو حوّل الصور إلى PDF.',
      pdfToImagesTab: 'PDF إلى صور (PNG / JPG)',
      imagesToPdfTab: 'صور إلى PDF',
      dropPrompt: 'اسحب ملف PDF لتحويل صفحاته إلى صور',
      exportFormat: 'صيغة الصور المستهدفة',
      exportFormatPng: 'PNG (جودة فائقة وخلفية نظيفة)',
      exportFormatJpg: 'JPEG (حجم ملف مضغوط)',
      exportQuality: 'دقة الاستخراج',
      convertBtn: 'تحويل الصفحات إلى صور',
      convertingProgress: 'جارٍ تصيير الصفحات إلى صور رقمية عالية الجودة...',
      honestDisclaimerTitle: 'حدود تقنية بكل شفافية ومصداقية',
      honestDisclaimerText: 'تحويل ملفات PDF إلى Word (DOCX) أو Excel بدقة متناهية يتطلب خوارزميات ذكاء اصطناعي ضخمة تستلزم إرسال مستنداتك لخوادم طرف ثالث سحابية. لحماية خصوصيتك وسلامة بياناتك 100%، نوفر تحويل PDF إلى صور واستخراج النصوص عبر OCR محلياً بالكامل دون أي مساومة على سرية بياناتك.',
    },
    ocr: {
      title: 'استخراج النصوص (OCR)',
      subtitle: 'استخرج النصوص القابلة للنسخ والتحرير من ملفات PDF الممسوحة ضوئياً أو الصور.',
      dropPrompt: 'اسحب ملف PDF ممسوح ضوئياً أو صورة لاستخراج النص منها',
      selectLanguage: 'لغة المستند للتعرف الضوئي',
      langEnglish: 'الإنجليزية (English)',
      langArabic: 'العربية (Arabic)',
      langBoth: 'العربية + الإنجليزية (نصوص مختلطة)',
      ocrNotice: 'يعمل محرك OCR محلياً على جهازك باستخدام تقنية Tesseract.js WebAssembly. في المرة الأولى يتم تنزيل قاموس اللغة الخفيف (~2-4 ميجابايت) ويُحفظ في ذاكرة متصفحك للعمل دائماً.',
      startOcrBtn: 'بدء استخراج النصوص الآن',
      ocrProgress: 'جارٍ التعرف على الأحرف وتحليل الأسطر...',
      resultTitle: 'النص المستخرج من المستند',
      noTextFound: 'لم يتم التعرف على أي نصوص في الصفحات المحددة. تأكد من وضوح المستند واتجاهه الصحيح.',
      downloadTextFile: 'تحميل كملف نصي (.txt)',
      copyToClipboard: 'نسخ إلى الحافظة',
    },
    security: {
      title: 'الأمان والبيانات الوصفية',
      subtitle: 'فحص الخصائص الداخلية للمستند، وإزالة البيانات الحساسة الملحقة، وحماية الخصوصية.',
      dropPrompt: 'اسحب ملف PDF لعرض وتحديث بياناته الوصفية',
      infoTab: 'خصائص المستند',
      metadataTitle: 'البيانات الوصفية (Metadata)',
      metadataAuthor: 'اسم المؤلف / الكاتب',
      metadataTitleProp: 'عنوان المستند',
      metadataSubject: 'الموضوع',
      metadataKeywords: 'الكلمات المفتاحية',
      metadataCreator: 'التطبيق المنشئ',
      metadataProducer: 'برنامج إنتاج PDF',
      updateMetadataBtn: 'تنظيف وتحديث البيانات الوصفية وتحميل الملف',
      metadataUpdatedSuccess: 'تم تنظيف وتحديث البيانات الوصفية بنجاح!',
      privacyNote: 'حذف اسم الكاتب والبرامج المستخدمة قبل مشاركة المستندات يحمي هويتك الرقمية وخصوصيتك الشخصية.',
    },
    privacy: {
      title: 'ضمان الخصوصية التامة',
      subtitle: 'خصوصية حقيقية بالاعتماد على البنية المحلية للمتصفح، وليس مجرد وعود تسويقية.',
      badge100Local: 'معالجة محلية داخل المتصفح 100%',
      summary: 'في استوديو بي دي إف المجاني، نؤمن بأن مستنداتك الشخصية، وإقراراتك الضريبية، وعقودك، وهوياتك لا ينبغي أبداً إرسالها إلى خوادم خارجية. تعمل هذه المنصة بالكامل داخل متصفحك عبر واجهات برمجة الويب و WebAssembly.',
      section1Title: '1. لا يتم رفع أي ملف إلى أي خادم',
      section1Text: 'عند اختيارك لأي ملف، يُقرأ الملف مباشرة في الذاكرة العشوائية لمتصفحك فقط عبر FileReader و Blob. لا يتم إرسال أي بايت من ملفك عبر شبكة الإنترنت إطلاقاً.',
      section2Title: '2. انعدام التتبع والتحليلات السرية',
      section2Text: 'لا نستخدم أدوات تتبع تسويقية من أطراف ثالثة ولا برمجيات تسجيل جلسات تراقب ما تقرأه أو تعدله.',
      section3Title: '3. محركات برمجية مفتوحة المصدر وموثوقة',
      section3Text: 'كل أداة تعتمد على مكتبات مفتوحة المصدر تم تدقيقها عالمياً: pdf-lib لمعالجة وتعديل الملفات، و Mozilla PDF.js للعرض، و Tesseract.js للتعرف الضوئي على الحروف.',
      section4Title: '4. حماية كاملة لملفك الأصلي',
      section4Text: 'ملفك الأصلي على جهازك يظل كما هو للقراءة فقط ولا يتم استبداله أو حذفه إطلاقاً. الملفات المعدلة تُحمّل كملفات جديدة تماماً بأسماء مستقلة.',
      section5Title: '5. يعمل دون الحاجة لإنترنت',
      section5Text: 'بمجرد تحميل صفحة الموقع في متصفحك، يمكنك قطع الاتصال بالإنترنت تماماً ومتابعة قراءة ودمج وتقسيم وتوقيع ملفاتك بكل أريحية.',
    },
    about: {
      title: 'عن استوديو بي دي إف المجاني',
      subtitle: 'منصة ويب حديثة ومتاحة للجميع، صُممت لتوفير أقصى درجات الخصوصية وسهولة الاستخدام اليومي.',
      missionTitle: 'رسالتنا وهدفنا',
      missionText: 'معظم أدوات PDF التجارية على شبكة الإنترنت تجبر المستخدمين على إنشاء حسابات، أو تفرض دفع اشتراكات، أو ترفع ملفاتهم الحساسة إلى خوادم مجهولة. صُمم استوديو بي دي إف ليكون البديل الصادق والحر الذي يُجري كافة العمليات على عتاد جهازك الخاص.',
      featuresListTitle: 'الميزات والقدرات الأساسية',
      openTechTitle: 'مبني على معايير الويب المفتوحة',
      openTechText: 'الاستفادة من أحدث تقنيات الويب العالمية مثل WebAssembly و Web Workers و HTML5 Canvas لتوفير قوة برامج سطح المكتب مباشرة في نافذة المتصفح.',
      faqTitle: 'الأسئلة الشائعة',
      faq1Q: 'هل استوديو بي دي إف مجاني حقاً وبلا أي مقابل؟',
      faq1A: 'نعم، مجاني تماماً وبلا أي اشتراكات، ولا توجد مستويات مدفوعة، ولا حدود يومية، ولا علامات مائية إطلاقاً.',
      faq2Q: 'أين تُحفظ الملفات التي أقوم باختيارها؟',
      faq2A: 'لا تُحفظ على أي خادم على الإطلاق! جميع العمليات تجري لحظياً داخل ذاكرة متصفح جهازك فقط.',
      faq3Q: 'هل يوجد حد أقصى لحجم الملفات؟',
      faq3A: 'نظراً لأن المعالجة تتم على جهازك، فإن الحد الوحيد هو ذاكرة حاسوبك أو هاتفك. تستطيع معظم الأجهزة الحديثة معالجة مستندات بمئات الصفحات بسلاسة.',
      faq4Q: 'هل تعمل الأدوات على الهواتف والأجهزة اللوحية؟',
      faq4A: 'نعم بكل تأكيد، واجهة الموقع متجاوبة ومصممة بدقة لتلائم شاشات اللمس والهواتف الذكية بنظامي Android و iOS.',
    },
    footer: {
      tagline: 'أدوات PDF احترافية ومجانية وتعمل محلياً داخل متصفحك بأعلى معايير الخصوصية.',
      quickLinks: 'التنقل السريع',
      tools: 'أدوات PDF',
      legal: 'الموثوقية والخصوصية',
      clientSideNotice: 'معالجة محلية داخل المتصفح • بدون رفع ملفات • لا حاجة لتسجيل حساب',
      allRightsReserved: 'استوديو بي دي إف المجاني. كافة العمليات تُنفّذ محلياً على جهازك.',
    },
  },
};
