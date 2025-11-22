'use client';

import { ISuccessResult, VerificationLevel } from '@worldcoin/idkit';
import { useState } from 'react';

interface WorldIDWidgetAuthProps {
  onSuccess: (result: ISuccessResult) => void;
  onError?: (error: Error) => void;
}

export default function WorldIDWidgetAuth({ onSuccess, onError }: WorldIDWidgetAuthProps) {
  const [isLoading, setIsLoading] = useState(false);
  
  // Development testing function - simulates a World ID verification
  const handleSimulatedAuth = async () => {
    if (process.env.NODE_ENV !== 'development') {
      onError?.(new Error('Simulator mode only available in development'));
      return;
    }

    setIsLoading(true);
    console.log('🧪 Starting simulated World ID verification...');

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Create a mock World ID verification result
    const mockResult: ISuccessResult = {
      verification_level: VerificationLevel.Orb,
      merkle_root: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
      nullifier_hash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
      proof: '0x00112233445566778899aabbccddeeff00112233445566778899aabbccddeeff00112233445566778899aabbccddeeff00112233445566778899aabbccddeeff00112233445566778899aabbccddeeff00112233445566778899aabbccddeeff00112233445566778899aabbccddeeff00112233445566778899aabbccddeeff00112233445566778899aabbccddeeff00112233445566778899aabbccddeeff00112233445566778899aabbccddeeff00112233445566778899aabbccddeeff00112233445566778899aabbccddeeff00112233445566778899aabbccddeeff00112233445566778899aabbccddeeff00112233445566778899aabbccddeeff'
    };

    console.log('🧪 Mock World ID result:', mockResult);
    setIsLoading(false);
    onSuccess(mockResult);
  };

  return (
    <div className="space-y-3">
      <button
        onClick={handleSimulatedAuth}
        disabled={isLoading}
        className="w-full bg-purple-600 text-white rounded-lg p-3 font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
            Simulating World ID...
          </>
        ) : (
          <>
            <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center">
              <span className="text-purple-600 text-xs font-bold">🧪</span>
            </div>
            Test World ID (Simulator)
          </>
        )}
      </button>
      
      {process.env.NODE_ENV === 'development' && (
        <p className="text-xs text-gray-500 text-center">
          Development testing mode - simulates World ID verification
        </p>
      )}
    </div>
  );
}
