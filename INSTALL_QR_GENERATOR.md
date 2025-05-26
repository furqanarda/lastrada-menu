# 🆓 Free QR Code Generator Installation Guide

This guide helps you generate **actual QR code images** for all hotel rooms using free tools.

## 🐍 **Option 1: Python Script (Recommended - 100% Free)**

### Step 1: Install Python
If you don't have Python installed:

**Windows:**
1. Go to [python.org](https://python.org/downloads/)
2. Download Python 3.8 or newer
3. Run installer and check "Add Python to PATH"

**macOS:**
```bash
# Using Homebrew (recommended)
brew install python

# Or download from python.org
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt update
sudo apt install python3 python3-pip
```

### Step 2: Install Required Libraries
```bash
# Install the QR code generation libraries
pip install qrcode[pil] pillow

# Or if you have pip3:
pip3 install qrcode[pil] pillow
```

### Step 3: Run the Generator
```bash
# Navigate to your project directory
cd /path/to/la-strada-menu

# Run the Python script
python scripts/generate-qr-images.py

# Or if you have python3:
python3 scripts/generate-qr-images.py
```

### Step 4: Get Your QR Codes
The script will create:
- `qr-codes-images/` folder with 60+ PNG files
- `qr-codes-images/qr-codes-gallery.html` - Beautiful gallery page
- Each QR code is labeled with the room name
- Ready to print at optimal size

---

## 🌐 **Option 2: Free Online Tools (One by One)**

### QR Code Monkey (Free, No Limits)
1. Go to [qr-code-monkey.com](https://www.qr-code-monkey.com)
2. Paste your room URL (e.g., `https://menu.theplazahoteledirne.com?token=qr_101_t9u2v5w8x1y4`)
3. Customize design if desired
4. Download PNG/SVG
5. Repeat for each room

### QR Server (Free API)
1. Go to [qr-server.com](https://www.qr-server.com)
2. Use their free API
3. No registration required
4. High quality images

### Google Charts QR (Free)
Use this URL format for any room:
```
https://chart.googleapis.com/chart?chs=300x300&cht=qr&chl=https://menu.theplazahoteledirne.com?token=ROOM_TOKEN
```

Replace `ROOM_TOKEN` with the actual token for each room.

---

## 📱 **Option 3: Browser-Based Generator**

I can create a simple HTML page that generates QR codes in your browser:

### Step 1: Create QR Generator Page
```html
<!DOCTYPE html>
<html>
<head>
    <title>QR Code Generator</title>
    <script src="https://cdn.jsdelivr.net/npm/qrcode@1.5.3/build/qrcode.min.js"></script>
</head>
<body>
    <h1>Room QR Code Generator</h1>
    <div id="qr-container"></div>
    <script>
        // Your room URLs here
        const rooms = [
            {name: "Room 101", url: "https://menu.theplazahoteledirne.com?token=qr_101_t9u2v5w8x1y4"},
            {name: "Room 102", url: "https://menu.theplazahoteledirne.com?token=qr_102_z7a0b3c6d9e2"},
            // Add all rooms...
        ];
        
        rooms.forEach(room => {
            const div = document.createElement('div');
            div.innerHTML = `<h3>${room.name}</h3>`;
            const canvas = document.createElement('canvas');
            div.appendChild(canvas);
            document.getElementById('qr-container').appendChild(div);
            
            QRCode.toCanvas(canvas, room.url, {width: 300}, function(error) {
                if (error) console.error(error);
            });
        });
    </script>
</body>
</html>
```

---

## 🎯 **Quick Start (Python Method)**

1. **Install Python** (if not installed)
2. **Install libraries:**
   ```bash
   pip install qrcode[pil] pillow
   ```
3. **Run generator:**
   ```bash
   python scripts/generate-qr-images.py
   ```
4. **Open gallery:**
   - Open `qr-codes-images/qr-codes-gallery.html`
   - Print or download individual images

## ✅ **What You Get**

- **60+ QR code images** (PNG format)
- **High quality** (300x300+ pixels)
- **Room labels** on each QR code
- **Print-ready** format
- **HTML gallery** for easy viewing
- **100% free** - no paid services needed

## 🔧 **Troubleshooting**

**Python not found:**
- Make sure Python is installed and in your PATH
- Try `python3` instead of `python`

**Libraries not installing:**
- Try `pip3` instead of `pip`
- On Windows, try `py -m pip install qrcode[pil] pillow`

**Permission errors:**
- Try `pip install --user qrcode[pil] pillow`
- Or use `sudo` on Linux/macOS

**Script not running:**
- Make sure you're in the correct directory
- Check that `data/tokens.json` exists

## 📞 **Need Help?**

If you encounter any issues:
1. Check that Python is installed: `python --version`
2. Check that libraries are installed: `pip list | grep qrcode`
3. Make sure you're in the project directory
4. Verify `data/tokens.json` exists and is valid

The Python script is the most reliable and gives you the best results! 