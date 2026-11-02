# v2c PDF Editor

> **Free, High-Performance Online PDF Platform** with 38 dedicated tools, visual PDF editor, digital signing, office conversion, and 100% client-side privacy.

---

## Overview

**v2c PDF Editor** is an open-source, modern web application offering a comprehensive suite of 38 PDF utilities. Built on Next.js 14, TypeScript, Tailwind CSS, and `pdf-lib`, the platform performs PDF manipulation directly inside the user's browser, ensuring that confidential documents are never uploaded to third-party processing servers.

---

## Key Features

- **38 Dedicated Tools:** Complete coverage of PDF creation, conversion, editing, organization, and security.
- **Visual PDF Editor:** Interactive in-browser canvas editor supporting text, shapes, drawing, image placement, and page reordering.
- **Touch-Friendly Digital Signatures:** Canvas-based signature pad with mobile touch gestures (`touch-none`, zero-scroll interference) and instant document stamping.
- **Genuine Office Conversion:** Generates fully compliant Microsoft OpenXML documents (`.docx`, `.pptx`, `.xlsx`) that open natively in Microsoft Office, Google Docs, and WPS without corruption warnings.
- **100% Client-Side Privacy:** Document processing occurs locally via Web Workers and `pdf-lib`. No files are permanently stored on the server.
- **Zero Permanent Storage Backend:** Ephemeral task logging backed by Node.js native `node:sqlite` with automated 5-minute TTL record purging.
- **Mobile First UX:** Responsive layout adapting from 1 column on mobile to 4 columns on desktop, touch targets $\ge$ 44px, dynamic viewport height (`h-[100dvh]`), and edge-to-edge category scrolling.

---

## Tool Directory (38 Tools)

### 1. Convert to PDF (8 Tools)
| Tool | Route | Description |
| :--- | :--- | :--- |
| **TXT to PDF** | `/tools/txt-to-pdf` | Convert plain text or uploaded `.txt` files into formatted PDF documents. |
| **CSV to PDF** | `/tools/csv-to-pdf` | Transform tabular CSV datasets into styled landscape PDF tables. |
| **HTML to PDF** | `/tools/html-to-pdf` | Convert HTML markup and web snippets into clean printable PDFs. |
| **ZIP to PDF** | `/tools/zip-to-pdf` | Extract documents, images, and text from archives and compile into a single PDF. |
| **JPG to PDF** | `/tools/jpg-to-pdf` | Embed one or multiple JPG/PNG images into a sequenced PDF. |
| **Word to PDF** | `/tools/word-to-pdf` | Convert `.docx` documents into standard PDF pages. |
| **PowerPoint to PDF** | `/tools/powerpoint-to-pdf` | Convert presentation decks into slide-based PDF documents. |
| **Excel to PDF** | `/tools/excel-to-pdf` | Convert spreadsheets and grid tables into formatted PDF reports. |

### 2. Convert from PDF (5 Tools)
| Tool | Route | Description |
| :--- | :--- | :--- |
| **PDF to JPG** | `/tools/pdf-to-jpg` | Render PDF page viewports into crisp high-resolution JPEG images. |
| **PDF to PNG** | `/tools/pdf-to-png` | Export PDF pages as lossless 2x-scaled PNG graphics. |
| **PDF to Word** | `/tools/pdf-to-word` | Extract content and generate a compliant Microsoft Word OpenXML (`.docx`) file. |
| **PDF to PowerPoint** | `/tools/pdf-to-powerpoint` | Convert pages into editable slide decks in Microsoft PowerPoint (`.pptx`) format. |
| **PDF to Excel** | `/tools/pdf-to-excel` | Parse layout rows into a valid Microsoft Excel spreadsheet (`.xlsx`). |

### 3. Edit PDF (6 Tools)
| Tool | Route | Description |
| :--- | :--- | :--- |
| **Edit PDF** | `/tools/edit-pdf` | Full-featured visual canvas editor with text boxes, freehand drawing, shapes, and images. |
| **Annotate PDF** | `/tools/annotate-pdf` | Add review badges, callout notes, and approval stamps to specific pages. |
| **Sign PDF** | `/tools/sign-pdf` | Draw, type, or upload digital signatures and stamp them onto document pages. |
| **Watermark PDF** | `/tools/watermark-pdf` | Apply diagonal or horizontal watermarks with customizable opacity, size, and rotation. |
| **Page Numbers** | `/tools/page-numbers` | Stamp sequential page numbers (`Page X of Y`) with configurable position and alignment. |
| **Crop PDF** | `/tools/crop-pdf` | Adjust `CropBox` and `MediaBox` margins uniformly or with per-edge directional offsets. |

### 4. Organize PDF (10 Tools)
| Tool | Route | Description |
| :--- | :--- | :--- |
| **Merge PDF** | `/tools/merge-pdf` | Combine multiple PDF files into one continuous document. |
| **Split PDF** | `/tools/split-pdf` | Extract custom page ranges or individual pages into separate files. |
| **Compress PDF** | `/tools/compress-pdf` | Optimize document size using Extreme, Recommended, or Low compression levels. |
| **Rotate PDF** | `/tools/rotate-pdf` | Rotate specific or all pages by 90°, 180°, or 270°. |
| **Delete Pages** | `/tools/delete-pdf-pages` | Remove unwanted pages while preserving remaining document integrity. |
| **Extract Pages** | `/tools/extract-pages` | Isolate selected pages into a standalone PDF. |
| **Reorder PDF** | `/tools/reorder-pdf` | Re-sequence pages into any custom order. |
| **Duplicate Pages** | `/tools/duplicate-pages` | Clone designated pages within the document. |
| **Add Blank Pages** | `/tools/add-pdf-pages` | Insert new blank pages at the start, end, or specific indices. |
| **Scan to PDF** | `/tools/scan-to-pdf` | Capture and compile mobile photos or image scans into a multi-page PDF. |

