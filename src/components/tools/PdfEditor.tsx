'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import {
  Home,
  Type,
  Bold,
  Italic,
  Underline,
  Square,
  Circle,
  Highlighter,
  ImagePlus,
  Pencil,
  MousePointer,
  Undo2,
  Redo2,
  Trash2,
  ZoomIn,
  ZoomOut,
  Download,
  Plus,
  Scissors,
  FilePlus,
  Files,
  FileDown,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  Check,
  AlertCircle,
  Table as TableIcon,
  Grid,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  ListOrdered,
  FileSignature,
  Copy,
  RotateCw,
  Menu,
  X,
  Settings2,
  ArrowRight,
  Minus,
  Rows,
  Columns,
  Palette,
  Layers,
  Eraser,
  Sparkles,
  ChevronDown,
  RotateCcw,
  Image as ImageIcon,
  MoreHorizontal,
  ArrowUp,
  ArrowDown,
  MessageSquarePlus,
  MessageSquare,
  Slash,
  Upload,
} from 'lucide-react';
import {
  EditorElement,
  TableData,
  compileVisualEditedPDF,
  downloadFile,
  formatBytes,
} from '@/lib/pdf-engine';

interface PdfEditorProps {
  pdfFile: File;
  onBack: () => void;
  onFinish?: (fileBytes: Uint8Array, fileName: string) => void;
}

interface PageMeta {
  id: string;
  originalIndex: number;
  isBlank?: boolean;
  rotation?: number;
}

interface ExistingTextItem {
  id: string;
  str: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize: number;
}

// 50+ Curated Fonts for All Purposes (Sans-Serif, Serif, Cursive/Script, Display, Monospace)
export interface FontOption {
  id: string;
  name: string;
  category: 'Sans-Serif' | 'Serif' | 'Cursive & Script' | 'Display' | 'Monospace';
  family: string;
}

export const FONT_LIBRARY: FontOption[] = [
  // --- SANS-SERIF (15) ---
  { id: 'Arial', name: 'Arial', category: 'Sans-Serif', family: 'Arial, sans-serif' },
  { id: 'Helvetica', name: 'Helvetica', category: 'Sans-Serif', family: 'Helvetica, Arial, sans-serif' },
  { id: 'Inter', name: 'Inter', category: 'Sans-Serif', family: '"Inter", sans-serif' },
  { id: 'Roboto', name: 'Roboto', category: 'Sans-Serif', family: '"Roboto", sans-serif' },
  { id: 'OpenSans', name: 'Open Sans', category: 'Sans-Serif', family: '"Open Sans", sans-serif' },
  { id: 'Lato', name: 'Lato', category: 'Sans-Serif', family: '"Lato", sans-serif' },
  { id: 'Montserrat', name: 'Montserrat', category: 'Sans-Serif', family: '"Montserrat", sans-serif' },
  { id: 'Poppins', name: 'Poppins', category: 'Sans-Serif', family: '"Poppins", sans-serif' },
  { id: 'Raleway', name: 'Raleway', category: 'Sans-Serif', family: '"Raleway", sans-serif' },
  { id: 'Nunito', name: 'Nunito', category: 'Sans-Serif', family: '"Nunito", sans-serif' },
  { id: 'Ubuntu', name: 'Ubuntu', category: 'Sans-Serif', family: '"Ubuntu", sans-serif' },
  { id: 'SegoeUI', name: 'Segoe UI', category: 'Sans-Serif', family: '"Segoe UI", Tahoma, sans-serif' },
  { id: 'Verdana', name: 'Verdana', category: 'Sans-Serif', family: 'Verdana, sans-serif' },
  { id: 'Tahoma', name: 'Tahoma', category: 'Sans-Serif', family: 'Tahoma, sans-serif' },
  { id: 'TrebuchetMS', name: 'Trebuchet MS', category: 'Sans-Serif', family: '"Trebuchet MS", sans-serif' },

  // --- SERIF (14) ---
  { id: 'TimesRoman', name: 'Times New Roman', category: 'Serif', family: '"Times New Roman", Times, serif' },
  { id: 'Georgia', name: 'Georgia', category: 'Serif', family: 'Georgia, serif' },
  { id: 'Garamond', name: 'Garamond', category: 'Serif', family: 'Garamond, Baskerville, serif' },
  { id: 'PlayfairDisplay', name: 'Playfair Display', category: 'Serif', family: '"Playfair Display", serif' },
  { id: 'Merriweather', name: 'Merriweather', category: 'Serif', family: '"Merriweather", serif' },
  { id: 'Lora', name: 'Lora', category: 'Serif', family: '"Lora", serif' },
  { id: 'PTSerif', name: 'PT Serif', category: 'Serif', family: '"PT Serif", serif' },
  { id: 'Palatino', name: 'Palatino Linotype', category: 'Serif', family: '"Palatino Linotype", Palatino, serif' },
  { id: 'Baskerville', name: 'Baskerville', category: 'Serif', family: 'Baskerville, serif' },
  { id: 'Bodoni', name: 'Bodoni MT', category: 'Serif', family: '"Bodoni MT", Didot, serif' },
  { id: 'Cambria', name: 'Cambria', category: 'Serif', family: 'Cambria, Georgia, serif' },
  { id: 'Didot', name: 'Didot', category: 'Serif', family: 'Didot, serif' },
  { id: 'Cinzel', name: 'Cinzel', category: 'Serif', family: '"Cinzel", serif' },
  { id: 'Bookman', name: 'Bookman Old Style', category: 'Serif', family: '"Bookman Old Style", Bookman, serif' },

  // --- CURSIVE & SCRIPT (11) ---
  { id: 'DancingScript', name: 'Dancing Script', category: 'Cursive & Script', family: '"Dancing Script", cursive' },
  { id: 'Pacifico', name: 'Pacifico', category: 'Cursive & Script', family: '"Pacifico", cursive' },
  { id: 'Caveat', name: 'Caveat', category: 'Cursive & Script', family: '"Caveat", cursive' },
  { id: 'GreatVibes', name: 'Great Vibes', category: 'Cursive & Script', family: '"Great Vibes", cursive' },
  { id: 'AlexBrush', name: 'Alex Brush', category: 'Cursive & Script', family: '"Alex Brush", cursive' },
  { id: 'Satisfy', name: 'Satisfy', category: 'Cursive & Script', family: '"Satisfy", cursive' },
  { id: 'Sacramento', name: 'Sacramento', category: 'Cursive & Script', family: '"Sacramento", cursive' },
  { id: 'Allura', name: 'Allura', category: 'Cursive & Script', family: '"Allura", cursive' },
  { id: 'Parisienne', name: 'Parisienne', category: 'Cursive & Script', family: '"Parisienne", cursive' },
  { id: 'MarckScript', name: 'Marck Script', category: 'Cursive & Script', family: '"Marck Script", cursive' },
  { id: 'Cookie', name: 'Cookie', category: 'Cursive & Script', family: '"Cookie", cursive' },

  // --- DISPLAY & HEADINGS (6) ---
  { id: 'Impact', name: 'Impact', category: 'Display', family: 'Impact, Charcoal, sans-serif' },
  { id: 'Oswald', name: 'Oswald', category: 'Display', family: '"Oswald", sans-serif' },
  { id: 'BebasNeue', name: 'Bebas Neue', category: 'Display', family: '"Bebas Neue", sans-serif' },
  { id: 'Anton', name: 'Anton', category: 'Display', family: '"Anton", sans-serif' },
  { id: 'Futura', name: 'Futura', category: 'Display', family: 'Futura, "Trebuchet MS", sans-serif' },
  { id: 'CenturyGothic', name: 'Century Gothic', category: 'Display', family: '"Century Gothic", sans-serif' },

  // --- MONOSPACE & CODE (6) ---
  { id: 'Courier', name: 'Courier New', category: 'Monospace', family: '"Courier New", Courier, monospace' },
  { id: 'Consolas', name: 'Consolas', category: 'Monospace', family: 'Consolas, monospace' },
  { id: 'Monaco', name: 'Monaco', category: 'Monospace', family: 'Monaco, monospace' },
  { id: 'Inconsolata', name: 'Inconsolata', category: 'Monospace', family: '"Inconsolata", monospace' },
  { id: 'FiraCode', name: 'Fira Code', category: 'Monospace', family: '"Fira Code", monospace' },
  { id: 'SpaceMono', name: 'Space Mono', category: 'Monospace', family: '"Space Mono", monospace' },
];

export const getFontCss = (fontId?: string): string => {
  const found = FONT_LIBRARY.find((f) => f.id === fontId);
  return found ? found.family : '"Times New Roman", Times, serif';
};

const GOOGLE_FONTS_HREF =
  'https://fonts.googleapis.com/css2?' +
  'family=Alex+Brush&' +
  'family=Allura&' +
  'family=Anton&' +
  'family=Bebas+Neue&' +
  'family=Caveat:wght@400;700&' +
  'family=Cinzel:wght@400;700&' +
  'family=Cookie&' +
  'family=Dancing+Script:wght@400;700&' +
  'family=Fira+Code:wght@400;700&' +
  'family=Great+Vibes&' +
  'family=Inconsolata:wght@400;700&' +
  'family=Inter:wght@400;700&' +
  'family=Lato:wght@400;700&' +
  'family=Lora:ital,wght@0,400;0,700;1,400&' +
  'family=Marck+Script&' +
  'family=Merriweather:ital,wght@0,400;0,700;1,400&' +
  'family=Montserrat:wght@400;700&' +
  'family=Nunito:wght@400;700&' +
  'family=Open+Sans:ital,wght@0,400;0,700;1,400&' +
  'family=Oswald:wght@400;700&' +
  'family=Pacifico&' +
  'family=Parisienne&' +
  'family=Playfair+Display:ital,wght@0,400;0,700;1,400&' +
  'family=Poppins:wght@400;700&' +
  'family=PT+Serif:ital,wght@0,400;0,700;1,400&' +
  'family=Raleway:wght@400;700&' +
  'family=Roboto:ital,wght@0,400;0,700;1,400&' +
  'family=Sacramento&' +
  'family=Satisfy&' +
  'family=Space+Mono:wght@400;700&' +
  'family=Ubuntu:wght@400;700&' +
  'display=swap';

// Real Fluorescent Highlighter Markers
const HIGHLIGHT_COLORS = [
  { name: 'Fluorescent Yellow', value: '#ffff00' },
  { name: 'Pastel Yellow', value: '#fef08a' },
  { name: 'Neon Green', value: '#bbf7d0' },
  { name: 'Sky Cyan', value: '#bae6fd' },
  { name: 'Coral Pink', value: '#fbcfe8' },
  { name: 'Neon Orange', value: '#fed7aa' },
  { name: 'Soft Lilac', value: '#e9d5ff' },
];

const TEXT_COLORS = [
  { name: 'Navy', value: '#0B1B3D' },
  { name: 'Black', value: '#000000' },
  { name: 'Slate', value: '#475569' },
  { name: 'Blue', value: '#2563eb' },
  { name: 'Emerald', value: '#059669' },
  { name: 'Crimson', value: '#dc2626' },
  { name: 'Amber', value: '#d97706' },
  { name: 'Purple', value: '#7c3aed' },
];

// Microsoft Word-Style Office Color Palette (IMG_20261102_110355.jpg)
const WORD_COLOR_PALETTE = {
  // Top 10 Standard Colors Row
  standard: [
    { name: 'White', value: '#FFFFFF' },
    { name: 'Black', value: '#000000' },
    { name: 'Dark Gray', value: '#4B5563' },
    { name: 'Navy Blue', value: '#1E3A8A' },
    { name: 'Ocean Blue', value: '#0284C7' },
    { name: 'Orange', value: '#EA580C' },
    { name: 'Green', value: '#16A34A' },
    { name: 'Cyan', value: '#06B6D4' },
    { name: 'Purple', value: '#9333EA' },
    { name: 'Lime', value: '#84CC16' },
  ],
  // 5 rows x 10 columns shades & tints matrix
  matrixRows: [
    ['#F8FAFC', '#F3F4F6', '#F1F5F9', '#EFF6FF', '#F0F9FF', '#FFF7ED', '#F0FDF4', '#ECFEFF', '#FAF5FF', '#F7FEE7'],
    ['#E2E8F0', '#E5E7EB', '#CBD5E1', '#DBEAFE', '#E0F2FE', '#FFEDD5', '#DCFCE7', '#CFFAFE', '#F3E8FF', '#ECFCCB'],
    ['#CBD5E1', '#D1D5DB', '#94A3B8', '#93C5FD', '#7DD3FC', '#FDBA74', '#86EFAC', '#67E8F9', '#D8B4FE', '#BEF264'],
    ['#94A3B8', '#9CA3AF', '#64748B', '#3B82F6', '#38BDF8', '#FB923C', '#4ADE80', '#22D3EE', '#C084FC', '#A3E635'],
    ['#475569', '#374151', '#334155', '#1D4ED8', '#0369A1', '#C2410C', '#15803D', '#0E7490', '#7E22CE', '#4D7C0F'],
  ],
};

// Microsoft Word-Style Numbering & Roman Letter Library (IMG_20261102_110437.jpg)
const NUMBERING_LIBRARY = [
  { id: 'none', label: 'None', preview: ['None', '—', '—'] },
  { id: '1.', label: '1. 2. 3.', preview: ['1. Item', '2. Item', '3. Item'] },
  { id: '1)', label: '1) 2) 3)', preview: ['1) Item', '2) Item', '3) Item'] },
  { id: '(1)', label: '(1) (2) (3)', preview: ['(1) Item', '(2) Item', '(3) Item'] },
  { id: 'A.', label: 'A. B. C.', preview: ['A. Item', 'B. Item', 'C. Item'] },
  { id: 'A)', label: 'A) B) C)', preview: ['A) Item', 'B) Item', 'C) Item'] },
  { id: '(A)', label: '(A) (B) (C)', preview: ['(A) Item', '(B) Item', '(C) Item'] },
  { id: 'a.', label: 'a. b. c.', preview: ['a. Item', 'b. Item', 'c. Item'] },
  { id: 'a)', label: 'a) b) c)', preview: ['a) Item', 'b) Item', 'c) Item'] },
  { id: '(a)', label: '(a) (b) (c)', preview: ['(a) Item', '(b) Item', '(c) Item'] },
  { id: 'I.', label: 'I. II. III.', preview: ['I. Item', 'II. Item', 'III. Item'] },
  { id: 'I)', label: 'I) II) III)', preview: ['I) Item', 'II) Item', 'III) Item'] },
  { id: '(I)', label: '(I) (II) (III)', preview: ['(I) Item', '(II) Item', '(III) Item'] },
  { id: 'i.', label: 'i. ii. iii.', preview: ['i. Item', 'ii. Item', 'iii. Item'] },
  { id: 'i)', label: 'i) ii) iii)', preview: ['i) Item', 'ii) Item', 'iii) Item'] },
  { id: '(i)', label: '(i) (ii) (iii)', preview: ['(i) Item', '(ii) Item', '(iii) Item'] },
  { id: 'bullet', label: 'Bullets •', preview: ['• Item', '• Item', '• Item'] },
  { id: 'diamond', label: 'Diamonds ◆', preview: ['◆ Item', '◆ Item', '◆ Item'] },
  { id: 'check', label: 'Checkmarks ✓', preview: ['✓ Item', '✓ Item', '✓ Item'] },
  { id: 'arrow', label: 'Arrows ➢', preview: ['➢ Item', '➢ Item', '➢ Item'] },
];

function toRomanNumeral(num: number, upper = true): string {
  const romanMap: [number, string][] = [
    [1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'],
    [100, 'C'], [90, 'XC'], [50, 'L'], [40, 'XL'],
    [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I'],
  ];
  let result = '';
  let n = Math.max(1, Math.min(3999, num));
  for (const [val, sym] of romanMap) {
    while (n >= val) {
      result += sym;
      n -= val;
    }
  }
  return upper ? result : result.toLowerCase();
}

function toAlphabetical(num: number, upper = true): string {
  let result = '';
  let n = num;
  while (n > 0) {
    const mod = (n - 1) % 26;
    result = String.fromCharCode((upper ? 65 : 97) + mod) + result;
    n = Math.floor((n - 1) / 26);
  }
  return result;
}

export interface WordShapeDef {
  id: string;
  category: 'Lines' | 'Rectangles' | 'Basic Shapes' | 'Block Arrows' | 'Equation Shapes' | 'Stars & Banners' | 'Callouts';
  name: string;
  path: string;
  isClosed: boolean;
}

export const WORD_SHAPES_LIBRARY: WordShapeDef[] = [
  // 1. Lines
  { id: 'line', category: 'Lines', name: 'Straight Line', path: 'M 5 50 L 95 50', isClosed: false },
  { id: 'arrow', category: 'Lines', name: 'Arrow Line', path: 'M 5 50 L 85 50 M 75 40 L 85 50 L 75 60', isClosed: false },
  { id: 'double-arrow', category: 'Lines', name: 'Double Arrow', path: 'M 15 40 L 5 50 L 15 60 M 5 50 L 95 50 M 85 40 L 95 50 L 85 60', isClosed: false },
  { id: 'elbow-arrow', category: 'Lines', name: 'Elbow Arrow', path: 'M 10 20 L 50 20 L 50 85 M 40 75 L 50 85 L 60 75', isClosed: false },
  { id: 'curved-arrow', category: 'Lines', name: 'Curved Arrow', path: 'M 10 80 Q 50 10 88 50 M 76 42 L 88 50 L 84 64', isClosed: false },

  // 2. Rectangles
  { id: 'rect', category: 'Rectangles', name: 'Rectangle', path: 'M 5 5 H 95 V 95 H 5 Z', isClosed: true },
  { id: 'rounded-rect', category: 'Rectangles', name: 'Rounded Rectangle', path: 'M 20 5 H 80 Q 95 5 95 20 V 80 Q 95 95 80 95 H 20 Q 5 95 5 80 V 20 Q 5 5 20 5 Z', isClosed: true },
  { id: 'snipped-rect', category: 'Rectangles', name: 'Single Snipped Corner', path: 'M 25 5 H 95 V 95 H 5 V 25 Z', isClosed: true },
  { id: 'round-single-rect', category: 'Rectangles', name: 'Round Single Corner', path: 'M 5 30 Q 5 5 30 5 H 95 V 95 H 5 Z', isClosed: true },

  // 3. Basic Shapes
  { id: 'circle', category: 'Basic Shapes', name: 'Oval / Circle', path: 'M 50 5 A 45 45 0 1 0 50 95 A 45 45 0 1 0 50 5 Z', isClosed: true },
  { id: 'triangle', category: 'Basic Shapes', name: 'Isosceles Triangle', path: 'M 50 5 L 95 95 H 5 Z', isClosed: true },
  { id: 'right-triangle', category: 'Basic Shapes', name: 'Right Triangle', path: 'M 5 5 L 95 95 H 5 Z', isClosed: true },
  { id: 'diamond', category: 'Basic Shapes', name: 'Diamond', path: 'M 50 5 L 95 50 L 50 95 L 5 50 Z', isClosed: true },
  { id: 'parallelogram', category: 'Basic Shapes', name: 'Parallelogram', path: 'M 25 10 H 95 L 75 90 H 5 Z', isClosed: true },
  { id: 'trapezoid', category: 'Basic Shapes', name: 'Trapezoid', path: 'M 20 10 H 80 L 95 90 H 5 Z', isClosed: true },
  { id: 'pentagon', category: 'Basic Shapes', name: 'Pentagon', path: 'M 50 5 L 95 38 L 78 95 H 22 L 5 38 Z', isClosed: true },
  { id: 'hexagon', category: 'Basic Shapes', name: 'Hexagon', path: 'M 25 5 H 75 L 95 50 L 75 95 H 25 L 5 50 Z', isClosed: true },
  { id: 'octagon', category: 'Basic Shapes', name: 'Octagon', path: 'M 30 5 H 70 L 95 30 V 70 L 70 95 H 30 L 5 70 V 30 Z', isClosed: true },
  { id: 'cross', category: 'Basic Shapes', name: 'Cross', path: 'M 35 5 H 65 V 35 H 95 V 65 H 65 V 95 H 35 V 65 H 5 V 35 H 35 Z', isClosed: true },
  { id: 'cylinder', category: 'Basic Shapes', name: 'Can / Cylinder', path: 'M 15 25 A 35 15 0 1 0 85 25 V 75 A 35 15 0 0 1 15 75 Z', isClosed: true },
  { id: 'cube', category: 'Basic Shapes', name: 'Cube', path: 'M 10 30 L 50 10 L 90 30 L 50 50 Z M 10 30 V 75 L 50 95 V 50 Z M 90 30 V 75 L 50 95', isClosed: false },
  { id: 'heart', category: 'Basic Shapes', name: 'Heart', path: 'M 50 88 C 20 70 5 50 5 30 C 5 15 15 5 30 5 C 40 5 47 12 50 20 C 53 12 60 5 70 5 C 85 5 95 15 95 30 C 95 50 80 70 50 88 Z', isClosed: true },
  { id: 'lightning', category: 'Basic Shapes', name: 'Lightning Bolt', path: 'M 55 5 L 15 55 H 45 L 35 95 L 85 45 H 55 Z', isClosed: true },
  { id: 'sun', category: 'Basic Shapes', name: 'Sun', path: 'M 50 25 A 25 25 0 1 0 50 75 A 25 25 0 1 0 50 25 Z M 50 5 V 18 M 50 82 V 95 M 5 50 H 18 M 82 50 H 95', isClosed: false },
  { id: 'moon', category: 'Basic Shapes', name: 'Moon', path: 'M 40 10 A 40 40 0 0 0 75 90 A 45 45 0 1 1 40 10 Z', isClosed: true },
  { id: 'cloud', category: 'Basic Shapes', name: 'Cloud', path: 'M 25 65 A 15 15 0 0 1 20 40 A 20 20 0 0 1 45 25 A 25 25 0 0 1 75 35 A 15 15 0 0 1 85 65 Z', isClosed: true },
  { id: 'smiley', category: 'Basic Shapes', name: 'Smiley Face', path: 'M 50 5 A 45 45 0 1 0 50 95 A 45 45 0 1 0 50 5 Z M 35 35 A 4 4 0 1 0 35 43 M 65 35 A 4 4 0 1 0 65 43 M 30 65 Q 50 85 70 65', isClosed: false },

  // 4. Block Arrows
  { id: 'arrow-right', category: 'Block Arrows', name: 'Right Arrow', path: 'M 5 35 H 60 V 15 L 95 50 L 60 85 V 65 H 5 Z', isClosed: true },
  { id: 'arrow-left', category: 'Block Arrows', name: 'Left Arrow', path: 'M 95 35 H 40 V 15 L 5 50 L 40 85 V 65 H 95 Z', isClosed: true },
  { id: 'arrow-up', category: 'Block Arrows', name: 'Up Arrow', path: 'M 35 95 V 40 H 15 L 50 5 L 85 40 H 65 V 95 Z', isClosed: true },
  { id: 'arrow-down', category: 'Block Arrows', name: 'Down Arrow', path: 'M 35 5 V 60 H 15 L 50 95 L 85 60 H 65 V 5 Z', isClosed: true },
  { id: 'arrow-left-right', category: 'Block Arrows', name: 'Left-Right Arrow', path: 'M 35 35 H 65 V 15 L 95 50 L 65 85 V 65 H 35 V 85 L 5 50 L 35 15 Z', isClosed: true },
  { id: 'arrow-4way', category: 'Block Arrows', name: '4-Way Arrow', path: 'M 40 40 V 25 H 25 L 50 5 L 75 25 H 60 V 40 H 75 V 25 L 95 50 L 75 75 V 60 H 60 V 75 H 75 L 50 95 L 25 75 H 40 V 60 H 25 V 75 L 5 50 L 25 25 H 40 Z', isClosed: true },

  // 5. Equation Shapes
  { id: 'plus', category: 'Equation Shapes', name: 'Plus (+)', path: 'M 40 10 H 60 V 40 H 90 V 60 H 60 V 90 H 40 V 60 H 10 V 40 H 40 Z', isClosed: true },
  { id: 'minus-math', category: 'Equation Shapes', name: 'Minus (−)', path: 'M 10 40 H 90 V 60 H 10 Z', isClosed: true },
  { id: 'multiply', category: 'Equation Shapes', name: 'Multiply (×)', path: 'M 25 10 L 50 35 L 75 10 L 90 25 L 65 50 L 90 75 L 75 90 L 50 65 L 25 90 L 10 75 L 35 50 L 10 25 Z', isClosed: true },
  { id: 'divide', category: 'Equation Shapes', name: 'Divide (÷)', path: 'M 10 45 H 90 V 55 H 10 Z M 50 20 A 7 7 0 1 0 50 34 M 50 66 A 7 7 0 1 0 50 80', isClosed: false },
  { id: 'equal', category: 'Equation Shapes', name: 'Equal (=)', path: 'M 10 30 H 90 V 45 H 10 Z M 10 55 H 90 V 70 H 10 Z', isClosed: true },

  // 6. Stars & Banners
  { id: 'star-4', category: 'Stars & Banners', name: '4-Point Star', path: 'M 50 5 L 60 40 L 95 50 L 60 60 L 50 95 L 40 60 L 5 50 L 40 40 Z', isClosed: true },
  { id: 'star-5', category: 'Stars & Banners', name: '5-Point Star', path: 'M 50 5 L 61 38 L 95 38 L 68 58 L 78 91 L 50 71 L 22 91 L 32 58 L 5 38 L 39 38 Z', isClosed: true },
  { id: 'star-6', category: 'Stars & Banners', name: '6-Point Star', path: 'M 50 5 L 62 28 L 90 28 L 75 50 L 90 72 L 62 72 L 50 95 L 38 72 L 10 72 L 25 50 L 10 28 L 38 28 Z', isClosed: true },
  { id: 'ribbon', category: 'Stars & Banners', name: 'Ribbon / Banner', path: 'M 15 25 H 85 L 75 50 L 85 75 H 15 L 25 50 Z', isClosed: true },

  // 7. Callouts
  { id: 'callout-rect', category: 'Callouts', name: 'Rectangular Callout', path: 'M 10 10 H 90 V 65 H 45 L 25 85 L 30 65 H 10 Z', isClosed: true },
  { id: 'callout-round', category: 'Callouts', name: 'Rounded Callout', path: 'M 20 10 H 80 Q 90 10 90 20 V 55 Q 90 65 80 65 H 45 L 25 85 L 30 65 H 20 Q 10 65 10 55 V 20 Q 10 10 20 10 Z', isClosed: true },
  { id: 'callout-cloud', category: 'Callouts', name: 'Cloud Callout', path: 'M 25 60 C 15 60 10 50 15 40 C 12 30 25 20 35 25 C 45 15 65 15 75 25 C 85 25 90 35 85 45 C 95 50 90 60 80 60 H 45 L 25 85 L 35 60 Z', isClosed: true },
];

function getFirstListMarker(styleId: string): string {
  switch (styleId) {
    case '1.': return '1. ';
    case '1)': return '1) ';
    case '(1)': return '(1) ';
    case 'A.': return 'A. ';
    case 'A)': return 'A) ';
    case '(A)': return '(A) ';
    case 'a.': return 'a. ';
    case 'a)': return 'a) ';
    case '(a)': return '(a) ';
    case 'I.': return 'I. ';
    case 'I)': return 'I) ';
    case '(I)': return '(I) ';
    case 'i.': return 'i. ';
    case 'i)': return 'i) ';
    case '(i)': return '(i) ';
    case 'bullet': return '• ';
    case 'diamond': return '◆ ';
    case 'check': return '✓ ';
    case 'arrow': return '➢ ';
    default: return '1. ';
  }
}

function applyListFormat(text: string, styleId: string): string {
  const lines = text.split('\n');
  if (styleId === 'none') {
    return lines
      .map((line) => line.replace(/^(\s*)(\d+[\.\)]|\([0-9a-zA-ZivxlcdmIVXLCDM]+\)|[a-zA-Z][\.\)]|[ivxlcdmIVXLCDM]+[\.\)]|[•◆✓➢\-\*])\s+/, '$1'))
      .join('\n');
  }

  return lines
    .map((line, idx) => {
      const cleanLine = line.replace(/^(\s*)(\d+[\.\)]|\([0-9a-zA-ZivxlcdmIVXLCDM]+\)|[a-zA-Z][\.\)]|[ivxlcdmIVXLCDM]+[\.\)]|[•◆✓➢\-\*])\s+/, '');
      const num = idx + 1;
      let prefix = '';

      switch (styleId) {
        case '1.': prefix = `${num}. `; break;
        case '1)': prefix = `${num}) `; break;
        case '(1)': prefix = `(${num}) `; break;
        case 'A.': prefix = `${toAlphabetical(num, true)}. `; break;
        case 'A)': prefix = `${toAlphabetical(num, true)}) `; break;
        case '(A)': prefix = `(${toAlphabetical(num, true)}) `; break;
        case 'a.': prefix = `${toAlphabetical(num, false)}. `; break;
        case 'a)': prefix = `${toAlphabetical(num, false)}) `; break;
        case '(a)': prefix = `(${toAlphabetical(num, false)}) `; break;
        case 'I.': prefix = `${toRomanNumeral(num, true)}. `; break;
        case 'I)': prefix = `${toRomanNumeral(num, true)}) `; break;
        case '(I)': prefix = `(${toRomanNumeral(num, true)}) `; break;
        case 'i.': prefix = `${toRomanNumeral(num, false)}. `; break;
        case 'i)': prefix = `${toRomanNumeral(num, false)}) `; break;
        case '(i)': prefix = `(${toRomanNumeral(num, false)}) `; break;
        case 'bullet': prefix = `• `; break;
        case 'diamond': prefix = `◆ `; break;
        case 'check': prefix = `✓ `; break;
        case 'arrow': prefix = `➢ `; break;
        default: prefix = `${num}. `; break;
      }
      return cleanLine ? prefix + cleanLine : prefix;
    })
    .join('\n');
}

