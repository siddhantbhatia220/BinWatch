# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-07-09

### Added
- **BinWatch Rebrand**: Completely rebranded the project to BinWatch.
- **Full Black Professional Theme**: Overhauled the entire UI with a modern, high-contrast black aesthetic, incorporating glassmorphism and the Inter font.
- **MVC Architecture**: Migrated the legacy monolithic backend into a scalable Model-View-Controller (MVC) architecture.
- **Environment Configuration**: Added `dotenv` integration, a `.env.example` template, and strict environment variable validation.
- **Google Maps Integration**: Added dynamic Google Maps rendering on the details page.
- **Resend Integration**: Automated email notifications for when dustbins reach maximum capacity.
- **Security Standards**: Added robust JWT authentication guards, bcrypt password hashing, and structured error handling.
- **Open Source Files**: Added `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, `SECURITY.md`, and a comprehensive `README.md` with Mermaid diagrams.

### Changed
- Refactored `server.js` to cleanly separate WebSocket logic, Express routing, and Database connections.
- Consolidated disparate CSS files into modular, domain-specific stylesheets (`iot.css`, `auth.css`, `details.css`).
- Enhanced WebSocket performance to only broadcast relevant state changes rather than polling the database.

### Removed
- Deprecated legacy HTML and inline CSS files from the root directory.
- Removed hardcoded MongoDB URIs and secret keys from the source code.
