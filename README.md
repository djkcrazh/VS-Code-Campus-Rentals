[README.md](https://github.com/user-attachments/files/32270665/README.md)
# TigerRentals

A peer-to-peer rental marketplace for college students, built for the Claude x Hoagie Vibe-a-thon (1st place, 2025).

Students list items they own and aren't using; other students browse, request a rental for a date range, and pick up in person. The owner approves requests, both sides confirm pickup/return with a QR code, and payments/fees are simulated for the demo.

## Stack

**Frontend:** React 18, React Router, Tailwind CSS, Vite, Recharts, React Leaflet, Axios

**Backend:** FastAPI, SQLAlchemy, SQLite, JWT auth (python-jose, passlib), QR code generation, Pillow

## Architecture

```
Users        auth (email, hashed password), profile, ratings
Items        ownership, pricing, location (lat/lng), categories, availability
Rentals      date range, cost breakdown, status workflow, QR codes
Messages     per-rental conversations
Reviews      mutual 5-star ratings
Transactions earnings and payout history
```

Rental status flow: `pending → approved → active → completed`, with QR verification at pickup and return.

### API surface

| Area | Endpoints |
|---|---|
| Auth | `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me` |
| Items | `GET /api/items`, `GET /api/items/{id}`, `POST /api/items`, `GET /api/items/my-items` |
| Rentals | `POST /api/rentals`, `GET /api/rentals/my-rentals`, `PATCH /api/rentals/{id}/approve`, `PATCH /api/rentals/{id}/verify-pickup`, `PATCH /api/rentals/{id}/verify-return` |
| Messages | `GET /api/messages`, `POST /api/messages` |
| Reviews | `POST /api/reviews` |

## Running locally

**Backend**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python seed_data.py       # seeds demo users, items, and rentals
python main.py             # http://localhost:8000
```

**Frontend**
```bash
cd frontend
npm install
npm run dev                # http://localhost:3000
```

## Demo data

The seed script creates 7 sample users, 20+ listed items across 8 categories, and a mix of active and completed rentals with messages and reviews already attached.

Demo login credentials are set in `backend/seed_data.py` — check that file rather than hardcoding them here.

## Notable implementation details

- **.edu email validation** at registration, gating signups to campus users
- **QR-code pickup/return verification** to reduce disputed handoffs
- Security deposits, insurance coverage, and the 15% platform fee are simulated for the demo — no real payment processing is wired up
- Map view (React Leaflet) supports distance-based filtering, centered on the Princeton campus

## Possible next steps

- Real payment processing (Stripe)
- Email/push notifications for rental status changes
- Multi-campus support beyond Princeton

## License

MIT — see `LICENSE`.
