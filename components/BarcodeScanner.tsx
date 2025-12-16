"use client";

import { useZxing } from "react-zxing";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface BarcodeScannerProps {
  onScan: (result: string) => void;
  onClose: () => void;
}

export function BarcodeScanner({ onScan, onClose }: BarcodeScannerProps) {
  const { ref } = useZxing({
    onDecodeResult(result) {
      onScan(result.getText());
    },
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex flex-col items-center justify-center p-4">
       <div className="bg-white p-4 rounded-2xl w-full max-w-sm relative">
           <Button
             variant="ghost"
             size="icon"
             className="absolute right-2 top-2"
             onClick={onClose}
           >
             <X className="h-6 w-6" />
           </Button>
           <h3 className="text-lg font-bold mb-4 text-center">Scan ISBN</h3>
           <div className="relative aspect-square bg-black rounded-lg overflow-hidden">
                <video ref={ref} className="w-full h-full object-cover" />
           </div>
           <p className="text-center text-sm text-gray-500 mt-4">
               Point camera at barcode
           </p>
       </div>
    </div>
  );
}
