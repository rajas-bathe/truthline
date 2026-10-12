import { FileText, Image, Music, FileSpreadsheet, Globe, File } from 'lucide-react';
import React from 'react';
import type { InputType } from '../types';

export function formatDate(dateString: string | undefined): string {
  if (!dateString) return 'Unknown date';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  } catch {
    return dateString;
  }
}

export function formatDuration(ms: number | undefined): string {
  if (!ms || ms <= 0) return '0s';
  const seconds = (ms / 1000).toFixed(1);
  return `${seconds}s`;
}

export function truncateText(text: string, maxLength = 80): string {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

export function getFileTypeIcon(type: InputType | string): React.ComponentType<{ className?: string }> {
  switch (type.toLowerCase()) {
    case 'image':
      return Image;
    case 'audio':
      return Music;
    case 'pdf':
      return FileSpreadsheet;
    case 'url':
      return Globe;
    case 'text':
      return FileText;
    default:
      return File;
  }
}
