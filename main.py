from fastapi import FastAPI, Depends, HTTPException, Request, Form
from fastapi.responses import RedirectResponse
from fastapi.templating import Jinja2Templates
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from database import engine, get_db
from models import Base
from schemas import TicketCreate, NoteCreate, NoteResponse
import crud

app = FastAPI()

@app.middleware("http")
async def log_request(request, call_next):
    print("ORIGIN:", request.headers.get("origin"))
    print("METHOD:", request.method)
    print("ACCESS_CONTROL_REQUEST_METHOD:", request.headers.get("access-control-request-method"))
    print("ACCESS_CONTROL_REQUEST_HEADERS:", request.headers.get("access-control-request-headers"))
    response = await call_next(request)
    return response

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

templates = Jinja2Templates(directory="templates")

Base.metadata.create_all(bind=engine)

@app.get("/")
def home(request: Request):
    return templates.TemplateResponse(
        request=request,
        name="index.html"
    )

@app.post("/create-ticket")
def create_ticket_ui(
    customer_name: str = Form(...),
    customer_email: str = Form(...),
    subject: str = Form(...),
    description: str = Form(...),
    db: Session = Depends(get_db)
):
    ticket_data = TicketCreate(
        customer_name=customer_name,
        customer_email=customer_email,
        subject=subject,
        description=description
    )

    crud.create_ticket(
        db,
        ticket_data
    )

    return RedirectResponse(
        url="/tickets",
        status_code=303
    )

@app.get("/tickets")
def view_tickets(
    request: Request,
    db: Session = Depends(get_db)
):
    tickets = crud.get_all_tickets(db)

    return templates.TemplateResponse(
        request=request,
        name="tickets.html",
        context={
            "tickets": tickets
        }
    )

@app.post("/api/tickets")
def create_ticket(
    ticket_data: TicketCreate,
    db: Session = Depends(get_db)
):
    ticket = crud.create_ticket(
        db,
        ticket_data
    )

    return {
        "message": "Ticket created",
        "ticket_id": ticket.ticket_id
    }

@app.get("/api/tickets")
def get_tickets(
    db: Session = Depends(get_db)
):
    return crud.get_all_tickets(db)

@app.get("/api/tickets/{ticket_id}")
def get_ticket(
    ticket_id: str,
    db: Session = Depends(get_db)
):
    ticket = crud.get_ticket_by_id(
        db,
        ticket_id
    )

    if not ticket:
        raise HTTPException(
            status_code=404,
            detail="Ticket not found"
        )

    return ticket

@app.put("/api/tickets/{ticket_id}")
def update_ticket(
    ticket_id: str,
    status: str,
    db: Session = Depends(get_db)
):
    ticket = crud.update_ticket_status(
        db,
        ticket_id,
        status
    )

    if not ticket:
        raise HTTPException(
            status_code=404,
            detail="Ticket not found"
        )

    return {
        "message": "Ticket updated",
        "ticket_id": ticket.ticket_id,
        "status": ticket.status
    }

@app.delete("/api/tickets/{ticket_id}")
def delete_ticket(
    ticket_id: str,
    db: Session = Depends(get_db)
):
    deleted = crud.delete_ticket(
        db,
        ticket_id
    )

    if not deleted:
        raise HTTPException(
            status_code=404,
            detail="Ticket not found"
        )

    return {
        "message": "Ticket deleted"
    }

@app.post("/api/tickets/{ticket_id}/notes")
def add_ticket_note(
    ticket_id: str,
    note_data: NoteCreate,
    db: Session = Depends(get_db)
):
    ticket = crud.get_ticket_by_id(db, ticket_id)
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    
    crud.create_note(db, ticket_id, note_data)
    return {"success": True}

@app.get("/api/tickets/{ticket_id}/notes", response_model=list[NoteResponse])
def get_ticket_notes(
    ticket_id: str,
    db: Session = Depends(get_db)
):
    ticket = crud.get_ticket_by_id(db, ticket_id)
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    
    return crud.get_notes_by_ticket_id(db, ticket_id)


@app.get("/debug/cors")
def debug_cors():
    allow_origins = []
    allow_origin_regex = None
    for m in app.user_middleware:
        if getattr(m, "cls", None).__name__ == "CORSMiddleware":
            allow_origins = m.options.get("allow_origins", [])
            allow_origin_regex = m.options.get("allow_origin_regex")
            break
    return {
        "allow_origins": allow_origins,
        "allow_origin_regex": allow_origin_regex
    }


@app.get("/debug/version")
def debug_version():
    return {
        "commit": "FORCE_DEPLOY_TEST",
        "timestamp": "2026-06-02T19:37:04+05:30"
    }


@app.get("/debug/routes")
def debug_routes():
    return [route.path for route in app.routes]




