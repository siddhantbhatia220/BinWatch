// This file serves as an entry point for platforms like Render and Vercel.
const app = require('./src/app');

if (require.main === module) {
    require('./src/server.js');
}

module.exports = app;
