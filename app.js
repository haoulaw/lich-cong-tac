// --- THÔNG TIN CẦN THAY ĐỔI ---
const GIST_ID = '475f1c1d8bafae4971f80e09e0c899f2'; 
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

    let lastValidDay = '';
    let currentDayGroup = '';
    let isOddGroup = false;

    data.lichCongTac.forEach(item => {
        const row = document.createElement('tr');
        let effectiveDay = (item.ngay || '').trim();

        if (effectiveDay) {
            lastValidDay = effectiveDay;
        } else {
            effectiveDay = lastValidDay;
        }
        
        if (effectiveDay !== currentDayGroup) {
            isOddGroup = !isOddGroup;
            currentDayGroup = effectiveDay;
        }
        row.classList.add(isOddGroup ? 'day-group-odd' : 'day-group-even');
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
    const weekdays = ["Chủ nhật", "Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"];
    const todayString = weekdays[new Date().getDay()];
    const rows = document.querySelectorAll('#scheduleTable tbody tr');

    rows.forEach(row => {
        const rowDay = row.getAttribute('data-day');
        if (rowDay && rowDay.startsWith(todayString)) {
            row.classList.add('current-day');
        }
    });
}

function filterTable() {
    const filterText = document.getElementById('searchInput').value;
    const allRows = document.querySelectorAll('#scheduleTable tbody tr');

    allRows.forEach(row => {
        row.querySelectorAll('td').forEach(cell => {
            cell.innerHTML = cell.textContent;
        });
    });

    if (!filterText.trim()) {
        allRows.forEach(row => { row.style.display = ''; });
        return;
    }

    const upperFilterText = filterText.toUpperCase();
    const matchingDays = new Set();
    allRows.forEach(row => {
        if (row.textContent.toUpperCase().includes(upperFilterText)) {
            matchingDays.add(row.getAttribute('data-day'));
        }
    });

    const regex = new RegExp(filterText, 'gi');
    allRows.forEach(row => {
        const rowDay = row.getAttribute('data-day');
        const isVisible = matchingDays.has(rowDay);
        row.style.display = isVisible ? '' : 'none';
        if (isVisible) {
            row.querySelectorAll('td').forEach(cell => {
                cell.innerHTML = cell.innerHTML.replace(regex, (match) => `<mark class="highlight">${match}</mark>`);
            });
        }
    });
}