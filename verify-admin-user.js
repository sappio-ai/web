
import { loadEnvConfig } from '@next/env'
loadEnvConfig(process.cwd())

const { getAdminUserDetails } = require('./src/lib/actions/admin-users');

async function verify() {
    try {
        const user = await getAdminUserDetails('215675c3-de0c-42c4-9f2c-95626b305237');
        console.log('User Details:', JSON.stringify(user, null, 2));
    } catch (err) {
        console.error('Error:', err);
    }
}

verify();