export function PdfEditor({ pdfFile, onBack, onFinish }: PdfEditorProps) {
  // Active PDF file (supports merging additional PDFs into active document)
  const [activePdfFile, setActivePdfFile] = useState<File>(pdfFile);
  useEffect(() => {
    setActivePdfFile(pdfFile);
  }, [pdfFile]);

  // Page Tools state (Merge, Split, Delete, Extract, Add)
  const [pageToolsOpen, setPageToolsOpen] = useState(false);
  const [splitModalOpen, setSplitModalOpen] = useState(false);
  const [splitRange, setSplitRange] = useState('');
  const [extractModalOpen, setExtractModalOpen] = useState(false);
  const mergeInputRef = useRef<HTMLInputElement>(null);

  // Page state
  const [pages, setPages] = useState<PageMeta[]>([]);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [pageDimensions, setPageDimensions] = useState({ width: 595, height: 842 });
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [pageThumbnails, setPageThumbnails] = useState<Record<number, string>>({});
  const [pageTextItems, setPageTextItems] = useState<Record<number, ExistingTextItem[]>>({});

  // Active Tool
  const [activeTool, setActiveTool] = useState<
    'select' | 'text' | 'draw' | 'rect' | 'circle' | 'highlight' | 'table' | 'line' | 'arrow' | 'eraser' | 'shape'
  >('select');

  // Elements & History
  const [elements, setElements] = useState<EditorElement[]>([]);
  const [history, setHistory] = useState<EditorElement[][]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);

  // Formatting state (matching Word/Docs toolbar in IMG_20261102_084737.jpg)
  const [fontFamily, setFontFamily] = useState<string>('TimesRoman');
  const [fontSize, setFontSize] = useState<number>(14);
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [textAlign, setTextAlign] = useState<'left' | 'center' | 'right'>('left');
  const [headingStyle, setHeadingStyle] = useState<'normal' | 'h1' | 'h2' | 'h3' | 'subtitle'>('normal');
  const [textColor, setTextColor] = useState('#0B1B3D');
  const [highlightColor, setHighlightColor] = useState('#ffff00');
  const [highlightTipHeight, setHighlightTipHeight] = useState<number>(24);
  const [strokeWidth, setStrokeWidth] = useState<number>(2);

  // Dropdown & Modal toggles (MS Word Light Theme)
  const [fontColorOpen, setFontColorOpen] = useState(false);
  const [highlighterOpen, setHighlighterOpen] = useState(false);
  const [shapesOpen, setShapesOpen] = useState(false);
  const [tableModalOpen, setTableModalOpen] = useState(false);
  const [numberingOpen, setNumberingOpen] = useState(false);
  const [selectedNumberingStyle, setSelectedNumberingStyle] = useState<string | null>(null);
  const [signatureModalOpen, setSignatureModalOpen] = useState(false);
  const [signatureTab, setSignatureTab] = useState<'draw' | 'type' | 'upload'>('draw');
  const [typedSignature, setTypedSignature] = useState('John Doe');
  const [signatureFont, setSignatureFont] = useState('DancingScript');
  const [signatureColor, setSignatureColor] = useState('#0B1B3D');
  const [signatureCanvasDrawing, setSignatureCanvasDrawing] = useState(false);
  const sigCanvasRef = useRef<HTMLCanvasElement>(null);

  const [pencilOpen, setPencilOpen] = useState(false);
  const [pencilColor, setPencilColor] = useState('#0B1B3D');
  const [pencilWidth, setPencilWidth] = useState(2);

  const [eraserOpen, setEraserOpen] = useState(false);
  const [eraserBrushSize, setEraserBrushSize] = useState(24);

  const [selectedShapeKind, setSelectedShapeKind] = useState('rect');
  const [shapeCategoryTab, setShapeCategoryTab] = useState('All');

  const [tableGridHover, setTableGridHover] = useState<{ rows: number; cols: number }>({ rows: 3, cols: 3 });

  const [commentModalOpen, setCommentModalOpen] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [commentAuthor, setCommentAuthor] = useState('Reviewer');
  const [commentColor, setCommentColor] = useState('#FEF08A');

  const [elementOptionsOpen, setElementOptionsOpen] = useState(false);
  const [shapeFillColor, setShapeFillColor] = useState('transparent');
  const [shapeStrokeColor, setShapeStrokeColor] = useState('#0B1B3D');
  const [shapeStrokeWidth, setShapeStrokeWidth] = useState(2);

  // Table Configuration Modal State
  const [newTableRows, setNewTableRows] = useState(3);
  const [newTableCols, setNewTableCols] = useState(3);
  const [newTableHeaderBg, setNewTableHeaderBg] = useState('#0B1B3D');
  const [newTableBorderColor, setNewTableBorderColor] = useState('#cbd5e1');

  // Viewport zoom
  const [zoom, setZoom] = useState<number>(100);

  // Processing state
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingPdf, setIsLoadingPdf] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const pdfDocRef = useRef<any>(null);
  const currentRenderTaskRef = useRef<any>(null);
  const pagesRef = useRef<PageMeta[]>([]);
  const [pdfDocReady, setPdfDocReady] = useState(0);

  useEffect(() => {
    pagesRef.current = pages;
  }, [pages]);

  // Dragging, highlighting, and drawing states
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentDrawingPoints, setCurrentDrawingPoints] = useState<{ x: number; y: number }[]>([]);
  const [isErasing, setIsErasing] = useState(false);
  const [eraserStart, setEraserStart] = useState<{ x: number; y: number } | null>(null);
  const [eraserCurrent, setEraserCurrent] = useState<{ x: number; y: number } | null>(null);
  const [isHighlighting, setIsHighlighting] = useState(false);
  const [highlightStart, setHighlightStart] = useState<{ x: number; y: number } | null>(null);
  const [highlightCurrent, setHighlightCurrent] = useState<{ x: number; y: number } | null>(null);

  // Resizing and Rotating states (Word/Office style features)
  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState<string | null>(null);
  const [resizeStart, setResizeStart] = useState<{
    x: number;
    y: number;
    elX: number;
    elY: number;
    elW: number;
    elH: number;
  } | null>(null);

  const [isRotating, setIsRotating] = useState(false);
  const [rotateStart, setRotateStart] = useState<{
    centerX: number;
    centerY: number;
    startAngle: number;
    initialRotation: number;
  } | null>(null);

  // Context Menu & Long-Press States
  const [contextMenu, setContextMenu] = useState<{
    isOpen: boolean;
    elementId: string | null;
    x: number;
    y: number;
  } | null>(null);

  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const touchStartPosRef = useRef<{ x: number; y: number } | null>(null);
  const imageActionTypeRef = useRef<'insert' | 'replace'>('insert');

  // Push History
  const pushHistory = useCallback(
    (newElements: EditorElement[]) => {
      const updatedHistory = history.slice(0, historyIndex + 1);
      updatedHistory.push(newElements);
      setHistory(updatedHistory);
      setHistoryIndex(updatedHistory.length - 1);
    },
    [history, historyIndex]
  );

  const handleUndo = () => {
    if (historyIndex > 0) {
      const prev = history[historyIndex - 1];
      setHistoryIndex(historyIndex - 1);
      setElements(prev);
    } else if (historyIndex === 0) {
      setHistoryIndex(-1);
      setElements([]);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const next = history[historyIndex + 1];
      setHistoryIndex(historyIndex + 1);
      setElements(next);
    }
  };

  // Generate Real Page Thumbnails for the Drawer & Sidebar (Fast Chunked Rendering)
  const generateThumbnails = useCallback(async (doc: any, count: number, currentPages?: PageMeta[]) => {
    const thumbs: Record<number, string> = {};
    const maxInitial = Math.min(count, 10);
    const activePages = currentPages || pagesRef.current;
    for (let i = 0; i < maxInitial; i++) {
      try {
        const page = await doc.getPage(i + 1);
        const pageMeta = activePages[i];
        const pageRot = ((page.rotate || 0) + (pageMeta?.rotation || 0)) % 360;
        const unscaled = page.getViewport({ scale: 1, rotation: pageRot });
        const vp = page.getViewport({ scale: 120 / unscaled.width, rotation: pageRot });
        const thumbCanvas = document.createElement('canvas');
        thumbCanvas.width = vp.width;
        thumbCanvas.height = vp.height;
        const ctx = thumbCanvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, thumbCanvas.width, thumbCanvas.height);
          await page.render({ canvasContext: ctx, viewport: vp }).promise;
          thumbs[i] = thumbCanvas.toDataURL('image/jpeg', 0.65);
        }
      } catch (err) {
        console.warn('Thumbnail generation warning for page', i + 1, err);
      }
    }
    setPageThumbnails({ ...thumbs });

    // Asynchronously render remaining page thumbnails so initial interaction is instantaneous
    if (count > maxInitial) {
      setTimeout(async () => {
        const latestPages = pagesRef.current;
        for (let i = maxInitial; i < count; i++) {
          try {
            const page = await doc.getPage(i + 1);
            const pageMeta = latestPages[i];
            const pageRot = ((page.rotate || 0) + (pageMeta?.rotation || 0)) % 360;
            const unscaled = page.getViewport({ scale: 1, rotation: pageRot });
            const vp = page.getViewport({ scale: 120 / unscaled.width, rotation: pageRot });
            const thumbCanvas = document.createElement('canvas');
            thumbCanvas.width = vp.width;
            thumbCanvas.height = vp.height;
            const ctx = thumbCanvas.getContext('2d');
            if (ctx) {
              ctx.fillStyle = '#ffffff';
              ctx.fillRect(0, 0, thumbCanvas.width, thumbCanvas.height);
              await page.render({ canvasContext: ctx, viewport: vp }).promise;
              thumbs[i] = thumbCanvas.toDataURL('image/jpeg', 0.65);
            }
          } catch {}
        }
        setPageThumbnails((prev) => ({ ...prev, ...thumbs }));
      }, 50);
    }
  }, []);

  // Render a specific page from the loaded PDF Document to the Canvas & Extract Text Items
  const renderCurrentPageToCanvas = useCallback(
    async (pageIndex: number, currentPages: PageMeta[], doc: any) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Cancel any ongoing render task on this canvas before starting a new one
      if (currentRenderTaskRef.current) {
        try {
          currentRenderTaskRef.current.cancel();
        } catch {}
        currentRenderTaskRef.current = null;
      }

      const pageMeta = currentPages[pageIndex];
      const standardWidth = 595;
      const standardHeight = 842;

      // Case A: Blank Page
      if (!pageMeta || pageMeta.isBlank || pageMeta.originalIndex < 0) {
        canvas.width = standardWidth * 2;
        canvas.height = standardHeight * 2;
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.scale(2, 2);

        // Fill crisp white sheet
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, standardWidth, standardHeight);

        // Subtle guideline border
        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = 1;
        ctx.strokeRect(20, 20, standardWidth - 40, standardHeight - 40);

        setPageDimensions((prev) => {
          if (prev.width === standardWidth && prev.height === standardHeight) return prev;
          return { width: standardWidth, height: standardHeight };
        });
        return;
      }

      // Case B: PDF Page render with PDF.js
      if (doc) {
        try {
          const originalPageNum = (pageMeta.originalIndex ?? pageIndex) + 1;
          const pdfPage = await doc.getPage(Math.min(originalPageNum, doc.numPages));

          // Combine PDF's intrinsic orientation with user's rotation (0, 90, 180, 270)
          const pageRotation = ((pdfPage.rotate || 0) + (pageMeta.rotation || 0)) % 360;

          const unscaledVp = pdfPage.getViewport({ scale: 1, rotation: pageRotation });
          const actualW = unscaledVp.width;
          const actualH = unscaledVp.height;

          // Responsive sizing: widen for landscape orientation certificates & slides
          const isLandscape = actualW > actualH;
          const displayW = isLandscape ? Math.min(842, Math.round(standardWidth * 1.35)) : standardWidth;
          const displayH = Math.round((actualH / actualW) * displayW);
          setPageDimensions((prev) => {
            if (prev.width === displayW && prev.height === displayH) return prev;
            return { width: displayW, height: displayH };
          });

          // Render at 2x resolution for retina & high-DPI mobile sharpness
          const renderScale = (displayW / actualW) * 2;
          const viewport = pdfPage.getViewport({ scale: renderScale, rotation: pageRotation });

          canvas.width = viewport.width;
          canvas.height = viewport.height;
          ctx.setTransform(1, 0, 0, 1, 0, 0);

          // Clear to white first
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          const renderTask = pdfPage.render({
            canvasContext: ctx,
            viewport,
          });
          currentRenderTaskRef.current = renderTask;
          await renderTask.promise;
          currentRenderTaskRef.current = null;

          // Extract existing text content with coordinates for clickable editing
          try {
            const tc = await pdfPage.getTextContent();
            const items: ExistingTextItem[] = tc.items
              .map((item: any, itemIdx: number) => {
                const tx = item.transform[4];
                const ty = item.transform[5];
                const itemFontSize = Math.abs(item.transform[0]) || item.height || 14;
                const screenX = (tx / actualW) * displayW;
                const screenY = ((actualH - ty - itemFontSize) / actualH) * displayH;
                const screenW = Math.max(16, (item.width / actualW) * displayW);
                const screenH = Math.max(14, (itemFontSize / actualH) * displayH * 1.15);
                return {
                  id: `orig-text-${pageIndex}-${itemIdx}`,
                  str: item.str,
                  x: Math.round(screenX),
                  y: Math.round(screenY),
                  width: Math.round(screenW),
                  height: Math.round(screenH),
                  fontSize: Math.round(itemFontSize * (displayW / actualW)),
                };
              })
              .filter((item: any) => item.str && item.str.trim().length > 0);

            setPageTextItems((prev) => ({
              ...prev,
              [pageIndex]: items,
            }));
          } catch (tcErr) {
            console.warn('Text content extraction notice:', tcErr);
          }
        } catch (renderErr: any) {
          if (renderErr?.name === 'RenderingCancelledException' || renderErr?.message?.includes('cancelled')) {
            // Render was intentionally cancelled by a subsequent render; ignore gracefully
            return;
          }
          console.error('PDF.js page render failed:', renderErr);
          // Fallback white page with document title
          canvas.width = standardWidth * 2;
          canvas.height = standardHeight * 2;
          ctx.setTransform(1, 0, 0, 1, 0, 0);
          ctx.scale(2, 2);
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, standardWidth, standardHeight);
          ctx.strokeStyle = '#cbd5e1';
          ctx.strokeRect(30, 30, standardWidth - 60, standardHeight - 60);
          ctx.fillStyle = '#0B1B3D';
          ctx.font = 'bold 18px sans-serif';
          ctx.fillText(activePdfFile.name, 50, 70);
          ctx.fillStyle = '#64748b';
          ctx.font = '13px sans-serif';
          ctx.fillText(`Page ${pageIndex + 1}`, 50, 95);
        }
      }
    },
    [activePdfFile.name]
  );

  // Load PDF Document on Mount / File change + Dynamically Load 50+ Google Fonts
  useEffect(() => {
    let isCancelled = false;
    setIsLoadingPdf(true);

    if (typeof document !== 'undefined') {
      const linkId = 'pdf-editor-google-fonts';
      if (!document.getElementById(linkId)) {
        const fontLink = document.createElement('link');
        fontLink.id = linkId;
        fontLink.rel = 'stylesheet';
        fontLink.href = GOOGLE_FONTS_HREF;
        document.head.appendChild(fontLink);
      }
    }

    async function loadPdf() {
      try {
        const pdfjs = await import('pdfjs-dist/legacy/build/pdf.js');
        const pdfjsLib = (pdfjs as any).default || pdfjs;

        try {
          if (typeof window !== 'undefined') {
            pdfjsLib.GlobalWorkerOptions.workerSrc = window.location.origin + '/pdf.worker.min.js';
          }
        } catch (wErr) {
          console.warn('Worker path notice:', wErr);
        }

        const fileBuffer = await activePdfFile.arrayBuffer();
        const loadingTask = pdfjsLib.getDocument({
          data: new Uint8Array(fileBuffer),
          cMapUrl: 'https://unpkg.com/pdfjs-dist@3.11.174/cmaps/',
          cMapPacked: true,
        });

        const doc = await loadingTask.promise;
        if (isCancelled) return;

        pdfDocRef.current = doc;
        const count = Math.max(1, doc.numPages);
        setTotalPages(count);

        const initialPages: PageMeta[] = Array.from({ length: count }, (_, i) => ({
          id: `page-${i}-${Date.now()}`,
          originalIndex: i,
          isBlank: false,
          rotation: 0,
        }));
        pagesRef.current = initialPages;
        setPages(initialPages);
        setCurrentPageIndex(0);

        // Auto-fit zoom on mobile screens
        if (typeof window !== 'undefined') {
          const screenW = window.innerWidth;
          if (screenW < 640) {
            const fitZoom = Math.min(100, Math.max(45, Math.floor(((screenW - 20) / 595) * 100)));
            setZoom(fitZoom);
          }
        }

        generateThumbnails(doc, count, initialPages);
        setPdfDocReady((v) => v + 1);
      } catch (err: any) {
        console.warn('Worker PDF loading failed, attempting main-thread fallback:', err);
        try {
          const pdfjs = await import('pdfjs-dist/legacy/build/pdf.js');
          const pdfjsLib = (pdfjs as any).default || pdfjs;
          pdfjsLib.GlobalWorkerOptions.workerSrc = '';

          const fileBuffer = await activePdfFile.arrayBuffer();
          const loadingTask = pdfjsLib.getDocument({
            data: new Uint8Array(fileBuffer),
            disableWorker: true,
          });

          const doc = await loadingTask.promise;
          if (isCancelled) return;

          pdfDocRef.current = doc;
          const count = Math.max(1, doc.numPages);
          setTotalPages(count);

          const initialPages: PageMeta[] = Array.from({ length: count }, (_, i) => ({
            id: `page-${i}-${Date.now()}`,
            originalIndex: i,
            isBlank: false,
            rotation: 0,
          }));
          pagesRef.current = initialPages;
          setPages(initialPages);
          setCurrentPageIndex(0);
          generateThumbnails(doc, count, initialPages);
          setPdfDocReady((v) => v + 1);
        } catch (err2: any) {
          console.error('All PDF rendering attempts failed:', err2);
          setErrorMessage('Notice: Document opened in compatibility view.');
        }
      } finally {
        if (!isCancelled) setIsLoadingPdf(false);
      }
    }

    loadPdf();
    return () => {
      isCancelled = true;
      if (currentRenderTaskRef.current) {
        try {
          currentRenderTaskRef.current.cancel();
        } catch {}
      }
    };
  }, [activePdfFile, generateThumbnails]);

  // Re-render canvas whenever page index, page rotation, or blank state changes
  const activePage = pages[currentPageIndex];
  const activePageRotation = activePage?.rotation || 0;
  const activePageIsBlank = !!activePage?.isBlank;
  const activePageOriginalIndex = activePage?.originalIndex;

  useEffect(() => {
    if (pdfDocRef.current || activePageIsBlank) {
      renderCurrentPageToCanvas(currentPageIndex, pagesRef.current, pdfDocRef.current);
    }
  }, [
    pdfDocReady,
    currentPageIndex,
    activePageRotation,
    activePageIsBlank,
    activePageOriginalIndex,
    renderCurrentPageToCanvas,
  ]);

  // Page Actions
  const handleAddBlankPage = () => {
    const newPage: PageMeta = {
      id: `blank-${Date.now()}`,
      originalIndex: -1,
      isBlank: true,
    };
    const updated = [...pages];
    updated.splice(currentPageIndex + 1, 0, newPage);
    setPages(updated);
    setCurrentPageIndex(currentPageIndex + 1);
    setMobileSidebarOpen(false);
  };

  const handleDuplicatePage = () => {
    const current = pages[currentPageIndex];
    if (!current) return;
    const duplicated: PageMeta = {
      id: `dup-${Date.now()}`,
      originalIndex: current.originalIndex,
      isBlank: current.isBlank,
    };
    const updated = [...pages];
    updated.splice(currentPageIndex + 1, 0, duplicated);
    setPages(updated);
    setCurrentPageIndex(currentPageIndex + 1);
    setMobileSidebarOpen(false);
  };

  const handleDeletePage = () => {
    if (pages.length <= 1) {
      setErrorMessage('A PDF document must contain at least one page.');
      return;
    }
    const updated = pages.filter((_, idx) => idx !== currentPageIndex);
    setPages(updated);
    setCurrentPageIndex((prev) => Math.max(0, Math.min(prev, updated.length - 1)));
    const updatedElements = elements.filter((el) => el.pageIndex !== currentPageIndex);
    setElements(updatedElements);
    pushHistory(updatedElements);
    setMobileSidebarOpen(false);
  };

  // 1. Merge PDF: Append all pages from picked PDF files into active document
  const handleMergePdfFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    try {
      setIsSaving(true);
      const { PDFDocument } = await import('pdf-lib');
      const mainDoc = await PDFDocument.load(await activePdfFile.arrayBuffer(), { ignoreEncryption: true });
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const otherDoc = await PDFDocument.load(await file.arrayBuffer(), { ignoreEncryption: true });
        const copiedPages = await mainDoc.copyPages(otherDoc, otherDoc.getPageIndices());
        copiedPages.forEach((p) => mainDoc.addPage(p));
      }
      const mergedBytes = await mainDoc.save();
      const mergedBlob = new Blob([mergedBytes.buffer as ArrayBuffer], { type: 'application/pdf' });
      const mergedFile = new File([mergedBlob], activePdfFile.name, { type: 'application/pdf' });
      setActivePdfFile(mergedFile);
      setErrorMessage(null);
    } catch (err: any) {
      console.error('Merge error:', err);
      setErrorMessage('Failed to merge PDF: ' + (err?.message || 'Invalid PDF file'));
    } finally {
      setIsSaving(false);
      if (e.target) e.target.value = '';
    }
  };

  // 2. Split PDF: Extract current page or custom range and download
  const handleSplitPdf = async (mode: 'current' | 'range') => {
    try {
      setIsSaving(true);
      const { PDFDocument } = await import('pdf-lib');
      const sourceDoc = await PDFDocument.load(await activePdfFile.arrayBuffer(), { ignoreEncryption: true });
      const newDoc = await PDFDocument.create();

      let pageIndices: number[] = [];
      if (mode === 'current') {
        const orig = pages[currentPageIndex]?.originalIndex ?? currentPageIndex;
        if (orig >= 0) pageIndices = [orig];
      } else {
        const parts = splitRange.split(',').map((p) => p.trim());
        for (const part of parts) {
          if (part.includes('-')) {
            const [start, end] = part.split('-').map(Number);
            if (!isNaN(start) && !isNaN(end)) {
              for (let p = Math.max(1, start); p <= Math.min(pages.length, end); p++) {
                const orig = pages[p - 1]?.originalIndex ?? p - 1;
                if (orig >= 0) pageIndices.push(orig);
              }
            }
          } else {
            const p = Number(part);
            if (!isNaN(p) && p >= 1 && p <= pages.length) {
              const orig = pages[p - 1]?.originalIndex ?? p - 1;
              if (orig >= 0) pageIndices.push(orig);
            }
          }
        }
      }

      if (pageIndices.length === 0) {
        setErrorMessage('Please specify a valid page range.');
        setIsSaving(false);
        return;
      }

      const validIndices = pageIndices.filter((idx) => idx >= 0 && idx < sourceDoc.getPageCount());
      const copied = await newDoc.copyPages(sourceDoc, validIndices);
      copied.forEach((p) => newDoc.addPage(p));
      const splitBytes = await newDoc.save();
      const baseName = activePdfFile.name.replace(/\.[^/.]+$/, '');
      const downloadName = mode === 'current'
        ? `${baseName}-page-${currentPageIndex + 1}.pdf`
        : `${baseName}-split.pdf`;
      downloadFile(splitBytes, downloadName, 'application/pdf');
      setSplitModalOpen(false);
    } catch (err: any) {
      setErrorMessage('Failed to split PDF: ' + (err?.message || 'Error occurred'));
    } finally {
      setIsSaving(false);
    }
  };

  // 3. Extract PDF Pages as JPG or PNG directly from canvas
  const handleExtractCurrentPage = (format: 'png' | 'jpeg') => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const mimeType = format === 'png' ? 'image/png' : 'image/jpeg';
    const dataUrl = canvas.toDataURL(mimeType, 0.95);
    const baseName = activePdfFile.name.replace(/\.[^/.]+$/, '');
    const filename = `${baseName}-page-${currentPageIndex + 1}.${format === 'png' ? 'png' : 'jpg'}`;
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setExtractModalOpen(false);
  };

  // Canvas Coordinate Mapping
  const getCanvasCoords = (e: React.MouseEvent<any> | React.TouchEvent<any>) => {
    const overlay = overlayRef.current;
    if (!overlay) return { x: 0, y: 0 };
    const rect = overlay.getBoundingClientRect();
    const touch = 'touches' in e ? (e.touches[0] || (e as React.TouchEvent).changedTouches?.[0]) : null;
    const clientX = touch ? touch.clientX : (e as React.MouseEvent).clientX;
    const clientY = touch ? touch.clientY : (e as React.MouseEvent).clientY;
    const scale = zoom / 100;
    return {
      x: Math.max(0, Math.min(pageDimensions.width, (clientX - rect.left) / scale)),
      y: Math.max(0, Math.min(pageDimensions.height, (clientY - rect.top) / scale)),
    };
  };

  // Click on Existing Text in PDF to Edit, Highlight, or Erase
  const handleEditExistingText = (item: ExistingTextItem) => {
    if (activeTool === 'highlight') {
      // Real Fluorescent Highlighter over existing text line
      const highlightEl: EditorElement = {
        id: `hl-${Date.now()}`,
        type: 'highlight',
        pageIndex: currentPageIndex,
        x: item.x - 2,
        y: item.y - 1,
        width: item.width + 4,
        height: item.height + 2,
        fillColor: highlightColor,
        opacity: 0.45,
      };
      const updated = [...elements, highlightEl];
      setElements(updated);
      pushHistory(updated);
      setSelectedElementId(highlightEl.id);
      return;
    }

    if (activeTool === 'eraser') {
      // Direct erase existing text
      const whiteoutEl: EditorElement = {
        id: `erase-${Date.now()}`,
        type: 'eraser',
        pageIndex: currentPageIndex,
        x: item.x - 2,
        y: item.y - 1,
        width: item.width + 4,
        height: item.height + 2,
        fillColor: '#ffffff',
      };
      const updated = [...elements, whiteoutEl];
      setElements(updated);
      pushHistory(updated);
      return;
    }

    // Step 1: Add a clean whiteout box covering original text
    const whiteoutEl: EditorElement = {
      id: `whiteout-${Date.now()}`,
      type: 'eraser',
      pageIndex: currentPageIndex,
      x: item.x - 2,
      y: item.y - 1,
      width: item.width + 4,
      height: item.height + 2,
      fillColor: '#ffffff',
    };

    // Step 2: Add an editable replacement text element on top with exact string & coordinates
    const replacementEl: EditorElement = {
      id: `text-replace-${Date.now()}`,
      type: 'text',
      pageIndex: currentPageIndex,
      x: item.x,
      y: item.y,
      width: Math.max(160, item.width + 20),
      height: item.height,
      text: item.str,
      fontFamily,
      fontSize: item.fontSize || fontSize,
      isBold,
      isItalic,
      isUnderline,
      textAlign,
      color: textColor,
    };

    const updated = [...elements, whiteoutEl, replacementEl];
    setElements(updated);
    pushHistory(updated);
    setSelectedElementId(replacementEl.id);
    setActiveTool('select');
  };

  // Canvas Click / Tap: Element Creation / Eraser Drag
  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    if (e.target !== overlayRef.current && (e.target as HTMLElement).tagName !== 'svg') {
      return;
    }

    const { x, y } = getCanvasCoords(e);

    if (activeTool === 'select') {
      setSelectedElementId(null);
      return;
    }

    // Eraser / Whiteout Tool: Start drag-box whiteout
    if (activeTool === 'eraser') {
      setIsErasing(true);
      setEraserStart({ x: Math.round(x), y: Math.round(y) });
      setEraserCurrent({ x: Math.round(x), y: Math.round(y) });
      return;
    }

    if (activeTool === 'text') {
      const newEl: EditorElement = {
        id: `text-${Date.now()}`,
        type: 'text',
        pageIndex: currentPageIndex,
        x: Math.round(x),
        y: Math.round(y),
        width: 220,
        height: Math.max(36, fontSize * 2),
        text: '',
        fontFamily,
        fontSize,
        isBold,
        isItalic,
        isUnderline,
        textAlign,
        color: textColor,
        headingStyle,
      };
      const updated = [...elements, newEl];
      setElements(updated);
      pushHistory(updated);
      setSelectedElementId(newEl.id);
      setActiveTool('select');
      return;
    }

    if (activeTool === 'highlight') {
      setIsHighlighting(true);
      setHighlightStart({ x: Math.round(x), y: Math.round(y) });
      setHighlightCurrent({ x: Math.round(x), y: Math.round(y) });
      return;
    }

    if (activeTool === 'shape' || activeTool === 'rect' || activeTool === 'circle' || activeTool === 'line' || activeTool === 'arrow') {
      const shapeId = selectedShapeKind || (activeTool === 'shape' ? 'rect' : activeTool);
      const shapeDef = WORD_SHAPES_LIBRARY.find((s) => s.id === shapeId) || WORD_SHAPES_LIBRARY[0];
      const isLine = shapeDef.category === 'Lines';
      const width = isLine ? 150 : 110;
      const height = isLine ? 40 : 100;

      const newEl: EditorElement = {
        id: `shape-${Date.now()}`,
        type: 'shape',
        shapeKind: shapeDef.id,
        shapeSvgPath: shapeDef.path,
        pageIndex: currentPageIndex,
        x: Math.round(x - width / 2),
        y: Math.round(y - height / 2),
        width,
        height,
        fillColor: shapeDef.isClosed ? shapeFillColor : 'transparent',
        color: shapeStrokeColor,
        strokeWidth: shapeStrokeWidth,
      };
      const updated = [...elements, newEl];
      setElements(updated);
      pushHistory(updated);
      setSelectedElementId(newEl.id);
      setActiveTool('select');
      return;
    }

    if (activeTool === 'draw') {
      setIsDrawing(true);
      setCurrentDrawingPoints([{ x: Math.round(x), y: Math.round(y) }]);
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<any> | React.TouchEvent<any>) => {
    // If movement exceeds 8px, cancel long-press so smooth dragging proceeds
    if (touchStartPosRef.current) {
      const touch = 'touches' in e ? (e.touches[0] || (e as React.TouchEvent).changedTouches?.[0]) : null;
      const clientX = touch ? touch.clientX : (e as React.MouseEvent).clientX;
      const clientY = touch ? touch.clientY : (e as React.MouseEvent).clientY;
      if (clientX !== undefined && clientY !== undefined) {
        const dist = Math.hypot(clientX - touchStartPosRef.current.x, clientY - touchStartPosRef.current.y);
        if (dist > 8 && longPressTimerRef.current) {
          clearTimeout(longPressTimerRef.current);
          longPressTimerRef.current = null;
        }
      }
    }

    // 1. Resizing active element via 8 handles
    if (isResizing && resizeHandle && resizeStart && selectedElementId) {
      const { x, y } = getCanvasCoords(e);
      const dx = x - resizeStart.x;
      const dy = y - resizeStart.y;
      let newX = resizeStart.elX;
      let newY = resizeStart.elY;
      let newW = resizeStart.elW;
      let newH = resizeStart.elH;

      if (resizeHandle.includes('e')) {
        newW = Math.max(20, resizeStart.elW + dx);
      }
      if (resizeHandle.includes('s')) {
        newH = Math.max(20, resizeStart.elH + dy);
      }
      if (resizeHandle.includes('w')) {
        const candidateW = resizeStart.elW - dx;
        if (candidateW >= 20) {
          newW = candidateW;
          newX = resizeStart.elX + dx;
        }
      }
      if (resizeHandle.includes('n')) {
        const candidateH = resizeStart.elH - dy;
        if (candidateH >= 20) {
          newH = candidateH;
          newY = resizeStart.elY + dy;
        }
      }

      setElements((prev) =>
        prev.map((el) => {
          if (el.id !== selectedElementId) return el;
          return {
            ...el,
            x: Math.round(newX),
            y: Math.round(newY),
            width: Math.round(newW),
            height: Math.round(newH),
          };
        })
      );
      return;
    }

    // 2. Rotating active element via top knob
    if (isRotating && rotateStart && selectedElementId) {
      const { x, y } = getCanvasCoords(e);
      const currentAngle = Math.atan2(y - rotateStart.centerY, x - rotateStart.centerX) * (180 / Math.PI);
      const deltaAngle = currentAngle - rotateStart.startAngle;
      let finalAngle = Math.round((rotateStart.initialRotation + deltaAngle) % 360);
      if (finalAngle < 0) finalAngle += 360;

      // Snap to 45 degree increments if close
      if (Math.abs(finalAngle % 45) < 5) {
        finalAngle = Math.round(finalAngle / 45) * 45;
      }

      setElements((prev) =>
        prev.map((el) => {
          if (el.id !== selectedElementId) return el;
          return { ...el, rotation: finalAngle };
        })
      );
      return;
    }

    // 3. Drawing / Erasing / Highlighting / Dragging
    if (activeTool === 'draw' && isDrawing) {
      const { x, y } = getCanvasCoords(e);
      setCurrentDrawingPoints((pts) => [...pts, { x: Math.round(x), y: Math.round(y) }]);
    } else if (activeTool === 'highlight' && isHighlighting && highlightStart) {
      const { x, y } = getCanvasCoords(e);
      setHighlightCurrent({ x: Math.round(x), y: Math.round(y) });
    } else if (activeTool === 'eraser' && isErasing && eraserStart) {
      const { x, y } = getCanvasCoords(e);
      setEraserCurrent({ x: Math.round(x), y: Math.round(y) });
    } else if (isDragging && selectedElementId) {
      const { x, y } = getCanvasCoords(e);
      setElements((prev) =>
        prev.map((el) => {
          if (el.id !== selectedElementId) return el;
          return {
            ...el,
            x: Math.max(0, Math.min(pageDimensions.width - el.width, Math.round(x - dragOffset.x))),
            y: Math.max(0, Math.min(pageDimensions.height - el.height, Math.round(y - dragOffset.y))),
          };
        })
      );
    }
  };

  const handleCanvasMouseUp = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
    touchStartPosRef.current = null;

    if (isResizing) {
      setIsResizing(false);
      setResizeHandle(null);
      setResizeStart(null);
      pushHistory(elements);
      return;
    }

    if (isRotating) {
      setIsRotating(false);
      setRotateStart(null);
      pushHistory(elements);
      return;
    }

    // Finish Real Highlighter Drag-Highlighting
    if (activeTool === 'highlight' && isHighlighting && highlightStart && highlightCurrent) {
      setIsHighlighting(false);
      const minX = Math.min(highlightStart.x, highlightCurrent.x);
      const maxX = Math.max(highlightStart.x, highlightCurrent.x);
      const minY = Math.min(highlightStart.y, highlightCurrent.y);
      const maxY = Math.max(highlightStart.y, highlightCurrent.y);
      const dragW = maxX - minX;
      const dragH = maxY - minY;
      const w = Math.max(dragW > 8 ? dragW : 140, 20);
      const h = Math.max(dragH > 8 ? dragH : highlightTipHeight, 14);

      const hlEl: EditorElement = {
        id: `hl-${Date.now()}`,
        type: 'highlight',
        pageIndex: currentPageIndex,
        x: Math.round(minX),
        y: Math.round(minY),
        width: Math.round(w),
        height: Math.round(h),
        fillColor: highlightColor,
        opacity: 0.45,
      };
      const updated = [...elements, hlEl];
      setElements(updated);
      pushHistory(updated);
      setSelectedElementId(hlEl.id);
      setHighlightStart(null);
      setHighlightCurrent(null);
      return;
    }

    // Finish Eraser drag-box whiteout
    if (activeTool === 'eraser' && isErasing && eraserStart && eraserCurrent) {
      setIsErasing(false);
      const minX = Math.min(eraserStart.x, eraserCurrent.x);
      const maxX = Math.max(eraserStart.x, eraserCurrent.x);
      const minY = Math.min(eraserStart.y, eraserCurrent.y);
      const maxY = Math.max(eraserStart.y, eraserCurrent.y);
      const w = Math.max(12, maxX - minX);
      const h = Math.max(12, maxY - minY);

      const eraseEl: EditorElement = {
        id: `eraser-${Date.now()}`,
        type: 'eraser',
        pageIndex: currentPageIndex,
        x: minX,
        y: minY,
        width: w,
        height: h,
        fillColor: '#ffffff',
      };
      const updated = [...elements, eraseEl];
      setElements(updated);
      pushHistory(updated);
      setEraserStart(null);
      setEraserCurrent(null);
      return;
    }

    if (activeTool === 'draw' && isDrawing) {
      setIsDrawing(false);
      if (currentDrawingPoints.length > 1) {
        const xs = currentDrawingPoints.map((p) => p.x);
        const ys = currentDrawingPoints.map((p) => p.y);
        const minX = Math.min(...xs);
        const maxX = Math.max(...xs);
        const minY = Math.min(...ys);
        const maxY = Math.max(...ys);

        const newEl: EditorElement = {
          id: `draw-${Date.now()}`,
          type: 'drawing',
          pageIndex: currentPageIndex,
          x: minX,
          y: minY,
          width: Math.max(20, maxX - minX),
          height: Math.max(20, maxY - minY),
          color: pencilColor,
          strokeWidth: pencilWidth,
          drawingPoints: currentDrawingPoints,
        };
        const updated = [...elements, newEl];
        setElements(updated);
        pushHistory(updated);
        setSelectedElementId(newEl.id);
      }
      setCurrentDrawingPoints([]);
    }

    if (isDragging) {
      setIsDragging(false);
      pushHistory(elements);
    }
  };

  // Element Selection & Dragging (Supports Mouse & Touch Dragging + Long-Press Menu)
  const handleElementMouseDown = (e: React.MouseEvent | React.TouchEvent, id: string) => {
    e.stopPropagation();

    // If Eraser is active, clicking an element erases/deletes it immediately!
    if (activeTool === 'eraser') {
      const updated = elements.filter((item) => item.id !== id);
      setElements(updated);
      pushHistory(updated);
      if (selectedElementId === id) setSelectedElementId(null);
      return;
    }

    setSelectedElementId(id);
    const el = elements.find((item) => item.id === id);
    if (!el) return;

    if (el.fontFamily) setFontFamily(el.fontFamily);
    if (el.fontSize) setFontSize(el.fontSize);
    if (el.isBold !== undefined) setIsBold(el.isBold);
    if (el.isItalic !== undefined) setIsItalic(el.isItalic);
    if (el.isUnderline !== undefined) setIsUnderline(el.isUnderline);
    if (el.textAlign) setTextAlign(el.textAlign);
    if (el.color) setTextColor(el.color);

    const { x, y } = getCanvasCoords(e);
    setDragOffset({
      x: x - el.x,
      y: y - el.y,
    });
    setIsDragging(true);

    // Save starting touch coords and arm long-press timer (~450ms)
    const touch = 'touches' in e ? (e.touches[0] || (e as React.TouchEvent).changedTouches?.[0]) : null;
    const clientX = touch ? touch.clientX : (e as React.MouseEvent).clientX;
    const clientY = touch ? touch.clientY : (e as React.MouseEvent).clientY;
    touchStartPosRef.current = { x: clientX, y: clientY };

    if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current);
    longPressTimerRef.current = setTimeout(() => {
      try {
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
          navigator.vibrate(40);
        }
      } catch (_) {}
      setIsDragging(false);
      setContextMenu({
        isOpen: true,
        elementId: id,
        x: clientX,
        y: clientY,
      });
    }, 450);
  };

  // Right-click Context Menu
  const handleContextMenu = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedElementId(id);
    setContextMenu({
      isOpen: true,
      elementId: id,
      x: e.clientX,
      y: e.clientY,
    });
  };

  // Layer Ordering and Element Manipulation Actions
  const handleBringToFront = (id: string) => {
    const el = elements.find((item) => item.id === id);
    if (!el) return;
    const others = elements.filter((item) => item.id !== id);
    const updated = [...others, el];
    setElements(updated);
    pushHistory(updated);
    setContextMenu(null);
  };

  const handleSendToBack = (id: string) => {
    const el = elements.find((item) => item.id === id);
    if (!el) return;
    const others = elements.filter((item) => item.id !== id);
    const updated = [el, ...others];
    setElements(updated);
    pushHistory(updated);
    setContextMenu(null);
  };

  const handleDuplicateElement = (id: string) => {
    const el = elements.find((item) => item.id === id);
    if (!el) return;
    const dup: EditorElement = {
      ...el,
      id: `${el.type}-${Date.now()}`,
      x: Math.min(pageDimensions.width - el.width, el.x + 20),
      y: Math.min(pageDimensions.height - el.height, el.y + 20),
    };
    const updated = [...elements, dup];
    setElements(updated);
    pushHistory(updated);
    setSelectedElementId(dup.id);
    setContextMenu(null);
  };

  const handleRotateElement90 = (id: string) => {
    const updated = elements.map((el) => {
      if (el.id !== id) return el;
      return { ...el, rotation: ((el.rotation || 0) + 90) % 360 };
    });
    setElements(updated);
    pushHistory(updated);
  };

  const handleInsertNewShape = (shapeType: 'rectangle' | 'circle') => {
    const newEl: EditorElement = {
      id: `${shapeType}-${Date.now()}`,
      type: shapeType,
      pageIndex: currentPageIndex,
      x: Math.round((pageDimensions.width - 120) / 2),
      y: Math.max(30, Math.round((pageDimensions.height - 120) / 3)),
      width: 120,
      height: 120,
      color: '#0B1B3D',
      fillColor: 'transparent',
      strokeWidth: 3,
    };
    const updated = [...elements, newEl];
    setElements(updated);
    pushHistory(updated);
    setSelectedElementId(newEl.id);
    setActiveTool('select');
    setContextMenu(null);
  };

  // Resize Handle Trigger
  const handleResizeStart = (e: React.MouseEvent | React.TouchEvent, handle: string) => {
    e.stopPropagation();
    const el = elements.find((item) => item.id === selectedElementId);
    if (!el) return;
    const { x, y } = getCanvasCoords(e);
    setIsResizing(true);
    setResizeHandle(handle);
    setResizeStart({
      x,
      y,
      elX: el.x,
      elY: el.y,
      elW: el.width,
      elH: el.height,
    });
  };

  // Rotation Handle Trigger (Word-style top stalk dot)
  const handleRotateStart = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    const el = elements.find((item) => item.id === selectedElementId);
    if (!el) return;
    const { x, y } = getCanvasCoords(e);
    const cx = el.x + el.width / 2;
    const cy = el.y + el.height / 2;
    const startAngle = Math.atan2(y - cy, x - cx) * (180 / Math.PI);
    setIsRotating(true);
    setRotateStart({
      centerX: cx,
      centerY: cy,
      startAngle,
      initialRotation: el.rotation || 0,
    });
  };

  // Convert All Page Text Lines to Editable at once (User Request)
  const handleMakeAllTextEditable = () => {
    const currentItems = pageTextItems[currentPageIndex] || [];
    if (currentItems.length === 0) return;

    const newElements: EditorElement[] = [];
    currentItems.forEach((item, idx) => {
      // Whiteout
      newElements.push({
        id: `whiteout-all-${Date.now()}-${idx}`,
        type: 'eraser',
        pageIndex: currentPageIndex,
        x: item.x - 2,
        y: item.y - 1,
        width: item.width + 4,
        height: item.height + 2,
        fillColor: '#ffffff',
      });
      // Editable replacement text
      newElements.push({
        id: `text-replace-all-${Date.now()}-${idx}`,
        type: 'text',
        pageIndex: currentPageIndex,
        x: item.x,
        y: item.y,
        width: Math.max(160, item.width + 20),
        height: item.height,
        text: item.str,
        fontFamily,
        fontSize: item.fontSize || fontSize,
        isBold,
        isItalic,
        isUnderline,
        textAlign,
        color: textColor,
      });
    });

    const updated = [...elements, ...newElements];
    setElements(updated);
    pushHistory(updated);
    setActiveTool('select');
  };

  const updateSelectedElement = (updates: Partial<EditorElement>) => {
    if (!selectedElementId) return;
    const updated = elements.map((el) => {
      if (el.id !== selectedElementId) return el;
      return { ...el, ...updates };
    });
    setElements(updated);
    pushHistory(updated);
  };

  const handleDeleteSelected = () => {
    if (!selectedElementId) return;
    const updated = elements.filter((el) => el.id !== selectedElementId);
    setElements(updated);
    pushHistory(updated);
    setSelectedElementId(null);
  };

  // Insert Table Action (Screenshot_2026-11-02-12-52-30-02_40deb401b9ffe8e1df2f1cc5ba480b12.jpg - Insert Blank Table Only)
  const handleInsertTable = (customRows?: number, customCols?: number) => {
    const rows = Math.max(1, Math.min(10, customRows ?? newTableRows));
    const cols = Math.max(1, Math.min(6, customCols ?? newTableCols));

    const cells: string[][] = [];
    for (let r = 0; r < rows; r++) {
      const rowArr: string[] = [];
      for (let c = 0; c < cols; c++) {
        rowArr.push(''); // 100% Completely BLANK cells - no placeholder junk!
      }
      cells.push(rowArr);
    }

    const tableData: TableData = {
      rows,
      cols,
      cells,
      headerBg: newTableHeaderBg || '#f8fafc',
      borderColor: newTableBorderColor || '#cbd5e1',
    };

    const tableW = Math.min(pageDimensions.width - 60, Math.max(240, cols * 85));
    const tableH = rows * 36;

    const newEl: EditorElement = {
      id: `table-${Date.now()}`,
      type: 'table',
      pageIndex: currentPageIndex,
      x: Math.round((pageDimensions.width - tableW) / 2),
      y: 120,
      width: tableW,
      height: tableH,
      tableData,
    };

    const updated = [...elements, newEl];
    setElements(updated);
    pushHistory(updated);
    setSelectedElementId(newEl.id);
    setActiveTool('select');
    setTableModalOpen(false);
  };

  // Table Cell Editing
  const handleTableCellChange = (tableId: string, rowIdx: number, colIdx: number, val: string) => {
    const updated = elements.map((el) => {
      if (el.id !== tableId || !el.tableData) return el;
      const newCells = el.tableData.cells.map((row, r) =>
        row.map((cell, c) => (r === rowIdx && c === colIdx ? val : cell))
      );
      return {
        ...el,
        tableData: {
          ...el.tableData,
          cells: newCells,
        },
      };
    });
    setElements(updated);
  };

  const handleTableAddRow = (tableId: string) => {
    const updated = elements.map((el) => {
      if (el.id !== tableId || !el.tableData) return el;
      const { rows, cols, cells } = el.tableData;
      const newRow: string[] = Array.from({ length: cols }, (_, c) => `Cell ${rows + 1},${c + 1}`);
      return {
        ...el,
        height: el.height + 36,
        tableData: {
          ...el.tableData,
          rows: rows + 1,
          cells: [...cells, newRow],
        },
      };
    });
    setElements(updated);
    pushHistory(updated);
  };

  const handleTableDeleteRow = (tableId: string) => {
    const updated = elements.map((el) => {
      if (el.id !== tableId || !el.tableData || el.tableData.rows <= 1) return el;
      const { rows, cells } = el.tableData;
      return {
        ...el,
        height: Math.max(36, el.height - 36),
        tableData: {
          ...el.tableData,
          rows: rows - 1,
          cells: cells.slice(0, rows - 1),
        },
      };
    });
    setElements(updated);
    pushHistory(updated);
  };

  const handleTableAddCol = (tableId: string) => {
    const updated = elements.map((el) => {
      if (el.id !== tableId || !el.tableData) return el;
      const { rows, cols, cells } = el.tableData;
      const newCells = cells.map((row, r) => [...row, r === 0 ? `Header ${cols + 1}` : `Col ${cols + 1}`]);
      return {
        ...el,
        width: el.width + 80,
        tableData: {
          ...el.tableData,
          cols: cols + 1,
          cells: newCells,
        },
      };
    });
    setElements(updated);
    pushHistory(updated);
  };

  const handleTableDeleteCol = (tableId: string) => {
    const updated = elements.map((el) => {
      if (el.id !== tableId || !el.tableData || el.tableData.cols <= 1) return el;
      const { rows, cols, cells } = el.tableData;
      const newCells = cells.map((row) => row.slice(0, cols - 1));
      return {
        ...el,
        width: Math.max(100, el.width - 80),
        tableData: {
          ...el.tableData,
          cols: cols - 1,
          cells: newCells,
        },
      };
    });
    setElements(updated);
    pushHistory(updated);
  };


  // Image Upload (Insert New or Replace Existing)
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      const img = new Image();
      img.onload = () => {
        const aspect = img.width / img.height;

        if (imageActionTypeRef.current === 'replace' && selectedElementId) {
          // Replace selected image content while maintaining placement
          setElements((prev) => {
            const updated = prev.map((item) => {
              if (item.id !== selectedElementId) return item;
              const newHeight = Math.round(item.width / aspect);
              return {
                ...item,
                imageDataUrl: dataUrl,
                height: newHeight,
              };
            });
            pushHistory(updated);
            return updated;
          });
        } else {
          // Insert brand new image
          const width = 160;
          const height = Math.round(width / aspect);

          const newEl: EditorElement = {
            id: `img-${Date.now()}`,
            type: 'image',
            pageIndex: currentPageIndex,
            x: Math.round((pageDimensions.width - width) / 2),
            y: 150,
            width,
            height,
            imageDataUrl: dataUrl,
          };
          const updated = [...elements, newEl];
          setElements(updated);
          pushHistory(updated);
          setSelectedElementId(newEl.id);
          setActiveTool('select');
        }
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Rotate Active Page (0°, 90°, 180°, 270°) - Solves upside down/rotated PDFs
  const handleRotateCurrentPage = (angleDelta: number) => {
    const updated = pages.map((p, idx) => {
      if (idx !== currentPageIndex) return p;
      const currentRot = p.rotation || 0;
      const nextRot = (currentRot + angleDelta + 360) % 360;
      return { ...p, rotation: nextRot };
    });
    pagesRef.current = updated;
    setPages(updated);
    if (pdfDocRef.current) {
      generateThumbnails(pdfDocRef.current, updated.length, updated);
    }
  };

  // Microsoft Word-Style Numbering & Roman Letters (IMG_20261102_110437.jpg & Screenshot_2026-11-02-12-51-40-36)
  const handleApplyNumbering = (styleId: string) => {
    setSelectedNumberingStyle(styleId);
    setNumberingOpen(false);

    if (selectedElementId) {
      const el = elements.find((item) => item.id === selectedElementId);
      if (el && el.type === 'text') {
        const currentText = el.text && el.text.trim().length > 0 ? el.text : getFirstListMarker(styleId);
        const formatted = el.text && el.text.trim().length > 0 ? applyListFormat(currentText, styleId) : getFirstListMarker(styleId);
        updateSelectedElement({ text: formatted });
        return;
      }
    }

    // If no text box selected, insert a fresh numbered list text box starting with the first marker (clean, no dummy items)
    const sampleText = getFirstListMarker(styleId);
    const newW = 220;
    const newEl: EditorElement = {
      id: `text-list-${Date.now()}`,
      type: 'text',
      pageIndex: currentPageIndex,
      x: Math.round((pageDimensions.width - newW) / 2),
      y: 160,
      width: newW,
      height: 60,
      text: sampleText,
      fontFamily,
      fontSize,
      isBold,
      isItalic,
      isUnderline,
      textAlign,
      color: textColor,
    };
    const updated = [...elements, newEl];
    setElements(updated);
    pushHistory(updated);
    setSelectedElementId(newEl.id);
    setActiveTool('select');
  };

  // Save & Download Compiled PDF
  const handleSaveAndDownload = async () => {
    setIsSaving(true);
    setErrorMessage(null);

    try {
      const compiledBytes = await compileVisualEditedPDF(
        activePdfFile,
        pages.map((p) => ({ originalIndex: p.originalIndex, isBlank: p.isBlank, rotation: p.rotation })),
        elements,
        pageDimensions.width,
        pageDimensions.height
      );

      const baseName = activePdfFile.name.replace(/\.[^/.]+$/, '');
      const downloadFilename = `${baseName}-edited.pdf`;

      downloadFile(compiledBytes, downloadFilename, 'application/pdf');

      if (onFinish) {
        onFinish(compiledBytes, downloadFilename);
      }
    } catch (err: any) {
      console.error('Save failed:', err);
      setErrorMessage(err.message || 'Could not compile edited PDF. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const selectedElement = elements.find((el) => el.id === selectedElementId);
  const currentElements = elements.filter((el) => el.pageIndex === currentPageIndex);
  const currentTextItems = pageTextItems[currentPageIndex] || [];

  // Word / Office Style Selection & Transformation Handles (Matches IMG_20261102_111048 & IMG_20261102_111109)
  const renderSelectionHandles = (el: EditorElement) => {
    if (selectedElementId !== el.id) return null;

    return (
      <div className="absolute inset-0 pointer-events-none z-20">
        {/* Word/Office Style Bounding Box Outline */}
        <div className="absolute inset-0 border-2 border-blue-500 rounded-xs" />

        {/* Word/Office Style Top Rotation Stalk + Circular Knob (Exact user screenshot match) */}
        <div
          className="absolute left-1/2 -top-9 -translate-x-1/2 flex flex-col items-center pointer-events-auto cursor-grab active:cursor-grabbing group z-30"
          onMouseDown={handleRotateStart}
          onTouchStart={handleRotateStart}
          title={`Rotate Element (${el.rotation || 0}°)`}
        >
          <div className="w-6 h-6 rounded-full bg-white border-2 border-blue-600 shadow-md flex items-center justify-center hover:scale-125 transition-transform bg-gradient-to-b from-white to-blue-50">
            <RotateCw className="w-3.5 h-3.5 text-blue-600 pointer-events-none" />
          </div>
          <div className="w-0.5 h-3 bg-blue-600 pointer-events-none" />
          {isRotating && (
            <span className="absolute -top-6 bg-[#0B1B3D] text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow whitespace-nowrap">
              {el.rotation || 0}&deg;
            </span>
          )}
        </div>

        {/* 8 Resize Handles - All circular white dots with drop shadow & comfortable touch area */}
        {/* NW */}
        <div
          onMouseDown={(e) => handleResizeStart(e, 'nw')}
          onTouchStart={(e) => handleResizeStart(e, 'nw')}
          className="absolute -top-2 -left-2 w-4 h-4 bg-white border-2 border-blue-600 rounded-full cursor-nwse-resize shadow-md hover:scale-125 pointer-events-auto z-20"
        />
        {/* N */}
        <div
          onMouseDown={(e) => handleResizeStart(e, 'n')}
          onTouchStart={(e) => handleResizeStart(e, 'n')}
          className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-2 border-blue-600 rounded-full cursor-ns-resize shadow-md hover:scale-125 pointer-events-auto z-20"
        />
        {/* NE */}
        <div
          onMouseDown={(e) => handleResizeStart(e, 'ne')}
          onTouchStart={(e) => handleResizeStart(e, 'ne')}
          className="absolute -top-2 -right-2 w-4 h-4 bg-white border-2 border-blue-600 rounded-full cursor-nesw-resize shadow-md hover:scale-125 pointer-events-auto z-20"
        />
        {/* E */}
        <div
          onMouseDown={(e) => handleResizeStart(e, 'e')}
          onTouchStart={(e) => handleResizeStart(e, 'e')}
          className="absolute top-1/2 -right-2 -translate-y-1/2 w-4 h-4 bg-white border-2 border-blue-600 rounded-full cursor-ew-resize shadow-md hover:scale-125 pointer-events-auto z-20"
        />
        {/* SE */}
        <div
          onMouseDown={(e) => handleResizeStart(e, 'se')}
          onTouchStart={(e) => handleResizeStart(e, 'se')}
          className="absolute -bottom-2 -right-2 w-4 h-4 bg-white border-2 border-blue-600 rounded-full cursor-nwse-resize shadow-md hover:scale-125 pointer-events-auto z-20"
        />
        {/* S */}
        <div
          onMouseDown={(e) => handleResizeStart(e, 's')}
          onTouchStart={(e) => handleResizeStart(e, 's')}
          className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-2 border-blue-600 rounded-full cursor-ns-resize shadow-md hover:scale-125 pointer-events-auto z-20"
        />
        {/* SW */}
        <div
          onMouseDown={(e) => handleResizeStart(e, 'sw')}
          onTouchStart={(e) => handleResizeStart(e, 'sw')}
          className="absolute -bottom-2 -left-2 w-4 h-4 bg-white border-2 border-blue-600 rounded-full cursor-nesw-resize shadow-md hover:scale-125 pointer-events-auto z-20"
        />
        {/* W */}
        <div
          onMouseDown={(e) => handleResizeStart(e, 'w')}
          onTouchStart={(e) => handleResizeStart(e, 'w')}
          className="absolute top-1/2 -left-2 -translate-y-1/2 w-4 h-4 bg-white border-2 border-blue-600 rounded-full cursor-ew-resize shadow-md hover:scale-125 pointer-events-auto z-20"
        />

        {/* Floating Quick Action Mini-Bar on Top-Right */}
        <div
          className="absolute -top-10 right-0 flex items-center gap-1 bg-[#0B1B3D] text-white rounded-lg shadow-xl px-1.5 py-1 pointer-events-auto z-30 border border-slate-700/60"
          onClick={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
        >
          {el.type === 'image' && (
            <button
              type="button"
              onClick={() => {
                imageActionTypeRef.current = 'replace';
                imageInputRef.current?.click();
              }}
              className="p-1 hover:bg-white/20 rounded text-slate-200 hover:text-white transition-colors"
              title="Replace Photo / Image"
            >
              <ImageIcon className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            type="button"
            onClick={() => handleDuplicateElement(el.id)}
            className="p-1 hover:bg-white/20 rounded text-slate-200 hover:text-white transition-colors"
            title="Duplicate (Clone)"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => handleRotateElement90(el.id)}
            className="p-1 hover:bg-white/20 rounded text-slate-200 hover:text-white transition-colors"
            title="Rotate +90°"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
              setContextMenu({
                isOpen: true,
                elementId: el.id,
                x: rect.left,
                y: rect.bottom + 5,
              });
            }}
            className="p-1 hover:bg-white/20 rounded text-slate-200 hover:text-white transition-colors"
            title="More Options / Long-press Menu"
          >
            <MoreHorizontal className="w-3.5 h-3.5" />
          </button>
          <div className="w-px h-3 bg-white/20" />
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteSelected();
            }}
            className="p-1 hover:bg-rose-600/80 rounded text-rose-300 hover:text-white transition-colors"
            title="Delete"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 h-[100dvh] w-screen flex flex-col bg-slate-900 shadow-2xl overflow-hidden text-slate-800 antialiased select-none">
      {/* 1. TOP HEADER & MAIN ACTION BAR */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 px-3 sm:px-6 py-2.5 flex items-center justify-between gap-2 shadow-2xs">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <button
            type="button"
            onClick={onBack}
            className="p-1.5 sm:p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors flex items-center gap-1.5 text-xs font-bold cursor-pointer"
            title="Exit Editor"
          >
            <ArrowLeft className="w-4 h-4 text-slate-700" />
            <span className="hidden sm:inline">Exit Editor</span>
          </button>

          <Link
            href="/"
            prefetch={true}
            className="p-1.5 sm:p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors flex items-center gap-1.5 text-xs font-bold cursor-pointer"
            title="Back to Homepage"
          >
            <Home className="w-4 h-4 text-slate-700" />
            <span className="hidden sm:inline">Homepage</span>
          </Link>

          <div className="h-5 w-px bg-slate-200 hidden sm:block" />

          {/* Document name & page info */}
          <div className="min-w-0">
            <h1 className="text-xs sm:text-sm font-extrabold text-[#0B1B3D] truncate max-w-[130px] sm:max-w-xs">
              {activePdfFile.name}
            </h1>
            <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-semibold">
              <span>
                Page {currentPageIndex + 1} of {pages.length}
              </span>
              <span className="hidden sm:inline">&bull; 100% Free &amp; Private</span>
            </div>
          </div>
        </div>

        {/* Center / Right controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Mobile Pages Drawer Trigger */}
          <button
            type="button"
            onClick={() => setMobileSidebarOpen(true)}
            className="md:hidden flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 text-xs font-bold active:bg-slate-100"
          >
            <Layers className="w-3.5 h-3.5 text-blue-600" />
            <span>Pages ({pages.length})</span>
          </button>

          {/* Save & Download CTA */}
          <button
            type="button"
            onClick={handleSaveAndDownload}
            disabled={isSaving}
            className="inline-flex items-center justify-center gap-1.5 sm:gap-2 px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-[#0B1B3D] hover:bg-[#122754] text-white font-extrabold text-xs sm:text-sm transition-all shadow-md shadow-[#0B1B3D]/15 active:scale-98 disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Compiling...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4 text-lime-400 stroke-[2.5]" />
                <span className="hidden xs:inline">Save &amp; </span>
                <span>Download</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* 2. COMPREHENSIVE OFFICE-STYLE TOOLBAR (Horizontal Scrollable) */}
      <div className="bg-white border-b border-slate-200 px-2 sm:px-6 py-1.5 flex items-center gap-1 sm:gap-2 overflow-x-auto scrollbar-none z-30 shadow-2xs">
        
        {/* Tool Mode: Pointer / Select */}
        <button
          type="button"
          onClick={() => setActiveTool('select')}
          className={`p-1.5 sm:p-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1 flex-shrink-0 ${
            activeTool === 'select'
              ? 'bg-[#0B1B3D] text-white shadow-xs'
              : 'text-slate-700 hover:bg-slate-100'
          }`}
          title="Select & Move Objects"
        >
          <MousePointer className="w-4 h-4" />
          <span className="hidden sm:inline">Select</span>
        </button>

        {/* Text Tool */}
        <button
          type="button"
          onClick={() => setActiveTool('text')}
          className={`p-1.5 sm:p-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1 flex-shrink-0 ${
            activeTool === 'text'
              ? 'bg-[#0B1B3D] text-white shadow-xs'
              : 'text-slate-700 hover:bg-slate-100'
          }`}
          title="Add Text (or Click Existing PDF Text to Edit)"
        >
          <Type className="w-4 h-4" />
          <span>Text</span>
        </button>

        {/* Edit All Text Button (User Requested) */}
        <button
          type="button"
          onClick={handleMakeAllTextEditable}
          className="p-1.5 sm:p-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1 flex-shrink-0 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200"
          title="Convert all page text lines into editable text boxes"
        >
          <Sparkles className="w-3.5 h-3.5 text-blue-600" />
          <span className="hidden sm:inline">Edit All Text</span>
        </button>

        {/* Eraser / Whiteout Tool */}
        <button
          type="button"
          onClick={() => {
            setActiveTool('eraser');
            setEraserOpen(!eraserOpen);
            setPencilOpen(false);
            setShapesOpen(false);
            setFontColorOpen(false);
            setHighlighterOpen(false);
            setTableModalOpen(false);
            setNumberingOpen(false);
            setSignatureModalOpen(false);
            setCommentModalOpen(false);
            setElementOptionsOpen(false);
          }}
          className={`p-1.5 sm:p-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1 flex-shrink-0 ${
            activeTool === 'eraser' || eraserOpen
              ? 'bg-rose-600 text-white shadow-xs'
              : 'text-slate-700 hover:bg-slate-100'
          }`}
          title="Real Full Eraser & Whiteout (Click elements, sweep over drawings, or drag box)"
        >
          <Eraser className="w-4 h-4 text-rose-500" />
          <span>Eraser</span>
          <ChevronDown className="w-3 h-3 text-slate-400" />
        </button>

        {/* Freehand Pen / Draw (IMG_20261102_125604.jpg) */}
        <button
          type="button"
          onClick={() => {
            setActiveTool('draw');
            setPencilOpen(!pencilOpen);
            setEraserOpen(false);
            setShapesOpen(false);
            setFontColorOpen(false);
            setHighlighterOpen(false);
            setTableModalOpen(false);
            setNumberingOpen(false);
            setSignatureModalOpen(false);
            setCommentModalOpen(false);
            setElementOptionsOpen(false);
          }}
          className={`p-1.5 sm:p-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 flex-shrink-0 ${
            activeTool === 'draw' || pencilOpen
              ? 'bg-[#0B1B3D] text-white shadow-xs'
              : 'text-slate-700 hover:bg-slate-100'
          }`}
          title="Pencil / Draw Options (Colors & Stroke Width)"
        >
          <Pencil className="w-4 h-4" />
          <span
            style={{ backgroundColor: pencilColor }}
            className="w-3 h-2 rounded-xs border border-white/50"
          />
          <span className="hidden sm:inline">Draw</span>
          <ChevronDown className="w-3 h-3 text-slate-400" />
        </button>

        {/* Microsoft Word Shapes Gallery Button (IMG_20261102_125537.png) */}
        <button
          type="button"
          onClick={() => {
            setShapesOpen(!shapesOpen);
            setPencilOpen(false);
            setEraserOpen(false);
            setFontColorOpen(false);
            setHighlighterOpen(false);
            setSignatureModalOpen(false);
            setCommentModalOpen(false);
            setNumberingOpen(false);
            setElementOptionsOpen(false);
            setTableModalOpen(false);
          }}
          className={`p-1.5 sm:p-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1 flex-shrink-0 ${
            activeTool === 'shape' || shapesOpen
              ? 'bg-[#0B1B3D] text-white shadow-xs'
              : 'text-slate-700 hover:bg-slate-100'
          }`}
          title="Shapes Library (Full Microsoft Word Catalog)"
        >
          <Square className="w-4 h-4" />
          <span className="hidden md:inline">Shapes</span>
          <ChevronDown className="w-3 h-3 text-slate-400" />
        </button>

        {/* Blank Table Option (Screenshot_2026-11-02-12-52-30-02_40deb401b9ffe8e1df2f1cc5ba480b12.jpg) */}
        <button
          type="button"
          onClick={() => {
            setTableModalOpen(!tableModalOpen);
            setShapesOpen(false);
            setPencilOpen(false);
            setEraserOpen(false);
            setFontColorOpen(false);
            setHighlighterOpen(false);
            setSignatureModalOpen(false);
            setCommentModalOpen(false);
            setNumberingOpen(false);
            setElementOptionsOpen(false);
          }}
          className={`p-1.5 sm:p-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1 flex-shrink-0 ${
            activeTool === 'table' || selectedElement?.type === 'table' || tableModalOpen
              ? 'bg-[#0B1B3D] text-white shadow-xs'
              : 'text-slate-700 hover:bg-slate-100'
          }`}
          title="Insert Blank Table (MS Word Style)"
        >
          <TableIcon className="w-4 h-4 text-blue-600" />
          <span>Table</span>
          <ChevronDown className="w-3 h-3 text-slate-400" />
        </button>

        {/* Image Tool */}
        <button
          type="button"
          onClick={() => imageInputRef.current?.click()}
          className="p-1.5 sm:p-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100 transition-all flex items-center gap-1 flex-shrink-0"
          title="Insert PNG/JPG Image or Logo"
        >
          <ImagePlus className="w-4 h-4 text-emerald-600" />
          <span className="hidden sm:inline">Image</span>
        </button>
        <input
          ref={imageInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          onChange={handleImageFileChange}
          className="hidden"
        />

        {/* Electronic Signature Option */}
        <button
          type="button"
          onClick={() => {
            setSignatureModalOpen(!signatureModalOpen);
            setShapesOpen(false);
            setFontColorOpen(false);
            setHighlighterOpen(false);
            setNumberingOpen(false);
            setCommentModalOpen(false);
            setElementOptionsOpen(false);
          }}
          className={`p-1.5 sm:p-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1 flex-shrink-0 ${
            signatureModalOpen ? 'bg-[#0B1B3D] text-white shadow-xs' : 'text-slate-700 hover:bg-slate-100'
          }`}
          title="Electronic Signature (Draw, Type Cursive, Upload Signature)"
        >
          <FileSignature className="w-4 h-4 text-indigo-600" />
          <span className="hidden sm:inline">E-Sign</span>
        </button>

        {/* Comment / Sticky Note Option */}
        <button
          type="button"
          onClick={() => {
            setCommentModalOpen(!commentModalOpen);
            setShapesOpen(false);
            setFontColorOpen(false);
            setHighlighterOpen(false);
            setNumberingOpen(false);
            setSignatureModalOpen(false);
            setElementOptionsOpen(false);
            setPageToolsOpen(false);
          }}
          className={`p-1.5 sm:p-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1 flex-shrink-0 ${
            commentModalOpen ? 'bg-[#0B1B3D] text-white shadow-xs' : 'text-slate-700 hover:bg-slate-100'
          }`}
          title="Add Comment / Sticky Note (MS Word Style)"
        >
          <MessageSquarePlus className="w-4 h-4 text-amber-600" />
          <span className="hidden sm:inline">Comment</span>
        </button>

        {/* Page Tools Dropdown (Merge, Split, Delete, Extract as JPG/PNG, Add Pages) */}
        <button
          type="button"
          onClick={() => {
            setPageToolsOpen(!pageToolsOpen);
            setShapesOpen(false);
            setPencilOpen(false);
            setEraserOpen(false);
            setFontColorOpen(false);
            setHighlighterOpen(false);
            setTableModalOpen(false);
            setNumberingOpen(false);
            setSignatureModalOpen(false);
            setCommentModalOpen(false);
            setElementOptionsOpen(false);
          }}
          className={`p-1.5 sm:p-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1 flex-shrink-0 ${
            pageToolsOpen ? 'bg-[#0B1B3D] text-white shadow-xs' : 'bg-blue-50 text-blue-800 hover:bg-blue-100 border border-blue-200'
          }`}
          title="Page Tools: Merge PDF, Split PDF, Delete Pages, Extract as JPG/PNG, Add Pages"
        >
          <Files className="w-4 h-4 text-blue-600" />
          <span>Page Tools</span>
          <ChevronDown className="w-3 h-3 text-slate-400" />
        </button>

        <input
          ref={mergeInputRef}
          type="file"
          accept="application/pdf"
          multiple
          onChange={handleMergePdfFiles}
          className="hidden"
        />

        <div className="h-5 w-px bg-slate-200 flex-shrink-0 mx-0.5" />

        {/* 3. TYPOGRAPHY & FORMATTING CONTROLS */}
        
        {/* Font Family Dropdown - 50+ Curated Fonts for All Purposes */}
        <select
          value={fontFamily}
          onChange={(e) => {
            const val = e.target.value;
            setFontFamily(val);
            updateSelectedElement({ fontFamily: val });
          }}
          className="h-8 px-2 rounded-lg border border-slate-200 bg-white text-xs font-bold text-slate-700 focus:outline-hidden focus:border-blue-500 flex-shrink-0 cursor-pointer max-w-[130px] sm:max-w-[170px]"
          title="Font Family (50+ Fonts for All Purposes)"
        >
          {['Sans-Serif', 'Serif', 'Cursive & Script', 'Display', 'Monospace'].map((cat) => (
            <optgroup key={cat} label={`── ${cat} ──`}>
              {FONT_LIBRARY.filter((f) => f.category === cat).map((f) => (
                <option key={f.id} value={f.id} style={{ fontFamily: f.family }}>
                  {f.name}
                </option>
              ))}
            </optgroup>
          ))}
        </select>

        {/* Font Size Dropdown */}
        <select
          value={fontSize}
          onChange={(e) => {
            const val = Number(e.target.value);
            setFontSize(val);
            updateSelectedElement({ fontSize: val });
          }}
          className="h-8 px-1.5 rounded-lg border border-slate-200 bg-white text-xs font-bold text-slate-700 focus:outline-hidden focus:border-blue-500 flex-shrink-0 cursor-pointer w-14"
        >
          {[10, 11, 12, 14, 16, 18, 20, 24, 28, 32, 36, 48, 64].map((sz) => (
            <option key={sz} value={sz}>
              {sz}
            </option>
          ))}
        </select>

        {/* Step Up Font Size (A^) */}
        <button
          type="button"
          onClick={() => {
            const nextSz = Math.min(72, fontSize + 2);
            setFontSize(nextSz);
            updateSelectedElement({ fontSize: nextSz });
          }}
          className="p-1 sm:p-1.5 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors flex items-center font-bold text-xs"
          title="Increase Font Size (A^)"
        >
          <span className="text-xs">A</span>
          <span className="text-[10px] text-blue-600 font-extrabold">&and;</span>
        </button>

        {/* Step Down Font Size (Av) */}
        <button
          type="button"
          onClick={() => {
            const nextSz = Math.max(8, fontSize - 2);
            setFontSize(nextSz);
            updateSelectedElement({ fontSize: nextSz });
          }}
          className="p-1 sm:p-1.5 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors flex items-center font-bold text-xs"
          title="Decrease Font Size (Av)"
        >
          <span className="text-xs">A</span>
          <span className="text-[10px] text-blue-600 font-extrabold">&or;</span>
        </button>

        {/* Bold (B) */}
        <button
          type="button"
          onClick={() => {
            setIsBold(!isBold);
            updateSelectedElement({ isBold: !isBold });
          }}
          className={`p-1.5 rounded-lg text-xs font-black transition-colors ${
            isBold ? 'bg-slate-900 text-white' : 'text-slate-700 hover:bg-slate-100'
          }`}
          title="Bold (Ctrl+B)"
        >
          <Bold className="w-3.5 h-3.5" />
        </button>

        {/* Italic (I) */}
        <button
          type="button"
          onClick={() => {
            setIsItalic(!isItalic);
            updateSelectedElement({ isItalic: !isItalic });
          }}
          className={`p-1.5 rounded-lg text-xs font-bold transition-colors ${
            isItalic ? 'bg-slate-900 text-white' : 'text-slate-700 hover:bg-slate-100'
          }`}
          title="Italic (Ctrl+I)"
        >
          <Italic className="w-3.5 h-3.5" />
        </button>

        {/* Underline (U) */}
        <button
          type="button"
          onClick={() => {
            setIsUnderline(!isUnderline);
            updateSelectedElement({ isUnderline: !isUnderline });
          }}
          className={`p-1.5 rounded-lg text-xs font-bold transition-colors ${
            isUnderline ? 'bg-slate-900 text-white' : 'text-slate-700 hover:bg-slate-100'
          }`}
          title="Underline (Ctrl+U)"
        >
          <Underline className="w-3.5 h-3.5" />
        </button>

        {/* Real Ink Highlighter Tool */}
        <button
          type="button"
          onClick={() => {
            setActiveTool('highlight');
            setHighlighterOpen(!highlighterOpen);
            setShapesOpen(false);
            setFontColorOpen(false);
            setNumberingOpen(false);
            setSignatureModalOpen(false);
            setCommentModalOpen(false);
            setElementOptionsOpen(false);
          }}
          className={`p-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 flex-shrink-0 ${
            activeTool === 'highlight' || highlighterOpen
              ? 'bg-amber-100 text-amber-950 ring-2 ring-amber-400 font-extrabold shadow-xs'
              : 'text-slate-700 hover:bg-slate-100'
          }`}
          title="Text Highlight Color (Word Style)"
        >
          <Highlighter className="w-4 h-4 text-amber-600" />
          <span
            style={{ backgroundColor: highlightColor }}
            className="w-3 h-2 rounded-xs border border-amber-500 shadow-2xs"
          />
          <ChevronDown className="w-3 h-3 text-slate-400" />
        </button>

        {/* Text Color Button with Chevron (IMG_20261102_110355.jpg) */}
        <button
          type="button"
          onClick={() => {
            setFontColorOpen(!fontColorOpen);
            setNumberingOpen(false);
            setShapesOpen(false);
            setHighlighterOpen(false);
            setSignatureModalOpen(false);
            setCommentModalOpen(false);
            setElementOptionsOpen(false);
          }}
          className={`p-1.5 sm:p-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1 flex-shrink-0 ${
            fontColorOpen ? 'bg-[#0B1B3D] text-white shadow-xs' : 'text-slate-700 hover:bg-slate-100'
          }`}
          title="Color Palette (MS Word Theme & Standard Colors)"
        >
          <div className="flex flex-col items-center justify-center">
            <span className="text-xs font-extrabold leading-none">A</span>
            <span
              style={{ backgroundColor: textColor }}
              className="w-3.5 h-1 rounded-full mt-0.5"
            />
          </div>
          <ChevronDown className="w-3 h-3 text-slate-400" />
        </button>

        {/* Numbering & Roman Letters Button (IMG_20261102_110437.jpg) */}
        <button
          type="button"
          onClick={() => {
            setNumberingOpen(!numberingOpen);
            setFontColorOpen(false);
            setShapesOpen(false);
            setHighlighterOpen(false);
            setSignatureModalOpen(false);
            setCommentModalOpen(false);
            setElementOptionsOpen(false);
          }}
          className={`p-1.5 sm:p-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1 flex-shrink-0 ${
            numberingOpen ? 'bg-[#0B1B3D] text-white shadow-xs' : 'text-slate-700 hover:bg-slate-100'
          }`}
          title="Numbering Library (1. 2. 3., A. B. C., I. II. III., Bullets)"
        >
          <ListOrdered className="w-4 h-4 text-blue-600" />
          <span className="hidden md:inline">Numbering</span>
          <ChevronDown className="w-3 h-3 text-slate-400" />
        </button>

        {/* Text Alignment (Left, Center, Right) */}
        <div className="flex items-center gap-0.5 bg-slate-100 p-0.5 rounded-lg flex-shrink-0">
          <button
            type="button"
            onClick={() => {
              setTextAlign('left');
              updateSelectedElement({ textAlign: 'left' });
            }}
            className={`p-1 rounded-md text-xs transition-colors ${
              textAlign === 'left' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-600'
            }`}
            title="Align Left"
          >
            <AlignLeft className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => {
              setTextAlign('center');
              updateSelectedElement({ textAlign: 'center' });
            }}
            className={`p-1 rounded-md text-xs transition-colors ${
              textAlign === 'center' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-600'
            }`}
            title="Align Center"
          >
            <AlignCenter className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => {
              setTextAlign('right');
              updateSelectedElement({ textAlign: 'right' });
            }}
            className={`p-1 rounded-md text-xs transition-colors ${
              textAlign === 'right' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-600'
            }`}
            title="Align Right"
          >
            <AlignRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Heading Style Dropdown */}
        <select
          value={headingStyle}
          onChange={(e) => {
            const val = e.target.value as any;
            setHeadingStyle(val);
            let newSz = fontSize;
            let newBold = isBold;
            if (val === 'h1') {
              newSz = 28;
              newBold = true;
            } else if (val === 'h2') {
              newSz = 22;
              newBold = true;
            } else if (val === 'h3') {
              newSz = 18;
              newBold = true;
            } else if (val === 'subtitle') {
              newSz = 13;
              newBold = false;
            }
            setFontSize(newSz);
            setIsBold(newBold);
            updateSelectedElement({
              headingStyle: val,
              fontSize: newSz,
              isBold: newBold,
            });
          }}
          className="h-8 px-2 rounded-lg border border-slate-200 bg-white text-xs font-bold text-slate-700 focus:outline-hidden focus:border-blue-500 flex-shrink-0 cursor-pointer hidden md:block"
        >
          <option value="normal">Normal Text</option>
          <option value="h1">Heading 1</option>
          <option value="h2">Heading 2</option>
          <option value="h3">Heading 3</option>
          <option value="subtitle">Subtitle</option>
        </select>

        <div className="h-5 w-px bg-slate-200 flex-shrink-0 mx-0.5" />

        {/* Undo / Redo */}
        <button
          type="button"
          onClick={handleUndo}
          disabled={historyIndex < 0}
          className="p-1.5 rounded-lg text-slate-700 hover:bg-slate-100 disabled:opacity-30 transition-colors"
          title="Undo"
        >
          <Undo2 className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={handleRedo}
          disabled={historyIndex >= history.length - 1}
          className="p-1.5 rounded-lg text-slate-700 hover:bg-slate-100 disabled:opacity-30 transition-colors"
          title="Redo"
        >
          <Redo2 className="w-3.5 h-3.5" />
        </button>

        {/* Selected Element Options Pop-up Button */}
        {selectedElement && (
          <button
            type="button"
            onClick={() => {
              setElementOptionsOpen(!elementOptionsOpen);
              setFontColorOpen(false);
              setShapesOpen(false);
              setHighlighterOpen(false);
              setNumberingOpen(false);
            }}
            className={`p-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 ${
              elementOptionsOpen ? 'bg-[#0B1B3D] text-white shadow-xs' : 'text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200'
            }`}
            title="Selected Element Options (Arrange, Duplicate, Opacity, Rotate)"
          >
            <Settings2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Options</span>
          </button>
        )}

        {/* Delete Selected Item */}
        {selectedElementId && (
          <button
            type="button"
            onClick={handleDeleteSelected}
            className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors flex items-center gap-1 text-xs font-bold"
            title="Delete Selected Item"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Delete</span>
          </button>
        )}

        {/* Zoom Controls */}
        <div className="flex items-center gap-1 border-l border-slate-200 pl-2 ml-auto flex-shrink-0">
          <button
            type="button"
            onClick={() => setZoom((z) => Math.max(40, z - 15))}
            className="p-1 rounded-lg text-slate-600 hover:bg-slate-100"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="text-[11px] font-bold text-slate-600 w-9 text-center">
            {zoom}%
          </span>
          <button
            type="button"
            onClick={() => setZoom((z) => Math.min(200, z + 15))}
            className="p-1 rounded-lg text-slate-600 hover:bg-slate-100"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => {
              if (typeof window !== 'undefined') {
                const screenW = window.innerWidth;
                const fitZoom = Math.min(100, Math.max(45, Math.floor(((screenW - 20) / 595) * 100)));
                setZoom(fitZoom);
              }
            }}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 text-[11px] font-bold hidden sm:inline"
            title="Fit to Screen"
          >
            Fit
          </button>
        </div>

      </div>

      {/* 2.5 WORD-STYLE SHAPE & ELEMENT FORMATTING RIBBON WHEN ELEMENT SELECTED */}
      {selectedElement && !shapesOpen && !fontColorOpen && !highlighterOpen && !signatureModalOpen && !commentModalOpen && (
        <div className="bg-slate-50 border-b border-slate-200 px-3 sm:px-6 py-2 flex items-center gap-3 overflow-x-auto scrollbar-none z-35 shadow-inner text-xs transition-all">

          {/* E. Word-Style Shape & Element Formatting Ribbon when element selected */}
          {selectedElement && !shapesOpen && !fontColorOpen && !highlighterOpen && (
            <div className="flex items-center gap-2.5 flex-nowrap flex-shrink-0">
              <span className="font-bold text-[#0B1B3D] bg-blue-100/70 text-blue-900 px-2 py-0.5 rounded text-[11px] uppercase tracking-wider flex items-center gap-1">
                {selectedElement.type === 'rectangle' ? (
                  <Square className="w-3.5 h-3.5" />
                ) : selectedElement.type === 'circle' ? (
                  <Circle className="w-3.5 h-3.5" />
                ) : selectedElement.type === 'line' ? (
                  <Minus className="w-3.5 h-3.5" />
                ) : selectedElement.type === 'text' ? (
                  <Type className="w-3.5 h-3.5" />
                ) : (
                  <Settings2 className="w-3.5 h-3.5" />
                )}
                <span>{selectedElement.type.toUpperCase()} FORMAT</span>
              </span>

              {/* For Shapes: Fill Color, Stroke Color, Stroke Width, Rotate */}
              {(selectedElement.type === 'rectangle' || selectedElement.type === 'circle') && (
                <>
                  {/* Fill Color */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] text-slate-600 font-bold">Fill:</span>
                    <button
                      type="button"
                      onClick={() => updateSelectedElement({ fillColor: 'transparent' })}
                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${
                        selectedElement.fillColor === 'transparent' || !selectedElement.fillColor
                          ? 'border-blue-600 bg-blue-50 text-blue-700'
                          : 'border-slate-300 bg-white text-slate-600'
                      }`}
                    >
                      None
                    </button>
                    {['#ffffff', '#fef08a', '#bbf7d0', '#bae6fd', '#fbcfe8', '#0B1B3D'].map((bg) => (
                      <button
                        key={bg}
                        type="button"
                        onClick={() => updateSelectedElement({ fillColor: bg })}
                        style={{ backgroundColor: bg }}
                        className={`w-4 h-4 rounded-full border ${
                          selectedElement.fillColor === bg ? 'border-blue-600 ring-2 ring-blue-300' : 'border-slate-300'
                        }`}
                      />
                    ))}
                    <input
                      type="color"
                      value={selectedElement.fillColor && selectedElement.fillColor !== 'transparent' ? selectedElement.fillColor : '#ffffff'}
                      onChange={(e) => updateSelectedElement({ fillColor: e.target.value })}
                      className="w-4 h-4 p-0 border-0 rounded cursor-pointer"
                      title="Custom fill color"
                    />
                  </div>

                  <div className="h-4 w-px bg-slate-200" />

                  {/* Outline Color */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] text-slate-600 font-bold">Outline:</span>
                    {['#000000', '#2563eb', '#16a34a', '#dc2626', '#eab308'].map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => updateSelectedElement({ color: c })}
                        style={{ backgroundColor: c }}
                        className={`w-4 h-4 rounded-full border ${
                          selectedElement.color === c ? 'border-blue-600 ring-2 ring-blue-300' : 'border-slate-300'
                        }`}
                      />
                    ))}
                    <input
                      type="color"
                      value={selectedElement.color || '#000000'}
                      onChange={(e) => updateSelectedElement({ color: e.target.value })}
                      className="w-4 h-4 p-0 border-0 rounded cursor-pointer"
                      title="Custom outline color"
                    />
                  </div>

                  <div className="h-4 w-px bg-slate-200" />

                  {/* Stroke Width */}
                  <div className="flex items-center gap-1">
                    <span className="text-[11px] text-slate-600 font-bold">Thickness:</span>
                    {[1, 2, 4, 6].map((w) => (
                      <button
                        key={w}
                        type="button"
                        onClick={() => updateSelectedElement({ strokeWidth: w })}
                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${
                          (selectedElement.strokeWidth || 2) === w
                            ? 'border-blue-600 bg-blue-50 text-blue-700'
                            : 'border-slate-300 bg-white text-slate-600'
                        }`}
                      >
                        {w}px
                      </button>
                    ))}
                  </div>
                </>
              )}

              {/* For Line */}
              {selectedElement.type === 'line' && (
                <>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] text-slate-600 font-bold">Color:</span>
                    {['#000000', '#2563eb', '#16a34a', '#dc2626'].map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => updateSelectedElement({ color: c })}
                        style={{ backgroundColor: c }}
                        className={`w-4 h-4 rounded-full border ${
                          selectedElement.color === c ? 'border-blue-600 ring-2 ring-blue-300' : 'border-slate-300'
                        }`}
                      />
                    ))}
                    <input
                      type="color"
                      value={selectedElement.color || '#000000'}
                      onChange={(e) => updateSelectedElement({ color: e.target.value })}
                      className="w-4 h-4 p-0 border-0 rounded cursor-pointer"
                    />
                  </div>

                  <div className="h-4 w-px bg-slate-200" />

                  <div className="flex items-center gap-1">
                    <span className="text-[11px] text-slate-600 font-bold">Thickness:</span>
                    {[1, 2, 3, 5, 8].map((w) => (
                      <button
                        key={w}
                        type="button"
                        onClick={() => updateSelectedElement({ strokeWidth: w })}
                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${
                          (selectedElement.strokeWidth || 3) === w
                            ? 'border-blue-600 bg-blue-50 text-blue-700'
                            : 'border-slate-300 bg-white text-slate-600'
                        }`}
                      >
                        {w}px
                      </button>
                    ))}
                  </div>
                </>
              )}

              {/* Rotation Actions */}
              <div className="h-4 w-px bg-slate-200" />
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => {
                    const nextRot = ((selectedElement.rotation || 0) + 90) % 360;
                    updateSelectedElement({ rotation: nextRot });
                  }}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 font-bold text-[11px]"
                  title="Rotate 90 Degrees Clockwise"
                >
                  <RotateCw className="w-3.5 h-3.5 text-blue-600" />
                  <span>+90&deg;</span>
                </button>
                {selectedElement.rotation ? (
                  <button
                    type="button"
                    onClick={() => updateSelectedElement({ rotation: 0 })}
                    className="px-2 py-1 rounded bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 font-bold text-[10px]"
                    title="Reset Rotation to 0"
                  >
                    Reset (0&deg;)
                  </button>
                ) : null}
              </div>

              {/* Duplicate & Delete */}
              <div className="h-4 w-px bg-slate-200" />
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => {
                    const dup: EditorElement = {
                      ...selectedElement,
                      id: `${selectedElement.type}-${Date.now()}`,
                      x: selectedElement.x + 20,
                      y: selectedElement.y + 20,
                    };
                    const updated = [...elements, dup];
                    setElements(updated);
                    pushHistory(updated);
                    setSelectedElementId(dup.id);
                  }}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 font-bold text-[11px]"
                  title="Duplicate Element"
                >
                  <Copy className="w-3.5 h-3.5 text-slate-600" />
                  <span>Duplicate</span>
                </button>
                <button
                  type="button"
                  onClick={handleDeleteSelected}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 font-bold text-[11px]"
                  title="Delete Element"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ERROR ALERT */}
      {errorMessage && (
        <div className="bg-rose-50 border-b border-rose-200 text-rose-800 text-xs px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button onClick={() => setErrorMessage(null)} className="font-bold text-rose-700 text-base">
            &times;
          </button>
        </div>
      )}

      {/* 4. MAIN WORKSPACE WITH DESKTOP SIDEBAR & CENTER CANVAS */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* DESKTOP Left Page Manager Panel with REAL PDF THUMBNAILS */}
        <aside className="hidden md:flex w-44 bg-white border-r border-slate-200 p-2.5 flex-col gap-2.5 overflow-y-auto flex-shrink-0">
          <div className="flex items-center justify-between text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
            <span>Pages</span>
            <span className="text-slate-700 font-bold">{pages.length}</span>
          </div>

          <div className="flex flex-col gap-1.5">
            <button
              type="button"
              onClick={handleAddBlankPage}
              className="w-full flex items-center justify-center gap-1.5 py-1.5 px-2 bg-blue-50 text-blue-700 rounded-xl text-xs font-bold hover:bg-blue-100 transition-colors shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" /> Add Blank Page
            </button>

            <button
              type="button"
              onClick={() => mergeInputRef.current?.click()}
              className="w-full flex items-center justify-center gap-1.5 py-1.5 px-2 bg-indigo-50 text-indigo-700 rounded-xl text-xs font-bold hover:bg-indigo-100 transition-colors shadow-2xs"
              title="Merge Another PDF File into This Document"
            >
              <FilePlus className="w-3.5 h-3.5" /> Merge PDF
            </button>

            <div className="grid grid-cols-2 gap-1">
              <button
                type="button"
                onClick={() => setSplitModalOpen(true)}
                className="flex items-center justify-center gap-1 py-1.5 px-1 bg-slate-100 text-slate-700 rounded-lg text-[11px] font-bold hover:bg-slate-200 transition-colors"
                title="Split & Extract Pages as PDF"
              >
                <Scissors className="w-3 h-3 text-purple-600" /> Split
              </button>
              <button
                type="button"
                onClick={() => setExtractModalOpen(true)}
                className="flex items-center justify-center gap-1 py-1.5 px-1 bg-slate-100 text-slate-700 rounded-lg text-[11px] font-bold hover:bg-slate-200 transition-colors"
                title="Extract Page as JPG or PNG"
              >
                <ImageIcon className="w-3 h-3 text-emerald-600" /> To Image
              </button>
            </div>

            <div className="grid grid-cols-2 gap-1">
              <button
                type="button"
                onClick={handleDuplicatePage}
                className="flex-1 flex items-center justify-center gap-1 py-1 px-1 bg-slate-100 text-slate-700 rounded-lg text-[11px] font-bold hover:bg-slate-200 transition-colors"
                title="Duplicate Current Page"
              >
                <Copy className="w-3 h-3" /> Duplicate
              </button>
              <button
                type="button"
                onClick={handleDeletePage}
                disabled={pages.length <= 1}
                className="flex-1 flex items-center justify-center gap-1 py-1 px-1 bg-rose-50 text-rose-700 rounded-lg text-[11px] font-bold hover:bg-rose-100 disabled:opacity-40 transition-colors"
                title="Delete Current Page"
              >
                <Trash2 className="w-3 h-3" /> Delete
              </button>
            </div>
          </div>

          <div className="space-y-2 mt-1">
            {pages.map((p, idx) => (
              <div
                key={p.id}
                onClick={() => setCurrentPageIndex(idx)}
                className={`cursor-pointer rounded-xl p-1.5 transition-all text-center border-2 ${
                  currentPageIndex === idx
                    ? 'border-[#0B1B3D] bg-blue-50/50 shadow-xs ring-2 ring-blue-500/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                {/* Real Rendered Page Thumbnail */}
                <div className="w-full aspect-[595/842] bg-slate-100 rounded-lg border border-slate-200 overflow-hidden flex flex-col items-center justify-center text-[10px] text-slate-400 font-bold">
                  {p.isBlank || p.originalIndex < 0 ? (
                    <div className="flex flex-col items-center justify-center h-full">
                      <span>Blank</span>
                      <span className="text-xs font-black text-slate-800">{idx + 1}</span>
                    </div>
                  ) : pageThumbnails[p.originalIndex] ? (
                    <img
                      src={pageThumbnails[p.originalIndex]}
                      alt={`Page ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full animate-pulse">
                      <span>Page</span>
                      <span className="text-xs font-black text-slate-800">{idx + 1}</span>
                    </div>
                  )}
                </div>
                <div className="mt-1 text-[10px] font-bold text-slate-600">
                  Page {idx + 1}
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* MOBILE Slide-over Page Manager Drawer with REAL PDF THUMBNAILS */}
        {mobileSidebarOpen && (
          <div className="fixed inset-0 z-50 flex md:hidden bg-black/50 backdrop-blur-xs animate-in fade-in">
            <div className="w-72 max-w-[85vw] bg-white h-full shadow-2xl flex flex-col p-4 animate-in slide-in-from-left duration-200">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-blue-600" />
                  <span className="font-extrabold text-sm text-slate-800">Pages ({pages.length})</span>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileSidebarOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="py-3 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={handleAddBlankPage}
                  className="w-full flex items-center justify-center gap-1.5 py-2 px-3 bg-blue-50 text-blue-700 rounded-xl text-xs font-bold hover:bg-blue-100"
                >
                  <Plus className="w-4 h-4" /> Add Blank Page
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMobileSidebarOpen(false);
                    mergeInputRef.current?.click();
                  }}
                  className="w-full flex items-center justify-center gap-1.5 py-2 px-3 bg-indigo-50 text-indigo-700 rounded-xl text-xs font-bold hover:bg-indigo-100"
                >
                  <FilePlus className="w-4 h-4" /> Merge PDF
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setMobileSidebarOpen(false);
                      setSplitModalOpen(true);
                    }}
                    className="flex items-center justify-center gap-1 py-1.5 px-2 bg-slate-100 text-slate-700 rounded-lg text-xs font-bold hover:bg-slate-200"
                  >
                    <Scissors className="w-3.5 h-3.5 text-purple-600" /> Split PDF
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMobileSidebarOpen(false);
                      setExtractModalOpen(true);
                    }}
                    className="flex items-center justify-center gap-1 py-1.5 px-2 bg-slate-100 text-slate-700 rounded-lg text-xs font-bold hover:bg-slate-200"
                  >
                    <ImageIcon className="w-3.5 h-3.5 text-emerald-600" /> To Image
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={handleDuplicatePage}
                    className="flex items-center justify-center gap-1 py-1.5 px-2 bg-slate-100 text-slate-700 rounded-lg text-xs font-bold"
                  >
                    <Copy className="w-3.5 h-3.5" /> Duplicate
                  </button>
                  <button
                    type="button"
                    onClick={handleDeletePage}
                    disabled={pages.length <= 1}
                    className="flex items-center justify-center gap-1 py-1.5 px-2 bg-rose-50 text-rose-700 rounded-lg text-xs font-bold disabled:opacity-40"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto space-y-2.5 pt-1">
                {pages.map((p, idx) => (
                  <div
                    key={p.id}
                    onClick={() => {
                      setCurrentPageIndex(idx);
                      setMobileSidebarOpen(false);
                    }}
                    className={`cursor-pointer rounded-xl p-2 transition-all flex items-center gap-3 border-2 ${
                      currentPageIndex === idx
                        ? 'border-[#0B1B3D] bg-blue-50 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    {/* Real Rendered Page Thumbnail */}
                    <div className="w-12 h-16 bg-slate-100 rounded-md border border-slate-200 overflow-hidden flex flex-col items-center justify-center text-[10px] text-slate-400 font-bold flex-shrink-0">
                      {p.isBlank || p.originalIndex < 0 ? (
                        <div className="flex flex-col items-center justify-center h-full">
                          <span>Blank</span>
                          <span className="text-xs font-black text-slate-800">{idx + 1}</span>
                        </div>
                      ) : pageThumbnails[p.originalIndex] ? (
                        <img
                          src={pageThumbnails[p.originalIndex]}
                          alt={`Page ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center h-full animate-pulse">
                          <span>Page</span>
                          <span className="text-xs font-black text-slate-800">{idx + 1}</span>
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800">Page {idx + 1}</p>
                      <p className="text-[10px] text-slate-500">{p.isBlank ? 'Blank page' : 'Document page'}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* CENTER VIEWPORT: Safe-Centered Canvas (Never clips on the left!) */}
        <main className="flex-1 overflow-auto p-2 sm:p-6 bg-slate-200/70 flex">
          <div className="m-auto flex flex-col items-center min-w-fit">
            
            {/* Page Floating Stepper & Orientation / Rotation Controls */}
            <div className="mb-2 flex items-center gap-1.5 sm:gap-2 bg-white px-3 py-1.5 rounded-full shadow-md border border-slate-200 text-xs font-bold text-slate-700">
              <button
                type="button"
                onClick={() => setCurrentPageIndex((i) => Math.max(0, i - 1))}
                disabled={currentPageIndex === 0}
                className="p-1 rounded-full hover:bg-slate-100 disabled:opacity-30"
                title="Previous Page"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <span className="whitespace-nowrap px-1">
                Page {currentPageIndex + 1} of {pages.length}
              </span>
              <button
                type="button"
                onClick={() => setCurrentPageIndex((i) => Math.min(pages.length - 1, i + 1))}
                disabled={currentPageIndex === pages.length - 1}
                className="p-1 rounded-full hover:bg-slate-100 disabled:opacity-30"
                title="Next Page"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>

              <div className="h-4 w-px bg-slate-200 mx-0.5 sm:mx-1" />

              {/* Page Rotation Buttons (Fix upside-down / sideways PDF orientation) */}
              <button
                type="button"
                onClick={() => handleRotateCurrentPage(270)}
                className="p-1 sm:px-2 rounded-lg text-slate-700 hover:bg-slate-100 flex items-center gap-1 font-bold text-[11px]"
                title="Rotate Page 90° Counter-Clockwise"
              >
                <RotateCcw className="w-3.5 h-3.5 text-blue-600" />
                <span className="hidden sm:inline">Rotate -90&deg;</span>
              </button>
              <button
                type="button"
                onClick={() => handleRotateCurrentPage(90)}
                className="p-1 sm:px-2 rounded-lg text-slate-700 hover:bg-slate-100 flex items-center gap-1 font-bold text-[11px]"
                title="Rotate Page 90° Clockwise"
              >
                <RotateCw className="w-3.5 h-3.5 text-blue-600" />
                <span className="hidden sm:inline">Rotate +90&deg;</span>
              </button>
              <button
                type="button"
                onClick={() => handleRotateCurrentPage(180)}
                className="px-2 py-1 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 flex items-center gap-1 font-extrabold text-[11px]"
                title="Flip Page 180° (Fix Upside-Down PDF)"
              >
                <span>Flip 180&deg;</span>
              </button>
            </div>

            {/* Canvas Wrapper with Zoom Scaling */}
            <div
              style={{
                width: `${pageDimensions.width * (zoom / 100)}px`,
                height: `${pageDimensions.height * (zoom / 100)}px`,
              }}
              className="relative shadow-2xl rounded-md origin-top bg-white select-none"
            >
              {/* Background Canvas (PDF Render) */}
              <canvas
                ref={canvasRef}
                style={{
                  width: '100%',
                  height: '100%',
                }}
                className="block rounded-md bg-white pointer-events-none"
              />

              {/* Interactive SVG/HTML Overlay Layer */}
              <div
                ref={overlayRef}
                onMouseDown={handleCanvasMouseDown}
                onMouseMove={handleCanvasMouseMove}
                onMouseUp={handleCanvasMouseUp}
                onTouchStart={handleCanvasMouseDown}
                onTouchMove={handleCanvasMouseMove}
                onTouchEnd={handleCanvasMouseUp}
                onDoubleClick={(e) => {
                  const { x, y } = getCanvasCoords(e);
                  const newEl: EditorElement = {
                    id: `text-${Date.now()}`,
                    type: 'text',
                    pageIndex: currentPageIndex,
                    x: Math.round(x),
                    y: Math.round(y - 10),
                    width: 220,
                    height: Math.max(32, fontSize * 1.8),
                    text: '',
                    fontFamily,
                    fontSize,
                    isBold,
                    isItalic,
                    isUnderline,
                    textAlign,
                    color: textColor,
                    headingStyle,
                  };
                  const updated = [...elements, newEl];
                  setElements(updated);
                  pushHistory(updated);
                  setSelectedElementId(newEl.id);
                  setActiveTool('select');
                }}
                style={{
                  width: `${pageDimensions.width}px`,
                  height: `${pageDimensions.height}px`,
                  transform: `scale(${zoom / 100})`,
                  transformOrigin: 'top left',
                }}
                className={`absolute inset-0 select-none touch-none ${
                  activeTool === 'text'
                    ? 'cursor-text'
                    : activeTool === 'draw'
                    ? 'cursor-crosshair'
                    : activeTool === 'eraser'
                    ? 'cursor-cell'
                    : activeTool === 'highlight'
                    ? 'cursor-crosshair'
                    : activeTool === 'select'
                    ? 'cursor-default'
                    : 'cursor-crosshair'
                }`}
              >
                {/* SVG for vector lines, shapes, and active drawing */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none">
                  {/* Drawing in-progress preview */}
                  {isDrawing && currentDrawingPoints.length > 1 && (
                    <path
                      d={`M ${currentDrawingPoints.map((p) => `${p.x} ${p.y}`).join(' L ')}`}
                      fill="none"
                      stroke={pencilColor}
                      strokeWidth={pencilWidth}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  )}

                  {/* Active Highlighter drag preview (Real Fluorescent Ink) */}
                  {isHighlighting && highlightStart && highlightCurrent && (
                    <rect
                      x={Math.min(highlightStart.x, highlightCurrent.x)}
                      y={Math.min(highlightStart.y, highlightCurrent.y)}
                      width={Math.max(8, Math.abs(highlightCurrent.x - highlightStart.x))}
                      height={Math.max(highlightTipHeight, Math.abs(highlightCurrent.y - highlightStart.y))}
                      fill={highlightColor}
                      opacity={0.45}
                      className="mix-blend-multiply"
                    />
                  )}

                  {/* Active Eraser box drag preview */}
                  {isErasing && eraserStart && eraserCurrent && (
                    <rect
                      x={Math.min(eraserStart.x, eraserCurrent.x)}
                      y={Math.min(eraserStart.y, eraserCurrent.y)}
                      width={Math.abs(eraserCurrent.x - eraserStart.x)}
                      height={Math.abs(eraserCurrent.y - eraserStart.y)}
                      fill="#ffffff"
                      stroke="#ef4444"
                      strokeWidth={1.5}
                      strokeDasharray="4 2"
                      opacity={0.9}
                    />
                  )}

                  {/* Rendered shapes & drawings */}
                  {currentElements.map((el) => {
                    if (el.type === 'drawing' && el.drawingPoints && el.drawingPoints.length > 1) {
                      return (
                        <path
                          key={el.id}
                          d={`M ${el.drawingPoints.map((p) => `${p.x} ${p.y}`).join(' L ')}`}
                          fill="none"
                          stroke={el.color || '#000000'}
                          strokeWidth={el.strokeWidth || 2}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          onClick={(e) => handleElementMouseDown(e, el.id)}
                          onTouchStart={(e) => handleElementMouseDown(e, el.id)}
                          onContextMenu={(e) => handleContextMenu(e, el.id)}
                          className="pointer-events-auto cursor-move"
                        />
                      );
                    }

                    if (el.type === 'line') {
                      const isSelected = el.id === selectedElementId;
                      return (
                        <g key={el.id} className="pointer-events-auto">
                          <line
                            x1={el.x}
                            y1={el.y}
                            x2={el.x + el.width}
                            y2={el.y + el.height}
                            stroke={el.color || '#000000'}
                            strokeWidth={el.strokeWidth || 3}
                            strokeLinecap="round"
                            onClick={(e) => handleElementMouseDown(e, el.id)}
                            onTouchStart={(e) => handleElementMouseDown(e, el.id)}
                            onContextMenu={(e) => handleContextMenu(e, el.id)}
                            className="cursor-move"
                          />
                          {isSelected && (
                            <>
                              <circle
                                cx={el.x}
                                cy={el.y}
                                r={5}
                                fill="#ffffff"
                                stroke="#2563eb"
                                strokeWidth={2}
                                className="cursor-nwse-resize"
                                onMouseDown={(e) => handleResizeStart(e, 'nw')}
                              />
                              <circle
                                cx={el.x + el.width}
                                cy={el.y + el.height}
                                r={5}
                                fill="#ffffff"
                                stroke="#2563eb"
                                strokeWidth={2}
                                className="cursor-nwse-resize"
                                onMouseDown={(e) => handleResizeStart(e, 'se')}
                              />
                            </>
                          )}
                        </g>
                      );
                    }

                    return null;
                  })}
                </svg>

                {/* EXISTING TEXT INTERACTIVE OVERLAY: Clickable to edit, highlight, or erase existing PDF text */}
                {(activeTool === 'select' || activeTool === 'text' || activeTool === 'eraser' || activeTool === 'highlight') &&
                  currentTextItems.map((item) => (
                    <div
                      key={item.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditExistingText(item);
                      }}
                      style={{
                        left: `${item.x}px`,
                        top: `${item.y}px`,
                        width: `${item.width}px`,
                        height: `${item.height}px`,
                      }}
                      className={`absolute group cursor-pointer transition-colors ${
                        activeTool === 'eraser'
                          ? 'hover:bg-rose-500/30 hover:ring-1 hover:ring-rose-500'
                          : activeTool === 'highlight'
                          ? 'hover:bg-yellow-400/40 hover:ring-1 hover:ring-yellow-400 mix-blend-multiply'
                          : 'hover:bg-blue-500/20 hover:ring-1 hover:ring-blue-500'
                      }`}
                      title={
                        activeTool === 'eraser'
                          ? `Click to erase "${item.str}"`
                          : activeTool === 'highlight'
                          ? `Click to highlight "${item.str}"`
                          : `Click to edit "${item.str}"`
                      }
                    >
                      <span className="hidden group-hover:block absolute -top-5 left-0 bg-[#0B1B3D] text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-sm whitespace-nowrap z-30 pointer-events-none">
                        {activeTool === 'eraser' ? 'Erase Text' : activeTool === 'highlight' ? 'Highlight Line' : 'Edit Text'}
                      </span>
                    </div>
                  ))}

                {/* DOM Elements: Text, Shapes, Tables, Images, Stamps, Erasers */}
                {currentElements.map((el) => {
                  const isSelected = el.id === selectedElementId;

                  // 1. Text Elements
                  if (el.type === 'text') {
                    return (
                      <div
                        key={el.id}
                        onMouseDown={(e) => handleElementMouseDown(e, el.id)}
                        onTouchStart={(e) => handleElementMouseDown(e, el.id)}
                        onContextMenu={(e) => handleContextMenu(e, el.id)}
                        style={{
                          left: `${el.x}px`,
                          top: `${el.y}px`,
                          width: `${el.width}px`,
                          minHeight: `${el.height || 24}px`,
                          color: el.color || '#000000',
                          fontSize: `${el.fontSize || 14}px`,
                          fontWeight: el.isBold ? 'bold' : 'normal',
                          fontStyle: el.isItalic ? 'italic' : 'normal',
                          textDecoration: el.isUnderline ? 'underline' : 'none',
                          textAlign: el.textAlign || 'left',
                          fontFamily: getFontCss(el.fontFamily),
                          transform: el.rotation ? `rotate(${el.rotation}deg)` : undefined,
                          transformOrigin: 'center center',
                        }}
                        className={`absolute cursor-move select-text p-1 ${
                          isSelected ? 'bg-blue-50/20' : 'hover:ring-1 hover:ring-slate-400'
                        }`}
                      >
                        <textarea
                          value={el.text || ''}
                          placeholder={isSelected ? 'Type text...' : ''}
                          rows={Math.max(1, (el.text || '').split('\n').length)}
                          onChange={(e) => {
                            const val = e.target.value;
                            updateSelectedElement({ text: val });
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              const textarea = e.currentTarget;
                              const pos = textarea.selectionStart;
                              const currentVal = el.text || '';
                              const textBefore = currentVal.slice(0, pos);
                              const textAfter = currentVal.slice(pos);
                              const linesBefore = textBefore.split('\n');
                              const currentLine = linesBefore[linesBefore.length - 1];

                              const numMatch = currentLine.match(/^(\s*)(\d+)([\.\)])\s*(.*)$/);
                              const letterMatch = currentLine.match(/^(\s*)([a-zA-Z])([\.\)])\s*(.*)$/);
                              const parenNumMatch = currentLine.match(/^(\s*)\((\d+)\)\s*(.*)$/);
                              const bulletMatch = currentLine.match(/^(\s*)([•◆✓➢\-\*])\s*(.*)$/);

                              if (numMatch) {
                                e.preventDefault();
                                const indent = numMatch[1];
                                const curNum = parseInt(numMatch[2], 10);
                                const punct = numMatch[3];
                                const content = numMatch[4];
                                if (!content.trim()) {
                                  const newText = textBefore.slice(0, textBefore.length - currentLine.length) + textAfter;
                                  updateSelectedElement({ text: newText });
                                } else {
                                  const nextPrefix = `\n${indent}${curNum + 1}${punct} `;
                                  const newText = textBefore + nextPrefix + textAfter;
                                  updateSelectedElement({ text: newText });
                                  setTimeout(() => {
                                    textarea.selectionStart = textarea.selectionEnd = pos + nextPrefix.length;
                                  }, 0);
                                }
                              } else if (letterMatch) {
                                e.preventDefault();
                                const indent = letterMatch[1];
                                const curChar = letterMatch[2];
                                const punct = letterMatch[3];
                                const content = letterMatch[4];
                                if (!content.trim()) {
                                  const newText = textBefore.slice(0, textBefore.length - currentLine.length) + textAfter;
                                  updateSelectedElement({ text: newText });
                                } else {
                                  const nextCode = curChar.charCodeAt(0) + 1;
                                  const nextChar = String.fromCharCode(nextCode);
                                  const nextPrefix = `\n${indent}${nextChar}${punct} `;
                                  const newText = textBefore + nextPrefix + textAfter;
                                  updateSelectedElement({ text: newText });
                                  setTimeout(() => {
                                    textarea.selectionStart = textarea.selectionEnd = pos + nextPrefix.length;
                                  }, 0);
                                }
                              } else if (parenNumMatch) {
                                e.preventDefault();
                                const indent = parenNumMatch[1];
                                const curNum = parseInt(parenNumMatch[2], 10);
                                const content = parenNumMatch[3];
                                if (!content.trim()) {
                                  const newText = textBefore.slice(0, textBefore.length - currentLine.length) + textAfter;
                                  updateSelectedElement({ text: newText });
                                } else {
                                  const nextPrefix = `\n${indent}(${curNum + 1}) `;
                                  const newText = textBefore + nextPrefix + textAfter;
                                  updateSelectedElement({ text: newText });
                                  setTimeout(() => {
                                    textarea.selectionStart = textarea.selectionEnd = pos + nextPrefix.length;
                                  }, 0);
                                }
                              } else if (bulletMatch) {
                                e.preventDefault();
                                const indent = bulletMatch[1];
                                const bulletChar = bulletMatch[2];
                                const content = bulletMatch[3];
                                if (!content.trim()) {
                                  const newText = textBefore.slice(0, textBefore.length - currentLine.length) + textAfter;
                                  updateSelectedElement({ text: newText });
                                } else {
                                  const nextPrefix = `\n${indent}${bulletChar} `;
                                  const newText = textBefore + nextPrefix + textAfter;
                                  updateSelectedElement({ text: newText });
                                  setTimeout(() => {
                                    textarea.selectionStart = textarea.selectionEnd = pos + nextPrefix.length;
                                  }, 0);
                                }
                              }
                            }
                          }}
                          className="w-full bg-transparent border-0 outline-hidden p-0 font-inherit text-inherit resize-none overflow-hidden leading-tight"
                        />
                        {renderSelectionHandles(el)}
                      </div>
                    );
                  }

                  // 2. Eraser / Whiteout Elements
                  if (el.type === 'eraser') {
                    return (
                      <div
                        key={el.id}
                        onMouseDown={(e) => handleElementMouseDown(e, el.id)}
                        onTouchStart={(e) => handleElementMouseDown(e, el.id)}
                        onContextMenu={(e) => handleContextMenu(e, el.id)}
                        style={{
                          left: `${el.x}px`,
                          top: `${el.y}px`,
                          width: `${el.width}px`,
                          height: `${el.height}px`,
                          backgroundColor: el.fillColor || '#ffffff',
                          transform: el.rotation ? `rotate(${el.rotation}deg)` : undefined,
                          transformOrigin: 'center center',
                        }}
                        className={`absolute cursor-move ${
                          isSelected ? '' : 'hover:ring-1 hover:ring-slate-300'
                        }`}
                        title="Whiteout / Eraser Box"
                      >
                        {renderSelectionHandles(el)}
                      </div>
                    );
                  }

                  // 3. Highlight Elements (Real Fluorescent Ink Marker)
                  if (el.type === 'highlight') {
                    return (
                      <div
                        key={el.id}
                        onMouseDown={(e) => handleElementMouseDown(e, el.id)}
                        onTouchStart={(e) => handleElementMouseDown(e, el.id)}
                        onContextMenu={(e) => handleContextMenu(e, el.id)}
                        style={{
                          left: `${el.x}px`,
                          top: `${el.y}px`,
                          width: `${el.width}px`,
                          height: `${el.height}px`,
                          backgroundColor: el.fillColor || '#ffff00',
                          opacity: el.opacity ?? 0.45,
                          transform: el.rotation ? `rotate(${el.rotation}deg)` : undefined,
                          transformOrigin: 'center center',
                        }}
                        className={`absolute cursor-move mix-blend-multiply rounded-xs pointer-events-auto transition-opacity ${
                          isSelected ? '' : 'hover:opacity-85'
                        }`}
                        title="Fluorescent Highlighter"
                      >
                        {renderSelectionHandles(el)}
                      </div>
                    );
                  }

                  // 4. Rectangle Elements
                  if (el.type === 'rectangle') {
                    return (
                      <div
                        key={el.id}
                        onMouseDown={(e) => handleElementMouseDown(e, el.id)}
                        onTouchStart={(e) => handleElementMouseDown(e, el.id)}
                        onContextMenu={(e) => handleContextMenu(e, el.id)}
                        style={{
                          left: `${el.x}px`,
                          top: `${el.y}px`,
                          width: `${el.width}px`,
                          height: `${el.height}px`,
                          borderColor: el.color || '#000000',
                          borderWidth: `${el.strokeWidth || 2}px`,
                          borderStyle: 'solid',
                          backgroundColor: el.fillColor || 'transparent',
                          transform: el.rotation ? `rotate(${el.rotation}deg)` : undefined,
                          transformOrigin: 'center center',
                        }}
                        className={`absolute cursor-move rounded-xs ${
                          isSelected ? '' : 'hover:ring-1 hover:ring-slate-400'
                        }`}
                      >
                        {renderSelectionHandles(el)}
                      </div>
                    );
                  }

                  // 5. Circle Elements
                  if (el.type === 'circle') {
                    return (
                      <div
                        key={el.id}
                        onMouseDown={(e) => handleElementMouseDown(e, el.id)}
                        onTouchStart={(e) => handleElementMouseDown(e, el.id)}
                        onContextMenu={(e) => handleContextMenu(e, el.id)}
                        style={{
                          left: `${el.x}px`,
                          top: `${el.y}px`,
                          width: `${el.width}px`,
                          height: `${el.height}px`,
                          borderColor: el.color || '#000000',
                          borderWidth: `${el.strokeWidth || 2}px`,
                          borderStyle: 'solid',
                          backgroundColor: el.fillColor || 'transparent',
                          borderRadius: '50%',
                          transform: el.rotation ? `rotate(${el.rotation}deg)` : undefined,
                          transformOrigin: 'center center',
                        }}
                        className={`absolute cursor-move ${
                          isSelected ? '' : 'hover:ring-1 hover:ring-slate-400'
                        }`}
                      >
                        {renderSelectionHandles(el)}
                      </div>
                    );
                  }

                  // 5B. Microsoft Word Shapes (IMG_20261102_125537.png)
                  if (el.type === 'shape' || el.shapeSvgPath) {
                    return (
                      <div
                        key={el.id}
                        onMouseDown={(e) => handleElementMouseDown(e, el.id)}
                        onTouchStart={(e) => handleElementMouseDown(e, el.id)}
                        onContextMenu={(e) => handleContextMenu(e, el.id)}
                        style={{
                          left: `${el.x}px`,
                          top: `${el.y}px`,
                          width: `${el.width}px`,
                          height: `${el.height}px`,
                          transform: el.rotation ? `rotate(${el.rotation}deg)` : undefined,
                          transformOrigin: 'center center',
                        }}
                        className={`absolute cursor-move select-none ${
                          isSelected ? 'ring-2 ring-blue-500 rounded-xs' : 'hover:ring-1 hover:ring-slate-400'
                        }`}
                      >
                        <svg
                          viewBox="0 0 100 100"
                          preserveAspectRatio="none"
                          className="w-full h-full overflow-visible pointer-events-none"
                        >
                          <path
                            d={el.shapeSvgPath}
                            fill={el.fillColor && el.fillColor !== 'transparent' ? el.fillColor : 'none'}
                            stroke={el.color || '#0B1B3D'}
                            strokeWidth={(el.strokeWidth || 2) * (100 / Math.max(el.width, el.height, 40))}
                            vectorEffect="non-scaling-stroke"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>

                        {/* Microsoft Word Style: Type text inside shape */}
                        <div className="absolute inset-2 flex items-center justify-center pointer-events-auto">
                          <textarea
                            value={el.text || ''}
                            placeholder={isSelected ? 'Type inside shape...' : ''}
                            onChange={(e) => {
                              const val = e.target.value;
                              setElements((prev) =>
                                prev.map((item) => (item.id === el.id ? { ...item, text: val } : item))
                              );
                            }}
                            onBlur={() => pushHistory(elements)}
                            onMouseDown={(e) => e.stopPropagation()}
                            onTouchStart={(e) => e.stopPropagation()}
                            style={{
                              fontFamily: el.fontFamily || fontFamily || 'Arial',
                              fontSize: `${el.fontSize || fontSize || 13}px`,
                              fontWeight: el.isBold ? 'bold' : 'normal',
                              fontStyle: el.isItalic ? 'italic' : 'normal',
                              textDecoration: [
                                el.isUnderline ? 'underline' : '',
                                el.isStrikethrough ? 'line-through' : '',
                              ].filter(Boolean).join(' ') || 'none',
                              color: el.textColor || el.color || textColor || '#0B1B3D',
                              textAlign: el.textAlign || 'center',
                              background: 'transparent',
                            }}
                            className="w-full h-full resize-none border-none outline-none text-center bg-transparent p-1 leading-snug cursor-text"
                          />
                        </div>

                        {renderSelectionHandles(el)}
                      </div>
                    );
                  }

                  // 6. Table Elements (Blank Table - Screenshot_2026-11-02-12-52-30-02_40deb401b9ffe8e1df2f1cc5ba480b12.jpg)
                  if (el.type === 'table' && el.tableData) {
                    const { rows, cols, cells, borderColor: tBorderColor } = el.tableData;
                    return (
                      <div
                        key={el.id}
                        onMouseDown={(e) => handleElementMouseDown(e, el.id)}
                        onTouchStart={(e) => handleElementMouseDown(e, el.id)}
                        onContextMenu={(e) => handleContextMenu(e, el.id)}
                        style={{
                          left: `${el.x}px`,
                          top: `${el.y}px`,
                          width: `${el.width}px`,
                        }}
                        className={`absolute cursor-move bg-white shadow-xs rounded-md overflow-hidden ${
                          isSelected ? 'ring-2 ring-blue-500' : 'hover:ring-1 hover:ring-slate-400'
                        }`}
                      >
                        {/* Table Floating Control Bar when Selected */}
                        {isSelected && (
                          <div
                            onMouseDown={(e) => e.stopPropagation()}
                            className="bg-slate-100 border-b border-slate-200 text-slate-700 text-[10px] font-bold px-2 py-1 flex items-center justify-between gap-1 shadow-xs"
                          >
                            <span className="flex items-center gap-1 font-extrabold text-blue-700">
                              <TableIcon className="w-3 h-3 text-blue-600" />
                              Blank Table ({rows}&times;{cols})
                            </span>
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => handleTableAddRow(el.id)}
                                className="px-1.5 py-0.5 rounded bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors"
                                title="Add Row"
                              >
                                + Row
                              </button>
                              <button
                                type="button"
                                onClick={() => handleTableDeleteRow(el.id)}
                                className="px-1.5 py-0.5 rounded bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors"
                                title="Delete Row"
                              >
                                - Row
                              </button>
                              <button
                                type="button"
                                onClick={() => handleTableAddCol(el.id)}
                                className="px-1.5 py-0.5 rounded bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors"
                                title="Add Column"
                              >
                                + Col
                              </button>
                              <button
                                type="button"
                                onClick={() => handleTableDeleteCol(el.id)}
                                className="px-1.5 py-0.5 rounded bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors"
                                title="Delete Column"
                              >
                                - Col
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  const updated = elements.filter((item) => item.id !== el.id);
                                  setElements(updated);
                                  pushHistory(updated);
                                  setSelectedElementId(null);
                                }}
                                className="p-1 rounded text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition-colors ml-1"
                                title="Delete Table"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        )}

                        <table
                          style={{ borderColor: tBorderColor || '#cbd5e1' }}
                          className="w-full border-collapse border text-xs bg-white"
                        >
                          <tbody>
                            {cells.map((rowArr, rIdx) => (
                              <tr key={rIdx}>
                                {rowArr.map((cellText, cIdx) => (
                                  <td
                                    key={cIdx}
                                    style={{
                                      borderColor: tBorderColor || '#cbd5e1',
                                      backgroundColor: '#ffffff',
                                      color: '#1e293b',
                                      minWidth: '50px',
                                      height: '30px',
                                    }}
                                    className="border p-1"
                                  >
                                    <input
                                      type="text"
                                      value={cellText}
                                      placeholder=""
                                      onChange={(e) =>
                                        handleTableCellChange(el.id, rIdx, cIdx, e.target.value)
                                      }
                                      className="w-full h-full bg-transparent border-0 outline-hidden px-1 text-xs font-inherit text-slate-800"
                                    />
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    );
                  }

                  // 7. Image Elements
                  if (el.type === 'image' && el.imageDataUrl) {
                    return (
                      <div
                        key={el.id}
                        onMouseDown={(e) => handleElementMouseDown(e, el.id)}
                        onTouchStart={(e) => handleElementMouseDown(e, el.id)}
                        onContextMenu={(e) => handleContextMenu(e, el.id)}
                        style={{
                          left: `${el.x}px`,
                          top: `${el.y}px`,
                          width: `${el.width}px`,
                          height: `${el.height}px`,
                          transform: el.rotation ? `rotate(${el.rotation}deg)` : undefined,
                          transformOrigin: 'center center',
                        }}
                        className={`absolute cursor-move ${
                          isSelected ? '' : 'hover:ring-1 hover:ring-slate-400'
                        }`}
                      >
                        <img
                          src={el.imageDataUrl}
                          alt="Inserted element"
                          className="w-full h-full object-contain pointer-events-none select-none"
                        />
                        {renderSelectionHandles(el)}
                      </div>
                    );
                  }

                  // 8. Stamp Elements
                  if (el.type === 'stamp') {
                    return (
                      <div
                        key={el.id}
                        onMouseDown={(e) => handleElementMouseDown(e, el.id)}
                        onTouchStart={(e) => handleElementMouseDown(e, el.id)}
                        onContextMenu={(e) => handleContextMenu(e, el.id)}
                        style={{
                          left: `${el.x}px`,
                          top: `${el.y}px`,
                          width: `${el.width}px`,
                          height: `${el.height}px`,
                          color: el.color || '#059669',
                          borderColor: el.color || '#059669',
                          backgroundColor: el.fillColor || '#ecfdf5',
                          transform: el.rotation ? `rotate(${el.rotation}deg)` : undefined,
                          transformOrigin: 'center center',
                        }}
                        className={`absolute cursor-move border-2 border-dashed rounded-lg flex items-center justify-center font-black tracking-wider text-sm select-none ${
                          isSelected ? '' : 'hover:ring-1 hover:ring-slate-400'
                        }`}
                      >
                        {el.text || 'APPROVED'}
                        {renderSelectionHandles(el)}
                      </div>
                    );
                  }

                  // 9. Comment Elements (Word-style sticky note balloon/card)
                  if (el.type === 'comment') {
                    return (
                      <div
                        key={el.id}
                        onMouseDown={(e) => handleElementMouseDown(e, el.id)}
                        onTouchStart={(e) => handleElementMouseDown(e, el.id)}
                        onContextMenu={(e) => handleContextMenu(e, el.id)}
                        style={{
                          left: `${el.x}px`,
                          top: `${el.y}px`,
                          width: `${Math.max(160, el.width)}px`,
                          minHeight: `${Math.max(50, el.height)}px`,
                          backgroundColor: el.fillColor || '#FEF08A',
                          borderColor: el.strokeColor || '#EAB308',
                          transform: el.rotation ? `rotate(${el.rotation}deg)` : undefined,
                          transformOrigin: 'center center',
                        }}
                        className={`absolute cursor-move border-2 rounded-xl shadow-lg p-2.5 text-xs text-slate-800 transition-shadow ${
                          isSelected ? 'ring-2 ring-blue-500 shadow-xl' : 'hover:shadow-md'
                        }`}
                      >
                        <div className="flex items-center justify-between pb-1 mb-1 border-b border-black/10">
                          <div className="flex items-center gap-1.5 font-bold text-[11px] text-amber-950">
                            <MessageSquare className="w-3.5 h-3.5 text-amber-700" />
                            <span>{el.commentAuthor || 'Comment'}</span>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteSelected();
                            }}
                            className="p-0.5 rounded text-slate-400 hover:text-rose-600 hover:bg-black/5"
                            title="Delete Comment"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                        <div className="text-[11px] text-slate-800 leading-snug whitespace-pre-wrap break-words font-sans">
                          {el.text}
                        </div>
                        {renderSelectionHandles(el)}
                      </div>
                    );
                  }

                  // 10. Electronic Signature Elements (E-Sign)
                  if (el.type === 'signature') {
                    return (
                      <div
                        key={el.id}
                        onMouseDown={(e) => handleElementMouseDown(e, el.id)}
                        onTouchStart={(e) => handleElementMouseDown(e, el.id)}
                        onContextMenu={(e) => handleContextMenu(e, el.id)}
                        style={{
                          left: `${el.x}px`,
                          top: `${el.y}px`,
                          width: `${el.width}px`,
                          height: `${el.height}px`,
                          transform: el.rotation ? `rotate(${el.rotation}deg)` : undefined,
                          transformOrigin: 'center center',
                        }}
                        className={`absolute cursor-move select-none ${
                          isSelected ? 'ring-2 ring-blue-500 rounded' : 'hover:ring-1 hover:ring-slate-400 rounded'
                        }`}
                      >
                        {el.imageDataUrl ? (
                          <img
                            src={el.imageDataUrl}
                            alt="Signature"
                            className="w-full h-full object-contain pointer-events-none"
                          />
                        ) : (
                          <div
                            style={{
                              fontFamily: getFontCss(el.fontFamily || 'DancingScript'),
                              fontSize: `${el.fontSize || 24}px`,
                              color: el.color || '#0B1B3D',
                            }}
                            className="w-full h-full flex items-center justify-center italic font-bold select-none px-2"
                          >
                            {el.text}
                          </div>
                        )}
                        {renderSelectionHandles(el)}
                      </div>
                    );
                  }

                  return null;
                })}
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* PAGE TOOLS POPOVER (MERGE, SPLIT, DELETE, EXTRACT, ADD) */}
      {pageToolsOpen && (
        <>
          <div
            className="fixed inset-0 z-45 bg-black/25 backdrop-blur-2xs"
            onClick={() => setPageToolsOpen(false)}
          />
          <div className="fixed inset-x-2 top-24 sm:top-28 sm:inset-x-auto sm:left-60 max-w-sm w-[95vw] sm:w-[360px] bg-white text-slate-800 rounded-3xl shadow-2xl border border-slate-200 p-5 z-50 animate-in zoom-in-95 mx-auto">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <Files className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-[#0B1B3D] text-sm leading-tight">PDF Page Tools</h3>
                  <p className="text-[11px] text-slate-500">Manage, merge, split, extract &amp; delete pages</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPageToolsOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              {/* 1. Merge PDF */}
              <button
                type="button"
                onClick={() => {
                  setPageToolsOpen(false);
                  mergeInputRef.current?.click();
                }}
                className="w-full p-2.5 rounded-2xl border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/50 flex items-start gap-2.5 transition-all text-left group"
              >
                <div className="w-7 h-7 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <FilePlus className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-extrabold text-slate-800 group-hover:text-indigo-900 text-[12px]">Merge PDF</h4>
                  <p className="text-[10px] text-slate-500 leading-snug">
                    Append and combine pages from another PDF file into this document.
                  </p>
                </div>
              </button>

              {/* 2. Split PDF */}
              <button
                type="button"
                onClick={() => {
                  setPageToolsOpen(false);
                  setSplitModalOpen(true);
                }}
                className="w-full p-2.5 rounded-2xl border border-slate-200 hover:border-purple-400 hover:bg-purple-50/50 flex items-start gap-2.5 transition-all text-left group"
              >
                <div className="w-7 h-7 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Scissors className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-extrabold text-slate-800 group-hover:text-purple-900 text-[12px]">Split PDF</h4>
                  <p className="text-[10px] text-slate-500 leading-snug">
                    Extract current page or custom ranges into a new separate PDF file.
                  </p>
                </div>
              </button>

              {/* 3. Extract PDF Pages as JPG / PNG */}
              <button
                type="button"
                onClick={() => {
                  setPageToolsOpen(false);
                  setExtractModalOpen(true);
                }}
                className="w-full p-2.5 rounded-2xl border border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/50 flex items-start gap-2.5 transition-all text-left group"
              >
                <div className="w-7 h-7 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <ImageIcon className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-extrabold text-slate-800 group-hover:text-emerald-900 text-[12px]">Extract Pages as JPG or PNG</h4>
                  <p className="text-[10px] text-slate-500 leading-snug">
                    Convert and download page as lossless PNG or high-res JPG image.
                  </p>
                </div>
              </button>

              {/* 4. Add PDF Pages */}
              <button
                type="button"
                onClick={() => {
                  setPageToolsOpen(false);
                  handleAddBlankPage();
                }}
                className="w-full p-2.5 rounded-2xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 flex items-start gap-2.5 transition-all text-left group"
              >
                <div className="w-7 h-7 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Plus className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-extrabold text-slate-800 group-hover:text-blue-900 text-[12px]">Add Blank Page</h4>
                  <p className="text-[10px] text-slate-500 leading-snug">
                    Insert a crisp new blank page into the active document.
                  </p>
                </div>
              </button>

              {/* 5. Delete PDF Pages */}
              <button
                type="button"
                onClick={() => {
                  setPageToolsOpen(false);
                  handleDeletePage();
                }}
                disabled={pages.length <= 1}
                className="w-full p-2.5 rounded-2xl border border-slate-200 hover:border-rose-400 hover:bg-rose-50/50 flex items-start gap-2.5 transition-all text-left group disabled:opacity-40"
              >
                <div className="w-7 h-7 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Trash2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-extrabold text-slate-800 group-hover:text-rose-900 text-[12px]">Delete Current Page</h4>
                  <p className="text-[10px] text-slate-500 leading-snug">
                    Permanently delete page {currentPageIndex + 1} from this PDF.
                  </p>
                </div>
              </button>
            </div>
          </div>
        </>
      )}

      {/* SPLIT PDF MODAL DIALOG */}
      {splitModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-2xs animate-in fade-in">
          <div className="bg-white rounded-3xl p-5 max-w-sm w-full shadow-2xl border border-slate-200 space-y-4 animate-in zoom-in-95 text-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                  <Scissors className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-[#0B1B3D] text-sm leading-tight">Split PDF</h3>
                  <p className="text-[11px] text-slate-500">Extract pages into a new PDF document</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSplitModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5 text-xs font-bold text-slate-700">
              <button
                type="button"
                onClick={() => handleSplitPdf('current')}
                className="w-full p-3 rounded-2xl border border-slate-200 hover:border-purple-400 hover:bg-purple-50/50 flex items-center justify-between transition-all group"
              >
                <div className="text-left">
                  <span className="block text-slate-800 group-hover:text-purple-900 font-extrabold">Extract Current Page Only</span>
                  <span className="text-[11px] text-slate-400 font-normal">Page {currentPageIndex + 1} of {pages.length}</span>
                </div>
                <ArrowRight className="w-4 h-4 text-purple-600 group-hover:translate-x-0.5 transition-transform" />
              </button>

              <div className="p-3 rounded-2xl border border-slate-200 space-y-2">
                <span className="block text-slate-800 font-extrabold">Extract Custom Page Range</span>
                <input
                  type="text"
                  placeholder="e.g. 1-3, 5"
                  value={splitRange}
                  onChange={(e) => setSplitRange(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-300 text-xs focus:border-purple-500 outline-hidden font-bold"
                />
                <button
                  type="button"
                  onClick={() => handleSplitPdf('range')}
                  disabled={!splitRange.trim()}
                  className="w-full py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold disabled:opacity-40 transition-colors shadow-sm"
                >
                  Download Split PDF
                </button>
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="button"
                onClick={() => setSplitModalOpen(false)}
                className="px-4 py-1.5 rounded-xl text-slate-500 hover:bg-slate-100 font-bold text-xs"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EXTRACT PDF PAGES AS JPG / PNG MODAL DIALOG */}
      {extractModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-2xs animate-in fade-in">
          <div className="bg-white rounded-3xl p-5 max-w-sm w-full shadow-2xl border border-slate-200 space-y-4 animate-in zoom-in-95 text-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                  <ImageIcon className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-[#0B1B3D] text-sm leading-tight">Extract Page as Image</h3>
                  <p className="text-[11px] text-slate-500">Save page {currentPageIndex + 1} as JPG or PNG</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setExtractModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5 text-xs font-bold text-slate-700">
              <button
                type="button"
                onClick={() => handleExtractCurrentPage('png')}
                className="w-full p-3 rounded-2xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 flex items-center justify-between transition-all group"
              >
                <div className="text-left">
                  <span className="block text-slate-800 group-hover:text-emerald-900 font-extrabold">Extract as PNG (Lossless)</span>
                  <span className="text-[11px] text-slate-400 font-normal">Sharpest quality &bull; Ideal for text and graphics</span>
                </div>
                <Download className="w-4 h-4 text-emerald-600 group-hover:translate-y-0.5 transition-transform" />
              </button>

              <button
                type="button"
                onClick={() => handleExtractCurrentPage('jpeg')}
                className="w-full p-3 rounded-2xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/50 flex items-center justify-between transition-all group"
              >
                <div className="text-left">
                  <span className="block text-slate-800 group-hover:text-blue-900 font-extrabold">Extract as JPG (High Quality)</span>
                  <span className="text-[11px] text-slate-400 font-normal">Compressed image &bull; Great for sharing & photos</span>
                </div>
                <Download className="w-4 h-4 text-blue-600 group-hover:translate-y-0.5 transition-transform" />
              </button>
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="button"
                onClick={() => setExtractModalOpen(false)}
                className="px-4 py-1.5 rounded-xl text-slate-500 hover:bg-slate-100 font-bold text-xs"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. TABLE SETTINGS MODAL DIALOG (BLANK TABLE ONLY - Screenshot_2026-11-02-12-52-30-02) */}
      {tableModalOpen && (
        <>
          <div
            className="fixed inset-0 z-45 bg-black/25 backdrop-blur-2xs"
            onClick={() => setTableModalOpen(false)}
          />
          <div className="fixed inset-x-2 top-24 sm:top-28 sm:inset-x-auto sm:left-48 max-w-sm w-[95vw] sm:w-[360px] bg-white text-slate-800 rounded-3xl shadow-2xl border border-slate-200 p-5 z-50 animate-in zoom-in-95 mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <TableIcon className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-[#0B1B3D] text-sm leading-tight">Insert Blank Table</h3>
                  <p className="text-[11px] text-slate-500">Clean slate table &bull; No placeholder text</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setTableModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Word-style Interactive 5x5 Grid Picker */}
            <div className="mb-4 bg-slate-50 p-3 rounded-2xl border border-slate-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-slate-600">Drag or click grid size:</span>
                <span className="text-[11px] font-extrabold text-blue-600 font-mono bg-blue-50 px-2 py-0.5 rounded-md">
                  {tableGridHover.rows > 0 ? `${tableGridHover.rows} × ${tableGridHover.cols} Table` : 'Choose Grid'}
                </span>
              </div>
              <div
                className="grid grid-cols-5 gap-1.5 w-fit mx-auto cursor-pointer p-1 bg-white rounded-xl border border-slate-200 shadow-2xs"
                onMouseLeave={() => setTableGridHover({ rows: 0, cols: 0 })}
              >
                {[1, 2, 3, 4, 5].map((r) =>
                  [1, 2, 3, 4, 5].map((c) => {
                    const isHighlighted = r <= tableGridHover.rows && c <= tableGridHover.cols;
                    return (
                      <div
                        key={`${r}-${c}`}
                        onMouseEnter={() => setTableGridHover({ rows: r, cols: c })}
                        onClick={() => handleInsertTable(r, c)}
                        className={`w-7 h-7 rounded-md border transition-all flex items-center justify-center text-[10px] font-bold ${
                          isHighlighted
                            ? 'bg-blue-500 border-blue-600 text-white shadow-xs scale-105'
                            : 'bg-slate-50 border-slate-200 hover:bg-blue-100 text-transparent'
                        }`}
                        title={`${r} Rows × ${c} Columns`}
                      />
                    );
                  })
                )}
              </div>
            </div>

            {/* Quick Blank Presets */}
            <div className="mb-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                Quick Blank Presets
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {[
                  { r: 2, c: 2, label: '2 × 2 Blank Table' },
                  { r: 3, c: 3, label: '3 × 3 Blank Table' },
                  { r: 4, c: 3, label: '4 × 3 Blank Table' },
                  { r: 5, c: 4, label: '5 × 4 Blank Table' },
                ].map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => handleInsertTable(preset.r, preset.c)}
                    className="p-2 rounded-xl bg-slate-50 hover:bg-blue-50 hover:border-blue-400 border border-slate-200 text-slate-700 hover:text-blue-700 font-bold text-center transition-all shadow-2xs"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Rows & Columns */}
            <div className="pt-3 border-t border-slate-100 space-y-3">
              <div className="grid grid-cols-2 gap-3 text-xs font-bold text-slate-700">
                <div className="space-y-1">
                  <label className="text-slate-500 text-[11px]">Rows (1–10):</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={newTableRows}
                    onChange={(e) => setNewTableRows(Math.max(1, Math.min(10, Number(e.target.value))))}
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-300 text-xs focus:border-blue-500 outline-hidden font-bold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-500 text-[11px]">Columns (1–6):</label>
                  <input
                    type="number"
                    min="1"
                    max="6"
                    value={newTableCols}
                    onChange={(e) => setNewTableCols(Math.max(1, Math.min(6, Number(e.target.value))))}
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-300 text-xs focus:border-blue-500 outline-hidden font-bold"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setTableModalOpen(false)}
                  className="px-3 py-2 rounded-xl text-slate-600 font-bold text-xs hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleInsertTable(newTableRows, newTableCols)}
                  className="px-4 py-2 rounded-xl bg-[#0B1B3D] hover:bg-[#122754] text-white font-extrabold text-xs shadow-md flex items-center gap-1.5"
                >
                  <TableIcon className="w-3.5 h-3.5" />
                  <span>Insert Blank Table</span>
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* 2.6 FULL MS WORD COLOR PALETTE MODAL / POPOVER (LIGHT THEME) */}
      {fontColorOpen && (
        <>
          <div
            className="fixed inset-0 z-45 bg-black/25 backdrop-blur-2xs"
            onClick={() => setFontColorOpen(false)}
          />
          <div className="fixed inset-x-2 top-24 sm:top-28 sm:inset-x-auto sm:left-48 max-w-[340px] w-[95vw] sm:w-80 bg-white text-slate-800 rounded-2xl shadow-2xl border border-slate-200 p-4 z-50 animate-in zoom-in-95 mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-slate-100">
              <div className="flex items-center gap-1.5">
                <Palette className="w-4 h-4 text-blue-600" />
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-700">
                  Theme &amp; Standard Colors
                </span>
              </div>
              <button
                type="button"
                onClick={() => setFontColorOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Standard 10 Colors Row */}
            <div className="mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                Standard Colors
              </span>
              <div className="flex items-center justify-between gap-1">
                {WORD_COLOR_PALETTE.standard.map((sc) => (
                  <button
                    key={sc.value}
                    type="button"
                    onClick={() => {
                      setTextColor(sc.value);
                      updateSelectedElement({ color: sc.value });
                      setFontColorOpen(false);
                    }}
                    style={{ backgroundColor: sc.value }}
                    className={`w-6 h-6 rounded-full border transition-transform hover:scale-120 ${
                      textColor === sc.value
                        ? 'ring-2 ring-blue-500 ring-offset-1 border-white scale-110 shadow-xs'
                        : 'border-slate-300'
                    }`}
                    title={sc.name}
                  />
                ))}
              </div>
            </div>

            <div className="h-px bg-slate-100 my-2" />

            {/* 10 Columns x 5 Rows Shades Matrix */}
            <div className="mb-2.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                Theme Colors
              </span>
              <div className="grid grid-cols-10 gap-1">
                {WORD_COLOR_PALETTE.matrixRows.map((rowArr, rIdx) =>
                  rowArr.map((colHex, cIdx) => (
                    <button
                      key={`${rIdx}-${cIdx}`}
                      type="button"
                      onClick={() => {
                        setTextColor(colHex);
                        updateSelectedElement({ color: colHex });
                        setFontColorOpen(false);
                      }}
                      style={{ backgroundColor: colHex }}
                      className={`w-6 h-5 rounded-xs transition-transform hover:scale-125 border ${
                        textColor === colHex ? 'ring-2 ring-blue-500 border-white' : 'border-slate-200'
                      }`}
                      title={colHex}
                    />
                  ))
                )}
              </div>
            </div>

            <div className="h-px bg-slate-100 my-2.5" />

            {/* Custom Color Input */}
            <div className="flex items-center justify-between gap-2 pt-0.5">
              <label className="flex items-center gap-1.5 cursor-pointer text-xs font-bold text-slate-700 hover:text-slate-900">
                <Palette className="w-4 h-4 text-blue-600" />
                <span>Custom Color:</span>
                <input
                  type="color"
                  value={textColor}
                  onChange={(e) => {
                    setTextColor(e.target.value);
                    updateSelectedElement({ color: e.target.value });
                  }}
                  className="w-6 h-6 p-0 border border-slate-300 rounded cursor-pointer ml-1"
                />
              </label>
              <span className="text-[11px] font-mono font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 uppercase">
                {textColor}
              </span>
            </div>
          </div>
        </>
      )}

      {/* 2.6B MS WORD TEXT HIGHLIGHT COLOR MODAL / POPOVER (LIGHT THEME) */}
      {highlighterOpen && (
        <>
          <div
            className="fixed inset-0 z-45 bg-black/25 backdrop-blur-2xs"
            onClick={() => setHighlighterOpen(false)}
          />
          <div className="fixed inset-x-2 top-24 sm:top-28 sm:inset-x-auto sm:left-40 max-w-[340px] w-[95vw] sm:w-80 bg-white text-slate-800 rounded-2xl shadow-2xl border border-slate-200 p-4 z-50 animate-in zoom-in-95 mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-slate-100">
              <div className="flex items-center gap-1.5">
                <Highlighter className="w-4 h-4 text-amber-500" />
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-700">
                  Text Highlight Color
                </span>
              </div>
              <button
                type="button"
                onClick={() => setHighlighterOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Word Highlight Colors Palette */}
            <div className="mb-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                Standard Word Highlighter Inks
              </span>
              <div className="grid grid-cols-5 gap-2">
                {[
                  { name: 'Yellow', val: '#FFFF00' },
                  { name: 'Bright Green', val: '#00FF00' },
                  { name: 'Turquoise', val: '#00FFFF' },
                  { name: 'Pink', val: '#FF00FF' },
                  { name: 'Blue', val: '#3B82F6' },
                  { name: 'Red', val: '#EF4444' },
                  { name: 'Dark Blue', val: '#1E3A8A' },
                  { name: 'Teal', val: '#0F766E' },
                  { name: 'Olive', val: '#84CC16' },
                  { name: 'Purple', val: '#8B5CF6' },
                  { name: 'Light Gray', val: '#CBD5E1' },
                  { name: 'Dark Gray', val: '#64748B' },
                  { name: 'Dark Red', val: '#991B1B' },
                  { name: 'Dark Green', val: '#166534' },
                  { name: 'Lavender', val: '#E9D5FF' },
                ].map((hc) => (
                  <button
                    key={hc.val}
                    type="button"
                    onClick={() => {
                      setHighlightColor(hc.val);
                      setActiveTool('highlight');
                      updateSelectedElement({ fillColor: hc.val });
                    }}
                    style={{ backgroundColor: hc.val }}
                    className={`h-7 rounded-lg border transition-transform flex items-center justify-center ${
                      highlightColor === hc.val
                        ? 'ring-2 ring-blue-500 ring-offset-1 border-slate-900 scale-105 shadow-sm'
                        : 'border-slate-300 hover:scale-105'
                    }`}
                    title={hc.name}
                  >
                    {highlightColor === hc.val && <Check className="w-3.5 h-3.5 text-slate-900 drop-shadow" />}
                  </button>
                ))}
              </div>
            </div>

            {/* No Color Button (MS Word Style) */}
            <button
              type="button"
              onClick={() => {
                setActiveTool('eraser');
                setHighlighterOpen(false);
              }}
              className="w-full mb-3 flex items-center justify-center gap-2 py-1.5 px-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-bold text-slate-700 transition-colors"
            >
              <Slash className="w-3.5 h-3.5 text-rose-500" />
              <span>No Color (Erase / Clear Highlight)</span>
            </button>

            <div className="h-px bg-slate-100 my-2.5" />

            {/* Chisel Tip Width */}
            <div className="mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                Marker Chisel Tip
              </span>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { label: 'Fine (16px)', val: 16 },
                  { label: 'Medium (24px)', val: 24 },
                  { label: 'Broad (32px)', val: 32 },
                ].map((tip) => (
                  <button
                    key={tip.val}
                    type="button"
                    onClick={() => setHighlightTipHeight(tip.val)}
                    className={`py-1.5 rounded-lg text-[10px] font-bold border transition-colors ${
                      highlightTipHeight === tip.val
                        ? 'bg-amber-100 border-amber-400 text-amber-950 font-black'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {tip.label}
                  </button>
                ))}
              </div>
            </div>

            <p className="text-[10px] text-slate-400 italic text-center mt-2">
              Drag over text or tap any detected PDF line to highlight with real ink
            </p>
          </div>
        </>
      )}

      {/* 2.6C FULL MICROSOFT WORD SHAPES GALLERY (IMG_20261102_125537.png) */}
      {shapesOpen && (
        <>
          <div
            className="fixed inset-0 z-45 bg-black/25 backdrop-blur-2xs"
            onClick={() => setShapesOpen(false)}
          />
          <div className="fixed inset-x-2 top-20 sm:top-24 sm:inset-x-auto sm:left-32 max-w-[420px] w-[95vw] sm:w-[410px] bg-white text-slate-800 rounded-3xl shadow-2xl border border-slate-200 p-4 z-50 animate-in zoom-in-95 mx-auto max-h-[82vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 flex-shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <Square className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-[#0B1B3D] text-xs leading-tight">Word Shapes Gallery</h3>
                  <p className="text-[10px] text-slate-500">37+ Vector shapes &bull; Fill &amp; border styles</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShapesOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1.5 mb-2 no-scrollbar flex-shrink-0">
              {['All', 'Lines', 'Rectangles', 'Basic Shapes', 'Block Arrows', 'Equation', 'Stars', 'Callouts'].map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setShapeCategoryTab(cat)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold whitespace-nowrap transition-all ${
                    shapeCategoryTab === cat
                      ? 'bg-[#0B1B3D] text-white shadow-xs font-extrabold'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Shape Grid */}
            <div className="overflow-y-auto pr-1 flex-1 min-h-[160px] max-h-[220px] mb-3">
              <div className="grid grid-cols-4 sm:grid-cols-5 gap-1.5">
                {WORD_SHAPES_LIBRARY.filter((s) => {
                  if (shapeCategoryTab === 'All') return true;
                  return s.category.toLowerCase().includes(shapeCategoryTab.toLowerCase().slice(0, 4));
                }).map((s) => {
                  const isSelectedShape = selectedShapeKind === s.id;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      title={s.name}
                      onClick={() => {
                        setSelectedShapeKind(s.id);
                        setActiveTool('shape');
                        const isLine = s.category === 'Lines';
                        const width = isLine ? 160 : 110;
                        const height = isLine ? 40 : 100;
                        const newEl: EditorElement = {
                          id: `shape-${Date.now()}`,
                          type: 'shape',
                          shapeKind: s.id,
                          shapeSvgPath: s.path,
                          pageIndex: currentPageIndex,
                          x: Math.round((pageDimensions.width - width) / 2),
                          y: 180,
                          width,
                          height,
                          fillColor: s.isClosed ? shapeFillColor : 'transparent',
                          color: shapeStrokeColor,
                          strokeWidth: shapeStrokeWidth,
                        };
                        const updated = [...elements, newEl];
                        setElements(updated);
                        pushHistory(updated);
                        setSelectedElementId(newEl.id);
                        setActiveTool('select');
                        setShapesOpen(false);
                      }}
                      className={`p-2 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all group ${
                        isSelectedShape
                          ? 'bg-blue-50 border-blue-500 shadow-xs ring-1 ring-blue-400'
                          : 'bg-slate-50 border-slate-200 hover:bg-white hover:border-blue-300'
                      }`}
                    >
                      <svg viewBox="0 0 100 100" className="w-6 h-6 flex-shrink-0 transition-transform group-hover:scale-110">
                        <path
                          d={s.path}
                          fill={s.isClosed ? (shapeFillColor !== 'transparent' ? shapeFillColor : '#e0e7ff') : 'none'}
                          stroke={shapeStrokeColor || '#2563eb'}
                          strokeWidth="7"
                          vectorEffect="non-scaling-stroke"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <span className="text-[9px] font-bold text-slate-700 truncate max-w-[58px] text-center">
                        {s.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Styling Controls: Fill Color */}
            <div className="pt-2 border-t border-slate-100 flex-shrink-0 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Fill Color
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setShapeFillColor('transparent');
                      updateSelectedElement({ fillColor: 'transparent' });
                    }}
                    className={`px-2 py-0.5 rounded-md text-[10px] font-bold border transition-colors ${
                      shapeFillColor === 'transparent'
                        ? 'bg-blue-50 border-blue-500 text-blue-700'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    No Fill
                  </button>
                  {['#ffffff', '#fef08a', '#bbf7d0', '#bae6fd', '#fbcfe8', '#0B1B3D'].map((bg) => (
                    <button
                      key={bg}
                      type="button"
                      onClick={() => {
                        setShapeFillColor(bg);
                        updateSelectedElement({ fillColor: bg });
                      }}
                      style={{ backgroundColor: bg }}
                      className={`w-5 h-5 rounded-full border transition-transform ${
                        shapeFillColor === bg ? 'ring-2 ring-blue-500 scale-110 border-white shadow-2xs' : 'border-slate-300 hover:scale-110'
                      }`}
                    />
                  ))}
                  <input
                    type="color"
                    value={shapeFillColor !== 'transparent' ? shapeFillColor : '#ffffff'}
                    onChange={(e) => {
                      setShapeFillColor(e.target.value);
                      updateSelectedElement({ fillColor: e.target.value });
                    }}
                    className="w-5 h-5 p-0 border border-slate-300 rounded cursor-pointer"
                    title="Custom fill color"
                  />
                </div>
              </div>

              {/* Stroke & Width */}
              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Outline &amp; Width
                </span>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    {['#000000', '#0B1B3D', '#2563eb', '#16a34a', '#dc2626'].map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => {
                          setShapeStrokeColor(c);
                          updateSelectedElement({ color: c });
                        }}
                        style={{ backgroundColor: c }}
                        className={`w-4 h-4 rounded-full border transition-transform ${
                          shapeStrokeColor === c ? 'ring-2 ring-blue-500 scale-115 border-white' : 'border-slate-300 hover:scale-110'
                        }`}
                      />
                    ))}
                    <input
                      type="color"
                      value={shapeStrokeColor}
                      onChange={(e) => {
                        setShapeStrokeColor(e.target.value);
                        updateSelectedElement({ color: e.target.value });
                      }}
                      className="w-4 h-4 p-0 border border-slate-300 rounded cursor-pointer"
                      title="Custom outline color"
                    />
                  </div>

                  <div className="flex items-center gap-1">
                    {[1, 2, 4, 6].map((w) => (
                      <button
                        key={w}
                        type="button"
                        onClick={() => {
                          setShapeStrokeWidth(w);
                          updateSelectedElement({ strokeWidth: w });
                        }}
                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold border transition-colors ${
                          shapeStrokeWidth === w
                            ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {w}px
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <p className="text-[10px] text-slate-400 italic text-center mt-2 flex-shrink-0">
              Click any shape to insert immediately, or drag on page to draw
            </p>
          </div>
        </>
      )}

      {/* 2.6E FREEHAND DRAW & PENCIL MODAL / POPOVER (IMG_20261102_125604.jpg) */}
      {pencilOpen && (
        <>
          <div
            className="fixed inset-0 z-45 bg-black/25 backdrop-blur-2xs"
            onClick={() => setPencilOpen(false)}
          />
          <div className="fixed inset-x-2 top-20 sm:top-24 sm:inset-x-auto sm:left-40 max-w-sm w-[95vw] sm:w-[320px] bg-white text-slate-800 rounded-3xl shadow-2xl border border-slate-200 p-4 z-50 animate-in zoom-in-95 mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <Pencil className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-[#0B1B3D] text-xs leading-tight">Draw &amp; Pen Options</h3>
                  <p className="text-[10px] text-slate-500">Ink color &bull; Pen tip thickness</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPencilOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Standard Ink Colors */}
            <div className="mb-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                Pen Ink Color
              </span>
              <div className="flex flex-wrap items-center gap-1.5">
                {[
                  { color: '#000000', label: 'Black' },
                  { color: '#0B1B3D', label: 'Navy' },
                  { color: '#2563eb', label: 'Blue' },
                  { color: '#dc2626', label: 'Red' },
                  { color: '#16a34a', label: 'Green' },
                  { color: '#ea580c', label: 'Orange' },
                  { color: '#9333ea', label: 'Purple' },
                  { color: '#64748b', label: 'Slate' },
                  { color: '#eab308', label: 'Yellow' },
                  { color: '#ffffff', label: 'White' },
                ].map((ink) => (
                  <button
                    key={ink.color}
                    type="button"
                    title={ink.label}
                    onClick={() => setPencilColor(ink.color)}
                    style={{ backgroundColor: ink.color }}
                    className={`w-6 h-6 rounded-full border transition-transform ${
                      pencilColor === ink.color
                        ? 'ring-2 ring-blue-500 scale-115 border-white shadow-xs'
                        : 'border-slate-300 hover:scale-110'
                    }`}
                  />
                ))}
                <div className="relative flex items-center">
                  <input
                    type="color"
                    value={pencilColor}
                    onChange={(e) => setPencilColor(e.target.value)}
                    className="w-6 h-6 p-0 rounded-full border border-slate-300 cursor-pointer overflow-hidden"
                    title="Custom Ink Color"
                  />
                </div>
              </div>
            </div>

            {/* Pen Stroke Width */}
            <div className="mb-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                Pen Tip Thickness
              </span>
              <div className="grid grid-cols-4 gap-1.5">
                {[
                  { w: 1, label: 'Fine (1px)' },
                  { w: 2, label: 'Medium (2px)' },
                  { w: 4, label: 'Thick (4px)' },
                  { w: 8, label: 'Marker (8px)' },
                ].map((tip) => (
                  <button
                    key={tip.w}
                    type="button"
                    onClick={() => setPencilWidth(tip.w)}
                    className={`py-1.5 px-2 rounded-xl text-[10px] font-bold border transition-all text-center flex flex-col items-center gap-1 ${
                      pencilWidth === tip.w
                        ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-2xs font-extrabold'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span
                      style={{
                        height: `${Math.min(tip.w, 6)}px`,
                        backgroundColor: pencilColor,
                        width: '28px',
                      }}
                      className="rounded-full inline-block"
                    />
                    <span>{tip.w}px</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Live Preview */}
            <div className="mb-3 bg-slate-50 p-2 rounded-xl border border-slate-100 flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-500">Live Stroke:</span>
              <svg className="w-36 h-5">
                <line
                  x1="5"
                  y1="10"
                  x2="135"
                  y2="10"
                  stroke={pencilColor}
                  strokeWidth={pencilWidth}
                  strokeLinecap="round"
                />
              </svg>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  const updated = elements.filter(
                    (el) => !(el.pageIndex === currentPageIndex && el.type === 'drawing')
                  );
                  setElements(updated);
                  pushHistory(updated);
                }}
                className="text-[10px] text-rose-600 hover:text-rose-700 font-bold px-2 py-1 rounded-lg hover:bg-rose-50 transition-colors"
                title="Remove freehand drawings on this page"
              >
                Clear Page Drawings
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTool('draw');
                  setPencilOpen(false);
                }}
                className="px-3.5 py-1.5 rounded-xl bg-[#0B1B3D] text-white text-xs font-extrabold shadow-sm hover:bg-[#122754] transition-colors"
              >
                Start Drawing
              </button>
            </div>
          </div>
        </>
      )}

      {/* 2.6F REAL FULL ERASER & WHITEOUT MODAL / POPOVER */}
      {eraserOpen && (
        <>
          <div
            className="fixed inset-0 z-45 bg-black/25 backdrop-blur-2xs"
            onClick={() => setEraserOpen(false)}
          />
          <div className="fixed inset-x-2 top-20 sm:top-24 sm:inset-x-auto sm:left-32 max-w-sm w-[95vw] sm:w-[320px] bg-white text-slate-800 rounded-3xl shadow-2xl border border-slate-200 p-4 z-50 animate-in zoom-in-95 mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
                  <Eraser className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-[#0B1B3D] text-xs leading-tight">Real Full Eraser</h3>
                  <p className="text-[10px] text-slate-500">Delete objects &bull; Whiteout sections</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEraserOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 mb-3 text-xs">
              <div
                onClick={() => {
                  setActiveTool('eraser');
                  setEraserOpen(false);
                }}
                className="p-2.5 rounded-2xl border border-slate-200 hover:border-rose-400 hover:bg-rose-50/40 cursor-pointer transition-all flex items-start gap-2.5"
              >
                <span className="w-6 h-6 rounded-lg bg-rose-100 text-rose-700 font-black text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                  1
                </span>
                <div>
                  <h4 className="font-extrabold text-slate-800 text-[11px]">Click-to-Delete Eraser</h4>
                  <p className="text-[10px] text-slate-500 leading-snug">
                    Click any shape, text box, table, signature, drawing, or detected PDF text line to erase it instantly.
                  </p>
                </div>
              </div>

              <div
                onClick={() => {
                  setActiveTool('eraser');
                  setEraserOpen(false);
                }}
                className="p-2.5 rounded-2xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/40 cursor-pointer transition-all flex items-start gap-2.5"
              >
                <span className="w-6 h-6 rounded-lg bg-blue-100 text-blue-700 font-black text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                  2
                </span>
                <div>
                  <h4 className="font-extrabold text-slate-800 text-[11px]">Drag-Box Whiteout</h4>
                  <p className="text-[10px] text-slate-500 leading-snug">
                    Click and drag a rectangle over any portion of the PDF page to cover and erase it with paper white.
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Wipe Actions */}
            <div className="pt-2 border-t border-slate-100 space-y-1.5">
              <button
                type="button"
                onClick={() => {
                  const updated = elements.filter(
                    (el) => !(el.pageIndex === currentPageIndex && el.type === 'drawing')
                  );
                  setElements(updated);
                  pushHistory(updated);
                  setEraserOpen(false);
                }}
                className="w-full py-1.5 px-2 rounded-xl text-[10px] font-bold text-slate-700 hover:bg-slate-100 border border-slate-200 text-center transition-colors"
              >
                Clear Freehand Drawings on this Page
              </button>
              <button
                type="button"
                onClick={() => {
                  const updated = elements.filter((el) => el.pageIndex !== currentPageIndex);
                  setElements(updated);
                  pushHistory(updated);
                  setSelectedElementId(null);
                  setEraserOpen(false);
                }}
                className="w-full py-1.5 px-2 rounded-xl text-[10px] font-extrabold text-rose-600 hover:bg-rose-50 border border-rose-200 text-center transition-colors"
              >
                Clear All Annotations on this Page
              </button>
            </div>
          </div>
        </>
      )}

      {/* 2.6D ELECTRONIC SIGNATURE MODAL (LIGHT THEME) */}
      {signatureModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-2xs animate-in fade-in">
          <div className="bg-white rounded-3xl p-5 max-w-md w-full shadow-2xl border border-slate-200 space-y-4 animate-in zoom-in-95 text-slate-800">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                  <FileSignature className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-[#0B1B3D] text-base leading-tight">Electronic Signature</h3>
                  <p className="text-[11px] text-slate-500">Sign PDF documents legally &amp; professionally</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSignatureModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Tab switch */}
            <div className="flex rounded-xl bg-slate-100 p-1 gap-1 text-xs font-bold">
              {[
                { id: 'draw', label: 'Draw' },
                { id: 'type', label: 'Type Cursive' },
                { id: 'upload', label: 'Upload' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setSignatureTab(tab.id as any)}
                  className={`flex-1 py-1.5 rounded-lg transition-all text-center ${
                    signatureTab === tab.id
                      ? 'bg-white text-slate-900 shadow-2xs font-extrabold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab 1: Draw Signature */}
            {signatureTab === 'draw' && (
              <div className="space-y-3">
                <div className="border border-slate-200 rounded-2xl bg-slate-50 overflow-hidden relative shadow-inner">
                  <canvas
                    ref={sigCanvasRef}
                    width={380}
                    height={150}
                    className="w-full h-36 bg-white cursor-crosshair touch-none"
                    onMouseDown={(e) => {
                      const canvas = sigCanvasRef.current;
                      if (!canvas) return;
                      const rect = canvas.getBoundingClientRect();
                      const ctx = canvas.getContext('2d');
                      if (!ctx) return;
                      ctx.beginPath();
                      ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
                      ctx.strokeStyle = signatureColor;
                      ctx.lineWidth = 2.5;
                      ctx.lineCap = 'round';
                      ctx.lineJoin = 'round';
                      setSignatureCanvasDrawing(true);
                    }}
                    onMouseMove={(e) => {
                      if (!signatureCanvasDrawing) return;
                      const canvas = sigCanvasRef.current;
                      if (!canvas) return;
                      const rect = canvas.getBoundingClientRect();
                      const ctx = canvas.getContext('2d');
                      if (!ctx) return;
                      ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
                      ctx.stroke();
                    }}
                    onMouseUp={() => setSignatureCanvasDrawing(false)}
                    onMouseLeave={() => setSignatureCanvasDrawing(false)}
                    onTouchStart={(e) => {
                      const canvas = sigCanvasRef.current;
                      if (!canvas || !e.touches[0]) return;
                      const rect = canvas.getBoundingClientRect();
                      const ctx = canvas.getContext('2d');
                      if (!ctx) return;
                      ctx.beginPath();
                      ctx.moveTo(e.touches[0].clientX - rect.left, e.touches[0].clientY - rect.top);
                      ctx.strokeStyle = signatureColor;
                      ctx.lineWidth = 2.5;
                      ctx.lineCap = 'round';
                      ctx.lineJoin = 'round';
                      setSignatureCanvasDrawing(true);
                    }}
                    onTouchMove={(e) => {
                      if (!signatureCanvasDrawing || !e.touches[0]) return;
                      const canvas = sigCanvasRef.current;
                      if (!canvas) return;
                      const rect = canvas.getBoundingClientRect();
                      const ctx = canvas.getContext('2d');
                      if (!ctx) return;
                      ctx.lineTo(e.touches[0].clientX - rect.left, e.touches[0].clientY - rect.top);
                      ctx.stroke();
                    }}
                    onTouchEnd={() => setSignatureCanvasDrawing(false)}
                  />
                  <div className="absolute bottom-2 left-3 text-[10px] text-slate-400 select-none pointer-events-none">
                    Sign above using finger, stylus or mouse
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  {/* Ink color */}
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
                    <span>Ink:</span>
                    {['#0B1B3D', '#000000', '#1d4ed8'].map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setSignatureColor(c)}
                        style={{ backgroundColor: c }}
                        className={`w-5 h-5 rounded-full border ${
                          signatureColor === c ? 'ring-2 ring-blue-500 scale-110' : 'border-slate-300'
                        }`}
                      />
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      const canvas = sigCanvasRef.current;
                      if (!canvas) return;
                      const ctx = canvas.getContext('2d');
                      ctx?.clearRect(0, 0, canvas.width, canvas.height);
                    }}
                    className="text-xs font-bold text-rose-600 hover:text-rose-700 hover:underline"
                  >
                    Clear Canvas
                  </button>
                </div>
              </div>
            )}

            {/* Tab 2: Type Signature */}
            {signatureTab === 'type' && (
              <div className="space-y-3">
                <input
                  type="text"
                  value={typedSignature}
                  onChange={(e) => setTypedSignature(e.target.value)}
                  placeholder="Type your name or initials"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:border-blue-500 outline-hidden font-bold"
                />

                <div className="space-y-2">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                    Choose Script Style
                  </span>
                  <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                    {[
                      { id: 'DancingScript', label: 'Dancing Script' },
                      { id: 'GreatVibes', label: 'Great Vibes' },
                      { id: 'Pacifico', label: 'Pacifico' },
                      { id: 'Sacramento', label: 'Sacramento' },
                      { id: 'Parisienne', label: 'Parisienne' },
                      { id: 'AlexBrush', label: 'Alex Brush' },
                    ].map((f) => (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => setSignatureFont(f.id)}
                        style={{ fontFamily: getFontCss(f.id), color: signatureColor }}
                        className={`p-2 rounded-xl border text-lg text-center transition-all ${
                          signatureFont === f.id
                            ? 'bg-blue-50 border-blue-500 ring-1 ring-blue-400'
                            : 'bg-white border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        {typedSignature || 'Signature'}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
                  <span>Ink:</span>
                  {['#0B1B3D', '#000000', '#1d4ed8'].map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setSignatureColor(c)}
                      style={{ backgroundColor: c }}
                      className={`w-5 h-5 rounded-full border ${
                        signatureColor === c ? 'ring-2 ring-blue-500 scale-110' : 'border-slate-300'
                      }`}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Tab 3: Upload Signature */}
            {signatureTab === 'upload' && (
              <div className="space-y-3">
                <label className="border-2 border-dashed border-slate-300 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 hover:border-blue-500 transition-colors">
                  <Upload className="w-8 h-8 text-blue-600 mb-2" />
                  <span className="text-xs font-bold text-slate-700">Click to upload signature image</span>
                  <span className="text-[10px] text-slate-400">PNG or JPG (transparent recommended)</span>
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onload = (ev) => {
                        const dataUrl = ev.target?.result as string;
                        if (!dataUrl) return;
                        const newElement: EditorElement = {
                          id: `sig-${Date.now()}`,
                          type: 'signature',
                          pageIndex: currentPageIndex,
                          x: 60,
                          y: 120,
                          width: 160,
                          height: 70,
                          imageDataUrl: dataUrl,
                          signatureType: 'upload',
                        };
                        const updated = [...elements, newElement];
                        setElements(updated);
                        pushHistory(updated);
                        setSelectedElementId(newElement.id);
                        setSignatureModalOpen(false);
                      };
                      reader.readAsDataURL(file);
                    }}
                  />
                </label>
              </div>
            )}

            {/* Footer Actions */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSignatureModalOpen(false)}
                className="px-4 py-2 rounded-xl text-slate-600 font-bold text-xs hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              {signatureTab !== 'upload' && (
                <button
                  type="button"
                  onClick={() => {
                    if (signatureTab === 'draw') {
                      const canvas = sigCanvasRef.current;
                      if (!canvas) return;
                      const dataUrl = canvas.toDataURL('image/png');
                      const newElement: EditorElement = {
                        id: `sig-${Date.now()}`,
                        type: 'signature',
                        pageIndex: currentPageIndex,
                        x: 60,
                        y: 120,
                        width: 180,
                        height: 75,
                        imageDataUrl: dataUrl,
                        signatureType: 'draw',
                      };
                      const updated = [...elements, newElement];
                      setElements(updated);
                      pushHistory(updated);
                      setSelectedElementId(newElement.id);
                      setSignatureModalOpen(false);
                    } else if (signatureTab === 'type') {
                      const newElement: EditorElement = {
                        id: `sig-${Date.now()}`,
                        type: 'signature',
                        pageIndex: currentPageIndex,
                        x: 60,
                        y: 120,
                        width: 200,
                        height: 50,
                        text: typedSignature || 'Signature',
                        fontFamily: signatureFont,
                        fontSize: 26,
                        color: signatureColor,
                        signatureType: 'type',
                      };
                      const updated = [...elements, newElement];
                      setElements(updated);
                      pushHistory(updated);
                      setSelectedElementId(newElement.id);
                      setSignatureModalOpen(false);
                    }
                  }}
                  className="px-5 py-2 rounded-xl bg-[#0B1B3D] text-white font-bold text-xs hover:bg-[#122754] transition-colors shadow-xs"
                >
                  Insert Signature
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 2.6E ADD COMMENT / NOTE MODAL (LIGHT THEME) */}
      {commentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-2xs animate-in fade-in">
          <div className="bg-white rounded-3xl p-5 max-w-sm w-full shadow-2xl border border-slate-200 space-y-4 animate-in zoom-in-95 text-slate-800">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                  <MessageSquarePlus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-[#0B1B3D] text-base leading-tight">Add Comment / Note</h3>
                  <p className="text-[11px] text-slate-500">Attach sticky notes &amp; review feedback</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setCommentModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Author & Color */}
            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Author Name:</label>
                <input
                  type="text"
                  value={commentAuthor}
                  onChange={(e) => setCommentAuthor(e.target.value)}
                  placeholder="Reviewer"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:border-blue-500 outline-hidden font-bold"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Note Color:</label>
                <div className="flex items-center gap-2">
                  {[
                    { name: 'Yellow', bg: '#FEF08A', border: '#EAB308' },
                    { name: 'Blue', bg: '#BAE6FD', border: '#38BDF8' },
                    { name: 'Green', bg: '#BBF7D0', border: '#4ADE80' },
                    { name: 'Pink', bg: '#FBCFE8', border: '#F472B6' },
                    { name: 'Lavender', bg: '#E9D5FF', border: '#C084FC' },
                  ].map((c) => (
                    <button
                      key={c.bg}
                      type="button"
                      onClick={() => setCommentColor(c.bg)}
                      style={{ backgroundColor: c.bg, borderColor: c.border }}
                      className={`w-7 h-7 rounded-xl border-2 transition-transform ${
                        commentColor === c.bg ? 'scale-115 ring-2 ring-blue-500' : 'hover:scale-105'
                      }`}
                      title={c.name}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Comment / Feedback:</label>
                <textarea
                  rows={3}
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Write feedback, revision suggestions, or sticky reminder..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:border-blue-500 outline-hidden"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setCommentModalOpen(false)}
                className="px-4 py-2 rounded-xl text-slate-600 font-bold text-xs hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!commentText.trim()) return;
                  const newElement: EditorElement = {
                    id: `comment-${Date.now()}`,
                    type: 'comment',
                    pageIndex: currentPageIndex,
                    x: 60,
                    y: 120,
                    width: 190,
                    height: 65,
                    text: commentText.trim(),
                    commentAuthor: commentAuthor.trim() || 'Reviewer',
                    fillColor: commentColor,
                    strokeColor:
                      commentColor === '#FEF08A'
                        ? '#EAB308'
                        : commentColor === '#BAE6FD'
                        ? '#38BDF8'
                        : commentColor === '#BBF7D0'
                        ? '#4ADE80'
                        : commentColor === '#FBCFE8'
                        ? '#F472B6'
                        : '#C084FC',
                  };
                  const updated = [...elements, newElement];
                  setElements(updated);
                  pushHistory(updated);
                  setSelectedElementId(newElement.id);
                  setCommentText('');
                  setCommentModalOpen(false);
                }}
                className="px-5 py-2 rounded-xl bg-[#0B1B3D] text-white font-bold text-xs hover:bg-[#122754] transition-colors shadow-xs"
              >
                Add Comment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2.6F SELECTED ELEMENT OPTIONS MODAL / POPOVER (LIGHT THEME) */}
      {elementOptionsOpen && selectedElement && (
        <>
          <div
            className="fixed inset-0 z-45 bg-black/25 backdrop-blur-2xs"
            onClick={() => setElementOptionsOpen(false)}
          />
          <div className="fixed inset-x-2 top-24 sm:top-28 sm:inset-x-auto sm:left-64 max-w-[340px] w-[95vw] sm:w-80 bg-white text-slate-800 rounded-2xl shadow-2xl border border-slate-200 p-4 z-50 animate-in zoom-in-95 mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-slate-100">
              <div className="flex items-center gap-1.5">
                <Settings2 className="w-4 h-4 text-blue-600" />
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-700">
                  {selectedElement.type.toUpperCase()} Options
                </span>
              </div>
              <button
                type="button"
                onClick={() => setElementOptionsOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Actions Grid */}
            <div className="grid grid-cols-2 gap-2 mb-3">
              {/* Bring to Front */}
              <button
                type="button"
                onClick={() => {
                  const without = elements.filter((e) => e.id !== selectedElement.id);
                  const updated = [...without, selectedElement];
                  setElements(updated);
                  pushHistory(updated);
                }}
                className="p-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-blue-50 hover:border-blue-300 text-xs font-bold text-slate-700 flex items-center gap-2 transition-colors"
              >
                <ArrowUp className="w-3.5 h-3.5 text-blue-600" />
                <span>Bring Front</span>
              </button>

              {/* Send to Back */}
              <button
                type="button"
                onClick={() => {
                  const without = elements.filter((e) => e.id !== selectedElement.id);
                  const updated = [selectedElement, ...without];
                  setElements(updated);
                  pushHistory(updated);
                }}
                className="p-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-blue-50 hover:border-blue-300 text-xs font-bold text-slate-700 flex items-center gap-2 transition-colors"
              >
                <ArrowDown className="w-3.5 h-3.5 text-indigo-600" />
                <span>Send Back</span>
              </button>

              {/* Duplicate */}
              <button
                type="button"
                onClick={() => {
                  const duplicate: EditorElement = {
                    ...selectedElement,
                    id: `${selectedElement.type}-${Date.now()}`,
                    x: selectedElement.x + 20,
                    y: selectedElement.y + 20,
                  };
                  const updated = [...elements, duplicate];
                  setElements(updated);
                  pushHistory(updated);
                  setSelectedElementId(duplicate.id);
                }}
                className="p-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-emerald-50 hover:border-emerald-300 text-xs font-bold text-slate-700 flex items-center gap-2 transition-colors"
              >
                <Copy className="w-3.5 h-3.5 text-emerald-600" />
                <span>Duplicate</span>
              </button>

              {/* Rotate 90 */}
              <button
                type="button"
                onClick={() => {
                  const currentRot = selectedElement.rotation || 0;
                  const newRot = (currentRot + 90) % 360;
                  updateSelectedElement({ rotation: newRot });
                }}
                className="p-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-amber-50 hover:border-amber-300 text-xs font-bold text-slate-700 flex items-center gap-2 transition-colors"
              >
                <RotateCw className="w-3.5 h-3.5 text-amber-600" />
                <span>Rotate 90°</span>
              </button>
            </div>

            {/* Opacity Slider */}
            <div className="mb-3">
              <div className="flex items-center justify-between text-xs font-bold text-slate-600 mb-1">
                <span>Opacity:</span>
                <span>{Math.round((selectedElement.opacity ?? 1) * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="1"
                step="0.05"
                value={selectedElement.opacity ?? 1}
                onChange={(e) => updateSelectedElement({ opacity: parseFloat(e.target.value) })}
                className="w-full accent-blue-600 cursor-pointer"
              />
            </div>

            <div className="h-px bg-slate-100 my-2.5" />

            {/* Delete Button */}
            <button
              type="button"
              onClick={() => {
                handleDeleteSelected();
                setElementOptionsOpen(false);
              }}
              className="w-full py-2 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete This Element</span>
            </button>
          </div>
        </>
      )}

      {/* 2.7 FULL MS WORD NUMBERING & ROMAN LETTERS LIBRARY MODAL / POPOVER (LIGHT THEME) */}
      {numberingOpen && (
        <>
          <div
            className="fixed inset-0 z-45 bg-black/25 backdrop-blur-2xs"
            onClick={() => setNumberingOpen(false)}
          />
          <div className="fixed inset-x-2 top-24 sm:top-28 sm:inset-x-auto sm:left-64 max-w-[360px] w-[95vw] sm:w-[350px] bg-white text-slate-800 rounded-2xl shadow-2xl border border-slate-200 p-4 z-50 animate-in zoom-in-95 mx-auto max-h-[75vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-slate-100 sticky top-0 bg-white z-10">
              <div className="flex items-center gap-1.5">
                <ListOrdered className="w-4 h-4 text-blue-600" />
                <span className="text-[12px] font-extrabold uppercase tracking-wider text-slate-700">
                  Numbering Library
                </span>
              </div>
              <button
                type="button"
                onClick={() => setNumberingOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Section 1: Numbering Formats (Roman, Alphabetical, Numerical) */}
            <div className="mb-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                Numbering Formats
              </span>
              <div className="grid grid-cols-2 gap-2">
                {NUMBERING_LIBRARY.slice(0, 16).map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleApplyNumbering(item.id)}
                    className="p-2 rounded-xl bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-500 text-left transition-all group flex flex-col justify-center"
                  >
                    <span className="text-[11px] font-black text-blue-700 group-hover:text-blue-900 mb-1">
                      {item.label}
                    </span>
                    <div className="space-y-0.5 opacity-80">
                      {item.preview.map((pLine, pIdx) => (
                        <div key={pIdx} className="flex items-center gap-1.5 text-[10px] text-slate-600 font-mono">
                          <span className="font-bold">{pLine.split(' ')[0]}</span>
                          <span className="w-8 h-1 bg-slate-300 rounded-full inline-block" />
                        </div>
                      ))}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Section 2: Bullets & Symbols */}
            <div className="mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                Multi-level / Bullet Formats
              </span>
              <div className="grid grid-cols-2 gap-2">
                {NUMBERING_LIBRARY.slice(16).map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleApplyNumbering(item.id)}
                    className="p-2 rounded-xl bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-500 text-left transition-all group flex flex-col justify-center"
                  >
                    <span className="text-[11px] font-black text-emerald-700 group-hover:text-emerald-900 mb-1">
                      {item.label}
                    </span>
                    <div className="space-y-0.5 opacity-80">
                      {item.preview.map((pLine, pIdx) => (
                        <div key={pIdx} className="flex items-center gap-1.5 text-[10px] text-slate-600 font-mono">
                          <span className="font-bold">{pLine.split(' ')[0]}</span>
                          <span className="w-8 h-1 bg-slate-300 rounded-full inline-block" />
                        </div>
                      ))}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {/* 6. LONG-PRESS / RIGHT-CLICK QUICK ACTION CONTEXT MENU */}
      {contextMenu?.isOpen && contextMenu.elementId && (
        <>
          <div
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-2xs animate-in fade-in"
            onClick={() => setContextMenu(null)}
          />
          <div
            className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-xs sm:max-w-sm bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 text-slate-800"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-[#0B1B3D] text-white px-4 py-3 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-2">
                {(() => {
                  const targetEl = elements.find((i) => i.id === contextMenu.elementId);
                  if (targetEl?.type === 'image') return <ImageIcon className="w-4 h-4 text-lime-400" />;
                  if (targetEl?.type === 'rectangle' || targetEl?.type === 'circle') return <Square className="w-4 h-4 text-lime-400" />;
                  return <Sparkles className="w-4 h-4 text-lime-400" />;
                })()}
                <span className="text-xs font-black uppercase tracking-wider text-slate-100">
                  {(() => {
                    const targetEl = elements.find((i) => i.id === contextMenu.elementId);
                    if (targetEl?.type === 'image') return 'Photo / Image Options';
                    if (targetEl?.type === 'rectangle' || targetEl?.type === 'circle') return 'Shape Options';
                    return 'Element Options';
                  })()}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setContextMenu(null)}
                className="p-1 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Menu Options */}
            <div className="p-2.5 space-y-1 text-xs">
              {/* Replace Photo (If element is an image) */}
              {elements.find((i) => i.id === contextMenu.elementId)?.type === 'image' && (
                <button
                  type="button"
                  onClick={() => {
                    imageActionTypeRef.current = 'replace';
                    imageInputRef.current?.click();
                    setContextMenu(null);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl bg-blue-50 text-blue-900 hover:bg-blue-100 transition-colors"
                >
                  <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0">
                    <ImageIcon className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <div className="font-extrabold text-blue-950">Replace Photo</div>
                    <div className="text-[10px] text-blue-700/80">Swap with another image from device</div>
                  </div>
                </button>
              )}

              {/* Insert New Photo */}
              <button
                type="button"
                onClick={() => {
                  imageActionTypeRef.current = 'insert';
                  imageInputRef.current?.click();
                  setContextMenu(null);
                }}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-200">
                  <ImagePlus className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <div className="font-bold text-slate-800">Insert New Photo</div>
                  <div className="text-[10px] text-slate-500">Upload and add another image</div>
                </div>
              </button>

              {/* Insert Shapes Quick Section */}
              <div className="pt-1.5 pb-1">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block px-2 mb-1">
                  Insert Shape
                </span>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleInsertNewShape('rectangle')}
                    className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl bg-slate-50 hover:bg-blue-50 hover:border-blue-300 border border-slate-200 text-slate-700 font-bold transition-colors"
                  >
                    <Square className="w-3.5 h-3.5 text-blue-600" />
                    <span>Rectangle</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleInsertNewShape('circle')}
                    className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl bg-slate-50 hover:bg-blue-50 hover:border-blue-300 border border-slate-200 text-slate-700 font-bold transition-colors"
                  >
                    <Circle className="w-3.5 h-3.5 text-blue-600" />
                    <span>Circle</span>
                  </button>
                </div>
              </div>

              <div className="h-px bg-slate-100 my-1.5" />

              {/* Duplicate */}
              <button
                type="button"
                onClick={() => handleDuplicateElement(contextMenu.elementId!)}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-100 transition-colors font-semibold"
              >
                <Copy className="w-4 h-4 text-slate-600" />
                <span>Duplicate (Clone)</span>
              </button>

              {/* Rotate 90° Clockwise */}
              <button
                type="button"
                onClick={() => {
                  handleRotateElement90(contextMenu.elementId!);
                  setContextMenu(null);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-100 transition-colors font-semibold"
              >
                <RotateCw className="w-4 h-4 text-slate-600" />
                <span>Rotate 90&deg; Clockwise</span>
              </button>

              {/* Layer Ordering: Bring to Front / Send to Back */}
              <div className="grid grid-cols-2 gap-1.5 pt-1">
                <button
                  type="button"
                  onClick={() => handleBringToFront(contextMenu.elementId!)}
                  className="flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold"
                >
                  <ArrowUp className="w-3.5 h-3.5 text-slate-600" />
                  <span>Bring to Front</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSendToBack(contextMenu.elementId!)}
                  className="flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold"
                >
                  <ArrowDown className="w-3.5 h-3.5 text-slate-600" />
                  <span>Send to Back</span>
                </button>
              </div>

              <div className="h-px bg-slate-100 my-1.5" />

              {/* Delete Element */}
              <button
                type="button"
                onClick={() => {
                  const idToDelete = contextMenu.elementId!;
                  setElements((prev) => {
                    const updated = prev.filter((i) => i.id !== idToDelete);
                    pushHistory(updated);
                    return updated;
                  });
                  setSelectedElementId(null);
                  setContextMenu(null);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 transition-colors font-black"
              >
                <Trash2 className="w-4 h-4 text-rose-600" />
                <span>Delete Element</span>
              </button>
            </div>
          </div>
        </>
      )}

    </div>
  );
}
