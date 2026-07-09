# API Documentation

The backend exposes a RESTful API powered by Express.js. All endpoints returning data are formatted as JSON.

## Base URL
`/api`

---

## Authentication Endpoints

### 1. Register Admin
**POST** `/auth/register`
- **Description:** Registers a new administrator.
- **Body:**
  ```json
  {
    "username": "admin",
    "email": "admin@binwatch.com",
    "password": "securepassword123"
  }
  ```
- **Response (201 Created):**
  ```json
  { "message": "User registered successfully" }
  ```

### 2. Login
**POST** `/auth/login`
- **Description:** Authenticates user and returns JWT.
- **Body:**
  ```json
  {
    "email": "admin@binwatch.com",
    "password": "securepassword123"
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "token": "eyJhbG...",
    "userId": "60d5ecb..."
  }
  ```

---

## Dustbin Endpoints

> **Note:** Most of these endpoints require an `Authorization` header with a valid Bearer token, except for the Hardware Update endpoint.

### 3. Get All Dustbins
**GET** `/dustbins`
- **Headers:** `Authorization: Bearer <token>`
- **Response (200 OK):**
  ```json
  [
    {
      "_id": "60d5ec...",
      "dustbinId": "DBN-123",
      "name": "Central Park Bin",
      "status": "Half",
      "distance": 45,
      "lat": 40.7128,
      "lng": -74.0060,
      "lastUpdated": "2026-07-09T10:00:00Z"
    }
  ]
  ```

### 4. Create Dustbin
**POST** `/dustbins`
- **Headers:** `Authorization: Bearer <token>`
- **Body:**
  ```json
  {
    "name": "Central Park Bin",
    "dustbinId": "DBN-123"
  }
  ```
- **Response (201 Created):**
  ```json
  { "message": "Dustbin created successfully", "dustbin": { ... } }
  ```

### 5. Hardware Sensor Update
**POST** `/update`
- **Description:** Called by the ESP8266/ESP32. This updates the database, triggers email alerts if full, and broadcasts to WebSockets.
- **Headers:** `None`
- **Body:**
  ```json
  {
    "dustbinId": "DBN-123",
    "distance": 15,
    "lat": 40.7128,
    "lng": -74.0060
  }
  ```
- **Response (200 OK):**
  ```json
  { "message": "Hardware update successful." }
  ```
