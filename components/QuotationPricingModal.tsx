
import React, { useMemo } from 'react';
import type { QuotationStructure, ClientDetails, QuotationScopeItemStructure } from '../types';
import { UNIT_SORT_ORDER } from '../constants';

interface QuotationPricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  quotationStructure: QuotationStructure;
  itemUnitPrices: Record<string, string>;
  clientDetails: ClientDetails;
  taxRate: number;
  onUnitPriceChange: (placeholderKey: string, value: string) => void;
  onClientDetailChange: (field: keyof ClientDetails, value: string) => void;
  onTaxRateChange: (value: string) => void;
  onPreviewQuotation: () => void;
  onDownloadPdf: () => void;
  isLoading: boolean;
  formatCurrency: (value: number | string | undefined) => string;
  calculateTotals: () => { subtotal: number; taxAmount: number; grandTotal: number };
  parseRelevantQuantity: (item: QuotationScopeItemStructure) => number;
}

const parseCurrencyLocal = (value: string): number => {
  if (!value) return 0;
  const parsed = parseFloat(value.replace(/[^0-9.-]+/g,""));
  return isNaN(parsed) ? 0 : parsed;
};

const sortQuotationItemsByUnit = (items: QuotationScopeItemStructure[]): QuotationScopeItemStructure[] => {
  return [...items].sort((a, b) => {
    const unitA = a.unitOfMeasure?.toUpperCase();
    const unitB = b.unitOfMeasure?.toUpperCase();
    const indexA = UNIT_SORT_ORDER.indexOf(unitA);
    const indexB = UNIT_SORT_ORDER.indexOf(unitB);

    if (indexA !== -1 && indexB !== -1) {
      return indexA - indexB;
    }
    if (indexA !== -1) return -1;
    if (indexB !== -1) return 1;
    if (unitA && unitB) {
      if (unitA < unitB) return -1;
      if (unitA > unitB) return 1;
    } else if (unitA) {
      return -1;
    } else if (unitB) {
      return 1;
    }
    // Fallback: sort by category then description
    if (a.category !== b.category) {
      return a.category.localeCompare(b.category);
    }
    return a.description.localeCompare(b.description);
  });
};


