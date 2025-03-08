# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Created new admin portal page at `/admin-portal` with basic structure and styling
- Added API configuration file at `frontend/echo/src/config/api.js` to centralize API endpoint management
- Added CORS configuration in backend to explicitly allow frontend origins

### Changed
- Updated backend API URL from port 5000 to 8000 in frontend configuration
- Modified admin portal to use centralized API endpoints
- Updated CORS settings in `backend/app/core/config.py` to explicitly allow frontend origins

### Fixed
- Fixed 404 error for admin portal page by creating the missing page component
- Added proper error handling and loading states in admin portal
- Added authentication header support in admin portal API calls

### Dependencies
- Updated FastAPI and related packages to be compatible with Python 3.13
- Added pydantic-settings package requirement for BaseSettings functionality

### Known Issues
- Backend server startup issue with BaseSettings import from pydantic (needs pydantic-settings package)
- Network errors when making API calls need to be resolved by fixing backend server startup 