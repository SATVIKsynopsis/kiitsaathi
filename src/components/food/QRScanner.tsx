import { useState, useEffect } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Camera, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface QRScannerProps {
  onScan: (code: string) => void;
  onClose?: () => void;
}

const QRScanner = ({ onScan, onClose }: QRScannerProps) => {
  const [scanner, setScanner] = useState<Html5Qrcode | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const html5QrCode = new Html5Qrcode("qr-reader");
    setScanner(html5QrCode);

    return () => {
      if (html5QrCode.isScanning) {
        html5QrCode.stop();
      }
    };
  }, []);

  const startScanning = async () => {
    if (!scanner) return;

    try {
      setIsScanning(true);
      await scanner.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 }
        },
        (decodedText) => {
          onScan(decodedText);
          stopScanning();
        },
        (errorMessage) => {
          // Ignore errors - they're usually just "no QR code found"
        }
      );
    } catch (error: any) {
      toast({
        title: "Camera Error",
        description: error.message,
        variant: "destructive"
      });
      setIsScanning(false);
    }
  };

  const stopScanning = async () => {
    if (scanner && isScanning) {
      await scanner.stop();
      setIsScanning(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Scan QR Code</CardTitle>
        {onClose && (
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <div id="qr-reader" className="w-full mb-4"></div>
        
        {!isScanning ? (
          <Button onClick={startScanning} className="w-full">
            <Camera className="mr-2 h-5 w-5" />
            Start Scanning
          </Button>
        ) : (
          <Button onClick={stopScanning} variant="outline" className="w-full">
            Stop Scanning
          </Button>
        )}
        
        <p className="text-sm text-muted-foreground text-center mt-4">
          Position the QR code within the frame to scan
        </p>
      </CardContent>
    </Card>
  );
};

export default QRScanner;