from fastapi import FastAPI, HTTPException, Depends, Request, Response
from fastapi.responses import HTMLResponse, RedirectResponse
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from sqlalchemy import desc
import secrets
import string
import os
from datetime import datetime, timedelta
import json
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger
import pytz

from database import SessionLocal, engine
from models import Base, ShortURL, Click
from schemas import URLCreate, URLResponse

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Personal URL Shortener")

# Initialize scheduler
scheduler = BackgroundScheduler()
ist_timezone = pytz.timezone('Asia/Kolkata')

def auto_reset_daily_data():
    """Automatically reset today's click data at 12 AM IST"""
    db = SessionLocal()
    try:
        from datetime import date
        today = date.today()
        
        # Delete today's clicks
        deleted_count = db.query(Click).filter(Click.click_date == today).delete()
        db.commit()
        
        print(f"Auto-reset completed: {deleted_count} clicks deleted for {today}")
    except Exception as e:
        print(f"Error during auto-reset: {e}")
        db.rollback()
    finally:
        db.close()

# Schedule the auto-reset for 12:00 AM IST daily
scheduler.add_job(
    auto_reset_daily_data,
    CronTrigger(hour=0, minute=0, timezone=ist_timezone),
    id='daily_reset',
    name='Auto Reset Daily Data',
    replace_existing=True
)

# Start the scheduler
scheduler.start()

# Mount static files
app.mount("/static", StaticFiles(directory="static"), name="static")

# Templates
templates = Jinja2Templates(directory="templates")

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def generate_short_code(length=6):
    """Generate a random short code"""
    characters = string.ascii_letters + string.digits
    return ''.join(secrets.choice(characters) for _ in range(length))

def get_base_url(request: Request):
    """Get the base URL for the application"""
    return f"{request.url.scheme}://{request.url.netloc}"

@app.get("/", response_class=HTMLResponse)
async def index(request: Request):
    """Main page for URL shortening"""
    return templates.TemplateResponse("index.html", {"request": request})

@app.get("/admin", response_class=HTMLResponse)
async def admin_panel(request: Request, db: Session = Depends(get_db)):
    """Admin panel for managing URLs"""
    from datetime import date, timedelta
    
    today = date.today()
    yesterday = today - timedelta(days=1)
    
    # Get all URLs with different click counts
    urls = db.query(ShortURL).all()
    url_stats = []
    
    # Statistics counters
    total_clicks_today = 0
    total_clicks_yesterday = 0
    total_clicks_all_time = 0
    
    for url in urls:
        # Today's clicks
        clicks_today = db.query(Click).filter(
            Click.short_url_id == url.id,
            Click.click_date == today
        ).count()
        
        # Yesterday's clicks
        clicks_yesterday = db.query(Click).filter(
            Click.short_url_id == url.id,
            Click.click_date == yesterday
        ).count()
        
        # All time clicks
        clicks_all_time = db.query(Click).filter(Click.short_url_id == url.id).count()
        
        # Add to totals
        total_clicks_today += clicks_today
        total_clicks_yesterday += clicks_yesterday
        total_clicks_all_time += clicks_all_time
        
        url_stats.append({
            "id": url.id,
            "short_code": url.short_code,
            "original_url": url.original_url,
            "click_count": clicks_today,  # Show today's clicks by default
            "clicks_today": clicks_today,
            "clicks_yesterday": clicks_yesterday,
            "clicks_all_time": clicks_all_time,
            "created_at": url.created_at
        })
    
    # Sort by today's click count
    url_stats.sort(key=lambda x: x["clicks_today"], reverse=True)
    
    # Get top performer for today
    top_performer_today = max(url_stats, key=lambda x: x["clicks_today"])["clicks_today"] if url_stats else 0
    
    # Calculate average for today
    avg_clicks_today = (total_clicks_today / len(urls)) if urls else 0
    
    return templates.TemplateResponse("admin.html", {
        "request": request, 
        "urls": url_stats,
        "total_clicks_today": total_clicks_today,
        "total_clicks_yesterday": total_clicks_yesterday,
        "total_clicks_all_time": total_clicks_all_time,
        "top_performer_today": top_performer_today,
        "avg_clicks_today": avg_clicks_today,
        "today_date": today.strftime('%Y-%m-%d'),
        "yesterday_date": yesterday.strftime('%Y-%m-%d')
    })

@app.post("/api/shorten", response_model=URLResponse)
async def shorten_url(url_data: URLCreate, request: Request, db: Session = Depends(get_db)):
    """API endpoint to shorten a URL"""
    # Generate unique short code
    while True:
        short_code = generate_short_code()
        existing = db.query(ShortURL).filter(ShortURL.short_code == short_code).first()
        if not existing:
            break
    
    # Create new short URL
    short_url = ShortURL(
        short_code=short_code,
        original_url=str(url_data.url)
    )
    db.add(short_url)
    db.commit()
    db.refresh(short_url)
    
    base_url = get_base_url(request)
    return URLResponse(
        short_url=f"{base_url}/{short_code}",
        short_code=short_code
    )

