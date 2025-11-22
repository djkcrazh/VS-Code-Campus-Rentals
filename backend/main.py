from fastapi import FastAPI, Depends, HTTPException, status, UploadFile, File, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timedelta
from pydantic import BaseModel, EmailStr
import json
import qrcode
import io
import base64
from math import radians, cos, sin, asin, sqrt

from database import (
    get_db, init_db, User, Category, Item, Rental, Review,
    Transaction, Message, AvailabilityBlock
)
from auth import (
    verify_password, get_password_hash, create_access_token,
    decode_access_token, verify_edu_email, UserCreate, UserLogin
)

app = FastAPI(title="Campus Rentals API")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

security = HTTPBearer()


# Pydantic models
class UserResponse(BaseModel):
    id: int
    email: str
    full_name: str
    phone: Optional[str]
    verified: bool
    rating: float
    total_ratings: int
    bio: Optional[str]
    address: Optional[str]
    profile_image: Optional[str]

    class Config:
        from_attributes = True


class ItemCreate(BaseModel):
    title: str
    description: str
    daily_rate: float
    weekly_rate: Optional[float] = None
    deposit: float
    category_ids: List[int]
    condition: str
    location_name: str
    latitude: float
    longitude: float
    images: Optional[List[str]] = None


class ItemResponse(BaseModel):
    id: int
    owner_id: int
    title: str
    description: str
    daily_rate: float
    weekly_rate: Optional[float]
    deposit: float
    condition: str
    available: bool
    location_name: str
    latitude: float
    longitude: float
    insurance_value: float
    created_at: datetime
    images: Optional[List[str]] = None
    categories: List[dict]
    owner: UserResponse

    class Config:
        from_attributes = True


class RentalCreate(BaseModel):
    item_id: int
    start_date: datetime
    end_date: datetime
    message: Optional[str] = None


class RentalResponse(BaseModel):
    id: int
    item_id: int
    renter_id: int
    owner_id: int
    start_date: datetime
    end_date: datetime
    total_cost: float
    deposit_amount: float
    platform_fee: float
    owner_earnings: float
    status: str
    pickup_qr: Optional[str]
    return_qr: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


class MessageCreate(BaseModel):
    rental_id: int
    content: str


class MessageResponse(BaseModel):
    id: int
    rental_id: int
    sender_id: int
    receiver_id: int
    content: str
    created_at: datetime
    read: bool
    sender: UserResponse

    class Config:
        from_attributes = True


class ReviewCreate(BaseModel):
    rental_id: int
    reviewee_id: int
    rating: int
    comment: Optional[str] = None


# Helper functions
def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    token = credentials.credentials
    email = decode_access_token(token)
    if not email:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials"
        )
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


def calculate_distance(lat1, lon1, lat2, lon2):
    """Calculate distance between two points in miles using Haversine formula"""
    lon1, lat1, lon2, lat2 = map(radians, [lon1, lat1, lon2, lat2])
    dlon = lon2 - lon1
    dlat = lat2 - lat1
    a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
    c = 2 * asin(sqrt(a))
    miles = 3956 * c
    return miles


def generate_qr_code(data: str) -> str:
    """Generate QR code and return as base64 string"""
    qr = qrcode.QRCode(version=1, box_size=10, border=5)
    qr.add_data(data)
    qr.make(fit=True)
    img = qr.make_image(fill_color="black", back_color="white")

    buffered = io.BytesIO()
    img.save(buffered, format="PNG")
    img_str = base64.b64encode(buffered.getvalue()).decode()
    return f"data:image/png;base64,{img_str}"


# Routes
@app.on_event("startup")
async def startup_event():
    init_db()


@app.post("/api/auth/register")
async def register(user_data: UserCreate, db: Session = Depends(get_db)):
    # Verify .edu email
    if not verify_edu_email(user_data.email):
        raise HTTPException(
            status_code=400,
            detail="Must use a .edu email address"
        )

    # Check if user exists
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    # Create user
    user = User(
        email=user_data.email,
        hashed_password=get_password_hash(user_data.password),
        full_name=user_data.full_name,
        phone=user_data.phone,
        verified=True,  # Auto-verify for demo
        rating=5.0,
        total_ratings=0
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # Create access token
    access_token = create_access_token(data={"sub": user.email})

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": UserResponse.from_orm(user)
    }


