import React, { useState } from 'react';
import { X, ZoomIn, ZoomOut, RotateCw, ExternalLink, FileText } from 'lucide-react';

interface ImageLightboxProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  title: string;
  driveUrl?: string;
}

export const ImageLightbox: React.FC<ImageLightboxProps> = ({
  isOpen,
  onClose,
  imageUrl,
  title,
  driveUrl,
}) => {
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);

  if (!isOpen) return null;

  const handleZoomIn = () => setScale(prev => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setScale(prev => Math.max(prev - 0.25, 0.5));
  const handleRotate = () => setRotation(prev => (prev + 90) % 360);
  const handleReset = () => {
    setScale(1);
    setRotation(0);
  };

  const isPdf = Boolean(
    imageUrl &&
    (imageUrl.startsWith('data:application/pdf') || (title && title.toLowerCase().endsWith('.pdf')))
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="relative w-full max-w-5xl bg-slate-900 rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Header bar */}
        <div className="flex items-center justify-between px-4 py-3 bg-slate-800 border-b border-slate-700 text-white">
          <div className="flex items-center gap-2 truncate">
            <span className="text-emerald-400 text-lg">📄</span>
            <span className="font-semibold text-sm truncate">{title || 'รูปภาพเอกสารใบเสร็จ/บิลยา'}</span>
          </div>

          <div className="flex items-center gap-2">
            {!isPdf && imageUrl && (
              <>
                <button
                  onClick={handleZoomIn}
                  className="p-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 transition-colors"
                  title="ขยายรูป"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <button
                  onClick={handleZoomOut}
                  className="p-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 transition-colors"
                  title="ย่อรูป"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <button
                  onClick={handleRotate}
                  className="p-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 transition-colors"
                  title="หมุน 90 องศา"
                >
                  <RotateCw className="w-4 h-4" />
                </button>
                <button
                  onClick={handleReset}
                  className="px-2 py-1 text-xs rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 transition-colors"
                  title="รีเซ็ตขนาด"
                >
                  100%
                </button>
              </>
            )}

            {driveUrl && (
              <a
                href={driveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 px-2.5 py-1 text-xs rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-colors"
              >
                <span>Google Drive</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-700 hover:bg-rose-600 text-slate-200 hover:text-white transition-colors ml-2"
              title="ปิด"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Viewport */}
        <div className="relative flex-1 overflow-auto p-4 flex items-center justify-center min-h-[350px] bg-slate-950">
          {!imageUrl ? (
            <div className="text-center text-slate-400 p-8">
              <FileText className="w-12 h-12 mx-auto mb-2 text-slate-500" />
              <p className="text-sm font-medium">ดูไฟล์ต้นฉบับใน Google Drive</p>
              {driveUrl && (
                <a
                  href={driveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-colors"
                >
                  <span>เปิด Google Drive Folder</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          ) : isPdf ? (
            <iframe
              src={imageUrl}
              className="w-full h-[70vh] rounded-lg border border-slate-700 bg-white"
              title="PDF Preview"
            />
          ) : (
            <div className="overflow-auto max-w-full max-h-full flex items-center justify-center">
              <img
                src={imageUrl}
                alt={title}
                className="transition-transform duration-200 object-contain rounded-lg shadow-lg"
                style={{
                  transform: `scale(${scale}) rotate(${rotation}deg)`,
                  maxHeight: scale === 1 ? '72vh' : 'none',
                }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
