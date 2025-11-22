import json
from datetime import datetime, timedelta
from database import SessionLocal, init_db, User, Category, Item, Rental, Review, Transaction, Message
from auth import get_password_hash
import random
import base64

PRINCETON_LOCATIONS = [
    {"name": "Butler College", "lat": 40.3453, "lng": -74.6557},
    {"name": "Mathey College", "lat": 40.3461, "lng": -74.6583},
    {"name": "Rockefeller College", "lat": 40.3478, "lng": -74.6561},
    {"name": "Whitman College", "lat": 40.3487, "lng": -74.6542},
    {"name": "Forbes College", "lat": 40.3442, "lng": -74.6612},
    {"name": "Engineering Quad", "lat": 40.3491, "lng": -74.6524},
    {"name": "Frist Campus Center", "lat": 40.3478, "lng": -74.6553},
    {"name": "McCosh Hall", "lat": 40.3485, "lng": -74.6579},
]

def get_local_images(folder_name):
    """Get local image URLs from static folder"""
    import os
    import glob

    image_dir = f"static/images/{folder_name}"
    if not os.path.exists(image_dir):
        # Return placeholder URL if folder doesn't exist yet
        return [f"http://localhost:8000/static/images/{folder_name}/placeholder.jpg"]

    # Get all image files in the folder
    image_files = []
    for ext in ['*.jpg', '*.jpeg', '*.png', '*.gif']:
        image_files.extend(glob.glob(os.path.join(image_dir, ext)))

    # If no images found, return placeholder
    if not image_files:
        return [f"http://localhost:8000/static/images/{folder_name}/placeholder.jpg"]

    # Convert to URLs
    return [f"http://localhost:8000/static/images/{folder_name}/{os.path.basename(f)}" for f in sorted(image_files)]

CATEGORIES_DATA = [
    {"name": "Electronics", "icon": "📱"},
    {"name": "Tools", "icon": "🔧"},
    {"name": "Fashion", "icon": "👔"},
    {"name": "Sports", "icon": "⚽"},
    {"name": "Party Supplies", "icon": "🎉"},
    {"name": "Academic", "icon": "📚"},
    {"name": "Transportation", "icon": "🚲"},
    {"name": "Photography", "icon": "📷"},
]

SAMPLE_USERS = [
    {
        "email": "alex.chen@princeton.edu",
        "full_name": "Alex Chen",
        "phone": "+1-609-555-0101",
        "bio": "Engineering major who loves photography and tech. Always happy to help fellow Tigers!",
        "verified": True,
    },
    {
        "email": "sarah.johnson@princeton.edu",
        "full_name": "Sarah Johnson",
        "phone": "+1-609-555-0102",
        "bio": "Pre-med student and outdoor enthusiast. Renting out my gear when I'm not using it.",
        "verified": True,
    },
    {
        "email": "marcus.williams@princeton.edu",
        "full_name": "Marcus Williams",
        "phone": "+1-609-555-0103",
        "bio": "Business major and aspiring entrepreneur. Making passive income through rentals!",
        "verified": True,
    },
    {
        "email": "emily.davis@princeton.edu",
        "full_name": "Emily Davis",
        "phone": "+1-609-555-0104",
        "bio": "Art history major with a passion for fashion and events.",
        "verified": True,
    },
    {
        "email": "james.martinez@princeton.edu",
        "full_name": "James Martinez",
        "phone": "+1-609-555-0105",
        "bio": "CS major and DIY enthusiast. Have tools, will share!",
        "verified": True,
    },
    {
        "email": "olivia.brown@princeton.edu",
        "full_name": "Olivia Brown",
        "phone": "+1-609-555-0106",
        "bio": "Economics major who loves sustainability and the sharing economy.",
        "verified": True,
    },
    {
        "email": "demo@princeton.edu",
        "full_name": "Demo User",
        "phone": "+1-609-555-0100",
        "bio": "Demo account for testing Campus Rentals!",
        "verified": True,
    }
]

