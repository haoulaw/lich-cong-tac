// --- THÔNG TIN CẦN THAY ĐỔI ---
const GIST_ID = '4255a3b171fa450e0be26775dd282d79'; 
// --- KẾT THÚC PHẦN THAY ĐỔI ---

document.addEventListener('DOMContentLoaded', function() {
    fetchSchedule();
    document.getElementById('searchInput').addEventListener('keyup', filterTable);
    document.getElementById('printButton').addEventListener('click', () => window.print());
});

function fetchSchedule() {
    const scheduleTableBody = document.querySelector('#scheduleTable tbody');
    scheduleTableBody.innerHTML = `<tr><td colspan="6">Đang tải dữ liệu...</td></tr>`;
    const url = `https://api.github.com/gists/${GIST_ID}?t=${new Date().getTime()}`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            const fileContent = data.files['schedule.json']?.content;
            if (fileContent) {
                const scheduleData = JSON.parse(fileContent);
                renderSchedule(scheduleData);
            } else {
                throw new Error("Không tìm thấy file 'schedule.json' trong Gist.");
            }
        })
        .catch(error => {
            console.error('Lỗi khi tải lịch:', error);
            scheduleTableBody.innerHTML = `<tr><td colspan="6" style="color: red;">Không thể tải lịch công tác.</td></tr>`;
        });
}

function renderSchedule(data) {
    document.getElementById('tuanSo').textContent = `Từ ngày: ${data.tuanSo || ''}`;
    const updateDate = new Date(data.ngayCapNhat);
    document.getElementById('ngayCapNhat').textContent = updateDate.toLocaleString('vi-VN');
    const scheduleTableBody = document.querySelector('#scheduleTable tbody');
    scheduleTableBody.innerHTML = '';

    if (!data.lichCongTac || data.lichCongTac.length === 0) {
        scheduleTableBody.innerHTML = `<tr><td colspan="6">Không có lịch công tác trong tuần.</td></tr>`;
        return;
    }

    let lastValidDay = '';    // Biến để nhớ ngày gần nhất
    let currentDayGroup = ''; // Biến để theo dõi nhóm ngày cho việc tô màu
    let isOddGroup = false;

    data.lichCongTac.forEach(item => {
        const row = document.createElement('tr');
        let effectiveDay; // Ngày thực tế của dòng này (kể cả khi ô trống)

        // Nếu ô ngày có chữ, đó là một ngày mới. Nếu không, nó thuộc về ngày ở trên.
        if ((item.ngay || '').trim()) {
            effectiveDay = item.ngay.trim();
            lastValidDay = effectiveDay;
        } else {
            effectiveDay = lastValidDay;
        }
        
        // Logic tô màu nền xen kẽ: chỉ đổi màu khi ngày thực tế thay đổi
        if (effectiveDay !== currentDayGroup) {
            isOddGroup = !isOddGroup;
            currentDayGroup = effectiveDay;
        }
        row.classList.add(isOddGroup ? 'day-group-odd' : 'day-group-even');
        
        // Gán ngày thực tế vào thuộc tính data-day để highlight cho đúng
        row.setAttribute('data-day', effectiveDay);

        row.innerHTML = `
            <td data-label="Ngày">${item.ngay || ''}</td>
            <td data-label="Buổi">${item.buoi || ''}</td>
            <td data-label="Nội dung">${item.noiDung || ''}</td>
            <td data-label="Địa điểm">${item.diaDiem || ''}</td>
            <td data-label="Tham gia">${item.thamGia || ''}</td>
            <td data-label="Ghi chú">${item.ghiChu || ''}</td>
        `;
        scheduleTableBody.appendChild(row);
    });

    highlightCurrentDay();
}

function highlightCurrentDay() {
    // Sửa lại để khớp với định dạng "Thứ 2", "Thứ 3"...
    const weekdays = ["Chủ nhật", "Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"];
    const todayString = weekdays[new Date().getDay()];
    const rows = document.querySelectorAll('#scheduleTable tbody tr');

    rows.forEach(row => {
        const rowDay = row.getAttribute('data-day');
        // So sánh chính xác phần bắt đầu của chuỗi để highlight cả ngày
        if (rowDay && rowDay.startsWith(todayString)) {
            row.classList.add('current-day');
        }
    });
}

function filterTable() {
    const filterText = document.getElementById('searchInput').value;
    const allRows = document.querySelectorAll('#scheduleTable tbody tr');

    // Đầu tiên, xóa tất cả các highlight cũ để bắt đầu lại
    allRows.forEach(row => {
        row.querySelectorAll('td').forEach(cell => {
            // Trả lại nội dung gốc bằng cách lấy textContent
            // Cách này đơn giản và hiệu quả cho dự án của chúng ta
            cell.innerHTML = cell.textContent;
        });
    });

    // Nếu ô tìm kiếm trống, hiện tất cả các dòng và thoát
    if (!filterText.trim()) {
        allRows.forEach(row => {
            row.style.display = '';
        });
        return;
    }

    const upperFilterText = filterText.toUpperCase();
    const matchingDays = new Set();

    // Tìm tất cả các ngày có chứa từ khóa
    allRows.forEach(row => {
        if (row.textContent.toUpperCase().includes(upperFilterText)) {
            matchingDays.add(row.getAttribute('data-day'));
        }
    });

    // Tạo biểu thức chính quy để tìm kiếm không phân biệt hoa thường
    const regex = new RegExp(filterText, 'gi');

    // Vừa ẩn/hiện dòng, vừa tô màu từ khóa cho các dòng được hiện
    allRows.forEach(row => {
        const rowDay = row.getAttribute('data-day');
        const isVisible = matchingDays.has(rowDay);

        row.style.display = isVisible ? '' : 'none';

        // Nếu dòng được hiển thị, thực hiện tô màu
        if (isVisible) {
            row.querySelectorAll('td').forEach(cell => {
                cell.innerHTML = cell.innerHTML.replace(regex, (match) => `<mark class="highlight">${match}</mark>`);
            });
        }
    });
}