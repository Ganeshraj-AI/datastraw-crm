from sqlalchemy.orm import Session
from datetime import datetime

from models import Ticket, Note
from schemas import TicketCreate, NoteCreate


def detect_priority(subject: str, description: str) -> str:
    # Combine subject and description and convert to lowercase for easy search
    text = f"{subject} {description}".lower()
    
    high_keywords = [
        "payment", "refund", "charged", "billing", "hacked", 
        "security", "fraud", "urgent", "cannot login", "account locked"
    ]
    
    medium_keywords = [
        "bug", "issue", "error", "problem", "slow", "delay"
    ]
    
    # Check High Priority Keywords
    for kw in high_keywords:
        if kw in text:
            return "High"
            
    # Check Medium Priority Keywords
    for kw in medium_keywords:
        if kw in text:
            return "Medium"
            
    return "Low"


def calculate_ticket_age(created_at: datetime) -> int:
    delta = datetime.utcnow() - created_at
    return max(0, delta.days)


def create_ticket(db: Session, ticket_data: TicketCreate):
    # Auto-detect priority level based on text content keywords
    priority = detect_priority(ticket_data.subject, ticket_data.description)

    ticket = Ticket(
        customer_name=ticket_data.customer_name,
        customer_email=ticket_data.customer_email,
        subject=ticket_data.subject,
        description=ticket_data.description,
        priority=priority
    )

    db.add(ticket)
    db.commit()
    db.refresh(ticket)

    ticket.ticket_id = f"TKT-{ticket.id:03d}"

    db.commit()
    db.refresh(ticket)

    return ticket


def get_all_tickets(db: Session):
    return db.query(Ticket).all()


def get_ticket_by_id(db: Session, ticket_id: str):
    return (
        db.query(Ticket)
        .filter(Ticket.ticket_id == ticket_id)
        .first()
    )


def update_ticket_status(
    db: Session,
    ticket_id: str,
    status: str
):
    ticket = (
        db.query(Ticket)
        .filter(Ticket.ticket_id == ticket_id)
        .first()
    )

    if not ticket:
        return None

    ticket.status = status

    db.commit()
    db.refresh(ticket)

    return ticket


def delete_ticket(
    db: Session,
    ticket_id: str
):
    ticket = (
        db.query(Ticket)
        .filter(Ticket.ticket_id == ticket_id)
        .first()
    )

    if not ticket:
        return False

    db.delete(ticket)
    db.commit()

    return True


def create_note(db: Session, ticket_id: str, note_data: NoteCreate):
    note = Note(
        ticket_id=ticket_id,
        note_text=note_data.note_text
    )
    db.add(note)
    db.commit()
    db.refresh(note)
    return note


def get_notes_by_ticket_id(db: Session, ticket_id: str):
    return (
        db.query(Note)
        .filter(Note.ticket_id == ticket_id)
        .order_by(Note.created_at.desc())
        .all()
    )