### 5. PDF Security & Utilities (9 Tools)
| Tool | Route | Description |
| :--- | :--- | :--- |
| **Protect PDF** | `/tools/protect-pdf` | Add password reference metadata and access-control security stamps across pages. |
| **Unlock PDF** | `/tools/unlock-pdf` | Remove restriction flags and normalize permissions for unlocked viewing. |
| **Redact PDF** | `/tools/redact-pdf` | Permanently blackout sensitive header data, confidential center bands, and footers. |
| **Compare PDF** | `/tools/compare-pdf` | Side-by-side content analysis generating an automated comparison report. |
| **OCR PDF** | `/tools/ocr-pdf` | Extract text layer data from documents to produce searchable PDFs. |
| **Repair PDF** | `/tools/repair-pdf` | Reconstruct damaged XRef cross-reference tables and normalize page catalogs. |
| **Flatten PDF** | `/tools/flatten-pdf` | Bake interactive form fields and annotations permanently into the page stream. |
| **PDF Metadata** | `/tools/pdf-metadata` | Inspect and edit Title, Author, Subject, and Keyword document dictionaries. |
| **PDF to QR Code** | `/tools/pdf-to-qr` | Generate high-resolution Level-H QR codes linking to document references. |

---

## Tech Stack

- **Framework:** [Next.js 14](https://nextjs.org/) (App Router, SSG & Server Components)
- **Language:** [TypeScript 5](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS 3](https://tailwindcss.com/) with custom typography and scrollbar utilities
- **PDF Engine:** [`pdf-lib`](https://pdf-lib.js.org/) & [`pdfjs-dist`](https://mozilla.github.io/pdf.js/)
- **Compression & Archives:** [`jszip`](https://stuk.github.io/jszip/)
- **QR Codes:** [`qrcode`](https://github.com/soldair/node-qrcode)
- **Icons:** [`lucide-react`](https://lucide.dev/)
- **Database:** Node.js native `node:sqlite` (`DatabaseSync`)

---

## Getting Started

### Prerequisites

- **Node.js:** v18.17.0 or later (v20+ / v24 recommended)
- **npm:** v9+ or later

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd swift-kalam

# Install dependencies
npm install
```

### Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

```bash
# Compile and optimize production bundle
npm run build

# Start production server
npm run start -p 3000
```

### Linting & Type Checking

```bash
# Run ESLint
npm run lint

# TypeScript verification
npx tsc --noEmit
```

---

## Automated Verification Suite

The repository includes end-to-end regression test scripts verifying all 38 tools with synthetic inputs:

```bash
# Run the complete 38-tool verification suite
node test-all-38-tools.js

# Run live audit exercising tools, SQLite logging API, and network endpoints
node audit-tools-and-ui.js
```

---

## Project Structure

```
swift-kalam/
├── attachments/             # Reference assets and test attachments
├── database/                # SQLite storage and schema definitions
│   ├── schema.sql           # Database schema
│   └── v2c_pdf.sqlite       # Local SQLite database (auto-purged)
├── public/                  # Static assets
│   ├── apple-touch-icon.png # iOS touch icon (180x180)
│   ├── favicon.ico          # Multi-resolution favicon (16x16, 32x32, 48x48, 64x64)
│   ├── pdf.worker.min.js    # Client-side PDF.js worker
│   └── v2c-pdf-editor-logo.png # Brand logo
├── src/
│   ├── app/                 # Next.js App Router routes & layouts
│   │   ├── api/tasks/log/   # SQLite task logging endpoint (GET, POST, DELETE)
│   │   ├── tools/[slug]/    # Dynamic tool runner route
│   │   ├── globals.css      # Tailwind & custom CSS rules
│   │   ├── layout.tsx       # Root layout & metadata configuration
│   │   └── page.tsx         # Homepage with Hero, ToolsGrid, and TaskBanner
│   ├── components/
│   │   ├── common/          # Reusable UI components (DynamicIcon, etc.)
│   │   ├── home/            # Homepage sections (HeroBanner, ToolsGrid, RecentTasks)
│   │   ├── layout/          # Navbar & Footer
│   │   └── tools/           # Dropzone, UniversalToolRunner, PdfEditor, SignPad
│   ├── lib/
│   │   ├── format-utils.ts  # File size and string formatters
│   │   ├── office-converter.ts # Word (.docx), PPT (.pptx), Excel (.xlsx) generator
│   │   ├── pdf-engine.ts    # Core PDF transformation functions
│   │   ├── sqlite.ts        # SQLite database connection & TTL purge logic
│   │   └── tools-data.ts    # Metadata directory for all 38 tools
│   └── types/               # TypeScript interfaces & types
├── audit-tools-and-ui.js    # Live API & tool simulation test suite
├── test-all-38-tools.js     # Comprehensive 38-tool regression suite
├── next.config.mjs          # Next.js configuration
├── package.json             # Project dependencies and npm scripts
├── tailwind.config.ts       # Tailwind CSS design system configuration
└── tsconfig.json            # TypeScript configuration
```

---

## Privacy & Security

- **Zero Cloud Leakage:** All file conversions, modifications, page removals, and signings execute directly in the browser memory using WebAssembly / JavaScript.
- **Strict Headers:** Includes `X-Frame-Options: SAMEORIGIN`, `X-Content-Type-Options: nosniff`, and restrictive `Permissions-Policy`.
- **Ephemeral Task Logging:** The optional task log stores only file names and byte sizes for session tracking and purges records older than 5 minutes automatically.

---

## License

This project is licensed under the MIT License.
