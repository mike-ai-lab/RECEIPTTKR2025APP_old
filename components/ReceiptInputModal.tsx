import React from 'react';
import type { ReceiptDetails } from '../types';

interface ReceiptInputModalProps {
  isOpen: boolean;
  onClose: () => void;
  receiptDetails: ReceiptDetails;
  onDetailChange: <K extends keyof ReceiptDetails>(field: K, value: ReceiptDetails[K]) => void;
  onPreview: () => void;
  onDownload: () => void;
  isLoading: boolean;
}

export const ReceiptInputModal: React.FC<ReceiptInputModalProps> = ({
  isOpen,
  onClose,
  receiptDetails,
  onDetailChange,
  onPreview,
  onDownload,
  isLoading,
}) => {
  if (!isOpen) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      onDetailChange(name as keyof ReceiptDetails, (e.target as HTMLInputElement).checked);
    } else {
      onDetailChange(name as keyof ReceiptDetails, value);
    }
  };
  
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    // Allow only numbers and a single decimal point
    if (/^\d*\.?\d*$/.test(value) || value === "") {
        onDetailChange('amount', value);
    }
  };

  const inputTailwindClasses = "mt-1 block w-full px-3 py-2 border border-base-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm disabled:bg-base-200 disabled:opacity-70";


  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[100] p-4 overflow-y-auto">
      <div className="bg-base-100 rounded-lg shadow-xl w-full max-w-2xl max-h-[95vh] flex flex-col">
        <div className="flex justify-between items-center p-4 border-b border-base-300 sticky top-0 bg-base-100 z-10">
          <h2 className="text-xl font-semibold text-primary">Enter Receipt Details</h2>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="text-neutral hover:text-accent p-1 rounded-full focus:outline-none focus:ring-2 focus:ring-accent"
            aria-label="Close receipt modal"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-4 overflow-y-auto">
          {/* General Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="receiptDate" className="block text-sm font-medium text-neutral">Receipt Date:</label>
              <input type="date" name="receiptDate" id="receiptDate" value={receiptDetails.receiptDate} onChange={handleInputChange} className={inputTailwindClasses} disabled={isLoading} />
            </div>
            <div>
              <label htmlFor="receivedFromName" className="block text-sm font-medium text-neutral">Received From (وصلنا من السادة):</label>
              <input type="text" name="receivedFromName" id="receivedFromName" value={receiptDetails.receivedFromName} onChange={handleInputChange} className={inputTailwindClasses} placeholder="Enter name" disabled={isLoading} />
            </div>
          </div>
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-neutral">Amount (مبلغ وقدره):</label>
            <input type="text" name="amount" id="amount" value={receiptDetails.amount} onChange={handleAmountChange} className={inputTailwindClasses} placeholder="Enter amount" disabled={isLoading} />
          </div>
          <div>
            <label htmlFor="subscriptionPurpose" className="block text-sm font-medium text-neutral">For (وذلك بدل):</label>
            <input type="text" name="subscriptionPurpose" id="subscriptionPurpose" value={receiptDetails.subscriptionPurpose} onChange={handleInputChange} className={inputTailwindClasses} disabled={isLoading} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="tentNumber" className="block text-sm font-medium text-neutral">Tent No. (الخيمة رقم):</label>
              <input type="text" name="tentNumber" id="tentNumber" value={receiptDetails.tentNumber} onChange={handleInputChange} className={inputTailwindClasses} placeholder="Enter tent number" disabled={isLoading} />
            </div>
            <div>
              <label htmlFor="usagePurpose" className="block text-sm font-medium text-neutral">Usage Purpose (جهة الاستعمال):</label>
              <input type="text" name="usagePurpose" id="usagePurpose" value={receiptDetails.usagePurpose} onChange={handleInputChange} className={inputTailwindClasses} placeholder="Enter purpose" disabled={isLoading} />
            </div>
          </div>

          {/* Additional Services */}
          <fieldset className="p-3 border border-base-300 rounded-md">
            <legend className="text-md font-medium text-primary px-1">Additional Services (إضافات أخرى)</legend>
            <div className="space-y-2 mt-2">
              {['electricityAvailable', 'chairsAvailable', 'tableAvailable'].map((field) => (
                <div key={field} className="flex items-center">
                  <input type="checkbox" name={field} id={field} checked={receiptDetails[field as keyof ReceiptDetails] as boolean} onChange={handleInputChange} className="h-4 w-4 text-primary border-base-300 rounded focus:ring-primary" disabled={isLoading} />
                  <label htmlFor={field} className="ml-2 block text-sm text-neutral capitalize">{field.replace('Available', '')} ({(field === 'electricityAvailable' && 'كهرباء') || (field === 'chairsAvailable' && 'كراسي') || (field === 'tableAvailable' && 'طاولة')})</label>
                </div>
              ))}
            </div>
          </fieldset>

          {/* Advertisements on Track */}
          <fieldset className="p-3 border border-base-300 rounded-md">
            <legend className="text-md font-medium text-primary px-1">Advertisements on Track (إعلانات على مسار الحلبة)</legend>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
              {['adsZoneA', 'adsZoneB', 'adsZoneC', 'adsZoneD', 'adsZoneE', 'adsZoneF'].map((zone) => (
                <div key={zone} className="flex items-center">
                  <input type="checkbox" name={zone} id={zone} checked={receiptDetails[zone as keyof ReceiptDetails] as boolean} onChange={handleInputChange} className="h-4 w-4 text-primary border-base-300 rounded focus:ring-primary" disabled={isLoading} />
                  <label htmlFor={zone} className="ml-2 block text-sm text-neutral">Zone {zone.slice(-1)}</label>
                </div>
              ))}
            </div>
          </fieldset>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="adsTotalQuantity" className="block text-sm font-medium text-neutral">Total Ad Qty (العدد الإجمالي):</label>
              <input type="text" name="adsTotalQuantity" id="adsTotalQuantity" value={receiptDetails.adsTotalQuantity} onChange={handleInputChange} className={inputTailwindClasses} placeholder="Enter quantity" disabled={isLoading} />
            </div>
            <div>
              <label htmlFor="carFlagsCount" className="block text-sm font-medium text-neutral">Car Flags (أعلام على السيارات):</label>
              <input type="text" name="carFlagsCount" id="carFlagsCount" value={receiptDetails.carFlagsCount} onChange={handleInputChange} className={inputTailwindClasses} placeholder="Enter count" disabled={isLoading} />
            </div>
            <div>
              <label htmlFor="bannerFlagsCount" className="block text-sm font-medium text-neutral">Banner Flags (أعلام على الأرصفة):</label>
              <input type="text" name="bannerFlagsCount" id="bannerFlagsCount" value={receiptDetails.bannerFlagsCount} onChange={handleInputChange} className={inputTailwindClasses} placeholder="Enter count" disabled={isLoading} />
            </div>
          </div>

          {/* Notes and Signatures */}
          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-neutral">Notes (ملاحظات):</label>
            <textarea name="notes" id="notes" value={receiptDetails.notes} onChange={handleInputChange} rows={3} className={inputTailwindClasses} placeholder="Add any notes here..." disabled={isLoading}></textarea>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="receiverName" className="block text-sm font-medium text-neutral">Receiver's Name (المستلم):</label>
              <input type="text" name="receiverName" id="receiverName" value={receiptDetails.receiverName} onChange={handleInputChange} className={inputTailwindClasses} placeholder="Type Receiver's Name" disabled={isLoading} />
            </div>
            <div>
              <label htmlFor="payerName" className="block text-sm font-medium text-neutral">Payer's Name (الإمضاء):</label>
              <input type="text" name="payerName" id="payerName" value={receiptDetails.payerName} onChange={handleInputChange} className={inputTailwindClasses} placeholder="Type Your Name" disabled={isLoading} />
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-base-300 flex justify-end space-x-3 sticky bottom-0 bg-base-100 z-10">
          <button type="button" onClick={onClose} disabled={isLoading} className="btn-secondary">Cancel</button>
          <button type="button" onClick={onPreview} disabled={isLoading} className="btn-secondary-outline">
            {isLoading ? 'Generating...' : 'Preview Receipt'}
          </button>
          <button type="button" onClick={onDownload} disabled={isLoading} className="btn-primary">
            {isLoading ? 'Downloading...' : 'Download PDF'}
          </button>
        </div>
      </div>
    </div>
  );
};
