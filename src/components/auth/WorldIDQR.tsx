'use client';

import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { useSession, VerificationLevel } from '@worldcoin/idkit';

interface WorldIDQRProps {
  action: string;
  app_id: string;
  onSuccess?: (proof: any) => void;
  onError?: (error: any) => void;
}

export default function WorldIDQR({ action, app_id, onSuccess, onError }: WorldIDQRProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [sessionSignal] = useState(() => 'sign-in-' + Date.now()); // Stable signal per component instance
  const [isVerifying, setIsVerifying] = useState(false); // Prevent multiple verification attempts
  
  // Use IDKit's session hook for proper QR code generation
  const { status, sessionURI, result, errorCode } = useSession({
    app_id: app_id as `app_${string}`,
    action,
    signal: sessionSignal,
    action_description: 'Sign in to World Social',
    verification_level: VerificationLevel.Orb, // Use VerificationLevel.Device for less strict verification
  });

  // Generate QR code when sessionURI is available
  useEffect(() => {
    const generateQR = async () => {
      if (sessionURI) {
        try {
          const qrDataUrl = await QRCode.toDataURL(sessionURI, {
            width: 200,
            margin: 2,
            color: {
              dark: '#000000',
              light: '#FFFFFF'
            }
          });
          setQrDataUrl(qrDataUrl);
        } catch (error) {
          console.error('Error generating QR code:', error);
          onError?.(error);
        }
      }
    };

    generateQR();
  }, [sessionURI, onError]);

  // Handle verification result
  useEffect(() => {
    if (status === 'confirmed' && result && !isVerifying) {
      setIsVerifying(true);
      console.log('=== WORLD ID QR COMPONENT DEBUG ===');
      console.log('World ID scan result from useSession:', JSON.stringify(result, null, 2));
      console.log('Status:', status);
      console.log('Passing to parent component...');
      // Pass the raw proof result to parent component for backend verification
      onSuccess?.(result);
    } else if (status === 'failed') {
      console.log('World ID verification failed in useSession:', errorCode);
      onError?.(errorCode || 'Verification failed');
    }
  }, [status, result, errorCode, onSuccess, onError, isVerifying]);

  if (status === 'awaiting_connection' && !sessionURI) {
    return (
      <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200 text-center">
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent"></div>
        </div>
        <p className="text-sm text-gray-600">Setting up verification...</p>
      </div>
    );
  }

  if (status === 'confirmed') {
    return (
      <div className="bg-green-50 p-6 rounded-2xl shadow-lg border border-green-200 text-center">
        <div className="text-6xl mb-4">✅</div>
        <h3 className="text-lg font-semibold text-green-900 mb-2">
          Verification Successful!
        </h3>
        <p className="text-sm text-green-700">
          Your World ID has been verified. Redirecting...
        </p>
      </div>
    );
  }

  if (status === 'failed') {
    return (
      <div className="bg-red-50 p-6 rounded-2xl shadow-lg border border-red-200 text-center">
        <div className="text-6xl mb-4">❌</div>
        <h3 className="text-lg font-semibold text-red-900 mb-2">
          Verification Failed
        </h3>
        <p className="text-sm text-red-700 mb-4">
          World ID verification was not successful. Please try again.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200 text-center">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Verify with World ID
        </h3>
        <p className="text-sm text-gray-600">
          Scan this QR code with World App to verify your identity
        </p>
        {status === 'awaiting_connection' && (
          <div className="mt-2 flex items-center justify-center">
            <div className="animate-pulse flex items-center text-blue-600">
              <div className="w-2 h-2 bg-blue-600 rounded-full mr-2"></div>
              <span className="text-xs">Waiting for verification...</span>
            </div>
          </div>
        )}
      </div>
      
      <div className="mb-4 p-4 bg-gray-50 rounded-xl">
        <div className="w-48 h-48 mx-auto bg-white rounded-lg flex items-center justify-center border">
          {qrDataUrl ? (
            <img 
              src={qrDataUrl} 
              alt="World ID Verification QR Code"
              className="w-full h-full object-contain rounded-lg"
            />
          ) : (
            <div className="text-center">
              <div className="text-4xl mb-2">📱</div>
              <p className="text-xs text-gray-500">Generating QR Code...</p>
            </div>
          )}
        </div>
      </div>
      
      <div className="space-y-3">
        <p className="text-xs text-gray-500">
          Don't have World App?{' '}
          <a 
            href="https://worldcoin.org/download" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 underline"
          >
            Download here
          </a>
        </p>
        
        {sessionURI && (
          <a
            href={sessionURI}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
          >
            Open in World App
          </a>
        )}
      </div>
    </div>
  );
}
