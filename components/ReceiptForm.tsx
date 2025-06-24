import React from 'react';
import type { ReceiptDetails } from '../types';
import { RefreshCwIcon } from './icons/RefreshCwIcon'; // For reset button
import { EyeIcon } from './icons/EyeIcon'; // For preview
import { DownloadIcon } from './icons/DownloadIcon'; // For download

interface ReceiptFormProps {
  receiptDetails: ReceiptDetails;
  onDetailChange: <K extends keyof ReceiptDetails>(field: K, value: ReceiptDetails[K]) => void;
  onPreview: () => void;
  onDownload: () => void;
  onReset: () => void;
  isLoading: boolean;
}

export const ReceiptForm: React.FC<ReceiptFormProps> = ({
  receiptDetails,
  onDetailChange,
  onPreview,
  onDownload,
  onReset,
  isLoading,
}) => {

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
    if (/^\d*\.?\d*$/.test(value) || value === "") { // Allow numbers and one decimal
        onDetailChange('amount', value);
    }
  };

  const inputBaseClasses = "mt-1 block w-full px-3 py-2.5 border border-base-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm disabled:bg-base-200/70 disabled:opacity-70 placeholder-neutral/50";
  const fieldsetClasses = "p-4 border border-base-300 rounded-lg";
  const legendClasses = "text-md font-semibold text-primary px-1";
  const labelClasses = "block text-sm font-medium text-neutral/90";

  return (
    <form onSubmit={(e) => { e.preventDefault(); onDownload(); }} className="space-y-6 sm:space-y-8">
        <div>
            <h2 className="text-2xl font-semibold text-primary mb-1 text-center">Create New Receipt</h2>
            <p className="text-sm text-neutral/70 text-center mb-6">Fill in the details below to generate your receipt.</p>
        </div>

      {/* General Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
        <div>
          <label htmlFor="receiptDate" className={labelClasses}>Receipt Date:</label>
          <input type="date" name="receiptDate" id="receiptDate" value={receiptDetails.receiptDate} onChange={handleInputChange} className={inputBaseClasses} disabled={isLoading} />
        </div>
        <div>
          <label htmlFor="receivedFromName" className={labelClasses}>Received From (وصلنا من السادة):</label>
          <input type="text" name="receivedFromName" id="receivedFromName" value={receiptDetails.receivedFromName} onChange={handleInputChange} className={inputBaseClasses} placeholder="Enter name" disabled={isLoading} />
        </div>
      </div>
      <div>
        <label htmlFor="amount" className={labelClasses}>Amount (مبلغ وقدره):</label>
        <input type="text" name="amount" id="amount" value={receiptDetails.amount} onChange={handleAmountChange} className={inputBaseClasses} placeholder="e.g., 1500.50" disabled={isLoading} />
      </div>
      <div>
        <label htmlFor="subscriptionPurpose" className={labelClasses}>For (وذلك بدل):</label>
        <input type="text" name="subscriptionPurpose" id="subscriptionPurpose" value={receiptDetails.subscriptionPurpose} onChange={handleInputChange} className={inputBaseClasses} disabled={isLoading} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
        <div>
          <label htmlFor="tentNumber" className={labelClasses}>Tent No. (الخيمة رقم):</label>
          <input type="text" name="tentNumber" id="tentNumber" value={receiptDetails.tentNumber} onChange={handleInputChange} className={inputBaseClasses} placeholder="Enter tent number" disabled={isLoading} />
        </div>
        <div>
          <label htmlFor="usagePurpose" className={labelClasses}>Usage Purpose (جهة الاستعمال):</label>
          <input type="text" name="usagePurpose" id="usagePurpose" value={receiptDetails.usagePurpose} onChange={handleInputChange} className={inputBaseClasses} placeholder="Enter purpose" disabled={isLoading} />
        </div>
      </div>

      {/* Additional Services */}
      <fieldset className={fieldsetClasses}>
        <legend className={legendClasses}>Additional Services (إضافات أخرى)</legend>
        <div className="space-y-3 mt-3">
          {([
            { field: 'electricityAvailable', labelEn: 'Electricity', labelAr: 'كهرباء' },
            { field: 'chairsAvailable', labelEn: 'Chairs', labelAr: 'كراسي' },
            { field: 'tableAvailable', labelEn: 'Table', labelAr: 'طاولة' },
          ] as const).map(({ field, labelEn, labelAr }) => (
            <div key={field} className="flex items-center">
              <input type="checkbox" name={field} id={field} checked={receiptDetails[field]} onChange={handleInputChange} className="h-5 w-5 text-primary border-base-300 rounded focus:ring-primary disabled:opacity-50" disabled={isLoading} />
              <label htmlFor={field} className="ml-3 block text-sm text-neutral">{labelEn} ({labelAr})</label>
            </div>
          ))}
        </div>
      </fieldset>

      {/* Advertisements on Track */}
      <fieldset className={fieldsetClasses}>
        <legend className={legendClasses}>Advertisements on Track (إعلانات على مسار الحلبة)</legend>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-3 mt-3">
          {['adsZoneA', 'adsZoneB', 'adsZoneC', 'adsZoneD', 'adsZoneE', 'adsZoneF'].map((zone) => (
            <div key={zone} className="flex items-center">
              <input type="checkbox" name={zone} id={zone} checked={receiptDetails[zone as keyof ReceiptDetails]as boolean} onChange={handleInputChange} className="h-5 w-5 text-primary border-base-300 rounded focus:ring-primary disabled:opacity-50" disabled={isLoading} />
              <label htmlFor={zone} className="ml-3 block text-sm text-neutral">Zone {zone.slice(-1)}</label>
            </div>
          ))}
        </div>
      </fieldset>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4">
        <div>
          <label htmlFor="adsTotalQuantity" className={labelClasses}>Total Ad Qty (العدد الإجمالي):</label>
          <input type="text" name="adsTotalQuantity" id="adsTotalQuantity" value={receiptDetails.adsTotalQuantity} onChange={handleInputChange} className={inputBaseClasses} placeholder="e.g., 5" disabled={isLoading} />
        </div>
        <div>
          <label htmlFor="carFlagsCount" className={labelClasses}>Car Flags (أعلام على السيارات):</label>
          <input type="text" name="carFlagsCount" id="carFlagsCount" value={receiptDetails.carFlagsCount} onChange={handleInputChange} className={inputBaseClasses} placeholder="e.g., 2" disabled={isLoading} />
        </div>
        <div>
          <label htmlFor="bannerFlagsCount" className={labelClasses}>Banner Flags (أعلام على الأرصفة):</label>
          <input type="text" name="bannerFlagsCount" id="bannerFlagsCount" value={receiptDetails.bannerFlagsCount} onChange={handleInputChange} className={inputBaseClasses} placeholder="e.g., 10" disabled={isLoading} />
        </div>
      </div>

      {/* Notes and Signatures */}
      <div>
        <label htmlFor="notes" className={labelClasses}>Notes (ملاحظات):</label>
        <textarea name="notes" id="notes" value={receiptDetails.notes} onChange={handleInputChange} rows={3} className={`${inputBaseClasses} min-h-[80px]`} placeholder="Add any relevant notes here..." disabled={isLoading}></textarea>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
        <div>
          <label htmlFor="receiverName" className={labelClasses}>Receiver's Name (المستلم):</label>
          <input type="text" name="receiverName" id="receiverName" value={receiptDetails.receiverName} onChange={handleInputChange} className={inputBaseClasses} placeholder="Type Receiver's Name" disabled={isLoading} />
        </div>
        <div>
          <label htmlFor="payerName" className={labelClasses}>Payer's Name (الإمضاء):</label>
          <input type="text" name="payerName" id="payerName" value={receiptDetails.payerName} onChange={handleInputChange} className={inputBaseClasses} placeholder="Type Payer's Name" disabled={isLoading} />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="pt-6 border-t border-base-300/70 flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3 mt-8">
        <button 
          type="button" 
          onClick={onReset} 
          disabled={isLoading} 
          className="w-full sm:w-auto px-6 py-2.5 text-sm font-medium text-neutral bg-base-200 hover:bg-base-300 border border-base-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-60 transition-colors flex items-center justify-center"
        >
          <RefreshCwIcon className="w-4 h-4 mr-2"/> Reset Form
        </button>
        <button 
          type="button" 
          onClick={onPreview} 
          disabled={isLoading} 
          className="w-full sm:w-auto px-6 py-2.5 text-sm font-medium text-primary bg-primary/10 hover:bg-primary/20 border border-primary/30 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-60 transition-colors flex items-center justify-center"
        >
           <EyeIcon className="w-4 h-4 mr-2"/> {isLoading ? 'Generating...' : 'Preview Receipt'}
        </button>
        <button 
          type="submit" 
          disabled={isLoading} 
          className="w-full sm:w-auto px-6 py-2.5 text-sm font-medium text-base-100 bg-primary hover:bg-primary/90 border border-transparent rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-60 transition-colors flex items-center justify-center"
        >
          <DownloadIcon className="w-4 h-4 mr-2"/> {isLoading ? 'Downloading...' : 'Download PDF'}
        </button>
      </div>
    </form>
  );
};
