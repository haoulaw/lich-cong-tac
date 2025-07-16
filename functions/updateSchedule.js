exports.handler = async function(event) {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        const scheduleData = JSON.parse(event.body);
        const GIST_ID = process.env.GITHUB_GIST_ID;
        const GITHUB_TOKEN = process.env.GITHUB_API_TOKEN;

        if (!GIST_ID || !GITHUB_TOKEN) {
            return { statusCode: 500, body: JSON.stringify({ error: "Gist ID hoặc GitHub Token chưa được cấu hình trên Netlify." }) };
        }

        const fetch = (await import('node-fetch')).default;
        
        const response = await fetch(`https://api.github.com/gists/${GIST_ID}`, {
            method: 'PATCH',
            headers: {
                'Authorization': `token ${GITHUB_TOKEN}`,
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                files: { 'schedule.json': { content: JSON.stringify(scheduleData, null, 2) } }
            })
        });

        if (!response.ok) {
            const errorBody = await response.text();
            throw new Error(`Lỗi từ GitHub (${response.status}): ${errorBody}`);
        }

        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Cập nhật lịch công tác thành công!' })
        };

    } catch (error) {
        console.error('Lỗi trong serverless function:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message })
        };
    }
};