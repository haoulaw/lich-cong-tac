const ADMIN_USERNAME = 'admin'; 
const ADMIN_PASSWORD = 'admin';

const loginContainer = document.getElementById('login-container');
const uploadContainer = document.getElementById('upload-container');

function login() {
    const user = document.getElementById('username').value;
    const pass = document.getElementById('password').value;
    if (user === ADMIN_USERNAME && pass === ADMIN_PASSWORD) {
        loginContainer.style.display = 'none';
        uploadContainer.style.display = 'block';
    } else {
        document.getElementById('login-error').textContent = 'Tài khoản hoặc mật khẩu không đúng!';
    }
}

function handleUpload() {
    const fileInput = document.getElementById('csvFile');
    const tuanSo = document.getElementById('tuanSoInput').value;
    const statusDiv = document.getElementById('status');
    
    if (!fileInput.files || fileInput.files.length === 0 || !tuanSo) {
        statusDiv.textContent = 'Vui lòng nhập Tiêu đề và chọn một file.';
        statusDiv.className = 'error-cell';
        return;
    }
    
    const file = fileInput.files[0];
    statusDiv.textContent = 'Đang xử lý file...';

    Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        delimiter: ';',
        complete: function(results) {
            const cleanData = results.data.filter(row => Object.values(row).some(val => val !== null && val !== ''));
            const finalJson = {
                tuanSo: tuanSo,
                ngayCapNhat: new Date().toISOString(),
                lichCongTac: cleanData
            };
            updateScheduleSecurely(finalJson);
        }
    });
}

async function updateScheduleSecurely(scheduleData) {
    const statusDiv = document.getElementById('status');
    statusDiv.textContent = 'Đang gửi dữ liệu lên server an toàn...';
    statusDiv.className = '';

    try {
        const response = await fetch('/.netlify/functions/updateSchedule', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(scheduleData)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || `Server trả về lỗi: ${response.statusText}`);
        }
        
        const result = await response.json();
        statusDiv.textContent = result.message;
        statusDiv.className = 'success-cell';
        document.getElementById('csvFile').value = '';

    } catch (error) {
        statusDiv.textContent = `Cập nhật thất bại: ${error.message}`;
        statusDiv.className = 'error-cell';
        console.error('Lỗi khi gọi serverless function:', error);
    }
}