const fs = require('fs');
const path = require('path');

const API_URL = 'http://localhost:5000';

async function main() {
    try {
        console.log('Starting compatibility verification...');

        fs.writeFileSync('test_legacy.jpg', 'dummy legacy content');
        fs.writeFileSync('test_new.jpg', 'dummy new content');

        // 1. Register/Login (Reusing logic)
        const email = `test_compat_${Date.now()}@example.com`;
        const password = 'password123';

        let res = await fetch(`${API_URL}/user/onboard`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: 'Compat User', email, password })
        });

        if (!res.ok) console.log('Register skipped (exists?)');

        res = await fetch(`${API_URL}/user/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const loginData = await res.json();
        const token = loginData.data.token;
        console.log('Login successful.');

        // 2. Test Legacy "file" key
        console.log('Testing legacy "file" key...');
        const legacyFormData = new FormData();
        legacyFormData.append('title', 'Legacy Upload Test');
        const legacyFile = new Blob([fs.readFileSync('test_legacy.jpg')], { type: 'image/jpeg' });
        legacyFormData.append('file', legacyFile, 'test_legacy.jpg');

        res = await fetch(`${API_URL}/todo/create`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
            body: legacyFormData
        });

        const legacyData = await res.json();
        console.log('Legacy response:', JSON.stringify(legacyData, null, 2));

        if (legacyData.success && legacyData.data.attachments.length === 1) {
            console.log('✅ SUCCESS: Legacy "file" key works.');
        } else {
            console.log('❌ FAILURE: Legacy "file" key failed.');
        }

        // 3. Test New "files" key
        console.log('Testing new "files" key...');
        const newFormData = new FormData();
        newFormData.append('title', 'New Upload Test');
        const newFile = new Blob([fs.readFileSync('test_new.jpg')], { type: 'image/jpeg' });
        newFormData.append('files', newFile, 'test_new.jpg');

        res = await fetch(`${API_URL}/todo/create`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
            body: newFormData
        });

        const newData = await res.json();

        if (newData.success && newData.data.attachments.length === 1) {
            console.log('✅ SUCCESS: New "files" key works.');
        } else {
            console.log('❌ FAILURE: New "files" key failed.');
        }

        // Cleanup
        fs.unlinkSync('test_legacy.jpg');
        fs.unlinkSync('test_new.jpg');

    } catch (error) {
        console.error('Test Failed:', error);
    }
}

main();
