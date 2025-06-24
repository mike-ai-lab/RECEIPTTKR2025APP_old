
import React, { useEffect } from 'react';

interface PdfPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  pdfUrl: string | null;
  fileName?: string;
}

export const PdfPreviewModal: React.FC<PdfPreviewModalProps> = ({ isOpen, onClose, pdfUrl, fileName }) => {
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden'; // Prevent background scrolling
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !pdfUrl) {
    return null;
  }

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[100] p-4"
      aria-labelledby="pdf-preview-modal-title"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-base-100 rounded-lg shadow-xl w-full h-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b border-base-300 bg-base-200">
          <h2 id="pdf-preview-modal-title" className="text-lg font-semibold text-primary truncate pr-2" title={fileName}>
            Preview: {fileName || 'PDF Document'}
          </h2>
          <button
            onClick={onClose}
            className="text-neutral hover:text-accent p-1 rounded-full focus:outline-none focus:ring-2 focus:ring-accent"
            aria-label="Close PDF preview"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="flex-grow p-1 bg-neutral/10">
          <iframe
            src={pdfUrl}
            title={`PDF Preview: ${fileName || 'Document'}`}
            width="100%"
            height="100%"
            className="border-none"
            allowFullScreen
          />
        </div>
         <div className="p-3 border-t border-base-300 text-xs text-neutral/70 bg-base-200 text-center">
            Note: PDF rendering is handled by your browser. For advanced features, download and use a dedicated PDF viewer.
        </div>
      </div>
    </div>
  );
};