export const QuotationPricingModal: React.FC<QuotationPricingModalProps> = ({
  isOpen,
  onClose,
  quotationStructure,
  itemUnitPrices,
  clientDetails,
  taxRate,
  onUnitPriceChange,
  onClientDetailChange,
  onTaxRateChange,
  onPreviewQuotation,
  onDownloadPdf,
  isLoading,
  formatCurrency,
  calculateTotals,
  parseRelevantQuantity
}) => {
  if (!isOpen) return null;

  const { subtotal, taxAmount, grandTotal } = calculateTotals();

  const sortedItems = useMemo(() => {
    return sortQuotationItemsByUnit(quotationStructure.items);
  }, [quotationStructure.items]);

  const handleNumericInput = (
    e: React.ChangeEvent<HTMLInputElement>,
    callback: (value: string) => void
  ) => {
    const { value } = e.target;
    if (/^\d*\.?\d{0,2}$/.test(value) || value === "") {
        callback(value);
    }
  };

  const handleTaxRateInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
     if (/^\d*\.?\d{0,2}$/.test(value) || value === "") {
       onTaxRateChange(value);
    }
  };


  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[100] p-4 overflow-y-auto">
      <div className="bg-base-100 rounded-lg shadow-xl w-full max-w-3xl max-h-[95vh] flex flex-col">
        <div className="flex justify-between items-center p-4 border-b border-base-300 sticky top-0 bg-base-100 z-10">
          <h2 className="text-xl font-semibold text-primary">Finalize Quotation Details</h2>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="text-neutral hover:text-accent p-1 rounded-full focus:outline-none focus:ring-2 focus:ring-accent"
            aria-label="Close pricing modal"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto">
          {/* Client Details Section */}
          <section className="space-y-3 p-4 border border-base-300 rounded-md">
            <h3 className="text-lg font-medium text-primary border-b pb-2">Client & Project Information</h3>
            <div>
              <label htmlFor="clientName" className="block text-sm font-medium text-neutral">Client Name:</label>
              <input
                type="text"
                id="clientName"
                value={clientDetails.name}
                onChange={(e) => onClientDetailChange('name', e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-base-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                disabled={isLoading}
              />
            </div>
            <div>
              <label htmlFor="clientAddress" className="block text-sm font-medium text-neutral">Client Address:</label>
              <textarea
                id="clientAddress"
                rows={2}
                value={clientDetails.address}
                onChange={(e) => onClientDetailChange('address', e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-base-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                disabled={isLoading}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="quotationDate" className="block text-sm font-medium text-neutral">Quotation Date:</label>
                <input
                  type="date"
                  id="quotationDate"
                  value={clientDetails.date}
                  onChange={(e) => onClientDetailChange('date', e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-base-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                  disabled={isLoading}
                />
              </div>
              <div>
                <label htmlFor="projectId" className="block text-sm font-medium text-neutral">Project ID/Name:</label>
                <input
                  type="text"
                  id="projectId"
                  value={clientDetails.projectId}
                  onChange={(e) => onClientDetailChange('projectId', e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-base-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                  disabled={isLoading}
                />
              </div>
            </div>
          </section>

          {/* Items Pricing Section */}
          <section className="space-y-1 p-4 border border-base-300 rounded-md">
            <h3 className="text-lg font-medium text-primary border-b pb-2 mb-3">Scope Item Pricing</h3>
            {sortedItems.map((item, index) => {
               const unitPrice = parseCurrencyLocal(itemUnitPrices[item.pricePlaceholder] || '0');
               const quantity = parseRelevantQuantity(item);
               const itemTotalPrice = unitPrice * quantity;
               const unitLabel = item.unitOfMeasure ? item.unitOfMeasure.toUpperCase() : 'Item';
              return (
                <div key={item.id || index} className="grid grid-cols-[1fr_auto_auto] items-center gap-x-3 gap-y-1 py-2 border-b border-base-200 last:border-b-0">
                  <div className="text-sm">
                      <p className="font-medium text-neutral truncate" title={item.description}>
                        <span className="text-xs uppercase text-primary/70">[{item.category.replace('_', ' ')}]</span> {item.id}. {item.description}
                      </p>
                      <p className="text-xs text-neutral/70">Qty: {item.quantity || 'N/A'} | Material/Finish: {item.materialOrFinish}</p>
                      {item.unitOfMeasure && <p className="text-xs text-neutral/50">Unit Type: {item.unitOfMeasure}</p>}
                  </div>
                  <div className="flex items-center">
                    <label htmlFor={`price-${item.pricePlaceholder}`} className="text-sm text-neutral mr-1 whitespace-nowrap">
                      Price per {unitLabel}:
                    </label>
                    <input
                      type="text"
                      id={`price-${item.pricePlaceholder}`}
                      value={itemUnitPrices[item.pricePlaceholder] || ''}
                      onChange={(e) => handleNumericInput(e, (val) => onUnitPriceChange(item.pricePlaceholder, val))}
                      placeholder="0.00"
                      className="w-24 px-2 py-1 border border-base-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm text-right"
                      disabled={isLoading}
                      aria-label={`Unit Price for ${item.description}, per ${unitLabel}`}
                    />
                  </div>
                  <div className="text-sm text-neutral text-right w-28">
                      Item Total: {formatCurrency(itemTotalPrice)}
                  </div>
                </div>
              );
            })}
          </section>

          {/* Totals Section */}
          <section className="space-y-2 p-4 border border-base-300 rounded-md">
             <h3 className="text-lg font-medium text-primary border-b pb-2">Summary</h3>
            <div className="flex justify-between items-center">
              <label htmlFor="taxRateInput" className="text-sm font-medium text-neutral">Tax Rate (%):</label>
              <input
                type="text"
                id="taxRateInput"
                value={taxRate * 100}
                onChange={handleTaxRateInput}
                placeholder="e.g., 10 for 10%"
                className="w-20 px-2 py-1 border border-base-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm text-right"
                disabled={isLoading}
              />
            </div>
            <div className="text-right space-y-1 mt-2">
              <p className="text-sm"><span className="font-medium text-neutral">Subtotal:</span> {formatCurrency(subtotal)}</p>
              <p className="text-sm"><span className="font-medium text-neutral">Tax Amount:</span> {formatCurrency(taxAmount)}</p>
              <p className="text-lg font-semibold"><span className="text-primary">Grand Total:</span> {formatCurrency(grandTotal)}</p>
            </div>
          </section>
        </div>

        <div className="p-4 border-t border-base-300 flex justify-end space-x-3 sticky bottom-0 bg-base-100 z-10">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-neutral bg-base-200 hover:bg-base-300 border border-base-300 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onPreviewQuotation}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-primary bg-secondary/20 hover:bg-secondary/30 border border-secondary rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary disabled:opacity-50"
          >
            {isLoading ? 'Generating Preview...' : 'Preview Quotation'}
          </button>
          <button
            type="button"
            onClick={onDownloadPdf}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-base-100 bg-primary hover:bg-primary/90 border border-transparent rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
          >
            {isLoading ? 'Downloading PDF...' : 'Download PDF'}
          </button>
        </div>
      </div>
    </div>
  );
};
