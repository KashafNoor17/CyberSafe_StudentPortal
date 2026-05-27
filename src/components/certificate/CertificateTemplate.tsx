import { useRef } from 'react';
import { Award } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

interface CertificateTemplateProps {
  name: string;
  certificateNumber: string;
  verificationId: string;
  issueDate: string;
  verificationUrl: string;
}

export function CertificateTemplate({ 
  name, 
  certificateNumber, 
  verificationId,
  issueDate, 
  verificationUrl 
}: CertificateTemplateProps) {
  const certificateRef = useRef<HTMLDivElement>(null);

  return (
    <div 
      ref={certificateRef}
      className="bg-white p-6 md:p-10 rounded-xl shadow-lg"
    >
      <div className="border-[6px] border-double border-primary/30 p-6 md:p-10 relative">
        {/* Corner decorations */}
        <div className="absolute top-2 left-2 w-8 h-8 border-t-2 border-l-2 border-primary/40" />
        <div className="absolute top-2 right-2 w-8 h-8 border-t-2 border-r-2 border-primary/40" />
        <div className="absolute bottom-2 left-2 w-8 h-8 border-b-2 border-l-2 border-primary/40" />
        <div className="absolute bottom-2 right-2 w-8 h-8 border-b-2 border-r-2 border-primary/40" />

        {/* Header */}
        <div className="text-center mb-6">
          <div className="flex justify-center items-center gap-3 mb-3">
            <Award className="h-10 w-10 text-primary" />
            <span className="text-2xl font-bold text-primary font-display">CyberSafe</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 tracking-wide">
            Certificate of Completion
          </h1>
          <div className="w-24 h-1 bg-gradient-to-r from-primary/50 via-primary to-primary/50 mx-auto mt-3 rounded-full" />
        </div>

        {/* Body */}
        <div className="text-center my-8">
          <p className="text-gray-600 text-lg mb-2">This is to certify that</p>
          <p className="text-3xl md:text-4xl font-bold text-gray-900 my-4 font-display">
            {name}
          </p>
          <p className="text-gray-600 text-lg mb-4">
            has successfully completed the
          </p>
          <div className="bg-gradient-to-r from-primary/10 via-primary/20 to-primary/10 py-3 px-6 rounded-lg inline-block">
            <p className="text-xl md:text-2xl font-bold text-primary">
              Cybersecurity Fundamentals
            </p>
          </div>
          <p className="text-gray-500 mt-4 text-sm">
            Including Password Security, Phishing Detection, and Social Media Safety modules
          </p>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            {/* Left info */}
            <div className="text-center md:text-left">
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Certificate Number</p>
              <p className="font-mono text-sm text-gray-700">{certificateNumber}</p>
              <p className="text-xs text-gray-500 uppercase tracking-wider mt-3 mb-1">Issue Date</p>
              <p className="font-medium text-gray-700">{issueDate}</p>
            </div>

            {/* QR Code */}
            <div className="flex flex-col items-center">
              <QRCodeSVG 
                value={verificationUrl} 
                size={80}
                level="M"
                includeMargin={false}
                className="rounded"
              />
              <p className="text-xs text-gray-500 mt-2 text-center">
                Scan to verify
              </p>
            </div>

            {/* Right info */}
            <div className="text-center md:text-right">
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Verification ID</p>
              <p className="font-mono text-sm text-gray-700">{verificationId}</p>
              <div className="mt-4">
                <div className="border-b border-gray-400 w-32 mx-auto md:ml-auto md:mr-0 mb-1" />
                <p className="text-sm text-gray-600 font-medium">CyberSafe Education</p>
                <p className="text-xs text-gray-500">Authorized Signature</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export { CertificateTemplate as default };
