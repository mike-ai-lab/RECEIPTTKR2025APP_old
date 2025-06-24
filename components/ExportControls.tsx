
import React from 'react';
import { DownloadIcon } from './icons/DownloadIcon';
import { PdfIcon } from './icons/PdfIcon';
import { ReceiptIcon } from './icons/ReceiptIcon'; // New Icon

interface ExportControlsProps {
  onExportText: () => void;
  onGenerateQuotation: () => void;
  onGenerateReceipt: () => void; // New prop for receipt
  isQuotationDisabled: boolean; // To disable quotation button if no items
  isLoading: boolean;
}

export const ExportControls: React.FC<ExportControlsProps> = ({ 
  onExportText, 
  onGenerateQuotation, 
  onGenerateReceipt, 
  isQuotationDisabled,
  isLoading 
}) => {
  return (
    <div className="flex items-center space-x-2">
      <button
        onClick={onExportText}
        disabled={isLoading || isQuotationDisabled} // Also disable if no selected file / items for consistency
        className="flex items-center bg-secondary text-neutral px-3 py-2 rounded-md hover:bg-secondary/90 focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2 disabled:opacity-60 transition-colors"
        title="Export extracted info and chat as .txt"
      >
        <DownloadIcon className="w-5 h-5 mr-2" />
        Export Text
      </button>
      <button
        onClick={onGenerateQuotation}
        disabled={isLoading || isQuotationDisabled}
        className="flex items-center bg-accent text-base-100 px-3 py-2 rounded-md hover:bg-accent/90 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 disabled:opacity-60 transition-colors"
        title={isQuotationDisabled ? "Upload and select a processed file with items to generate quotation" : "Generate and export quotation as .pdf"}
      >
        <PdfIcon className="w-5 h-5 mr-2" />
        {isLoading ? 'Processing...' : 'Generate Quotation'}
      </button>
      <button
        onClick={onGenerateReceipt}
        disabled={isLoading}
        className="flex items-center bg-blue-500 text-base-100 px-3 py-2 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-60 transition-colors"
        title="Generate and export receipt as .pdf"
      >
        <ReceiptIcon className="w-5 h-5 mr-2" />
        {isLoading ? 'Processing...' : 'Generate Receipt'}
      </button>
    </div>
  );
};
