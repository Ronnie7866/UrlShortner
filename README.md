# URL Shortener

A high-performance URL shortening service built with FastAPI, providing a clean and fast user experience.

## Features

- **Complete Backend API**: `/api/shorten` endpoint for programmatic URL shortening
- **4-Step Intermediate Pages**: 15-second countdown timers on each page
- **Clean Interface**: Fast, ad-free user experience
- **Anti-Skip Protection**: Form-based session handling and user engagement tracking
- **Analytics Dashboard**: Complete click tracking and analytics
- **SQLite Database**: Simple, reliable data storage with automatic setup

## Quick Start

### Requirements
- Python 3.11+
- FastAPI, uvicorn, SQLAlchemy, and other dependencies (auto-installed)

### Installation

1. Clone this repository
2. Install dependencies:
```bash
pip install fastapi uvicorn sqlalchemy psycopg2-binary pydantic jinja2 python-multipart
```

3. Run the server:
```bash
python main.py
```

The server will start on `http://localhost:5000`

## API Usage

### Shorten a URL
```bash
curl -X POST http://localhost:5000/api/shorten \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com"}'
```

**Response:**
```json
{
  "short_url": "http://localhost:5000/ABC123",
  "short_code": "ABC123"
}
```

### User Flow
1. User clicks shortened URL
2. Goes through 4 intermediate pages with 15-second timers
3. Clean verification process without distractions
4. Gets redirected to original URL after completing all steps

## Clean Implementation

The system provides a streamlined experience:

- **Fast Loading**: No external ad scripts slowing down the site
- **Clean Interface**: Focused on core functionality
- **Privacy Focused**: No tracking scripts or third-party networks
- **User Experience**: Smooth navigation through verification pages

## File Structure

```
├── main.py              # FastAPI application and routes
├── models.py            # Database models (ShortURL, Click)
├── schemas.py           # Pydantic schemas for API
├── database.py          # Database configuration
├── templates/           # HTML templates
│   ├── base.html        # Base template
│   ├── index.html       # Homepage
│   ├── intermediate.html # 4-step intermediate pages
│   └── admin.html       # Analytics dashboard
├── static/
│   ├── css/style.css    # Styling
│   └── js/
│       ├── main.js      # Homepage functionality
│       └── intermediate.js # Timer and page logic
└── pyproject.toml       # Project dependencies
```

## Database Schema

- **ShortURL**: Maps short codes to original URLs
- **Click**: Tracks user interactions and completion rates

## Security Features

- Secure random code generation
- SQL injection prevention via ORM
- IP address logging for abuse prevention
- Anti-skip protection with form-based session handling

## Deployment

The application is designed to work on any Python hosting platform:
- Replit (ready to deploy)
- Heroku, Railway, or similar platforms
- VPS with Python 3.11+

For production, set `DATABASE_URL` environment variable for PostgreSQL support.

## Revenue Optimization

The system is optimized for performance and user experience:
- Clean, fast-loading pages
- Efficient database operations
- User engagement tracking
- Completion rate analytics for optimization

## License

This project is for personal use. Clean and ready for customization.