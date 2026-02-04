'use client';

import { useState } from 'react';

interface ViewControlsProps {
  showGrid: boolean;
  setShowGrid: (v: boolean) => void;
  gridSize: number;
  setGridSize: (v: number) => void;
  snapEnabled: boolean;
  setSnapEnabled: (v: boolean) => void;
  scale: number;
  setScale: (v: number) => void;
  currentPage: number;
  setCurrentPage: (v: number) => void;
  totalPages: number;
}

export function ViewControls({
  showGrid,
  setShowGrid,
  gridSize,
  setGridSize,
  snapEnabled,
  setSnapEnabled,
  scale,
  setScale,
  currentPage,
  setCurrentPage,
  totalPages,
}: ViewControlsProps) {
  const [showGridPopover, setShowGridPopover] = useState(false);

  return (
    <div className="flex items-center justify-between border-t border-bp-border bg-bp-panel/80 px-3 py-1.5 text-sm">
      {/* グリッド設定 */}
      <div className="relative">
        <button
          onClick={() => setShowGridPopover(!showGridPopover)}
          className={`rounded px-2 py-0.5 text-xs transition-colors ${
            snapEnabled ? 'bg-bp-accent text-white' : 'bg-bp-bg text-bp-text'
          }`}
        >
          グリッド {gridSize}pt
        </button>
        {showGridPopover && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setShowGridPopover(false)} />
            <div className="absolute bottom-full left-0 z-20 mb-1 w-48 rounded border border-bp-border bg-bp-panel p-3 shadow-lg">
              <label className="mb-2 flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  checked={showGrid}
                  onChange={(e) => setShowGrid(e.target.checked)}
                  className="h-3.5 w-3.5"
                />
                <span className="text-xs">グリッド表示</span>
              </label>
              <label className="mb-2 flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  checked={snapEnabled}
                  onChange={(e) => setSnapEnabled(e.target.checked)}
                  className="h-3.5 w-3.5"
                />
                <span className="text-xs">スナップ</span>
              </label>
              <div className="grid grid-cols-5 gap-1">
                {[5, 7.5, 10, 25, 50].map((size) => (
                  <button
                    key={size}
                    onClick={() => setGridSize(size)}
                    className={`rounded px-1.5 py-0.5 text-xs ${
                      gridSize === size ? 'bg-bp-accent text-white' : 'bg-bp-bg hover:bg-bp-border'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {/* ズーム */}
      <select
        value={scale}
        onChange={(e) => setScale(Number(e.target.value))}
        className="rounded border border-bp-border bg-bp-panel px-2 py-0.5 text-xs font-mono"
      >
        <option value={1}>100%</option>
        <option value={1.5}>150%</option>
        <option value={2}>200%</option>
      </select>

      {/* ページ切り替え */}
      {totalPages > 1 && (
        <div className="flex items-center gap-1">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage <= 1}
            className="rounded px-1.5 py-0.5 text-xs hover:bg-bp-bg disabled:opacity-30"
          >
            ◀
          </button>
          <span className="font-mono text-xs">
            {currentPage}/{totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage >= totalPages}
            className="rounded px-1.5 py-0.5 text-xs hover:bg-bp-bg disabled:opacity-30"
          >
            ▶
          </button>
        </div>
      )}
    </div>
  );
}
