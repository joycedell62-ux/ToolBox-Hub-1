import React, { useState } from 'react';
import { Download, QrCode as QrCodeIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function QrCodeGenerator() {
  const [input, setInput] = useState('');
  
  // Use a debounced value for the image to prevent too many requests while typing
  const [debouncedInput, setDebouncedInput] = useState('');
  
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedInput(input);
    }, 500);
    return () => clearTimeout(timer);
  }, [input]);

  const qrUrl = debouncedInput 
    ? `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(debouncedInput)}&margin=10` 
    : '';

  const handleDownload = async () => {
    if (!qrUrl) return;
    try {
      const response = await fetch(qrUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'qrcode.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading QR code:', error);
    }
  };

  return (
    <div className="max-w-2xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight mb-2">QR Code Generator</h1>
        <p className="text-muted-foreground">Turn any URL, text, or data into a scannable QR code</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border p-6 md:p-8 space-y-8">
        
        <div className="space-y-3">
          <label htmlFor="qr-input" className="text-sm font-semibold block">
            Enter text or URL
          </label>
          <Input
            id="qr-input"
            type="text"
            placeholder="https://example.com"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="text-lg py-6"
          />
        </div>

        <div className="bg-blue-50/50 rounded-xl p-8 border border-blue-100 flex flex-col items-center justify-center min-h-[400px]">
          {qrUrl ? (
            <div className="flex flex-col items-center gap-8 animate-in zoom-in-95 duration-300">
              <div className="bg-white p-4 rounded-xl shadow-sm">
                <img 
                  src={qrUrl} 
                  alt="Generated QR Code" 
                  className="w-[250px] h-[250px] object-contain"
                />
              </div>
              <Button onClick={handleDownload} className="gap-2" size="lg">
                <Download className="w-5 h-5" />
                Download PNG
              </Button>
            </div>
          ) : (
            <div className="text-center text-muted-foreground flex flex-col items-center">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-4 text-blue-300">
                <QrCodeIcon className="w-10 h-10" />
              </div>
              <p className="font-medium text-gray-500">Enter something above to generate</p>
              <p className="text-sm">Your QR code will appear here</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}