#!/usr/bin/env node

/**
 * Script to update database types from Supabase
 *
 * Best Practices for TypeScript Types in Supabase:
 *
 * 1. Always regenerate types after database changes
 * 2. Use the generated types as the single source of truth
 * 3. Create wrapper types for complex queries
 * 4. Never manually edit the generated database.types.ts file
 * 5. Use type helpers for common patterns
 *
 * Usage: npm run update-types
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

const execAsync = promisify(exec);

// Load environment variables
dotenv.config({ path: '.env.local' });

async function updateDatabaseTypes() {
  console.log('🔄 Updating database types from Supabase...');

  try {
    const supabaseUrl = process.env['NEXT_PUBLIC_SUPABASE_URL'];
    if (!supabaseUrl) {
      throw new Error('NEXT_PUBLIC_SUPABASE_URL not found in environment variables');
    }

    // Extract project ID from URL
    const urlParts = supabaseUrl.split('//')[1];
    if (!urlParts) {
      throw new Error('Invalid NEXT_PUBLIC_SUPABASE_URL format');
    }
    const projectId = urlParts.split('.')[0];
    console.log(`📦 Project ID: ${projectId}`);

    // Generate types using Supabase CLI
    console.log('⚙️ Generating types...');
    const { stdout, stderr } = await execAsync(
      `npx supabase gen types typescript --project-id ${projectId} --schema public`
    );

    if (stderr) {
      console.error('Warning:', stderr);
    }

    // Write to database.types.ts
    const typesPath = path.join(process.cwd(), 'lib', 'types', 'database.types.ts');
    fs.writeFileSync(typesPath, stdout);

    console.log('✅ Database types updated successfully!');
    console.log(`📁 Types written to: ${typesPath}`);

    // List new tables found
    const newTables = [
      'contact_submission',
      'webhook_events',
      'billing_alert',
      'invoice',
      'payment_intent',
      'charge',
      'payment_method',
      'refund',
      'subscription_history',
      'login_attempts',
      'account_lockouts',
      'rate_limit_violations',
      'verification_reminders',
      'sla_policy',
      'analytics_mrr'
    ];

    console.log('\n📊 Checking for new tables:');
    const content = stdout.toLowerCase();
    for (const table of newTables) {
      if (content.includes(table)) {
        console.log(`  ✅ ${table}`);
      }
    }

  } catch (error) {
    console.error('❌ Error updating database types:', error);
    process.exit(1);
  }
}

// Run the update
updateDatabaseTypes();