// functions/schedule.js

// Cơ sở dữ liệu tạm thời trong bộ nhớ
let tasks = [
  { id: '1', date: '2025-07-18', task: 'Họp team dự án' },
  { id: '2', date: '2025-07-19', task: 'Hoàn thành báo cáo tháng' }
];
let nextId = 3;

// Headers để xử lý lỗi CORS
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
};

export default async (request, context) => {
  // Xử lý yêu cầu preflight của trình duyệt cho CORS
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: CORS_HEADERS
    });
  }

  try {
    switch (request.method) {
      case 'GET': {
        return new Response(JSON.stringify({ data: tasks }), {
          status: 200,
          headers: { 'Content-Type': 'application/json',...CORS_HEADERS }
        });
      }

      case 'POST': {
        const { date, task } = await request.json();
        const newTask = { id: String(nextId++), date, task };
        tasks.push(newTask);
        return new Response(JSON.stringify({ message: 'Created', data: newTask }), {
          status: 201,
          headers: { 'Content-Type': 'application/json',...CORS_HEADERS }
        });
      }

      case 'PUT': {
        const { id, task } = await request.json();
        const taskIndex = tasks.findIndex(t => t.id === id);
        if (taskIndex === -1) {
          return new Response(JSON.stringify({ message: 'Not Found' }), { status: 404, headers: { 'Content-Type': 'application/json',...CORS_HEADERS } });
        }
        tasks[taskIndex].task = task;
        return new Response(JSON.stringify({ message: 'Updated', data: tasks[taskIndex] }), {
          status: 200,
          headers: { 'Content-Type': 'application/json',...CORS_HEADERS }
        });
      }

      case 'DELETE': {
        const { id } = await request.json();
        tasks = tasks.filter(t => t.id!== id);
        return new Response(JSON.stringify({ message: 'Deleted', id }), {
          status: 200,
          headers: { 'Content-Type': 'application/json',...CORS_HEADERS }
        });
      }

      default:
        return new Response("Method Not Allowed", { status: 405, headers: CORS_HEADERS });
    }
  } catch (error) {
    return new Response(JSON.stringify({ message: 'Internal Server Error', error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json',...CORS_HEADERS }
    });
  }
};