'use client';

import { useCallback, useState } from 'react';

interface DropZoneProps {
  onFileSelect: (file: File) => void;
  isLoading: boolean;
}

export function DropZone({ onFileSelect, isLoading }: DropZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file && file.type === 'application/pdf') {
        onFileSelect(file);
      }
    },
    [onFileSelect]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragOver(false);
  }, []);

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) onFileSelect(file);
    },
    [onFileSelect]
  );

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bp-bg">
        <p className="text-bp-text">読み込み中...</p>
      </div>
    );
  }

  return (
    <div
      className={`flex min-h-screen items-center justify-center bg-bp-bg p-8 transition-colors ${
        isDragOver ? 'bg-bp-grid/30' : ''
      }`}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      <label
        className={`flex h-80 w-full max-w-2xl cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed transition-colors ${
          isDragOver
            ? 'border-bp-accent bg-bp-accent/5'
            : 'border-bp-border bg-bp-panel hover:border-bp-accent/50'
        }`}
      >
        <div className="text-6xl mb-4 opacity-40">📄</div>
        <p className="text-lg font-medium text-bp-text mb-2">PDFをドロップ</p>
        <p className="text-sm text-bp-text/60">または クリックして選択</p>
        <input
          type="file"
          accept=".pdf"
          onChange={handleFileInput}
          className="hidden"
        />
      </label>
    </div>
  );
}
