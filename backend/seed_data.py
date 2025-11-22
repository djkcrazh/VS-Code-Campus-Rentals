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

def generate_placeholder_image(category, index):
    """Generate placeholder image URLs using picsum.photos"""
    seed = hash(f"{category}{index}") % 1000
    # Use different image sizes and seeds for variety
    return f"https://picsum.photos/seed/{seed}/800/600"

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
    },
    {
        "title": "Formal Tuxedo (40R)",
        "description": "Black tuxedo with bow tie and cummerbund. Perfect for formals, galas, or interviews. Dry cleaned after each use.",
        "daily_rate": 25.0,
        "weekly_rate": 80.0,
        "deposit": 100.0,
        "condition": "Excellent",
        "categories": ["Fashion"],
    },
    {
        "title": "DeWalt Cordless Drill Set",
        "description": "20V MAX drill/driver with 2 batteries and charger. Includes drill bits and carrying case. Perfect for DIY projects or dorm furniture assembly.",
        "daily_rate": 15.0,
        "weekly_rate": 60.0,
        "deposit": 80.0,
        "condition": "Good",
        "categories": ["Tools"],
    },
    {
        "title": "Textbook: Organic Chemistry 8th Ed",
        "description": "Klein's Organic Chemistry textbook in great condition. All chapters intact, minimal highlighting. Save hundreds vs buying new!",
        "daily_rate": 3.0,
        "weekly_rate": 15.0,
        "deposit": 50.0,
        "condition": "Good",
        "categories": ["Academic"],
    },
    {
        "title": "Professional DJ Speaker System",
        "description": "JBL EON615 powered speakers (pair) with stands and cables. 1000W total power. Perfect for parties, events, or performances.",
        "daily_rate": 60.0,
        "weekly_rate": 300.0,
        "deposit": 400.0,
        "condition": "Excellent",
        "categories": ["Party Supplies", "Electronics"],
    },
    {
        "title": "Mountain Bike - Trek Marlin 7",
        "description": "2022 Trek Marlin 7 in great condition. Perfect for campus commuting or trail riding. Helmet included.",
        "daily_rate": 20.0,
        "weekly_rate": 100.0,
        "deposit": 200.0,
        "condition": "Good",
        "categories": ["Transportation", "Sports"],
    },
    {
        "title": "Nintendo Switch + Popular Games",
        "description": "Nintendo Switch console with Mario Kart, Zelda BOTW, and Smash Bros. Includes 2 controllers and dock.",
        "daily_rate": 15.0,
        "weekly_rate": 70.0,
        "deposit": 150.0,
        "condition": "Good",
        "categories": ["Electronics"],
    },
    {
        "title": "Cocktail Party Kit (Shaker, Glasses, Tools)",
        "description": "Complete bartending set with shaker, jigger, strainer, muddler, and 12 cocktail glasses. Perfect for room parties!",
        "daily_rate": 10.0,
        "weekly_rate": 40.0,
        "deposit": 50.0,
        "condition": "Excellent",
        "categories": ["Party Supplies"],
    },
    {
        "title": "Electric Skateboard - Boosted Mini",
        "description": "Boosted Mini X electric skateboard. 14 mph top speed, 14 mile range. Fun and fast campus transportation!",
        "daily_rate": 25.0,
        "weekly_rate": 120.0,
        "deposit": 300.0,
        "condition": "Good",
        "categories": ["Transportation"],
    },
    {
        "title": "GoPro Hero 11 + Accessories",
        "description": "Latest GoPro with waterproof case, chest mount, head strap, and extra batteries. Perfect for adventures and vlogs.",
        "daily_rate": 20.0,
        "weekly_rate": 90.0,
        "deposit": 200.0,
        "condition": "Excellent",
        "categories": ["Photography", "Electronics"],
    },
    {
        "title": "Formal Dress - Black Evening Gown (Size 6)",
        "description": "Elegant floor-length black gown perfect for formals and galas. Fits size 4-6. Professionally cleaned.",
        "daily_rate": 30.0,
        "weekly_rate": 100.0,
        "deposit": 150.0,
        "condition": "Excellent",
        "categories": ["Fashion"],
    },
    {
        "title": "Camping Gear Bundle (Tent, Sleeping Bag, Pad)",
        "description": "Complete camping setup for 2 people. REI tent, mummy sleeping bag rated to 20°F, and sleeping pad.",
        "daily_rate": 25.0,
        "weekly_rate": 110.0,
        "deposit": 150.0,
        "condition": "Good",
        "categories": ["Sports"],
    },
    {
        "title": "Projector + Screen Combo",
        "description": "1080p projector with 100-inch portable screen. Perfect for movie nights or presentations. Includes HDMI cable.",
        "daily_rate": 20.0,
        "weekly_rate": 85.0,
        "deposit": 150.0,
        "condition": "Good",
        "categories": ["Electronics", "Party Supplies"],
    },
    {
        "title": "Complete Tool Kit (50+ pieces)",
        "description": "Professional tool set with hammers, screwdrivers, pliers, wrenches, and more. Everything you need for repairs or assembly.",
        "daily_rate": 12.0,
        "weekly_rate": 50.0,
        "deposit": 75.0,
        "condition": "Good",
        "categories": ["Tools"],
    },
    {
        "title": "Longboard - Loaded Tan Tien",
        "description": "Premium carving longboard in excellent condition. Smooth ride for campus cruising. Helmet included.",
        "daily_rate": 10.0,
        "weekly_rate": 45.0,
        "deposit": 100.0,
        "condition": "Excellent",
        "categories": ["Transportation", "Sports"],
    },
    {
        "title": "DSLR Lighting Kit (3-Point Setup)",
        "description": "Professional 3-point lighting setup with softboxes, stands, and LED bulbs. Perfect for video production or photography.",
        "daily_rate": 18.0,
        "weekly_rate": 75.0,
        "deposit": 120.0,
        "condition": "Good",
        "categories": ["Photography"],
    },
    {
        "title": "Karaoke Machine + Wireless Mics",
        "description": "Bluetooth karaoke system with 2 wireless mics, LED lights, and built-in screen. Party essential!",
        "daily_rate": 20.0,
        "weekly_rate": 85.0,
        "deposit": 100.0,
        "condition": "Good",
        "categories": ["Party Supplies", "Electronics"],
    },
    {
        "title": "Men's Designer Suit (42L)",
        "description": "Hugo Boss navy suit, tailored fit. Perfect for interviews, presentations, or formal events.",
        "daily_rate": 35.0,
        "weekly_rate": 140.0,
        "deposit": 200.0,
        "condition": "Excellent",
        "categories": ["Fashion"],
    },
    {
        "title": "Electric Scooter - Xiaomi Mi",
        "description": "Xiaomi Mi Electric Scooter with 18.6 mile range. Foldable and portable. Great for getting around campus quickly.",
        "daily_rate": 15.0,
        "weekly_rate": 70.0,
        "deposit": 150.0,
        "condition": "Good",
        "categories": ["Transportation"],
    },
    {
        "title": "Textbook Bundle: Calculus I & II",
        "description": "Stewart's Calculus textbooks (8th edition) for both semesters. Minimal wear, all content intact.",
        "daily_rate": 4.0,
        "weekly_rate": 20.0,
        "deposit": 80.0,
        "condition": "Good",
        "categories": ["Academic"],
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

        # Generate placeholder images for each item
        category_name = item_data["categories"][0] if item_data["categories"] else "item"
        images = [
            generate_placeholder_image(category_name, i * 3 + j)
            for j in range(random.randint(2, 4))  # 2-4 images per item
        ]

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
