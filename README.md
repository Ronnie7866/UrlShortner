# Monetized URL Shortener

A high-performance URL shortening service built with FastAPI, designed for maximum ad revenue generation through comprehensive monetization strategies.

## Features

- **Complete Backend API**: `/api/shorten` endpoint for programmatic URL shortening
- **4-Step Intermediate Pages**: 15-second countdown timers on each page
- **Maximum Revenue Ads**: Popups, popunders, banner ads, social bar, and native ads
- **Anti-Skip Protection**: Form-based session handling and user engagement tracking
- **Analytics Dashboard**: Complete click tracking and revenue analytics
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
2. Goes through 4 intermediate pages with ads and 15-second timers
3. Sees multiple ad types for maximum revenue
4. Gets redirected to original URL after completing all steps

## Monetization Integration

The system includes comprehensive ad integration:

- **Banner Ads (728x90)**: Top of every page
- **Native Banner Ads**: Integrated content ads
- **Popunder Ads**: Background revenue generation
- **Social Bar Ads**: Persistent sidebar ads
- **Multiple 300x250 Banners**: Maximum coverage on intermediate pages

## File Structure

```
├── main.py              # FastAPI application and routes
├── models.py            # Database models (ShortURL, Click)
├── schemas.py           # Pydantic schemas for API
├── database.py          # Database configuration
├── templates/           # HTML templates
│   ├── base.html        # Base template with ads
│   ├── index.html       # Homepage
│   ├── intermediate.html # 4-step intermediate pages
│   └── admin.html       # Analytics dashboard
├── static/
│   ├── css/style.css    # Styling
│   └── js/
│       ├── main.js      # Homepage functionality
│       ├── intermediate.js # Timer and page logic
│       └── popup-triggers.js # Ad trigger scripts
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

The system is optimized for maximum ad revenue:
- Multiple ad placements per page
- Strategic timing of popup/popunder ads
- User engagement tracking
- Completion rate analytics for optimization

## License

This project is for personal use. Modify ad scripts with your own ad network credentials for revenue generation.