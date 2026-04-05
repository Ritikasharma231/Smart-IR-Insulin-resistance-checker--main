const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3001;
const TEST_FILE = path.join(__dirname, 'test-cors.html');

const server = http.createServer((req, res) => {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }
    
    // Serve the test file
    if (req.url === '/' || req.url === '/index.html') {
        fs.readFile(TEST_FILE, (err, data) => {
            if (err) {
                res.writeHead(500);
                res.end('Error loading test file');
                return;
            }
            
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(data);
        });
    } else {
        res.writeHead(404);
        res.end('Not found');
    }
});

server.listen(PORT, () => {
    console.log(`🧪 Integration Test Server running on http://localhost:${PORT}`);
    console.log(`📝 Open http://localhost:${PORT} in your browser`);
    console.log(`🔗 This will test the frontend-backend integration properly`);
});

// Handle server shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down test server...');
    server.close(() => {
        console.log('✅ Test server stopped');
        process.exit(0);
    });
});
