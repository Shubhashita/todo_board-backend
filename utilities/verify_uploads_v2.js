const fs = require('fs');
const path = require('path');

const API_URL = 'http://localhost:5000'; // Trying 5000

async function main() {
    try {
        console.log('Starting verification...');

        // Create dummy files
        fs.writeFileSync('test1.jpg', 'dummy content 1');
        fs.writeFileSync('test2.jpg', 'dummy content 2');

        // 1. Register
        const email = `test${Date.now()}@example.com`;
        const password = 'password123';
        console.log(`Registering user: ${email}`);

        let res = await fetch(`${API_URL}/user/onboard`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: 'Test User', email, password })
        });

        if (!res.ok) {
            // Maybe already exists or other error, try login
            console.log('Register failed (maybe exists), trying login...');
        } else {
            console.log('Registered successfully.');
        }

        // 2. Login
        console.log('Logging in...');
        res = await fetch(`${API_URL}/user/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const loginData = await res.json();
        if (!res.ok) throw new Error(`Login failed: ${loginData.message}`);
        const token = loginData.data.token;
        console.log('Login successful, token received.');

        // 3. Create Todo with files
        console.log('Creating Todo with multiple files...');
        const formData = new FormData();
        formData.append('title', 'Test Multiple Upload');
        formData.append('description', 'Testing multiple file uploads');

        const file1 = new Blob([fs.readFileSync('test1.jpg')], { type: 'image/jpeg' });
        const file2 = new Blob([fs.readFileSync('test2.jpg')], { type: 'image/jpeg' });

        formData.append('files', file1, 'test1.jpg');
        formData.append('files', file2, 'test2.jpg');

        res = await fetch(`${API_URL}/todo/create`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });

        const createData = await res.json();
        if (!res.ok) {
            console.log('Create response:', createData);
            throw new Error(`Create Todo failed: ${createData.message}`);
        }

        console.log('Todo Created:', JSON.stringify(createData, null, 2));

        if (createData.data.attachments && createData.data.attachments.length === 2) {
            console.log('✅ SUCCESS: Todo created with 2 attachments.');
        } else {
            console.log('❌ FAILURE: Incorrect number of attachments.');
        }

        // 4. Update Todo with new file
        console.log('Updating Todo with 1 new file...');
        const todoId = createData.data.id;
        fs.writeFileSync('test3.jpg', 'dummy content 3');

        const updateFormData = new FormData();
        updateFormData.append('description', 'Updated description with more files');
        const file3 = new Blob([fs.readFileSync('test3.jpg')], { type: 'image/jpeg' });
        updateFormData.append('files', file3, 'test3.jpg');

        res = await fetch(`${API_URL}/todo/update/${todoId}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: updateFormData
        });

        const updateData = await res.json();
        console.log('Update response:', JSON.stringify(updateData, null, 2));

        if (updateData.data.attachments && updateData.data.attachments.length === 3) {
            console.log('✅ SUCCESS: Todo updated, now has 3 attachments.');
        } else {
            console.log('❌ FAILURE: Update failed to append attachment.');
        }

        // Cleanup
        fs.unlinkSync('test1.jpg');
        fs.unlinkSync('test2.jpg');
        fs.unlinkSync('test3.jpg');

    } catch (error) {
        console.error('Test Failed:', error);
    }
}

main();
