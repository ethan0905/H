import { NextRequest, NextResponse } from 'next/server';
import { verifyCloudProof } from '@worldcoin/idkit';

export async function POST(request: NextRequest) {
  try {
    const proof = await request.json();
    
    console.log('=== WORLD ID VERIFICATION DEBUG ===');
    console.log('1. RAW PROOF RECEIVED FROM WORLD ID:');
    console.log(JSON.stringify(proof, null, 2));
    
    console.log('2. EXPECTED FORMAT FOR VERIFICATION:');
    console.log(JSON.stringify({
      nullifier_hash: "0x[64 hex characters]",
      merkle_root: "0x[64 hex characters]", 
      proof: "0x[long hex string] OR [array of 8 numbers]",
      verification_level: "orb or device",
      signal: "optional signal string"
    }, null, 2));
    
    console.log('3. VALIDATION RESULTS:');
    console.log({
      hasProof: !!proof?.proof,
      hasNullifierHash: !!proof?.nullifier_hash,
      hasMerkleRoot: !!proof?.merkle_root,
      hasVerificationLevel: !!proof?.verification_level,
      proofType: typeof proof?.proof,
      proofValue: proof?.proof ? (Array.isArray(proof.proof) ? 'array' : 'string') : 'missing',
      allKeys: proof ? Object.keys(proof) : 'proof is null'
    });

    // Validate required fields
    if (!proof || !proof.proof || !proof.nullifier_hash || !proof.merkle_root) {
      console.log('❌ VALIDATION FAILED - Missing required fields');
      return NextResponse.json(
        { 
          error: 'Invalid proof format - missing required fields',
          debug: process.env.NODE_ENV === 'development' ? {
            received: proof,
            hasProof: !!proof?.proof,
            hasNullifierHash: !!proof?.nullifier_hash,
            hasMerkleRoot: !!proof?.merkle_root,
            keys: proof ? Object.keys(proof) : null
          } : undefined
        },
        { status: 400 }
      );
    }
    
    console.log('✅ VALIDATION PASSED - All required fields present');

    const app_id = process.env.NEXT_PUBLIC_WORLD_APP_ID;
    const action = process.env.NEXT_PUBLIC_WORLD_ID_ACTION;

    if (!app_id || !action) {
      return NextResponse.json(
        { error: 'App ID and action must be configured' },
        { status: 500 }
      );
    }

    // Check if proof format needs conversion
    console.log('4. PROOF FORMAT ANALYSIS:');
    if (typeof proof.proof === 'string' && proof.proof.length < 200) {
      console.log('⚠️  SHORT PROOF DETECTED - This might be test/invalid data');
      console.log('Proof length:', proof.proof.length, 'characters');
      console.log('Real World ID proofs should be much longer (500+ characters)');
      
      // For development: provide a helpful error message
      if (process.env.NODE_ENV === 'development') {
        console.log('💡 DEVELOPMENT TIP: Try scanning a real QR code with World App');
        console.log('   Test proofs will always fail. Real proofs should be properly formatted.');
      }
    }

    // Extract signal from proof (if provided)
    const signal = proof.signal || '';

    console.log('5. CALLING verifyCloudProof WITH:');
    console.log({
      app_id,
      action,
      signal,
      proof_structure: {
        nullifier_hash: proof.nullifier_hash,
        merkle_root: proof.merkle_root,
        proof: typeof proof.proof === 'string' ? proof.proof.substring(0, 50) + '...' : proof.proof,
        verification_level: proof.verification_level
      }
    });

    // Use IDKit's verifyCloudProof function for proper verification
    const verifyResult = await verifyCloudProof(proof, app_id as `app_${string}`, action, signal);
    
    console.log('6. WORLD ID API RESPONSE:');
    console.log(JSON.stringify(verifyResult, null, 2));

    if (verifyResult.success) {
      console.log('✅ WORLD ID VERIFICATION SUCCESSFUL');
      
      // Check if this nullifier has been used before
      const hasBeenUsed = await checkNullifierUsage(proof.nullifier_hash);
      if (hasBeenUsed) {
        console.log('❌ NULLIFIER ALREADY USED');
        return NextResponse.json(
          { error: 'This World ID has already been used' },
          { status: 400 }
        );
      }

      // Store the nullifier hash to prevent reuse
      await storeNullifierHash(proof.nullifier_hash);
      console.log('✅ NULLIFIER STORED, VERIFICATION COMPLETE');

      return NextResponse.json({
        success: true,
        verified: true,
        verification_level: proof.verification_level,
        nullifier_hash: proof.nullifier_hash,
      });
    } else {
      console.log('❌ WORLD ID VERIFICATION FAILED');
      console.log('7. COMPARISON ANALYSIS:');
      console.log('Error code:', verifyResult.code);
      console.log('Error attribute:', verifyResult.attribute);
      console.log('Error detail:', verifyResult.detail);
      
      if (verifyResult.code === 'invalid_format' && verifyResult.attribute === 'proof') {
        console.log('\n🔍 DETAILED PROOF FORMAT ANALYSIS:');
        console.log('Received proof type:', typeof proof.proof);
        console.log('Received proof value:', Array.isArray(proof.proof) ? 'Array with length: ' + proof.proof.length : 'String with length: ' + proof.proof?.length);
        
        if (typeof proof.proof === 'string') {
          console.log('String proof preview:', proof.proof.substring(0, 100) + '...');
          console.log('Full string length:', proof.proof.length);
          console.log('Starts with 0x?', proof.proof.startsWith('0x'));
          
          // Check if it's a short test proof
          if (proof.proof.length < 200) {
            console.log('⚠️  This appears to be a test/mock proof (too short)');
            console.log('Real World ID proofs are typically 500+ characters');
          }
          
          console.log('\n📋 EXPECTED FORMATS:');
          console.log('Option 1: ABI-encoded proof string (long hex string)');
          console.log('Option 2: Array of 8 uint256 numbers: [a, b, c, d, e, f, g, h]');
          console.log('Option 3: JSON array of 8 strings: ["0x...", "0x...", ...]');
        } else if (Array.isArray(proof.proof)) {
          console.log('Array proof contents:', proof.proof);
          console.log('Array length:', proof.proof.length);
          console.log('Expected array length: 8');
          
          if (proof.proof.length !== 8) {
            console.log('❌ Incorrect array length - should be 8 elements');
          }
          
          proof.proof.forEach((element: any, index: number) => {
            console.log(`Element ${index}: ${typeof element} = ${element}`);
          });
        }
        
        console.log('\n💡 SUGGESTIONS:');
        console.log('1. If this is a real scan, the frontend might need to format the proof differently');
        console.log('2. Check if IDKit is returning the proof in an unexpected format');
        console.log('3. The proof might need conversion before sending to verifyCloudProof');
      } else {
        console.log('Non-proof error details:', verifyResult);
      }
      
      console.log('=== END DEBUG ===');
      
      // Development fallback - allow failed verification for testing
      if (process.env.NODE_ENV === 'development' && process.env.ALLOW_FAILED_VERIFICATION === 'true') {
        console.log('⚠️  DEVELOPMENT MODE: Allowing failed verification to proceed');
        console.log('   Set ALLOW_FAILED_VERIFICATION=false to disable this behavior');
        
        return NextResponse.json({
          success: true,
          verified: false, // Mark as unverified but allow through
          verification_level: 'development_bypass',
          nullifier_hash: proof.nullifier_hash || 'dev_nullifier',
          dev_note: 'Verification failed but allowed through for development testing'
        });
      }
      
      return NextResponse.json(
        { 
          error: 'World ID verification failed', 
          details: verifyResult,
          help: process.env.NODE_ENV === 'development' && verifyResult.code === 'invalid_format' 
            ? 'This error often occurs when testing with mock data. Real World ID proofs from the QR scan should have the correct format. Set ALLOW_FAILED_VERIFICATION=true in .env.local to bypass for testing.'
            : undefined
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error verifying World ID:', error);
    return NextResponse.json(
      { 
        error: 'Failed to verify World ID', 
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// In-memory storage for demo - use database in production
const usedNullifiers = new Set<string>();

async function checkNullifierUsage(nullifierHash: string): Promise<boolean> {
  return usedNullifiers.has(nullifierHash);
}

async function storeNullifierHash(nullifierHash: string): Promise<void> {
  usedNullifiers.add(nullifierHash);
}
