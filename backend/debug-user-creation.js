import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

console.log('🔍 Debugging Supabase User Creation...\n');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function debugUserCreation() {
  try {
    console.log('1. Environment Check:');
    console.log('   SUPABASE_URL:', process.env.SUPABASE_URL ? '✅ Set' : '❌ Missing');
    console.log('   SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ Set' : '❌ Missing');
    
    const testEmail = `test-${Date.now()}@debug.com`;
    const testPassword = 'TestPass123!';
    
    console.log('\n2. Testing User Creation:');
    console.log('   Test Email:', testEmail);
    
    // Test 1: Basic user creation
    console.log('\n   Test 1: Basic user creation...');
    try {
      const { data: authData1, error: authError1 } = await supabase.auth.admin.createUser({
        email: testEmail,
        password: testPassword,
        email_confirm: true
      });
      
      if (authError1) {
        console.log('   ❌ Failed:', authError1.message);
        console.log('   Code:', authError1.code);
        console.log('   Details:', JSON.stringify(authError1, null, 2));
      } else {
        console.log('   ✅ Success! User ID:', authData1.user.id);
        
        // Clean up
        await supabase.auth.admin.deleteUser(authData1.user.id);
        console.log('   🧹 Test user cleaned up');
      }
    } catch (e) {
      console.log('   ❌ Exception:', e.message);
    }
    
    // Test 2: User creation without email_confirm
    console.log('\n   Test 2: User creation without email_confirm...');
    try {
      const { data: authData2, error: authError2 } = await supabase.auth.admin.createUser({
        email: testEmail.replace('@debug.com', '2@debug.com'),
        password: testPassword
      });
      
      if (authError2) {
        console.log('   ❌ Failed:', authError2.message);
        console.log('   Code:', authError2.code);
      } else {
        console.log('   ✅ Success! User ID:', authData2.user.id);
        
        // Clean up
        await supabase.auth.admin.deleteUser(authData2.user.id);
        console.log('   🧹 Test user cleaned up');
      }
    } catch (e) {
      console.log('   ❌ Exception:', e.message);
    }
    
    // Test 3: List existing users to check permissions
    console.log('\n3. Testing Admin Permissions:');
    try {
      const { data: users, error: listError } = await supabase.auth.admin.listUsers({
        page: 1,
        perPage: 5
      });
      
      if (listError) {
        console.log('   ❌ Cannot list users:', listError.message);
      } else {
        console.log('   ✅ Can list users. Found', users.users.length, 'users');
      }
    } catch (e) {
      console.log('   ❌ List users exception:', e.message);
    }
    
    // Test 4: Check RLS policies by testing database access
    console.log('\n4. Testing Database Access:');
    try {
      const { data: shops, error: shopError } = await supabase
        .from('shops')
        .select('id, name')
        .limit(1);
      
      if (shopError) {
        console.log('   ❌ Database access failed:', shopError.message);
      } else {
        console.log('   ✅ Database access works. Found', shops.length, 'shops');
      }
    } catch (e) {
      console.log('   ❌ Database exception:', e.message);
    }
    
    console.log('\n🔚 Debug complete!');
    
  } catch (error) {
    console.error('💥 Debug script failed:', error);
  }
  
  process.exit(0);
}

debugUserCreation();