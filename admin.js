// admin.js

document.addEventListener('DOMContentLoaded', () => {
    // Giả định trong admin.html có các element với id tương ứng
    const scheduleForm = document.getElementById('schedule-form');
    const scheduleTableBody = document.querySelector('#schedule-table tbody');
    const statusMessage = document.getElementById('status-message');
    let editingId = null; // Biến để lưu ID của công việc đang sửa

    const API_ENDPOINT = '/api/schedule'; // Sử dụng đường dẫn đã rewrite trong netlify.toml

    const showStatus = (message, isError = false) => {
        statusMessage.textContent = message;
        statusMessage.className = isError? 'error' : 'success';
        setTimeout(() => { statusMessage.textContent = ''; statusMessage.className = ''; }, 4000);
    };

    const renderTable = (schedules) => {
        scheduleTableBody.innerHTML = '';
        if (!schedules |

| schedules.length === 0) {
            scheduleTableBody.innerHTML = '<tr><td colspan="3" style="text-align: center;">Chưa có lịch công tác nào.</td></tr>';
            return;
        }
        schedules.forEach(item => {
            const row = scheduleTableBody.insertRow();
            row.setAttribute('data-id', item.id);
            row.innerHTML = `
                <td>${item.date}</td>
                <td>${item.task}</td>
                <td>
                    <button class="edit-btn" data-id="${item.id}" data-date="${item.date}" data-task="${item.task}">Sửa</button>
                    <button class="delete-btn" data-id="${item.id}">Xóa</button>
                </td>
            `;
        });
    };

    const fetchSchedules = async () => {
        try {
            const response = await fetch(API_ENDPOINT);
            if (!response.ok) throw new Error(`Lỗi mạng: ${response.statusText}`);
            const { data } = await response.json();
            renderTable(data);
        } catch (error) {
            showStatus('Không thể tải lịch công tác.', true);
        }
    };

    scheduleForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const date = document.getElementById('date').value;
        const task = document.getElementById('task').value;
        if (!date ||!task) {
            showStatus('Vui lòng nhập đủ ngày và nội dung.', true);
            return;
        }

        const method = editingId? 'PUT' : 'POST';
        const body = editingId? { id: editingId, date, task } : { date, task };

        try {
            const response = await fetch(API_ENDPOINT, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });
            if (!response.ok) throw new Error(`Không thể ${editingId? 'cập nhật' : 'thêm mới'}.`);
            
            showStatus(`Đã ${editingId? 'cập nhật' : 'thêm mới'} thành công!`);
            scheduleForm.reset();
            document.getElementById('form-title').textContent = 'Thêm Lịch Công Tác Mới';
            editingId = null;
            fetchSchedules();
        } catch (error) {
            showStatus(error.message, true);
        }
    });

    scheduleTableBody.addEventListener('click', async (e) => {
        const target = e.target;
        const id = target.dataset.id;

        if (target.classList.contains('delete-btn')) {
            if (!confirm('Bạn có chắc muốn xóa?')) return;
            try {
                const response = await fetch(API_ENDPOINT, {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id }),
                });
                if (!response.ok) throw new Error('Không thể xóa.');
                showStatus('Xóa thành công!');
                fetchSchedules();
            } catch (error) {
                showStatus(error.message, true);
            }
        }

        if (target.classList.contains('edit-btn')) {
            editingId = id;
            document.getElementById('date').value = target.dataset.date;
            document.getElementById('task').value = target.dataset.task;
            document.getElementById('form-title').textContent = 'Chỉnh Sửa Công Tác';
            window.scrollTo(0, 0); // Cuộn lên đầu trang để sửa
        }
    });

    fetchSchedules(); // Tải dữ liệu ban đầu
});