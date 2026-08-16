// ===== Core Models for resumeForge =====

export interface User {
  id: number;
  name: string;
  email: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface Document {
  id: number;
  title: string;
  type: string;
  templateId?: number;
  shareSlug?: string;
  userId?: number;
  createdAt: string;
  updatedAt: string;
  sections?: Section[];
  tags?: string[];
}

export interface Section {
  id: number;
  documentId: number;
  title: string;
  order: number;
  items?: Item[];
}

export interface Item {
  id: number;
  sectionId: number;
  content: string;
  order: number;
}

export interface Template {
  id: number;
  name: string;
  type: string;
  config?: any;
  previewColor?: string;
  description?: string;
}

export type AppStatus = 'Saved' | 'Applied' | 'Interview' | 'Offer' | 'Rejected';

export interface Application {
  id: number;
  company: string;
  role: string;
  status: AppStatus;
  documentId?: number;
  document?: { id: number; title: string };
  userId?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Share {
  id: number;
  documentId: number;
  slug: string;
  document?: { id: number; title: string };
  createdAt: string;
}

export interface DashboardStats {
  documents: number;
  applications: number;
  versions: number;
  exports: number;
  recentDocuments: RecentDoc[];
  applicationPipeline: PipelineItem[];
}

export interface RecentDoc {
  id: number;
  title: string;
  type: string;
  updatedAt: string;
}

export interface PipelineItem {
  status: string;
  count: number;
}

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
}
