// This is a Node.js function that runs on Netlify's servers
exports.handler = async function(event, context) {
    // Chỉ chấp nhận yêu cầu POST
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        // Lấy dữ liệu JSON từ request gửi lên
        const scheduleData = JSON.parse(event.body);
        
        // Lấy các biến môi trường đã lưu an toàn trên Netlify
        const GIST_ID = process.env.GITHUB_GIST_ID;
        const GITHUB_TOKEN = process.env.GITHUB_API_TOKEN;

        if (!GIST_ID || !GITHUB_TOKEN) {
            throw new Error("Gist ID hoặc GitHub Token chưa được thiết lập trên Netlify.");
        }

        // Gọi đến API của GitHub từ server của Netlify
        // Dùng dynamic import cho node-fetch
        const fetch = (await import('node-fetch')).default;
        
        const response = await fetch(`https://api.github.com/gists/${GIST_ID}`, {
            method: 'PATCH',
            headers: {
                'Authorization': `token ${GITHUB_TOKEN}`,
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                files: {
                    'schedule.json': {
                        content: JSON.stringify(scheduleData, null, 2)
                    }
                }
            })
        });

        if (!response.ok) {
            throw new Error(`Lỗi từ GitHub: ${response.statusText}`);
        }

        // Trả về thông báo thành công
        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Cập nhật lịch công tác thành công!' })
        };

    } catch (error) {
        // Trả về thông báo lỗi
        console.error('Lỗi trong serverless function:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message })
        };
    }
};