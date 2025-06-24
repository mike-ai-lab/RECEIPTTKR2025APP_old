
import React, { useState, useCallback, useEffect, useRef } from 'react';
import type { ReceiptDetails } from './utils/types'; // Updated path
import { generateReceiptPdf } from './utils/receiptPdfGenerator';
import { DEFAULT_RECEIPT_DETAILS } from './constants';
import { ReceiptPreviewModal } from './components/ReceiptPreviewModal';
import { DownloadIcon } from './components/icons/DownloadIcon';
import { EyeIcon } from './components/icons/EyeIcon';

// Extend window interface for appLogout
declare global {
  interface Window {
    appLogout?: () => void;
  }
}

const App: React.FC = () => {
  const [currentReceiptDetails, setCurrentReceiptDetails] = useState<ReceiptDetails>(DEFAULT_RECEIPT_DETAILS);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showReceiptPreviewModal, setShowReceiptPreviewModal] = useState<boolean>(false);
  const [receiptPreviewUrl, setReceiptPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const objectUrlTrackerRef = useRef<Record<string, string>>({});

  useEffect(() => {
    const today = new Date();
    setCurrentReceiptDetails(prev => ({
      ...prev,
      day: today.getDate().toString().padStart(2, '0'),
      month: (today.getMonth() + 1).toString().padStart(2, '0'),
      year: today.getFullYear().toString(),
      receiptDate: today.toISOString().split('T')[0],
    }));
    return () => {
      if (receiptPreviewUrl) URL.revokeObjectURL(receiptPreviewUrl);
      Object.values(objectUrlTrackerRef.current).forEach(URL.revokeObjectURL);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); //KEEPING THIS EMPTY: This effect is for one-time setup (date) and final cleanup.

  const handleDetailChange = useCallback(<K extends keyof ReceiptDetails>(field: K, value: ReceiptDetails[K]) => {
    const fieldsToUppercase: (keyof ReceiptDetails)[] = [
      'receivedFromName',
      'amount',
      'tentNumber',
      'usagePurpose',
      'description',
      'adsTotalQuantity',
      'carFlagsCount',
      'bannerFlagsCount',
      'notes',
      'receiverName',
      'payerName'
    ];

    let processedValue = value;
    if (typeof value === 'string' && fieldsToUppercase.includes(field)) {
      processedValue = value.toUpperCase() as ReceiptDetails[K];
    }
    // For subscriptionPurpose, we handle its English part's uppercasing at the display/PDF generation stage.
    // If we were to uppercase the whole subscriptionPurpose string here, it would affect the Arabic part.

    setCurrentReceiptDetails(prev => ({ ...prev, [field]: processedValue }));
  }, []);

  const handleCheckboxChange = useCallback((field: keyof ReceiptDetails, checked: boolean) => {
    setCurrentReceiptDetails(prev => ({ ...prev, [field]: checked }));
  }, []);
  
  const handlePreviewReceipt = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const pdfDataUri = await generateReceiptPdf(currentReceiptDetails, 'datauristring');
       if (typeof pdfDataUri === 'string') {
        if (receiptPreviewUrl) URL.revokeObjectURL(receiptPreviewUrl); // Revoke previous if exists
        setReceiptPreviewUrl(pdfDataUri);
        objectUrlTrackerRef.current['receiptPreview'] = pdfDataUri; 
        setShowReceiptPreviewModal(true);
      } else {
        throw new Error("Receipt PDF generation for preview did not return a data URI.");
      }
    } catch (err) {
      console.error("Error generating Receipt PDF for preview:", err);
      const errorMsg = `Failed to generate Receipt PDF for preview. ${(err as Error).message}`;
      setError(errorMsg);
      alert(errorMsg);
    } finally {
      setIsLoading(false);
    }
  }, [currentReceiptDetails, receiptPreviewUrl]);

  const handleDownloadReceiptPdf = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      await generateReceiptPdf(currentReceiptDetails, 'save');
    } catch (err) {
      console.error("Error generating final Receipt PDF for download:", err);
      const errorMsg = `Failed to generate Receipt PDF. ${(err as Error).message}`;
      setError(errorMsg);
      alert(errorMsg);
    } finally {
      setIsLoading(false);
    }
  }, [currentReceiptDetails]);
  
  const closeReceiptPreviewModal = () => {
    if (receiptPreviewUrl) {
        URL.revokeObjectURL(receiptPreviewUrl);
        setReceiptPreviewUrl(null);
        delete objectUrlTrackerRef.current['receiptPreview'];
    }
    setShowReceiptPreviewModal(false);
  };

  const handleLogout = () => {
    if (showReceiptPreviewModal) {
      closeReceiptPreviewModal();
    }
    setTimeout(() => {
      if (window.appLogout) {
        window.appLogout();
      } else {
        console.error("Logout function (window.appLogout) not found. Using fallback.");
        try {
          localStorage.removeItem("RECEIPT_ADMIN_SESSION_TOKEN");
        } catch(e) { 
          console.error("Error removing item from localStorage during fallback logout:", e);
        }
        location.reload();
      }
    }, 0);
  };

  const fillInInputClasses = "fill-in-input border-none border-b-[1.5px] border-solid border-slate-500 bg-transparent flex-grow mx-3 relative bottom-[1px] outline-none text-center pb-[2px] focus:border-solid focus:border-blue-600";
  const interactiveCheckboxClasses = "interactive-checkbox w-5 h-5 border-[1.5px] border-slate-400 rounded cursor-pointer accent-blue-600 align-middle";
  const enLabelClasses = "text-base font-medium text-slate-600 font-sans";
  const arLabelClasses = "text-base font-semibold font-arabic";

  const subscriptionPurposeEn = (currentReceiptDetails.subscriptionPurpose.split('/')[0]?.trim() || '').toUpperCase();

  return (
    <div id="receipt-app-container" className="min-h-screen bg-base-200 relative">
      <button
        onClick={handleLogout}
        className="no-print fixed top-4 right-4 bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-3 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors text-xs sm:text-sm"
        title="Logout"
        style={{ zIndex: 10000 }}
      >
        LOGOUT
      </button>

      <div id="receipt-container" className="bg-white rounded-xl p-6 sm:p-8 md:p-12 border border-slate-200 mx-auto my-4 sm:my-8 w-full max-w-[210mm] shadow-xl">
        
        {error && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
              <strong className="font-bold">ERROR </strong>
              <span className="block sm:inline">{error}</span>
            </div>
        )}

        <header className="text-center pb-6 mb-8 border-b-2 border-slate-300">
            <div className="flex justify-center items-center mb-6">
                 <img src="https://hbslewdkkgwsaohjyzak.supabase.co/storage/v1/object/public/tkr//logo.png" alt="Tripoli Karting Race Logo" className="h-20 md:h-24 object-contain"/>
            </div>
            <h1 className="text-2xl md:text-4xl font-bold text-slate-800 flex justify-between items-center w-full">
                <span className="tracking-wider font-sans">RECEIPT</span>
                <span dir="rtl" className="font-arabic">وصل استلام مبلغ</span>
            </h1>
            <h2 className="text-md md:text-xl font-semibold text-slate-600 mt-3 flex justify-between items-center w-full">
                <span className="font-sans">TRIPOLI KARTING RACE 2025 - SEASON 1</span>
                <span dir="rtl" className="font-arabic">مهرجان طرابلس للكارتينج</span>
            </h2>
        </header>

        <main id="receipt-content" className="space-y-5 text-slate-800">
            <div className="flex justify-between items-baseline">
                <span className={`${enLabelClasses}`}>DATE</span>
                <div className="flex-grow flex items-baseline mx-2 sm:mx-4">
                     <input type="text" id="date-day" value={currentReceiptDetails.day} onChange={(e) => handleDetailChange('day', e.target.value)} className={`${fillInInputClasses} !w-10 !flex-grow-0 font-sans`} maxLength={2}/> /
                     <input type="text" id="date-month" value={currentReceiptDetails.month} onChange={(e) => handleDetailChange('month', e.target.value)} className={`${fillInInputClasses} !w-10 !flex-grow-0 font-sans`} maxLength={2}/> /
                     <input type="text" id="date-year" value={currentReceiptDetails.year} onChange={(e) => handleDetailChange('year', e.target.value)} className={`${fillInInputClasses} !w-16 !flex-grow-0 font-sans`} maxLength={4}/>
                </div>
                <span className={`${arLabelClasses}`} dir="rtl">تاريخ الاستلام</span>
            </div>

            <div className="flex justify-between items-baseline">
                <span className={`${enLabelClasses} whitespace-nowrap mr-2`}>RECEIVED FROM</span>
                <input type="text" name="receivedFromName" value={currentReceiptDetails.receivedFromName} onChange={(e) => handleDetailChange('receivedFromName', e.target.value)} className={`${fillInInputClasses} font-sans`}/>
                <span className={`${arLabelClasses} whitespace-nowrap ml-2`} dir="rtl">وصلنا من السادة</span>
            </div>

            <div className="flex justify-between items-baseline">
                <span className={`${enLabelClasses} mr-2`}>AMOUNT</span>
                <input type="text" name="amount" value={currentReceiptDetails.amount} onChange={(e) => handleDetailChange('amount', e.target.value)} className={`${fillInInputClasses} font-sans`}/>
                <span className={`${arLabelClasses} ml-2`} dir="rtl">مبلغ وقدره</span>
            </div>
            
            <div className="flex justify-between items-baseline pt-4">
                <span className={`${enLabelClasses} mr-2`}>
                    FOR {subscriptionPurposeEn}
                </span>
                <span className={`${arLabelClasses} ml-2`} dir="rtl">
                    وذلك بدل <span className="font-medium text-slate-700 font-arabic text-base">
                        {currentReceiptDetails.subscriptionPurpose.split('/')[1]?.trim()}
                    </span>
                </span>
            </div>
            
             <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 sm:gap-x-12 gap-y-4 pt-2">
                <div className="flex items-baseline">
                    <span className={`${enLabelClasses} whitespace-nowrap mr-2`}>TENT NO.</span>
                    <input type="text" name="tentNumber" value={currentReceiptDetails.tentNumber} onChange={(e) => handleDetailChange('tentNumber', e.target.value)} className={`${fillInInputClasses} !flex-grow-0 w-24 sm:w-32 font-sans`}/>
                    <span className={`${arLabelClasses} whitespace-nowrap ml-2`} dir="rtl">الخيمة رقم</span>
                </div>
                <div className="flex items-baseline">
                    <span className={`${enLabelClasses} whitespace-nowrap mr-2`}>USAGE PURPOSE</span>
                    <input type="text" name="usagePurpose" value={currentReceiptDetails.usagePurpose} onChange={(e) => handleDetailChange('usagePurpose', e.target.value)} className={`${fillInInputClasses} !flex-grow-0 w-24 sm:w-32 font-sans`}/>
                    <span className={`${arLabelClasses} whitespace-nowrap ml-2`} dir="rtl">جهة الاستعمال</span>
                </div>
            </div>

            {/* Additional Services */}
            <div className="pt-6">
                <h3 className="text-lg font-bold text-slate-800 flex justify-between items-center w-full pb-3 border-b border-slate-200 mb-3"><span className="font-semibold font-sans">ADDITIONAL SERVICES</span><span className="font-bold font-arabic" dir="rtl">خدمات اخرى</span></h3>
                <div className="space-y-3 text-sm text-slate-600">
                    {[
                        { key: 'electricityAvailable', labelEn: 'ELECTRICITY', labelAr: 'توفير كهرباء' },
                        { key: 'chairsAvailable', labelEn: 'CHAIRS', labelAr: 'توفير كراسي' },
                        { key: 'tableAvailable', labelEn: 'TABLE', labelAr: 'توفير طاولات' },
                    ].map(({ key, labelEn, labelAr }) => (
                        <div key={key} className="flex justify-between items-center">
                            <div className="flex items-center">
                                <span className="font-semibold text-base font-sans mr-3 w-24 sm:w-28 text-left">{labelEn}</span>
                                <input 
                                    type="checkbox" 
                                    checked={currentReceiptDetails[key as keyof ReceiptDetails] as boolean} 
                                    onChange={(e) => handleCheckboxChange(key as keyof ReceiptDetails, e.target.checked)} 
                                    className={interactiveCheckboxClasses}
                                    aria-labelledby={`${key}-label-en ${key}-label-ar`}
                                />
                                <span id={`${key}-label-en`} className="sr-only">{labelEn}</span>
                            </div>
                            <div className="flex items-center justify-end" dir="rtl">
                                <span id={`${key}-label-ar`} className="font-semibold text-base font-arabic mr-3 w-28 sm:w-36 text-right">{labelAr}</span>
                                <input 
                                    type="checkbox" 
                                    checked={currentReceiptDetails[key as keyof ReceiptDetails] as boolean} 
                                    onChange={(e) => handleCheckboxChange(key as keyof ReceiptDetails, e.target.checked)} 
                                    className={interactiveCheckboxClasses}
                                    aria-labelledby={`${key}-label-ar ${key}-label-en`}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            
            <div className="flex items-baseline pt-4">
                <span className={`${enLabelClasses} whitespace-nowrap mr-2`}>DESCRIPTION</span>
                <input type="text" name="description" value={currentReceiptDetails.description} onChange={(e) => handleDetailChange('description', e.target.value)} className={`${fillInInputClasses} font-sans`}/>
                <span className={`${arLabelClasses} whitespace-nowrap ml-2`} dir="rtl">الشرح</span>
            </div>

            <div className="pt-6">
                <h3 className="text-lg font-bold text-slate-800 flex justify-between items-center w-full pb-3 border-b border-slate-200 mb-4"><span className="font-semibold font-sans">ADVERTISEMENTS ON TRACK</span><span className="font-bold font-arabic" dir="rtl">إعلانات على مسار الحلبة</span></h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 sm:gap-4 text-center font-mono font-semibold text-slate-700 mb-4">
                    {(['adsZoneA', 'adsZoneB', 'adsZoneC', 'adsZoneD', 'adsZoneE', 'adsZoneF'] as const).map(zoneKey => (
                         <div key={zoneKey} className="flex items-center justify-center text-sm sm:text-base">
                           <input type="checkbox" id={zoneKey} checked={currentReceiptDetails[zoneKey]} onChange={(e) => handleCheckboxChange(zoneKey, e.target.checked)} className={`${interactiveCheckboxClasses} !m-0 !mr-2`} aria-labelledby={`${zoneKey}-label`}/>
                           <label htmlFor={zoneKey} id={`${zoneKey}-label`} className="font-sans">ZONE {zoneKey.charAt(zoneKey.length - 1)}</label>
                         </div>
                    ))}
                </div>
                <div className="space-y-4 pt-2">
                    <div className="flex items-baseline">
                        <span className={`${enLabelClasses} w-1/4 sm:w-1/5 shrink-0 mr-2`}>TOTAL QTY</span>
                        <input type="text" name="adsTotalQuantity" value={currentReceiptDetails.adsTotalQuantity} onChange={(e) => handleDetailChange('adsTotalQuantity', e.target.value)} className={`${fillInInputClasses} mx-1 sm:mx-2 font-sans`}/>
                        <span className={`${arLabelClasses} w-1/3 sm:w-2/5 shrink-0 ml-2 text-right`} dir="rtl">العدد الإجمالي</span>
                    </div>
                    <div className="flex items-baseline">
                        <span className={`${enLabelClasses} w-1/4 sm:w-1/5 shrink-0 mr-2`}>CAR FLAGS</span>
                        <input type="text" name="carFlagsCount" value={currentReceiptDetails.carFlagsCount} onChange={(e) => handleDetailChange('carFlagsCount', e.target.value)} className={`${fillInInputClasses} mx-1 sm:mx-2 font-sans`}/>
                        <span className={`${arLabelClasses} w-1/3 sm:w-2/5 shrink-0 ml-2 text-right`} dir="rtl">أعلام على السيارات</span>
                    </div>
                    <div className="flex items-baseline">
                        <span className={`${enLabelClasses} w-1/4 sm:w-1/5 shrink-0 mr-2`}>BANNER FLAGS</span>
                        <input type="text" name="bannerFlagsCount" value={currentReceiptDetails.bannerFlagsCount} onChange={(e) => handleDetailChange('bannerFlagsCount', e.target.value)} className={`${fillInInputClasses} mx-1 sm:mx-2 font-sans`}/>
                        <span className={`${arLabelClasses} w-1/3 sm:w-2/5 shrink-0 ml-2 text-right`} dir="rtl">أعلام على الأرصفة</span>
                    </div>
                </div>
            </div>

            <div className="flex items-baseline pt-6">
                <span className={`${enLabelClasses} whitespace-nowrap mr-2`}>NOTES</span>
                <input type="text" name="notes" value={currentReceiptDetails.notes} onChange={(e) => handleDetailChange('notes', e.target.value)} className={`${fillInInputClasses} font-sans`}/>
                <span className={`${arLabelClasses} whitespace-nowrap ml-2`} dir="rtl">ملاحظات</span>
            </div>
        </main>

        <footer className="pt-8 mt-6 border-t border-slate-200">
             <p className="text-xs text-center text-slate-500 flex justify-between"><span className="font-sans">THIS RECEIPT IS NOT A TAX INVOICE.</span><span dir="rtl" className="font-arabic">هذا الوصل لا يعتبر فاتورة ضريبية.</span></p>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 sm:gap-x-12 gap-y-6 mt-8">
                <div className="text-center">
                  <input type="text" name="receiverName" value={currentReceiptDetails.receiverName} onChange={(e) => handleDetailChange('receiverName', e.target.value)} className={`${fillInInputClasses} !mx-0 !w-full font-sans`}/>
                  <p className="mt-2 font-semibold text-slate-700 flex justify-between"><span className="font-sans text-base">RECEIVER'S SIGNATURE</span><span dir="rtl" className="font-arabic text-base">المستلم</span></p>
                </div>
                <div className="text-center">
                  <input type="text" name="payerName" value={currentReceiptDetails.payerName} onChange={(e) => handleDetailChange('payerName', e.target.value)} className={`${fillInInputClasses} !mx-0 !w-full font-sans`}/>
                  <p className="mt-2 font-semibold text-slate-700 flex justify-between"><span className="font-sans text-base">SIGNATURE</span><span dir="rtl" className="font-arabic text-base">الإمضاء</span></p>
                </div>
             </div>
        </footer>

         <div id="export-buttons" className="pt-8 mt-8 border-t border-slate-300 flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4 no-print">
            <button 
              type="button" 
              onClick={handlePreviewReceipt} 
              disabled={isLoading} 
              className="w-full sm:w-auto px-6 py-3 text-sm font-medium text-primary bg-primary/10 hover:bg-primary/20 border border-primary/30 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-60 transition-colors flex items-center justify-center"
            >
               <EyeIcon className="w-5 h-5 mr-2"/> {isLoading ? 'GENERATING...' : 'PREVIEW PDF'}
            </button>
            <button 
              type="button" 
              onClick={handleDownloadReceiptPdf} 
              disabled={isLoading} 
              className="w-full sm:w-auto px-6 py-3 text-sm font-medium text-base-100 bg-primary hover:bg-primary/90 border border-transparent rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-60 transition-colors flex items-center justify-center"
            >
              <DownloadIcon className="w-5 h-5 mr-2"/> {isLoading ? 'DOWNLOADING...' : 'DOWNLOAD PDF'}
            </button>
        </div>
      </div>

      {showReceiptPreviewModal && receiptPreviewUrl && (
        <ReceiptPreviewModal
          isOpen={showReceiptPreviewModal}
          onClose={closeReceiptPreviewModal}
          pdfUrl={receiptPreviewUrl}
          fileName="Receipt_Preview.pdf"
        />
      )}
    </div>
  );
};

export default App;