SAMPLE_ITEMS = [
    {
        "title": "Canon EOS R6 Camera + 24-70mm Lens",
        "description": "Professional mirrorless camera perfect for events, portraits, or creative projects. Includes battery, charger, and SD card. Excellent condition, well-maintained.",
        "daily_rate": 45.0,
        "weekly_rate": 250.0,
        "deposit": 500.0,
        "condition": "Excellent",
        "categories": ["Photography", "Electronics"],
        "insurance_value": 2500.0,
        "image_folder": "camera",
    },
    {
        "title": "Electric Bike - Rad Power RadRunner",
        "description": "Electric bike with pedal assist and throttle. 45-mile range, perfect for campus commuting or exploring Princeton. Helmet and lock included.",
        "daily_rate": 30.0,
        "weekly_rate": 150.0,
        "deposit": 300.0,
        "condition": "Excellent",
        "categories": ["Transportation"],
        "insurance_value": 1500.0,
        "image_folder": "bike",
    },
    {
        "title": "Electric Skateboard - Boosted Mini",
        "description": "Boosted Mini X electric skateboard. 14 mph top speed, 14 mile range. Fun and fast campus transportation!",
        "daily_rate": 25.0,
        "weekly_rate": 120.0,
        "deposit": 300.0,
        "condition": "Good",
        "categories": ["Transportation"],
        "insurance_value": 750.0,
        "image_folder": "skateboard",
    },
    {
        "title": "GoPro Hero 11 + Accessories",
        "description": "Latest GoPro with waterproof case, chest mount, head strap, and extra batteries. Perfect for adventures and vlogs.",
        "daily_rate": 20.0,
        "weekly_rate": 90.0,
        "deposit": 200.0,
        "condition": "Excellent",
        "categories": ["Photography", "Electronics"],
        "insurance_value": 500.0,
        "image_folder": "gopro",
    },
    {
        "title": "Wilson Pro Staff Tennis Racket",
        "description": "Professional-grade tennis racket in excellent condition. Perfect for campus courts or club matches. Comes with case and new grip.",
        "daily_rate": 8.0,
        "weekly_rate": 35.0,
        "deposit": 75.0,
        "condition": "Excellent",
        "categories": ["Sports"],
        "insurance_value": 200.0,
        "image_folder": "tennis",
    },
    {
        "title": "Textbook: Organic Chemistry 8th Ed",
        "description": "Klein's Organic Chemistry textbook in great condition. All chapters intact, minimal highlighting. Save hundreds vs buying new!",
        "daily_rate": 3.0,
        "weekly_rate": 15.0,
        "deposit": 50.0,
        "condition": "Good",
        "categories": ["Academic"],
        "insurance_value": 150.0,
        "image_folder": "textbook",
    },
]