@app.post("/api/auth/login")
async def login(credentials: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == credentials.email).first()
    if not user or not verify_password(credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )

    access_token = create_access_token(data={"sub": user.email})

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": UserResponse.from_orm(user)
    }


@app.get("/api/auth/me", response_model=UserResponse)
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    return current_user


@app.get("/api/categories")
async def get_categories(db: Session = Depends(get_db)):
    categories = db.query(Category).all()
    return [{"id": c.id, "name": c.name, "icon": c.icon} for c in categories]


@app.post("/api/items")
async def create_item(
    item_data: ItemCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    item = Item(
        owner_id=current_user.id,
        title=item_data.title,
        description=item_data.description,
        daily_rate=item_data.daily_rate,
        weekly_rate=item_data.weekly_rate,
        deposit=item_data.deposit,
        condition=item_data.condition,
        location_name=item_data.location_name,
        latitude=item_data.latitude,
        longitude=item_data.longitude,
        available=True,
        images=json.dumps(item_data.images) if item_data.images else None
    )

    # Add categories
    for cat_id in item_data.category_ids:
        category = db.query(Category).filter(Category.id == cat_id).first()
        if category:
            item.categories.append(category)

    db.add(item)
    db.commit()
    db.refresh(item)

    return {"id": item.id, "message": "Item created successfully"}


@app.get("/api/items")
async def get_items(
    category_id: Optional[int] = None,
    search: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    latitude: Optional[float] = None,
    longitude: Optional[float] = None,
    max_distance: Optional[float] = 10.0,
    db: Session = Depends(get_db)
):
    query = db.query(Item).filter(Item.available == True)

    if category_id:
        query = query.join(Item.categories).filter(Category.id == category_id)

    if search:
        query = query.filter(
            (Item.title.ilike(f"%{search}%")) |
            (Item.description.ilike(f"%{search}%"))
        )

    if min_price:
        query = query.filter(Item.daily_rate >= min_price)

    if max_price:
        query = query.filter(Item.daily_rate <= max_price)

    items = query.all()

    # Filter by distance if location provided
    if latitude and longitude:
        items = [
            item for item in items
            if item.latitude and item.longitude and
            calculate_distance(latitude, longitude, item.latitude, item.longitude) <= max_distance
        ]

    # Format response
    result = []
    for item in items:
        item_dict = {
            "id": item.id,
            "owner_id": item.owner_id,
            "title": item.title,
            "description": item.description,
            "daily_rate": item.daily_rate,
            "weekly_rate": item.weekly_rate,
            "deposit": item.deposit,
            "condition": item.condition,
            "available": item.available,
            "location_name": item.location_name,
            "latitude": item.latitude,
            "longitude": item.longitude,
            "insurance_value": item.insurance_value,
            "created_at": item.created_at,
            "images": json.loads(item.images) if item.images else [],
            "categories": [{"id": c.id, "name": c.name, "icon": c.icon} for c in item.categories],
            "owner": {
                "id": item.owner.id,
                "full_name": item.owner.full_name,
                "rating": item.owner.rating,
                "total_ratings": item.owner.total_ratings,
                "verified": item.owner.verified,
            }
        }

        if latitude and longitude and item.latitude and item.longitude:
            item_dict["distance"] = round(
                calculate_distance(latitude, longitude, item.latitude, item.longitude), 1
            )

        result.append(item_dict)

    return result


@app.get("/api/items/{item_id}")
async def get_item(item_id: int, db: Session = Depends(get_db)):
    item = db.query(Item).filter(Item.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")

    return {
        "id": item.id,
        "owner_id": item.owner_id,
        "title": item.title,
        "description": item.description,
        "daily_rate": item.daily_rate,
        "weekly_rate": item.weekly_rate,
        "deposit": item.deposit,
        "condition": item.condition,
        "available": item.available,
        "location_name": item.location_name,
        "latitude": item.latitude,
        "longitude": item.longitude,
        "insurance_value": item.insurance_value,
        "created_at": item.created_at,
        "images": json.loads(item.images) if item.images else [],
        "categories": [{"id": c.id, "name": c.name, "icon": c.icon} for c in item.categories],
        "owner": UserResponse.from_orm(item.owner)
    }


@app.post("/api/rentals")
async def create_rental(
    rental_data: RentalCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    item = db.query(Item).filter(Item.id == rental_data.item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")

    if item.owner_id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot rent your own item")

    # Calculate costs
    days = (rental_data.end_date - rental_data.start_date).days
    if days < 1:
        raise HTTPException(status_code=400, detail="Rental must be at least 1 day")

    total_cost = item.daily_rate * days
    platform_fee = total_cost * 0.15
    owner_earnings = total_cost - platform_fee

    # Generate QR codes
    pickup_qr_data = f"PICKUP-{item.id}-{current_user.id}-{int(datetime.utcnow().timestamp())}"
    return_qr_data = f"RETURN-{item.id}-{current_user.id}-{int(datetime.utcnow().timestamp())}"

    rental = Rental(
        item_id=item.id,
        renter_id=current_user.id,
        owner_id=item.owner_id,
        start_date=rental_data.start_date,
        end_date=rental_data.end_date,
        total_cost=total_cost,
        deposit_amount=item.deposit,
        platform_fee=platform_fee,
        owner_earnings=owner_earnings,
        status="pending",
        pickup_qr=pickup_qr_data,
        return_qr=return_qr_data
    )

    db.add(rental)
    db.commit()
    db.refresh(rental)

    # Add initial message if provided
    if rental_data.message:
        message = Message(
            rental_id=rental.id,
            sender_id=current_user.id,
            receiver_id=item.owner_id,
            content=rental_data.message
        )
        db.add(message)
        db.commit()

    return {"id": rental.id, "message": "Rental request created successfully"}


@app.get("/api/rentals/my-rentals")
async def get_my_rentals(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Get rentals where user is renter
    as_renter = db.query(Rental).filter(Rental.renter_id == current_user.id).all()

    # Get rentals where user is owner
    as_owner = db.query(Rental).filter(Rental.owner_id == current_user.id).all()

    def format_rental(rental):
        return {
            "id": rental.id,
            "item": {
                "id": rental.item.id,
                "title": rental.item.title,
                "images": json.loads(rental.item.images) if rental.item.images else []
            },
            "renter": UserResponse.from_orm(rental.renter),
            "owner": UserResponse.from_orm(rental.owner),
            "start_date": rental.start_date,
            "end_date": rental.end_date,
            "total_cost": rental.total_cost,
            "deposit_amount": rental.deposit_amount,
            "platform_fee": rental.platform_fee,
            "owner_earnings": rental.owner_earnings,
            "status": rental.status,
            "pickup_qr": generate_qr_code(rental.pickup_qr) if rental.pickup_qr else None,
            "return_qr": generate_qr_code(rental.return_qr) if rental.return_qr else None,
            "created_at": rental.created_at
        }

    return {
        "as_renter": [format_rental(r) for r in as_renter],
        "as_owner": [format_rental(r) for r in as_owner]
    }


@app.patch("/api/rentals/{rental_id}/approve")
async def approve_rental(
    rental_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    rental = db.query(Rental).filter(Rental.id == rental_id).first()
    if not rental:
        raise HTTPException(status_code=404, detail="Rental not found")

    if rental.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    rental.status = "approved"
    rental.approved_at = datetime.utcnow()
    db.commit()

    return {"message": "Rental approved successfully"}


@app.patch("/api/rentals/{rental_id}/verify-pickup")
async def verify_pickup(
    rental_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    rental = db.query(Rental).filter(Rental.id == rental_id).first()
    if not rental:
        raise HTTPException(status_code=404, detail="Rental not found")

    rental.pickup_verified_at = datetime.utcnow()
    rental.status = "active"
    db.commit()

    return {"message": "Pickup verified successfully"}


@app.patch("/api/rentals/{rental_id}/verify-return")
async def verify_return(
    rental_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    rental = db.query(Rental).filter(Rental.id == rental_id).first()
    if not rental:
        raise HTTPException(status_code=404, detail="Rental not found")

    rental.return_verified_at = datetime.utcnow()
    rental.status = "completed"
    db.commit()

    # Create transaction for owner
    transaction = Transaction(
        user_id=rental.owner_id,
        rental_id=rental.id,
        amount=rental.owner_earnings,
        type="earning",
        status="completed",
        description=f"Earned from renting '{rental.item.title}'"
    )
    db.add(transaction)
    db.commit()

    return {"message": "Return verified successfully"}


@app.get("/api/messages")
async def get_messages(
    rental_id: Optional[int] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Message).filter(
        (Message.sender_id == current_user.id) |
        (Message.receiver_id == current_user.id)
    )

    if rental_id:
        query = query.filter(Message.rental_id == rental_id)

    messages = query.order_by(Message.created_at.desc()).all()

    return [
        {
            "id": m.id,
            "rental_id": m.rental_id,
            "sender_id": m.sender_id,
            "receiver_id": m.receiver_id,
            "content": m.content,
            "created_at": m.created_at,
            "read": m.read,
            "sender": UserResponse.from_orm(m.sender)
        }
        for m in messages
    ]


@app.post("/api/messages")
async def send_message(
    message_data: MessageCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    rental = db.query(Rental).filter(Rental.id == message_data.rental_id).first()
    if not rental:
        raise HTTPException(status_code=404, detail="Rental not found")

    # Determine receiver
    receiver_id = rental.owner_id if current_user.id == rental.renter_id else rental.renter_id

    message = Message(
        rental_id=message_data.rental_id,
        sender_id=current_user.id,
        receiver_id=receiver_id,
        content=message_data.content
    )

    db.add(message)
    db.commit()
    db.refresh(message)

    return {"id": message.id, "message": "Message sent successfully"}


@app.post("/api/reviews")
async def create_review(
    review_data: ReviewCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    rental = db.query(Rental).filter(Rental.id == review_data.rental_id).first()
    if not rental:
        raise HTTPException(status_code=404, detail="Rental not found")

    if rental.status != "completed":
        raise HTTPException(status_code=400, detail="Can only review completed rentals")

    # Check if already reviewed
    existing = db.query(Review).filter(
        Review.rental_id == review_data.rental_id,
        Review.reviewer_id == current_user.id
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Already reviewed this rental")

    review = Review(
        rental_id=review_data.rental_id,
        reviewer_id=current_user.id,
        reviewee_id=review_data.reviewee_id,
        rating=review_data.rating,
        comment=review_data.comment
    )

    db.add(review)

    # Update reviewee's rating
    reviewee = db.query(User).filter(User.id == review_data.reviewee_id).first()
    if reviewee:
        total_rating = reviewee.rating * reviewee.total_ratings + review_data.rating
        reviewee.total_ratings += 1
        reviewee.rating = round(total_rating / reviewee.total_ratings, 1)

    db.commit()

    return {"message": "Review submitted successfully"}


@app.get("/api/dashboard/earnings")
async def get_earnings(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Get all completed rentals as owner
    transactions = db.query(Transaction).filter(
        Transaction.user_id == current_user.id,
        Transaction.type == "earning"
    ).all()

    total_earnings = sum(t.amount for t in transactions)

    # Calculate monthly earnings
    now = datetime.utcnow()
    month_start = datetime(now.year, now.month, 1)
    monthly_transactions = [t for t in transactions if t.created_at >= month_start]
    monthly_earnings = sum(t.amount for t in monthly_transactions)

    # Get pending earnings (approved but not completed)
    pending_rentals = db.query(Rental).filter(
        Rental.owner_id == current_user.id,
        Rental.status.in_(["approved", "active"])
    ).all()
    pending_earnings = sum(r.owner_earnings for r in pending_rentals)

    # Get active rentals count
    active_count = db.query(Rental).filter(
        Rental.owner_id == current_user.id,
        Rental.status == "active"
    ).count()

    # Get total items
    total_items = db.query(Item).filter(Item.owner_id == current_user.id).count()

    return {
        "total_earnings": round(total_earnings, 2),
        "monthly_earnings": round(monthly_earnings, 2),
        "pending_earnings": round(pending_earnings, 2),
        "active_rentals": active_count,
        "total_items": total_items,
        "transactions": [
            {
                "id": t.id,
                "amount": t.amount,
                "description": t.description,
                "created_at": t.created_at
            }
            for t in sorted(transactions, key=lambda x: x.created_at, reverse=True)[:10]
        ]
    }


@app.get("/api/items/my-items")
async def get_my_items(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    items = db.query(Item).filter(Item.owner_id == current_user.id).all()

    return [
        {
            "id": item.id,
            "title": item.title,
            "description": item.description,
            "daily_rate": item.daily_rate,
            "weekly_rate": item.weekly_rate,
            "deposit": item.deposit,
            "condition": item.condition,
            "available": item.available,
            "images": json.loads(item.images) if item.images else [],
            "categories": [{"id": c.id, "name": c.name, "icon": c.icon} for c in item.categories],
            "created_at": item.created_at
        }
        for item in items
    ]


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
