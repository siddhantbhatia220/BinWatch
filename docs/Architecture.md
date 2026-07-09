# Architecture

This document describes the high-level architecture of BinWatch.

## System Architecture Diagram

```mermaid
graph TD;
    subgraph IoT Hardware
        ESP[ESP8266 / ESP32]
        US[HC-SR04 Ultrasonic]
        GPS[Neo-6M GPS]
        US -->|Distance Data| ESP
        GPS -->|Coordinates| ESP
    end

    subgraph Cloud Backend
        API[Express REST API]
        WS[WebSocket Server]
        DB[(MongoDB Atlas)]
        Auth[JWT Auth Guard]
        Mail[Resend Email Service]
    end

    subgraph Client Application
        Web[BinWatch Dashboard]
        Maps[Google Maps API]
    end

    ESP -->|POST /api/update| API
    API -->|Save Data| DB
    API -->|Trigger Alert| Mail
    API -->|Broadcast| WS
    WS -->|Real-time Data| Web
    Web <-->|Fetch Map| Maps
    Web <-->|Login / Fetch| Auth
```

## Data Flow Workflow

```mermaid
sequenceDiagram
    participant Hardware as ESP8266
    participant Server as Node.js Backend
    participant DB as MongoDB
    participant Resend as Email API
    participant Client as Web Dashboard

    Hardware->>Server: POST /api/update (Dustbin ID, distance, lat, lng)
    Server->>DB: Find Dustbin & Update Status
    DB-->>Server: Return Updated Document
    
    alt Status == "Full"
        Server->>Resend: Trigger Email Alert to Admin
    end

    Server->>Client: Broadcast Updated Document via WebSockets
    Client-->>Client: Re-render UI (Cards & Google Maps Marker)
```

## Design Principles

We built BinWatch adhering to the following design principles:
- ✔ **Scalability**: Capable of handling thousands of dustbins globally.
- ✔ **Maintainability**: Strict separation of concerns (MVC pattern).
- ✔ **Security**: No sensitive data is ever exposed; JWT handles stateless sessions.
- ✔ **Performance**: Minimal payload via WebSocket broadcasts instead of HTTP polling.
- ✔ **Accessibility**: UI follows Web Content Accessibility Guidelines (WCAG) for contrast and readability.
- ✔ **Modularity**: Frontend assets are component-driven and scoped.
- ✔ **Reusability**: Shared utility functions and database middleware for rapid expansion.