def seed_database():
    init_db()
    db = SessionLocal()

    # Clear existing data (for development)
    db.query(Transaction).delete()
    db.query(Review).delete()
    db.query(Message).delete()
    db.query(Rental).delete()
    db.query(Item).delete()
    db.query(Category).delete()
    db.query(User).delete()
    db.commit()

    print("Creating categories...")
    categories = {}
    for cat_data in CATEGORIES_DATA:
        category = Category(**cat_data)
        db.add(category)
        db.flush()
        categories[cat_data["name"]] = category
    db.commit()

    print("Creating users...")
    users = []
    for i, user_data in enumerate(SAMPLE_USERS):
        location = PRINCETON_LOCATIONS[i % len(PRINCETON_LOCATIONS)]
        user = User(
            email=user_data["email"],
            hashed_password=get_password_hash("password123"),
            full_name=user_data["full_name"],
            phone=user_data.get("phone"),
            bio=user_data.get("bio"),
            verified=user_data.get("verified", False),
            rating=round(random.uniform(4.3, 5.0), 1),
            total_ratings=random.randint(5, 25),
            latitude=location["lat"],
            longitude=location["lng"],
            address=location["name"]
        )
        db.add(user)
        db.flush()
        users.append(user)
    db.commit()

    print("Creating items...")
    items = []
    for i, item_data in enumerate(SAMPLE_ITEMS):
        owner = users[i % len(users)]
        location = PRINCETON_LOCATIONS[i % len(PRINCETON_LOCATIONS)]

        # Get local images for each item using the image_folder
        image_folder = item_data.get("image_folder", "default")
        images = get_local_images(image_folder)

        item = Item(
            owner_id=owner.id,
            title=item_data["title"],
            description=item_data["description"],
            daily_rate=item_data["daily_rate"],
            weekly_rate=item_data.get("weekly_rate"),
            deposit=item_data["deposit"],
            condition=item_data["condition"],
            available=True,
            latitude=location["lat"],
            longitude=location["lng"],
            location_name=location["name"],
            insurance_value=item_data.get("insurance_value", 2000.0),
            images=json.dumps(images),
        )
        db.add(item)
        db.flush()

        # Add categories
        for cat_name in item_data["categories"]:
            if cat_name in categories:
                item.categories.append(categories[cat_name])

        items.append(item)
    db.commit()

    print("Creating sample rentals...")
    # Create some completed rentals for transaction history
    for i in range(10):
        item = random.choice(items)
        renter = random.choice([u for u in users if u.id != item.owner_id])
        owner = next(u for u in users if u.id == item.owner_id)

        # Past rental (completed)
        days_ago = random.randint(10, 90)
        start_date = datetime.utcnow() - timedelta(days=days_ago + 3)
        end_date = datetime.utcnow() - timedelta(days=days_ago)
        rental_days = (end_date - start_date).days

        total_cost = item.daily_rate * rental_days
        platform_fee = total_cost * 0.15
        owner_earnings = total_cost - platform_fee

        rental = Rental(
            item_id=item.id,
            renter_id=renter.id,
            owner_id=owner.id,
            start_date=start_date,
            end_date=end_date,
            total_cost=total_cost,
            deposit_amount=item.deposit,
            platform_fee=platform_fee,
            owner_earnings=owner_earnings,
            status="completed",
            approved_at=start_date - timedelta(days=1),
            pickup_verified_at=start_date,
            return_verified_at=end_date,
            pickup_qr=f"PICKUP-{random.randint(100000, 999999)}",
            return_qr=f"RETURN-{random.randint(100000, 999999)}",
        )
        db.add(rental)
        db.flush()

        # Add transaction
        transaction = Transaction(
            user_id=owner.id,
            rental_id=rental.id,
            amount=owner_earnings,
            type="earning",
            status="completed",
            description=f"Earned from renting '{item.title}'"
        )
        db.add(transaction)

        # Add review
        if random.random() > 0.3:  # 70% chance of review
            review = Review(
                rental_id=rental.id,
                reviewer_id=renter.id,
                reviewee_id=owner.id,
                rating=random.randint(4, 5),
                comment=random.choice([
                    "Great item, exactly as described!",
                    "Smooth transaction, highly recommend!",
                    "Perfect condition, would rent again.",
                    "Super helpful owner, great experience!",
                    "Item worked perfectly for my needs."
                ])
            )
            db.add(review)

    # Create some active/pending rentals
    for i in range(5):
        item = random.choice(items)
        renter = random.choice([u for u in users if u.id != item.owner_id])
        owner = next(u for u in users if u.id == item.owner_id)

        status = random.choice(["pending", "approved", "active"])
        start_date = datetime.utcnow() + timedelta(days=random.randint(1, 7))
        end_date = start_date + timedelta(days=random.randint(2, 5))
        rental_days = (end_date - start_date).days

        total_cost = item.daily_rate * rental_days
        platform_fee = total_cost * 0.15
        owner_earnings = total_cost - platform_fee

        rental = Rental(
            item_id=item.id,
            renter_id=renter.id,
            owner_id=owner.id,
            start_date=start_date,
            end_date=end_date,
            total_cost=total_cost,
            deposit_amount=item.deposit,
            platform_fee=platform_fee,
            owner_earnings=owner_earnings,
            status=status,
            approved_at=datetime.utcnow() if status in ["approved", "active"] else None,
            pickup_qr=f"PICKUP-{random.randint(100000, 999999)}",
            return_qr=f"RETURN-{random.randint(100000, 999999)}",
        )
        db.add(rental)
        db.flush()

        # Add some messages
        for _ in range(random.randint(1, 3)):
            message = Message(
                rental_id=rental.id,
                sender_id=random.choice([renter.id, owner.id]),
                receiver_id=owner.id if random.random() > 0.5 else renter.id,
                content=random.choice([
                    "Hi! Is this item still available?",
                    "Thanks for approving! Looking forward to pickup.",
                    "What's the best time for pickup?",
                    "I'll be there at 2pm if that works.",
                    "Sounds great, see you then!",
                ]),
                read=random.random() > 0.3
            )
            message.receiver_id = owner.id if message.sender_id == renter.id else renter.id
            db.add(message)

    db.commit()

    print("\n" + "="*50)
    print("Database seeded successfully!")
    print("="*50)
    print(f"Created {len(users)} users")
    print(f"Created {len(categories)} categories")
    print(f"Created {len(items)} items")
    print(f"\nDemo credentials:")
    print("  Email: demo@princeton.edu")
    print("  Password: password123")
    print("\nAll users have password: password123")
    print("="*50 + "\n")

    db.close()


if __name__ == "__main__":
    seed_database()
