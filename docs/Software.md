# Software Documentation

The BinWatch backend is a robust monolithic Node.js application built on the MVC design pattern.

## Technology Stack
- **Node.js**: The runtime environment.
- **Express.js**: The web framework for handling REST APIs.
- **MongoDB Atlas**: Cloud-hosted NoSQL database.
- **Mongoose**: The Object Data Modeling (ODM) library for MongoDB.
- **ws**: A fast, thoroughly tested WebSocket client and server implementation.
- **jsonwebtoken**: For securely transmitting information as a JSON object (stateless authentication).
- **bcrypt**: A password-hashing function.
- **Resend**: A developer-first email API.

## Project Workflow
1. **Boot**: `server.js` connects to MongoDB and starts the HTTP server.
2. **WebSocket Server**: `server.js` binds a `ws` instance to the HTTP server.
3. **Static File Serving**: Express serves the `/public` folder containing our Vanilla JS, HTML, and modular CSS frontend.
4. **Routing**: `/api/auth` handles user authentication, while `/api/dustbins` handles bin data and IoT webhook ingestion.
5. **Controllers**: Business logic (hashing passwords, triggering emails via Resend) resides completely in the controller layer to keep routes lean.

## Frontend Interaction
The frontend is a lightweight Single Page Application (SPA). It uses vanilla `fetch()` for HTTP requests and standard `WebSocket` for real-time connection. Google Maps is injected dynamically using an API key stored in the environment and sent to the client upon initialization.
