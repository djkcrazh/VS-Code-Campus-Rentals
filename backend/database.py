from sqlalchemy import create_engine, Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text, Table
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from datetime import datetime

SQLALCHEMY_DATABASE_URL = "sqlite:///./campus_rentals.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# Association table for item categories
item_categories = Table(
    'item_categories',
    Base.metadata,
    Column('item_id', Integer, ForeignKey('items.id')),
    Column('category_id', Integer, ForeignKey('categories.id'))
)


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=False)
    phone = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    verified = Column(Boolean, default=False)
    rating = Column(Float, default=0.0)
    total_ratings = Column(Integer, default=0)
    profile_image = Column(Text)  # Base64 or URL
    bio = Column(Text)
    address = Column(String)
    latitude = Column(Float)
    longitude = Column(Float)

    # Relationships
    items = relationship("Item", back_populates="owner", foreign_keys="Item.owner_id")
    rentals_as_renter = relationship("Rental", back_populates="renter", foreign_keys="Rental.renter_id")
    rentals_as_owner = relationship("Rental", back_populates="owner", foreign_keys="Rental.owner_id")
    messages_sent = relationship("Message", back_populates="sender", foreign_keys="Message.sender_id")
    messages_received = relationship("Message", back_populates="receiver", foreign_keys="Message.receiver_id")
    reviews_given = relationship("Review", back_populates="reviewer", foreign_keys="Review.reviewer_id")
    reviews_received = relationship("Review", back_populates="reviewee", foreign_keys="Review.reviewee_id")


class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)
    icon = Column(String)  # emoji or icon name

    items = relationship("Item", secondary=item_categories, back_populates="categories")


class Item(Base):
    __tablename__ = "items"

    id = Column(Integer, primary_key=True, index=True)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String, nullable=False, index=True)
    description = Column(Text, nullable=False)
    daily_rate = Column(Float, nullable=False)
    weekly_rate = Column(Float)
    deposit = Column(Float, nullable=False)
    images = Column(Text)  # JSON array of base64 images
    condition = Column(String)  # Excellent, Good, Fair
    available = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    latitude = Column(Float)
    longitude = Column(Float)
    location_name = Column(String)
    insurance_value = Column(Float, default=2000.0)

    # Relationships
    owner = relationship("User", back_populates="items", foreign_keys=[owner_id])
    categories = relationship("Category", secondary=item_categories, back_populates="items")
    rentals = relationship("Rental", back_populates="item")
    availability_blocks = relationship("AvailabilityBlock", back_populates="item")


class AvailabilityBlock(Base):
    __tablename__ = "availability_blocks"

    id = Column(Integer, primary_key=True, index=True)
    item_id = Column(Integer, ForeignKey("items.id"), nullable=False)
    start_date = Column(DateTime, nullable=False)
    end_date = Column(DateTime, nullable=False)
    is_blocked = Column(Boolean, default=True)  # True = unavailable, False = available

    item = relationship("Item", back_populates="availability_blocks")


class Rental(Base):
    __tablename__ = "rentals"

    id = Column(Integer, primary_key=True, index=True)
    item_id = Column(Integer, ForeignKey("items.id"), nullable=False)
    renter_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    start_date = Column(DateTime, nullable=False)
    end_date = Column(DateTime, nullable=False)
    total_cost = Column(Float, nullable=False)
    deposit_amount = Column(Float, nullable=False)
    platform_fee = Column(Float, nullable=False)
    owner_earnings = Column(Float, nullable=False)
    status = Column(String, default="pending")  # pending, approved, active, completed, cancelled
    created_at = Column(DateTime, default=datetime.utcnow)
    approved_at = Column(DateTime)
    pickup_qr = Column(String)
    return_qr = Column(String)
    pickup_verified_at = Column(DateTime)
    return_verified_at = Column(DateTime)
    pickup_photos = Column(Text)  # JSON array
    return_photos = Column(Text)  # JSON array

    # Relationships
    item = relationship("Item", back_populates="rentals")
    renter = relationship("User", back_populates="rentals_as_renter", foreign_keys=[renter_id])
    owner = relationship("User", back_populates="rentals_as_owner", foreign_keys=[owner_id])
    messages = relationship("Message", back_populates="rental")
    reviews = relationship("Review", back_populates="rental")


class Message(Base):
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, index=True)
    rental_id = Column(Integer, ForeignKey("rentals.id"), nullable=False)
    sender_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    receiver_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    read = Column(Boolean, default=False)

    rental = relationship("Rental", back_populates="messages")
    sender = relationship("User", back_populates="messages_sent", foreign_keys=[sender_id])
    receiver = relationship("User", back_populates="messages_received", foreign_keys=[receiver_id])


class Review(Base):
    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True, index=True)
    rental_id = Column(Integer, ForeignKey("rentals.id"), nullable=False)
    reviewer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    reviewee_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    rating = Column(Integer, nullable=False)  # 1-5
    comment = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

    rental = relationship("Rental", back_populates="reviews")
    reviewer = relationship("User", back_populates="reviews_given", foreign_keys=[reviewer_id])
    reviewee = relationship("User", back_populates="reviews_received", foreign_keys=[reviewee_id])


class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    rental_id = Column(Integer, ForeignKey("rentals.id"))
    amount = Column(Float, nullable=False)
    type = Column(String, nullable=False)  # earning, payout, deposit, refund
    status = Column(String, default="completed")  # pending, completed, failed
    created_at = Column(DateTime, default=datetime.utcnow)
    description = Column(String)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    Base.metadata.create_all(bind=engine)
