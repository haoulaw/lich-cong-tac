// admin.js (Phiên bản cuối cùng)

async function updateSchedule(newContent) {
  // URL bây giờ là một đường dẫn tương đối đến function của bạn
  const API_URL = '/.netlify/functions/update-schedule';
  const API_KEY = 'Amin@giadinh@2025'; // Phải giống hệt giá trị bạn đã cài đặt trên Netlify

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
      },
      body: JSON.stringify({ content: newContent }),
    });

    const result = await response.json();

    if (!response.ok) {
      alert(`Lỗi: ${result.message}`);
    } else {
      alert('Cập nhật lịch công tác thành công!');
    }
  } catch (error) {
    console.error('Lỗi khi gọi Netlify Function:', error);
    alert('Lỗi nghiêm trọng: Không thể kết nối đến API.');
  }
}

// Gắn sự kiện cho nút "Lưu"
document.getElementById('save-button').addEventListener('click', () => {
  const scheduleContent = document.getElementById('schedule-editor').value;
  updateSchedule(scheduleContent);
});