export type ToolCategory =
  | 'convert-to'
  | 'convert-from'
  | 'edit'
  | 'organize'
  | 'security';

export interface PDFTool {
  id: string;
  name: string;
  shortDesc: string;
  category: ToolCategory;
  badge?: string;
  popular?: boolean;
  iconName: string;
  bgColor: string;
  borderColor: string;
  iconColor: string;
  badgeColor?: string;
  href: string;
  acceptTypes?: string;
  multipleFiles?: boolean;
}

export interface CategoryItem {
  id: ToolCategory | 'all';
  name: string;
  count: number;
}

export interface TaskLogPayload {
  toolId: string;
  toolName: string;
  fileName: string;
  fileSize: number;
  status: 'COMPLETED' | 'FAILED';
}
