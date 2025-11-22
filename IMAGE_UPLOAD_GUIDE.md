# 📸 Image Upload Guide for TigerRentals

## Quick Setup

Your TigerRentals app is now configured to use **local images** that you upload yourself!

## 📂 Where to Put Your Images

All images go in: `/Users/andrewaddo/campus-rentals/backend/static/images/`

We've created folders for each of the 6 items:

```
backend/static/images/
├── camera/          → Canon EOS R6 Camera images
├── bike/            → Electric Bike images
├── skateboard/      → Electric Skateboard images
├── gopro/           → GoPro Hero 11 images
├── tennis/          → Tennis Racket images
└── textbook/        → Chemistry Textbook images
```

## 🎯 How to Add Images

### Step 1: Find Your Images
Get photos for each product. You can:
- Take photos yourself
- Download from Google Images (search for each product)
- Use stock photos

### Step 2: Rename Your Images
Give them simple names like:
- `1.jpg`, `2.jpg`, `3.jpg`
- OR `main.jpg`, `side.jpg`, `detail.jpg`

Supported formats: `.jpg`, `.jpeg`, `.png`, `.gif`

### Step 3: Copy to the Right Folder

**Example for Camera:**
```bash
# Navigate to the camera folder
cd /Users/andrewaddo/campus-rentals/backend/static/images/camera

# Copy your images here (or drag and drop in Finder)
cp ~/Downloads/canon-camera-1.jpg ./1.jpg
cp ~/Downloads/canon-camera-2.jpg ./2.jpg
cp ~/Downloads/canon-camera-3.jpg ./3.jpg
```

**Do this for all 6 products:**

1. **Camera folder**: Add 2-4 photos of a Canon camera
2. **Bike folder**: Add 2-4 photos of an electric bike
3. **Skateboard folder**: Add 2-4 photos of an electric skateboard
4. **GoPro folder**: Add 2-4 photos of a GoPro camera
5. **Tennis folder**: Add 2-4 photos of a tennis racket
6. **Textbook folder**: Add 2-4 photos of a chemistry textbook

### Step 4: Regenerate the Database
After adding all your images, run:

```bash
cd /Users/andrewaddo/campus-rentals/backend
source venv/bin/activate
python seed_data.py
```

### Step 5: Restart the Server (if needed)
If the backend is already running, you don't need to restart. But if you want to:

```bash
# Kill existing server
lsof -ti:8000 | xargs kill -9

# Restart backend
cd /Users/andrewaddo/campus-rentals/backend
source venv/bin/activate
python main.py
```

## 🎨 Image Tips

### Recommended Image Specs:
- **Size**: 800x600 pixels or larger
- **Format**: JPG (best for photos)
- **Quality**: Medium to high quality
- **Aspect ratio**: 4:3 or 16:9

### What Makes Good Product Images:
✅ Clear, well-lit photos
✅ Plain or simple backgrounds
✅ Product fills most of the frame
✅ Multiple angles (front, side, detail)
✅ Show the item in use (if possible)

### What to Avoid:
❌ Blurry or dark photos
❌ Too much clutter in background
❌ Product too small in frame
❌ Watermarked images

## 🚀 Quick Example

Here's how to add camera images quickly:

```bash
# 1. Go to the camera folder
cd /Users/andrewaddo/campus-rentals/backend/static/images/camera

# 2. Download some images (example URLs - replace with actual images)
# You can drag files from your Downloads folder or:
# - Right-click → Save Image As...
# - Or use curl to download:

curl -o 1.jpg "https://example.com/camera-image-1.jpg"
curl -o 2.jpg "https://example.com/camera-image-2.jpg"

# 3. Check they're there
ls -la

# 4. Go back and regenerate database
cd ../..
python seed_data.py
```

## 🔍 Verification

After uploading images and regenerating the database, you can check:

```bash
# Check what images are in the database
cd /Users/andrewaddo/campus-rentals/backend
source venv/bin/activate
sqlite3 campus_rentals.db "SELECT title, images FROM items;"
```

You should see URLs like:
```
Canon EOS R6 Camera + 24-70mm Lens|["http://localhost:8000/static/images/camera/1.jpg", "http://localhost:8000/static/images/camera/2.jpg"]
```

## 🌐 View in Browser

1. Open http://localhost:3000
2. Go to Marketplace
3. You should see your uploaded images!

## 💡 Pro Tips

### Tip 1: Use Finder (Mac)
1. Open Finder
2. Navigate to `/Users/andrewaddo/campus-rentals/backend/static/images/`
3. Drag and drop images into each folder
4. Run `python seed_data.py` to update database

### Tip 2: Batch Rename
If you have multiple images with complex names:
```bash
cd /Users/andrewaddo/campus-rentals/backend/static/images/camera
# Rename all .jpg files to 1.jpg, 2.jpg, 3.jpg, etc.
i=1; for f in *.jpg; do mv "$f" "$i.jpg"; ((i++)); done
```

### Tip 3: Add More Images Later
Just add new images to any folder and run `python seed_data.py` again!

## ❓ Troubleshooting

**Images not showing?**
1. Check file permissions: `chmod 644 /path/to/image.jpg`
2. Make sure files are in the correct folder
3. Regenerate database: `python seed_data.py`
4. Clear browser cache (Cmd+Shift+R on Mac)

**"No such file or directory" error?**
- Check that you're in the backend directory
- Check that the image folders exist: `ls -la static/images/`

**Images are too large?**
Resize them:
```bash
# Install ImageMagick if needed: brew install imagemagick
mogrify -resize 800x600 *.jpg
```

## 📝 Current Product List

1. **Canon EOS R6 Camera** → `static/images/camera/`
2. **Electric Bike** → `static/images/bike/`
3. **Electric Skateboard** → `static/images/skateboard/`
4. **GoPro Hero 11** → `static/images/gopro/`
5. **Tennis Racket** → `static/images/tennis/`
6. **Chemistry Textbook** → `static/images/textbook/`

---

**Need help?** Check the main README.md or reach out!

**Happy uploading!** 🎉
