# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Changed
- Standardized API service usage across the application by replacing Axios with a custom ApiService
- Updated all components to use the new ApiService:
  - ArticleCard
  - ArticleList
  - Form
  - Home
  - TrendingArticle
  - AdminPortal
- Enhanced error handling and loading states in all components
- Centralized API endpoint configuration in api.js
- Added new API endpoints for trending, top, and top8 articles

### Fixed
- Fixed backend server startup issues with Python 3.13 compatibility
- Resolved CORS configuration to allow frontend requests
- Fixed email validation dependency issues
- Improved error handling in API requests
- Standardized API response handling across all components

### Added
- Created centralized API service (ApiService) for handling all API requests
- Added loading states to improve user experience
- Implemented consistent error handling across all components
- Added new API endpoints configuration for better maintainability

### Security
- Improved token handling in API requests
- Centralized authentication header management
- Standardized error handling for API responses

## [1.0.0] - 2024-03-08

### Added
- Initial release of the Echo News platform
- Basic article management functionality
- User authentication system
- Admin portal for content moderation
- Article submission form
- Trending articles section
- Voting system for articles

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