import { NextRequest, NextResponse } from 'next/server';
import { verificationStorage } from '@/lib/verification-storage';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('session');
    const proof = searchParams.get('proof');
    const error = searchParams.get('error');

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID required' },
        { status: 400 }
      );
    }

    const session = verificationStorage.get(sessionId);
    if (!session) {
      return NextResponse.json(
        { error: 'Session not found or expired' },
        { status: 404 }
      );
    }

    if (error) {
      // Verification failed
      session.status = 'failed';
      verificationStorage.set(sessionId, session);
      
      return new Response(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Verification Failed</title>
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <style>
              body { font-family: Arial, sans-serif; text-align: center; padding: 40px; background: #f5f5f5; }
              .container { background: white; padding: 40px; border-radius: 10px; max-width: 400px; margin: 0 auto; }
              .error { color: #dc2626; font-size: 18px; margin-bottom: 20px; }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>❌ Verification Failed</h1>
              <p class="error">World ID verification was not successful.</p>
              <p>Please try again or contact support if the issue persists.</p>
            </div>
          </body>
        </html>
      `, {
        headers: { 'Content-Type': 'text/html' },
      });
    }

    if (proof) {
      // Verification successful
      session.status = 'verified';
      session.proof = JSON.parse(decodeURIComponent(proof));
      verificationStorage.set(sessionId, session);

      return new Response(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Verification Successful</title>
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <style>
              body { font-family: Arial, sans-serif; text-align: center; padding: 40px; background: #f5f5f5; }
              .container { background: white; padding: 40px; border-radius: 10px; max-width: 400px; margin: 0 auto; }
              .success { color: #059669; font-size: 18px; margin-bottom: 20px; }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>✅ Verification Successful!</h1>
              <p class="success">Your World ID has been verified successfully.</p>
              <p>You can now return to the World Social app to continue.</p>
              <script>
                // Try to close the window if opened in a popup
                setTimeout(() => {
                  if (window.opener) {
                    window.close();
                  }
                }, 2000);
              </script>
            </div>
          </body>
        </html>
      `, {
        headers: { 'Content-Type': 'text/html' },
      });
    }

    return NextResponse.json(
      { error: 'Invalid callback parameters' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Error handling World ID callback:', error);
    return NextResponse.json(
      { error: 'Failed to process verification callback' },
      { status: 500 }
    );
  }
}
