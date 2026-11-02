export interface TableData {
  rows: number;
  cols: number;
  cells: string[][];
  headerBg?: string;
  borderColor?: string;
}

export interface EditorElement {
  id: string;
  type:
    | 'text'
    | 'image'
    | 'rectangle'
    | 'circle'
    | 'highlight'
    | 'drawing'
    | 'table'
    | 'line'
    | 'arrow'
    | 'stamp'
    | 'eraser'
    | 'comment'
    | 'signature'
    | 'shape';
  pageIndex: number;
  x: number;
  y: number;
  width: number;
  height: number;
  shapeKind?: string;
  shapeSvgPath?: string;
  shapeViewBox?: string;
  text?: string;
  fontFamily?: string;
  fontSize?: number;
  isBold?: boolean;
  isItalic?: boolean;
  isUnderline?: boolean;
  isStrikethrough?: boolean;
  textAlign?: 'left' | 'center' | 'right';
  lineSpacing?: number;
  headingStyle?: 'normal' | 'h1' | 'h2' | 'h3' | 'subtitle';
  color?: string;
  textColor?: string;
  strokeColor?: string;
  fillColor?: string;
  strokeWidth?: number;
  opacity?: number;
  imageData?: string;
  imageDataUrl?: string;
  drawingPoints?: { x: number; y: number }[];
  tableData?: TableData;
  stampType?: string;
  rotation?: number;
  originalText?: string;
  isOriginalReplacement?: boolean;
  commentAuthor?: string;
  commentDate?: string;
  isCommentExpanded?: boolean;
  signatureType?: 'draw' | 'type' | 'upload';
}

export interface PDFInfo {
  pageCount: number;
  title?: string;
  author?: string;
  subject?: string;
  keywords?: string;
  creator?: string;
  producer?: string;
  creationDate?: Date;
  modificationDate?: Date;
}
