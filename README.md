# Free PDF Studio — Professional & 100% In-Browser PDF Suite

A privacy-first, zero-cloud-upload PDF manipulation web application and Progressive Web App (PWA). All operations (merging, splitting, organizing, compressing, viewing, annotating, signing, watermarking, page numbering, optical character recognition, redaction, and converting) execute **100% locally in your browser memory** via WebAssembly and modern web APIs. No documents ever leave your machine.

---

## 🌟 Complete Suite of 19 In-Browser Tools

1. **PDF Reader (`/reader`)**: High-performance in-browser viewer with zoom, page jump navigation, fit to width, 90° rotation, print, and full-screen view.
2. **Organize & Rotate Pages (`/organize`)**: Visual grid of all pages rendered as interactive thumbnails. Drag-and-drop to reorder, rotate individual sheets in 90° increments, duplicate, or delete unwanted pages.
3. **Merge PDF (`/merge`)**: Combine multiple PDF files, reorder queue with move up/down controls, remove individual files, and generate a new merged PDF.
4. **Split PDF (`/split`)**: Extract custom ranges (e.g., `1-3, 5, 8-10`, supporting Arabic and English commas) or extract every single page into separate files, with one-click multi-file ZIP archiving.
5. **Side-by-Side Compare (`/compare`)**: Compare two PDF versions side by side with synchronized controls for contract revision and proofing.
6. **Annotate & Signature Studio (`/annotate`)**: 
   - **Draw**: Freehand pen drawing with customizable stroke and color.
   - **Type**: Clean typed text callouts and signature stamps.
   - **Signature Placement**: Draw or stamp signatures embedded directly into the PDF byte stream.
7. **Permanent Redaction (`/redact`)**: True blackout redaction where sensitive text/rectangles are permanently removed and converted into raster images to prevent text leakage or inspection.
8. **Form Filler (`/form-filler`)**: Detect interactive AcroForm fields, fill text inputs, toggle checkboxes, select dropdowns, and download completed forms.
9. **Flatten PDF (`/flatten`)**: Permanently bake form fields, annotations, and comments into flat static page content to prevent tampering.
10. **Compress PDF (`/compress`)**: Client-side optimization with dual modes: text-preserving structure optimization or image re-encoding, ensuring files never expand.
11. **Add Page Numbers (`/page-numbers`)**: Automatically insert clean page numbering with customizable positions (bottom-center, bottom-right, bottom-left, top-right, top-center), format (`Page X of Y`, `X/Y`, `X`), font size, color, and optional cover-page skipping.
12. **Watermark PDF (`/watermark`)**: Apply custom text watermarks (with instant presets like CONFIDENTIAL, DRAFT, سري للغاية) or image logos with transparency (opacity) and angle controls.
13. **Header & Footer Tool (`/header-footer`)**: Insert running headers (left, center, right) and footers (confidentiality notices, dates, page variables) across all pages.
14. **Crop Margins (`/crop`)**: Losslessly trim excess blank outer margins from all pages to optimize reading on mobile phones and tablets.
15. **Images to PDF (`/images-to-pdf`)**: Convert PNG, JPG, and WebP images into a PDF with A4, US Letter, or Fit-to-Image dimensions and customizable margins.
16. **PDF to Images (`/convert`)**: High-resolution PDF to PNG / JPEG export with individual downloads or full ZIP archiving.
17. **Extract Embedded Images (`/extract-images`)**: Extract all raster images and photos embedded inside the PDF directly into individual files or ZIP.
18. **OCR Text Extractor (`/ocr`)**: In-browser Optical Character Recognition using local Tesseract.js WebAssembly with English and Arabic language support, live multi-page progress, and `.txt` export.
19. **PDF Security & Metadata (`/security`)**: Inspect Title, Author, Subject, Keywords, Creator, and Producer, with one-click metadata sanitization.

---

## 🔒 100% Offline & Privacy Architecture

- **Zero Cloud Uploads**: Files are read into local browser RAM via `FileReader` and `Blob` APIs. No network requests carry your documents.
- **Zero CDN Dependencies**: All fonts (Cairo & Plus Jakarta Sans), PDF.js workers, cmaps, standard fonts, and Tesseract.js WASM cores are self-hosted within the app.
- **PWA Offline First**: Fully installable on Windows, macOS, Android, and iOS home screens with Workbox cache-first policies.

---

## 🛠️ Technology Stack

- **React 19** + **TypeScript** + **Vite 8**
- **Vite PWA Plugin** (`vite-plugin-pwa`) with Web App Manifest and Service Worker
- **Tailwind CSS v4** with native RTL support and custom `@variant dark`
- **pdf-lib**: Pure JavaScript/TypeScript client-side PDF document creation and manipulation
- **PDF.js (Mozilla)**: High-fidelity PDF rendering and page rasterization
- **Tesseract.js**: In-browser WebAssembly Optical Character Recognition
- **JSZip**: In-memory multi-file archive generation
- **Vitest**: Automated unit testing

---

## 🚀 Setup & Development

```bash
# 1. Install dependencies
npm install

# 2. Fetch/copy offline assets (PDF.js cmaps/fonts + Tesseract WASM/traineddata)
node scripts/fetch-assets.mjs

# 3. Start local development server
npm run dev

# 4. Run unit tests
npm run test

# 5. Typecheck and lint
npm run lint

# 6. Verify everything (lint + test + build)
npm run check

# 7. Build for production (automatically runs prebuild asset sync)
npm run build
```

### Netlify Deployment
The repository includes a ready-to-deploy `netlify.toml` with:
- Build command: `npm run build`
- Publish directory: `dist`
- SPA redirects to `/index.html`
- Strict Content-Security-Policy (CSP) allowing WASM and local blob/worker execution
- Proper immutable asset caching and `no-cache` rules for `sw.js`
