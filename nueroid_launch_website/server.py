from fastapi import FastAPI, HTTPException, Depends
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse
from pydantic import BaseModel
from sqlalchemy import create_engine, Column, Integer, String, Text, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from fastapi import BackgroundTasks
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# --- Database Setup ---
DATABASE_URL = "sqlite:///./applications.db"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class Application(Base):
    __tablename__ = "applications"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    email = Column(String, unique=True, index=True)
    linkedin = Column(String)
    company = Column(String, nullable=True)
    role = Column(String)
    build_type = Column(String)
    system_description = Column(Text)
    why_matter = Column(Text)
    team_size = Column(String)
    scale = Column(String)
    current_tools = Column(String)
    ai_stack = Column(String)
    contribution = Column(Text)
    feedback_commitment = Column(Boolean)
    time_commitment = Column(Boolean)
    status = Column(String, default="Under Review")
    cohort = Column(String, default="Cohort 01")

class DigitalTwinRequest(Base):
    __tablename__ = "wizard_requests"
    id = Column(Integer, primary_key=True, index=True)
    twin_type = Column(String)
    twin_category = Column(String)
    industry = Column(String)
    visibility = Column(String)
    use_cases = Column(Text) # JSON string
    data_sources = Column(Text) # JSON string
    standards = Column(Text) # JSON string
    compliance_notes = Column(Text, nullable=True)
    twin_name = Column(String)
    twin_description = Column(Text)
    tags = Column(String, nullable=True)
    estimated_size = Column(String, nullable=True)
    team_members = Column(Text, nullable=True)
    roles = Column(String, nullable=True)
    full_name = Column(String)
    email = Column(String)
    company = Column(String)
    contact_number = Column(String)
    country_code = Column(String)
    status = Column(String, default="Pending Review")

Base.metadata.create_all(bind=engine)

# --- Pydantic Models ---
class ApplicationCreate(BaseModel):
    name: str
    email: str
    linkedin: str
    company: str | None = None
    role: str
    build_type: str
    system_description: str
    why_matter: str
    team_size: str
    scale: str
    current_tools: str
    ai_stack: str
    contribution: str
    feedback_commitment: bool
    time_commitment: bool

class ApplicationResponse(BaseModel):
    id: int
    name: str
    email: str
    status: str
    cohort: str

    class Config:
        from_attributes = True

class WizardRequestCreate(BaseModel):
    twin_type: str
    twin_category: str
    industry: str
    visibility: str
    use_cases: list[str]
    data_sources: list[str]
    standards: list[str]
    compliance_notes: str | None = None
    twin_name: str
    twin_description: str
    tags: str | None = None
    estimated_size: str | None = None
    team_members: str | None = None
    roles: str | None = None
    full_name: str
    email: str
    company: str
    contact_number: str
    country_code: str

# --- FastAPI App ---
app = FastAPI()

# Middleware for CORS (if needed, but serving static files from same origin)
from fastapi.middleware.cors import CORSMiddleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def send_notification_email(subject: str, body: str):
    """
    Sends an email notification. 
    Note: Requires SMTP environment variables to be set for production.
    """
    smtp_server = os.getenv("SMTP_SERVER", "smtp.gmail.com")
    smtp_port = int(os.getenv("SMTP_PORT", "587"))
    smtp_user = os.getenv("SMTP_USER")
    smtp_pass = os.getenv("SMTP_PASS")
    recipient = os.getenv("ADMIN_EMAIL", "satishsuryapilli@gmail.com")

    print(f"Attempting to send email to {recipient} via {smtp_server}:{smtp_port}...")

    if not smtp_user or not smtp_pass:
        print(f"ERROR: SMTP credentials (SMTP_USER/SMTP_PASS) not found in environment.")
        return

    msg = MIMEMultipart()
    msg['From'] = smtp_user
    msg['To'] = recipient
    msg['Subject'] = subject
    msg.attach(MIMEText(body, 'plain'))

    try:
        with smtplib.SMTP(smtp_server, smtp_port) as server:
            server.set_debuglevel(1)  # Enable debug output in console
            server.starttls()
            server.login(smtp_user, smtp_pass)
            server.send_message(msg)
            print(f"SUCCESS: Email sent to {recipient}")
    except Exception as e:
        print(f"FAILURE: Failed to send email: {str(e)}")

@app.post("/api/apply", response_model=ApplicationResponse)
def submit_application(app_data: ApplicationCreate, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    # Move email body preparation up
    email_body = f"""
    New Waitlist Application Received:
    Name: {app_data.name}
    Email: {app_data.email}
    Company: {app_data.company}
    Role: {app_data.role}
    System: {app_data.system_description}
    """

    # Check if email exists
    existing_app = db.query(Application).filter(Application.email == app_data.email).first()
    if existing_app:
        print(f"INFO: Application already exists for {app_data.email}. Re-sending notification.")
        background_tasks.add_task(send_notification_email, "Nueroid™ Waitlist App (Retry)", email_body)
        return existing_app 

    db_app = Application(**app_data.dict())
    db.add(db_app)
    db.commit()
    db.refresh(db_app)

    # Send Email in Background
    background_tasks.add_task(send_notification_email, "New Nueroid™ Waitlist App", email_body)

    return db_app

@app.get("/api/status")
def check_status(email: str, db: Session = Depends(get_db)):
    db_app = db.query(Application).filter(Application.email == email).first()
    if not db_app:
        raise HTTPException(status_code=404, detail="Application not found")
    
    return {
        "status": db_app.status,
        "cohort": db_app.cohort,
        "name": db_app.name
    }

@app.post("/api/v2/digital-twin/requests")
def submit_digital_twin_request(request_data: WizardRequestCreate, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    """
    Accept digital twin wizard form submissions, save to DB, and notify via email.
    """
    try:
        # Convert lists to comma-separated strings for SQLite
        db_request = DigitalTwinRequest(
            **request_data.dict(exclude={'use_cases', 'data_sources', 'standards'}),
            use_cases=", ".join(request_data.use_cases),
            data_sources=", ".join(request_data.data_sources),
            standards=", ".join(request_data.standards)
        )
        db.add(db_request)
        db.commit()
        db.refresh(db_request)

        # Send Email in Background
        email_body = f"""
        New Digital Twin Wizard Request:
        Name: {request_data.full_name}
        Email: {request_data.email}
        Company: {request_data.company}
        Twin Name: {request_data.twin_name}
        Type: {request_data.twin_type}
        Industry: {request_data.industry}
        Use Cases: {", ".join(request_data.use_cases)}
        Data Sources: {", ".join(request_data.data_sources)}
        """
        background_tasks.add_task(send_notification_email, f"New Nueroid™ Wizard Request: {request_data.twin_name}", email_body)

        return {
            "status": "success",
            "message": "Digital twin request submitted successfully",
            "request_id": f"DT-{db_request.id}"
        }
    except Exception as e:
        print(f"Error in wizard submission: {e}")
        return JSONResponse(status_code=400, content={"error": str(e)})

# Serve Static Files
# We serve the current directory as static files, but index.html specifically at root
app.mount("/static", StaticFiles(directory="."), name="static")
app.mount("/images", StaticFiles(directory="images"), name="images")

@app.get("/favicon.ico")
def favicon():
    return FileResponse("images/ff.png")

@app.get("/")
def read_root():
    return FileResponse("index.html")

@app.get("/index.html")
def read_index():
    return FileResponse("index.html")

@app.get("/style.css")
def read_style():
    return FileResponse("style.css")

@app.get("/script.js")
def read_script():
    return FileResponse("script.js")
