# TigerRentals - Quick Reference Card

## 🚀 One-Command Start
```bash
./start.sh              # Mac/Linux
start.bat               # Windows
```

## 🌐 URLs
- Frontend: **http://localhost:3000**
- Backend API: **http://localhost:8000**
- API Docs: **http://localhost:8000/docs**

## 🔑 Demo Credentials
```
Email: demo@princeton.edu
Password: password123

All users: password123
```

## 👥 Sample Users
- demo@princeton.edu
- alex.chen@princeton.edu (has items listed)
- sarah.johnson@princeton.edu
- marcus.williams@princeton.edu
- emily.davis@princeton.edu
- james.martinez@princeton.edu
- olivia.brown@princeton.edu

## 📦 Sample Items
- Canon EOS R6 Camera ($45/day)
- Formal Tuxedo ($25/day)
- DeWalt Drill Set ($15/day)
- Organic Chemistry Textbook ($3/day)
- DJ Speaker System ($60/day)
- Trek Mountain Bike ($20/day)
- Nintendo Switch ($15/day)
- GoPro Hero 11 ($20/day)

## 🎯 Quick Demo Flow
1. **Browse** → Search "camera"
2. **View Item** → Canon EOS R6
3. **Request Rental** → Tomorrow for 3 days
4. **Switch User** → alex.chen@princeton.edu
5. **Approve** → Dashboard → Approve request
6. **Show QR** → Click "Pickup QR" (impressive!)
7. **Complete** → Verify pickup → Verify return
8. **Earnings** → Navigate to Earnings tab

## 🎨 Key Features to Demo
- ✅ .edu email validation
- 🗺️ Map view (click "Map" button)
- 📱 QR code generation
- 💰 Earnings projections
- 📊 Analytics charts
- 💬 Messaging system
- ⭐ Rating system
- 🔒 $2,000 insurance

## 🏗️ Tech Stack
**Frontend:** React + Tailwind + Vite
**Backend:** FastAPI + SQLAlchemy + SQLite
**Maps:** React Leaflet
**Charts:** Recharts
**Auth:** JWT

## 💼 Business Model
- 15% platform fee
- $300-$800 student earnings/semester
- $2,000 insurance per rental
- Target: 20M college students

## 🎤 30-Second Pitch
"TigerRentals is a peer-to-peer marketplace where students rent out items they're not using. Renters save money, owners earn $300-$800/semester. We make it safe with $2K insurance, QR verification, and .edu-only access. 15% commission model. Starting at Princeton, expanding to 20M college students nationwide."

## 📞 Troubleshooting
**Backend won't start:**
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python seed_data.py
```

**Frontend won't start:**
```bash
cd frontend
rm -rf node_modules
npm install
```

**Database reset:**
```bash
cd backend
rm campus_rentals.db
python seed_data.py
```

## 📂 File Structure
```
campus-rentals/
├── backend/           # FastAPI server
│   ├── main.py       # API endpoints
│   ├── database.py   # Models
│   ├── auth.py       # JWT auth
│   └── seed_data.py  # Sample data
├── frontend/         # React app
│   └── src/
│       ├── pages/    # 9 pages
│       ├── components/
│       └── api.js
└── README.md         # Full docs
```

## 🎬 Demo Shortcuts
- **Quick fill buttons** throughout app
- **Map view** for wow factor
- **QR codes** are very impressive
- **Charts** in earnings dashboard
- **Live cost calculation** when selecting dates

## 📊 Key Metrics to Mention
- 7 users
- 20+ items
- $1,000 in sample earnings
- 15% platform fee
- $2,000 insurance
- 8 categories

## 🏆 Awards to Target
- Best Use of Claude ✅
- Most Market-Ready ✅
- Best Design ✅
- Best Overall ✅

---

**Print this out or keep it on screen during your demo!**