@app.delete("/api/urls/{url_id}")
async def delete_url(url_id: int, db: Session = Depends(get_db)):
    """Delete a short URL"""
    url = db.query(ShortURL).filter(ShortURL.id == url_id).first()
    if not url:
        raise HTTPException(status_code=404, detail="URL not found")
    
    # Delete associated clicks
    db.query(Click).filter(Click.short_url_id == url_id).delete()
    
    # Delete the URL
    db.delete(url)
    db.commit()
    
    return {"message": "URL deleted successfully"}

@app.post("/api/reset-daily-data")
async def reset_daily_data(db: Session = Depends(get_db)):
    """Reset today's click data"""
    from datetime import date
    today = date.today()
    
    # Delete today's clicks
    deleted_count = db.query(Click).filter(Click.click_date == today).delete()
    db.commit()
    
    return {"message": f"Reset {deleted_count} clicks for today"}

@app.get("/api/scheduler-status")
async def get_scheduler_status():
    """Get scheduler status and next run time"""
    jobs = scheduler.get_jobs()
    daily_reset_job = None
    
    for job in jobs:
        if job.id == 'daily_reset':
            daily_reset_job = job
            break
    
    if daily_reset_job:
        next_run = daily_reset_job.next_run_time
        return {
            "scheduler_running": scheduler.running,
            "job_exists": True,
            "next_reset_time": next_run.strftime('%Y-%m-%d %H:%M:%S %Z') if next_run else None,
            "timezone": "Asia/Kolkata (IST)"
        }
    else:
        return {
            "scheduler_running": scheduler.running,
            "job_exists": False,
            "message": "Daily reset job not found"
        }

@app.post("/api/trigger-reset")
async def trigger_manual_reset():
    """Manually trigger the daily reset"""
    try:
        auto_reset_daily_data()
        return {"message": "Manual reset completed successfully"}
    except Exception as e:
        return {"error": f"Manual reset failed: {str(e)}"}

@app.get("/{short_code}")
async def redirect_to_intermediate(short_code: str, request: Request, response: Response, db: Session = Depends(get_db)):
    """Start the intermediate page flow"""
    # Find the short URL
    short_url = db.query(ShortURL).filter(ShortURL.short_code == short_code).first()
    if not short_url:
        raise HTTPException(status_code=404, detail="Short URL not found")
    
    # Create response with template (no click recorded yet)
    response = templates.TemplateResponse("intermediate.html", {
        "request": request,
        "page": 1,
        "total_pages": 4,
        "short_code": short_code
    })
    
    return response

@app.get("/{short_code}/page/{page_num}")
async def intermediate_page(short_code: str, page_num: int, request: Request, db: Session = Depends(get_db)):
    """Handle intermediate pages"""
    if page_num < 1 or page_num > 4:
        raise HTTPException(status_code=404, detail="Invalid page")
    
    # Get the short URL from database
    short_url = db.query(ShortURL).filter(ShortURL.short_code == short_code).first()
    if not short_url:
        raise HTTPException(status_code=404, detail="Short URL not found")
    
    # If this is page 5, redirect to final URL
    if page_num > 4:
        # Record the click
        from datetime import date
        click = Click(
            short_url_id=short_url.id,
            ip_address=request.client.host,
            user_agent=request.headers.get("user-agent", ""),
            click_date=date.today(),
            completed_flow=True
        )
        db.add(click)
        db.commit()
        
        return RedirectResponse(url=short_url.original_url)
    
    return templates.TemplateResponse("intermediate.html", {
        "request": request,
        "page": page_num,
        "total_pages": 4,
        "short_code": short_code
    })

@app.post("/{short_code}/advance")
async def advance_page(short_code: str, request: Request, db: Session = Depends(get_db)):
    """Advance to next page after timer completion"""
    # Get the short URL from database to verify it exists
    short_url = db.query(ShortURL).filter(ShortURL.short_code == short_code).first()
    if not short_url:
        raise HTTPException(status_code=404, detail="Short URL not found")
    
    # Use a simpler session approach - store minimal data in URL/form
    current_page = 1  # Default to page 1
    
    # Try to get page from form data if available
    try:
        form_data = await request.form()
        current_page = int(form_data.get("current_page", 1))
    except:
        pass
    
    next_page = current_page + 1
    
    if next_page > 4:
        # Record the click ONLY when user completes all 4 pages and gets redirected
        from datetime import date
        click = Click(
            short_url_id=short_url.id,
            ip_address=request.client.host,
            user_agent=request.headers.get("user-agent", ""),
            click_date=date.today(),
            completed_flow=True
        )
        db.add(click)
        db.commit()
        
        return {"redirect": short_url.original_url}
    
    # Return JSON response with next page info
    from fastapi.responses import JSONResponse
    response_data = {"next_page": next_page}
    return JSONResponse(content=response_data)

@app.get("/direct/{target_url:path}")
async def direct_link_redirect(target_url: str):
    """Direct link redirect for maximum ad revenue"""
    # Your DirectLink URL from the ad network - this maximizes earnings
    redirect_url = f"https://violationtones.com/wk3jtk9r7?key=f1a89e3aaa7086cc2113978186f98dcd&url={target_url}"
    return RedirectResponse(url=redirect_url)

# Shutdown event to stop scheduler
@app.on_event("shutdown")
def shutdown_event():
    scheduler.shutdown()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5000)
