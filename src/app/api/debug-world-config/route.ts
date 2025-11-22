import { NextResponse } from 'next/server';

export async function GET() {
  const config = {
    world_app_id: process.env.NEXT_PUBLIC_WORLD_APP_ID,
    world_id_action: process.env.NEXT_PUBLIC_WORLD_ID_ACTION,
    minikit_app_id: process.env.NEXT_PUBLIC_MINIKIT_APP_ID,
    simulator_enabled: process.env.NEXT_PUBLIC_ENABLE_SIMULATOR,
    environment: process.env.NODE_ENV,
    allow_failed_verification: process.env.ALLOW_FAILED_VERIFICATION
  };

  const issues = [];
  
  if (!config.world_app_id) issues.push('Missing NEXT_PUBLIC_WORLD_APP_ID');
  if (!config.world_id_action) issues.push('Missing NEXT_PUBLIC_WORLD_ID_ACTION'); 
  if (!config.minikit_app_id) issues.push('Missing NEXT_PUBLIC_MINIKIT_APP_ID');
  
  if (config.world_app_id && !config.world_app_id.startsWith('app_')) {
    issues.push('App ID should start with "app_"');
  }

  console.log('=== WORLD ID CONFIG DEBUG ===');
  console.log('Current Configuration:');
  console.log(JSON.stringify(config, null, 2));
  console.log('Issues found:', issues);
  
  return NextResponse.json({
    message: 'World ID Configuration Debug Info',
    config,
    issues,
    status: issues.length === 0 ? 'OK' : 'NEEDS_ATTENTION',
    next_steps: issues.length === 0 
      ? 'Configuration looks good. Ready for testing!'
      : 'Fix the identified issues in .env.local',
    testing_options: {
      simulator: config.simulator_enabled === 'true' && config.environment === 'development' 
        ? 'Available - use the purple "Test World ID" button'
        : 'Not available - set NEXT_PUBLIC_ENABLE_SIMULATOR=true in development',
      qr_code: 'Available - scan with World App',
      minikit: 'Available when running in World App',
      fallback: config.allow_failed_verification === 'true' 
        ? 'Enabled - failed verifications will be allowed in development'
        : 'Disabled'
    }
  });
}
