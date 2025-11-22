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
  const [sessionSignal] = useState(() => 'sign-in-' + Date.now());
  const [isVerifying, setIsVerifying] = useState(false);
  const [manualTesting, setManualTesting] = useState(false);
  
  console.log('=== WorldIDQR Component Debug ===');
  console.log('app_id:', app_id);
  console.log('action:', action);
  console.log('sessionSignal:', sessionSignal);

  // For development/testing when real World ID app is not available
  const handleManualSuccess = () => {
    const mockProof = {
      proof: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
      merkle_root: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef12",
      nullifier_hash: "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
      verification_level: "device" as const,
      status: "success" as const,
    };
    onSuccess?.(mockProof);
  };

  // Try to use real World ID session, but fallback gracefully
  let status = 'init';
  let sessionURI: string | null = '';
  let result = null;
  let errorCode = null;

  try {
    const sessionData = useSession({
      app_id: app_id as `app_${string}`,
      action,
      signal: sessionSignal,
      action_description: 'Verify your identity to access World Social',
      verification_level: VerificationLevel.Device,
    });
    
    status = sessionData.status;
    sessionURI = sessionData.sessionURI;
    result = sessionData.result;
    errorCode = sessionData.errorCode;
  } catch (error) {
    console.warn('World ID session failed, falling back to manual testing:', error);
    status = 'failed';
  }

  console.log('useSession status:', status);
  console.log('useSession sessionURI:', sessionURI);
  console.log('useSession result:', result);
  console.log('useSession errorCode:', errorCode);

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
      <div className="bg-card p-6 rounded-2xl shadow-lg border border-border text-center">
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
        </div>
        <p className="text-sm text-muted-foreground">Setting up verification...</p>
      </div>
    );
  }

  if (status === 'confirmed') {
    return (
      <div className="bg-card p-6 rounded-2xl shadow-lg border border-border text-center">
        <div className="text-6xl mb-4">✅</div>
        <h3 className="text-lg font-semibold text-foreground mb-2">
          Verification Successful!
        </h3>
        <p className="text-sm text-muted-foreground">
          Your World ID has been verified. Redirecting...
        </p>
      </div>
    );
  }

  if (status === 'failed') {
    return (
      <div className="bg-card p-6 rounded-2xl shadow-lg border border-border text-center">
        <div className="text-6xl mb-4">❌</div>
        <h3 className="text-lg font-semibold text-destructive mb-2">
          Verification Setup Failed
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          World ID verification setup failed. This might be a configuration issue.
        </p>
        {process.env.NODE_ENV === 'development' && (
          <div className="space-y-3">
            <button
              onClick={handleManualSuccess}
              className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors text-sm"
            >
              🧪 Test with Mock Verification (Dev)
            </button>
            <p className="text-xs text-muted-foreground">
              Development mode: Click above to simulate successful verification
            </p>
          </div>
        )}
        <button
          onClick={() => window.location.reload()}
          className="mt-3 bg-destructive text-destructive-foreground px-4 py-2 rounded-lg hover:bg-destructive/90 transition-colors text-sm"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="bg-card p-6 rounded-2xl shadow-lg border border-border text-center">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-foreground mb-2">
          Verify with World ID
        </h3>
        <p className="text-sm text-muted-foreground">
          Scan this QR code with World App to verify your identity
        </p>
        {status === 'awaiting_connection' && (
          <div className="mt-2 flex items-center justify-center">
            <div className="animate-pulse flex items-center text-primary">
              <div className="w-2 h-2 bg-primary rounded-full mr-2"></div>
              <span className="text-xs">Waiting for verification...</span>
            </div>
          </div>
        )}
      </div>
      
      <div className="mb-4 p-4 bg-muted rounded-xl">
        <div className="w-48 h-48 mx-auto bg-background rounded-lg flex items-center justify-center border border-border">
          {qrDataUrl ? (
            <img 
              src={qrDataUrl} 
              alt="World ID Verification QR Code"
              className="w-full h-full object-contain rounded-lg"
            />
          ) : (
            <div className="text-center">
              <div className="text-4xl mb-2">📱</div>
              <p className="text-xs text-muted-foreground">Generating QR Code...</p>
            </div>
          )}
        </div>
      </div>
      
      <div className="space-y-3">
        <p className="text-xs text-muted-foreground">
          Don't have World App?{' '}
          <a 
            href="https://worldcoin.org/download" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-primary hover:text-primary/80 underline"
          >
            Download here
          </a>
        </p>
        
        {sessionURI && (
          <a
            href={sessionURI}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-primary text-primary-foreground px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors text-sm"
          >
            Open in World App
          </a>
        )}

        {process.env.NODE_ENV === 'development' && (
          <div className="pt-2 border-t border-border">
            <button
              onClick={handleManualSuccess}
              className="bg-secondary text-secondary-foreground px-4 py-2 rounded-lg hover:bg-secondary/80 transition-colors text-sm"
            >
              🧪 Test with Mock Verification (Dev)
            </button>
            <p className="text-xs text-muted-foreground mt-1">
              Development mode: Click above to simulate successful verification
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
