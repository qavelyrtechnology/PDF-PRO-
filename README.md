# Free PDF Studio — Professional & 100% In-Browser PDF Suite

Developed by [Qavelyr](https://qavelyr.netlify.app/).

A privacy-first, zero-cloud-upload PDF manipulation web application and Progressive Web App (PWA). All operations (merging, splitting, organizing, compressing, viewing, password encryption/unlocking, PDF-to-Word conversion, annotating, signing, watermarking, page numbering, optical character recognition, and redaction) execute **100% locally in your browser memory** via WebAssembly and modern web APIs. No documents ever leave your machine.

---

## 🌟 Complete Suite of 22 In-Browser Tools

1. **PDF Reader (`/reader`)**: High-performance in-browser viewer with zoom, page jump navigation, fit to width, 90° rotation, thumbnail sidebar, and local password-unlock support.
2. **Organize & Rotate Pages (`/organize`)**: Visual grid of all pages rendered as interactive thumbnails. Reorder, rotate individual sheets in 90° increments, or delete unwanted pages.
3. **Merge PDF (`/merge`)**: Combine multiple PDF files, reorder queue with move up/down controls, remove individual files, and generate a new merged PDF.
4. **Split PDF (`/split`)**: Extract custom ranges (e.g., `1-3, 5, 8-10`, supporting Arabic and English commas) or extract every single page into separate files, with one-click multi-file ZIP archiving.
5. **Side-by-Side Compare (`/compare`)**: Compare two PDF versions side by side with synchronized controls for contract revision and proofing.
6. **Annotate & Signature Studio (`/annotate`)**:
   - **Draw**: Freehand pen drawing with customizable stroke and color.
   - **Type**: Clean typed text callouts and cursive signature stamps.
   - **Signature Studio**: Draw, type, or upload a paper signature with automatic background transparency.
7. **Permanent Redaction (`/redact`)**: True blackout redaction where sensitive text/rectangles are permanently removed by rasterizing redacted pages to flat images with zero underlying text streams.
8. **Form Filler (`/form-filler`)**: Detect interactive AcroForm fields, fill text inputs, toggle checkboxes, select dropdowns, and download completed forms.
9. **Flatten PDF (`/flatten`)**: Permanently bake form fields, annotations, and comments into flat static page content to prevent tampering.
10. **Compress PDF (`/compress`)**: Client-side optimization with dual modes: text-preserving structure optimization or JPEG page rasterization, displaying accurate before-and-after sizes.
11. **PDF to Word (`/pdf-to-word`)**: Text-focused PDF to `.docx` converter running completely locally in your browser with heading detection, simple aligned-column tables, Arabic RTL directionality, and on-demand OCR for scanned pages.
12. **Add Page Numbers (`/page-numbers`)**: Automatically insert clean page numbering with customizable positions, formats (`Page X of Y`, `X/Y`, `X`), font size, color, and optional cover-page skipping.
13. **Watermark PDF (`/watermark`)**: Apply custom text watermarks (including Arabic presets) or image logos with transparency and angle controls.
14. **Header & Footer Tool (`/header-footer`)**: Insert running headers and footers with dynamic `{page}`, `{total}`, and `{date}` variables across all pages.
15. **Crop Margins (`/crop`)**: Losslessly trim excess blank outer margins from all pages to optimize reading on mobile phones and tablets.
16. **Images to PDF (`/images-to-pdf`)**: Convert PNG, JPG, and WebP images into a PDF with A4, US Letter, or Fit-to-Image dimensions and customizable margins.
17. **PDF to Images (`/convert`)**: High-resolution PDF to PNG / JPEG export with individual downloads or full ZIP archiving.
18. **Extract Embedded Images (`/extract-images`)**: Extract all raster images and photos embedded inside the PDF directly into individual files or ZIP.
19. **OCR Text Extractor (`/ocr`)**: In-browser Optical Character Recognition using on-demand Tesseract.js WebAssembly (English & Arabic) cached locally on first run, with live download/recognition progress and `.txt` export.
20. **PDF Security & Metadata (`/security`)**: Inspect Title, Author, Subject, Keywords, Creator, and Producer, with one-click metadata sanitization.
21. **Protect PDF (`/protect`)**: Encrypt PDF files locally using real AES-256 or RC4 standard security handler encryption with custom permissions.
22. **Unlock PDF (`/unlock`)**: Permanently remove password protection from a PDF you own locally when you supply its password.

---

## 🔒 100% Offline & Privacy Architecture

- **Zero Cloud Uploads**: Files are read into local browser RAM via `FileReader` and `Blob` APIs. No network requests carry your documents.
- **Zero CDN Dependencies**: All fonts (Cairo & Plus Jakarta Sans), PDF.js workers, cmaps, standard fonts, and Tesseract.js WASM cores are self-hosted within the app.
- **PWA Offline First & Lightweight Install**: Core routes and PDF tools work offline right away, while Tesseract OCR traineddata (~57 MB) downloads on demand only when OCR is used and caches via `CacheFirst`.
- **Large-File Protection**: Warns above 50 MB and blocks above 200 MB to prevent mobile browser tab crashes, with operation cancellation support.

---

## 🛠️ Technology Stack

- **React 19** + **TypeScript** + **Vite 8** + **Node 22**
- **Vite PWA Plugin** (`vite-plugin-pwa`) with Web App Manifest and Service Worker
- **Tailwind CSS v4** with native RTL support and custom `@variant dark`
- **pdf-lib**, **PDF.js (Mozilla)**, **@pdfsmaller/pdf-encrypt & pdf-decrypt**, **docx**, **Tesseract.js**, **JSZip**
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

# 5. Typecheck
npx tsc --noEmit

# 6. Build for production (automatically generates sitemap/robots & syncs assets)
npm run build
```

### Netlify Deployment
The repository includes a ready-to-deploy `netlify.toml` and `.nvmrc` with:
- Node version: `22`
- Build command: `npm run build`
- Publish directory: `dist`
- SPA redirects to `/index.html`
- Strict Content-Security-Policy (CSP) allowing WASM and local blob/worker execution
- Proper immutable asset caching and `no-cache` rules for `sw.js`
