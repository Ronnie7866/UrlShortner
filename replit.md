# Personal URL Shortener

## Overview

This is a personal URL shortening service built with FastAPI, designed to provide a simple yet comprehensive solution for creating and managing shortened URLs. The application features a clean web interface, detailed analytics, and an anti-skip intermediate page system to ensure user engagement.

## System Architecture

### Backend Architecture
- **Framework**: FastAPI (Python 3.11+) for high-performance API development
- **Database**: SQLAlchemy ORM with flexible database support (SQLite for development, PostgreSQL for production)
- **Template Engine**: Jinja2 for server-side rendering
- **Static Files**: FastAPI's StaticFiles for serving CSS, JS, and other assets

### Frontend Architecture
- **UI Framework**: Bootstrap 5.3.0 for responsive design
- **Icons**: Font Awesome 6.4.0 for consistent iconography
- **JavaScript**: Vanilla JavaScript with modern async/await patterns
- **Styling**: Custom CSS with CSS variables for theming

### Database Design
The application uses a simple two-table schema:
- **ShortURL**: Stores the mapping between short codes and original URLs
- **Click**: Tracks individual clicks with IP addresses, user agents, and completion status

## Key Components

### URL Shortening Engine
- Generates cryptographically secure random short codes using Python's `secrets` module
- 6-character codes using alphanumeric characters (case-sensitive)
- Collision detection and retry mechanism

### Analytics System
- Click tracking with IP address and user agent logging
- Completion flow tracking to measure user engagement
- Admin dashboard with comprehensive statistics and visualizations

### Anti-Skip Protection
- Multi-page intermediate system to prevent direct access to destination URLs
- JavaScript-based timer system with visibility change detection
- Context menu and developer tools blocking
- Text selection and keyboard shortcut prevention

### Web Interface
- Clean, modern design with responsive layout
- Real-time URL shortening with AJAX
- Copy-to-clipboard functionality
- Admin panel for URL management and analytics

## Data Flow

1. **URL Shortening**: User submits URL → Validation → Short code generation → Database storage → Return shortened URL
2. **URL Redirection**: User clicks short URL → Database lookup → Multi-page intermediate flow → Final redirect to destination
3. **Analytics**: Each interaction is logged with timestamp, IP address, and user agent information
4. **Admin Dashboard**: Real-time statistics aggregation from click data

## External Dependencies

### Python Packages
- **fastapi**: Web framework and API development
- **uvicorn**: ASGI server for production deployment
- **sqlalchemy**: Database ORM and connection management
- **psycopg2-binary**: PostgreSQL adapter for production databases
- **pydantic**: Data validation and serialization
- **jinja2**: Template rendering engine
- **python-multipart**: Form data handling

### Frontend Libraries
- **Bootstrap 5.3.0**: UI framework (CDN)
- **Font Awesome 6.4.0**: Icon library (CDN)

### Database Support
- **Development**: SQLite with file-based storage
- **Production**: PostgreSQL with connection pooling
- **Flexible**: Environment variable-based configuration

## Deployment Strategy

### Development Environment
- Uses Replit's Python 3.11 module system
- SQLite database for simple setup
- Auto-installation of dependencies via pip
- Development server runs on port 5000

### Production Considerations
- Environment variable `DATABASE_URL` for PostgreSQL connection
- Automatic URL format conversion for compatibility
- Connection pooling and proper session management
- Static file serving with appropriate caching headers

### Security Features
- CSRF protection through proper form handling
- SQL injection prevention via SQLAlchemy ORM
- Secure random code generation
- IP address logging for abuse prevention

## Recent Changes
- June 25, 2025: Fixed database integration by switching from PostgreSQL to SQLite
- June 25, 2025: Cleaned up codebase by removing all advertising integrations
- June 25, 2025: Fixed session handling by replacing cookies with form-based approach
- June 25, 2025: Optimized for clean, fast user experience
- June 25, 2025: Confirmed backend API functionality - `/api/shorten` endpoint works perfectly

## Clean Implementation
The application provides a clean, ad-free URL shortening experience:
- **Fast Performance**: No external ad scripts slowing down the site
- **Clean Interface**: Focused on core functionality without distractions
- **Privacy Focused**: No tracking scripts or third-party ad networks
- **User Experience**: Smooth navigation through intermediate pages

## User Preferences
- Database: SQLite (preferred over PostgreSQL for simplicity)
- Focus: Clean, fast, and user-friendly URL shortening experience
- Communication style: Simple, everyday language