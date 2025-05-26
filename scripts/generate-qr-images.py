#!/usr/bin/env python3
"""
QR Code Image Generator for La Strada Hotel
Generates actual QR code images for all hotel rooms using the free qrcode library.
"""

import json
import os
import sys
from pathlib import Path

try:
    import qrcode
    from PIL import Image, ImageDraw, ImageFont
except ImportError:
    print("❌ Required libraries not installed!")
    print("📦 Please install them with:")
    print("   pip install qrcode[pil] pillow")
    print("\nOr if you have pip3:")
    print("   pip3 install qrcode[pil] pillow")
    sys.exit(1)

# Configuration
BASE_URL = "https://menu.theplazahoteledirne.com"
OUTPUT_DIR = "qr-codes-images"
TOKENS_FILE = "data/tokens.json"

def load_tokens():
    """Load tokens from JSON file"""
    try:
        with open(TOKENS_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    except FileNotFoundError:
        print(f"❌ Error: {TOKENS_FILE} not found!")
        sys.exit(1)
    except json.JSONDecodeError:
        print(f"❌ Error: Invalid JSON in {TOKENS_FILE}")
        sys.exit(1)

def get_room_data(tokens):
    """Extract room data from tokens"""
    rooms = []
    for key, data in tokens.items():
        if data.get('type') == 'room':
            rooms.append({
                'room_number': key,
                'room_name': data['name'],
                'token': data['token'],
                'qr_url': f"{BASE_URL}?token={data['token']}"
            })
    
    # Sort rooms by number
    def sort_key(room):
        room_num = room['room_number']
        # Handle numeric rooms
        if room_num.isdigit():
            return (0, int(room_num))
        # Handle alphanumeric rooms (L1, EP1, etc.)
        return (1, room_num)
    
    return sorted(rooms, key=sort_key)

def create_qr_code(url, room_name, output_path):
    """Create a QR code image with room label"""
    # Create QR code
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_M,
        box_size=10,
        border=4,
    )
    qr.add_data(url)
    qr.make(fit=True)
    
    # Create QR code image
    qr_img = qr.make_image(fill_color="black", back_color="white")
    
    # Create a larger image with room label
    img_width = qr_img.width
    img_height = qr_img.height + 80  # Extra space for text
    
    # Create new image with white background
    final_img = Image.new('RGB', (img_width, img_height), 'white')
    
    # Paste QR code
    final_img.paste(qr_img, (0, 0))
    
    # Add room label
    draw = ImageDraw.Draw(final_img)
    
    # Try to use a nice font, fall back to default if not available
    try:
        font = ImageFont.truetype("arial.ttf", 24)
    except:
        try:
            font = ImageFont.truetype("/System/Library/Fonts/Arial.ttf", 24)  # macOS
        except:
            try:
                font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 24)  # Linux
            except:
                font = ImageFont.load_default()
    
    # Calculate text position (centered)
    text = room_name
    try:
        bbox = draw.textbbox((0, 0), text, font=font)
        text_width = bbox[2] - bbox[0]
        text_x = (img_width - text_width) // 2
    except:
        # Fallback for older PIL versions
        text_width = len(text) * 12  # Approximate width
        text_x = (img_width - text_width) // 2
    
    text_y = qr_img.height + 20
    
    # Draw text
    draw.text((text_x, text_y), text, fill="black", font=font)
    
    # Save image
    final_img.save(output_path, 'PNG', quality=95)
    return True

def create_html_gallery(rooms, output_dir):
    """Create an HTML gallery of all QR codes"""
    html_content = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>La Strada Hotel - QR Codes Gallery</title>
    <style>
        body {{ font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }}
        .header {{ text-align: center; margin-bottom: 30px; background: white; padding: 20px; border-radius: 10px; }}
        .gallery {{ display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; }}
        .qr-item {{ background: white; padding: 15px; border-radius: 10px; text-align: center; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }}
        .qr-item img {{ max-width: 100%; height: auto; }}
        .room-title {{ font-size: 18px; font-weight: bold; margin-bottom: 10px; color: #333; }}
        .download-btn {{ display: inline-block; margin-top: 10px; padding: 8px 16px; background: #007bff; color: white; text-decoration: none; border-radius: 5px; }}
        .download-btn:hover {{ background: #0056b3; }}
        .instructions {{ background: #e7f3ff; padding: 20px; border-radius: 10px; margin-bottom: 30px; }}
        @media print {{ .qr-item {{ page-break-inside: avoid; }} }}
    </style>
</head>
<body>
    <div class="header">
        <h1>🏨 La Strada Hotel - QR Codes</h1>
        <p>Total Rooms: {len(rooms)} | Generated: {__import__('datetime').datetime.now().strftime('%Y-%m-%d %H:%M:%S')}</p>
    </div>
    
    <div class="instructions">
        <h3>📋 Instructions:</h3>
        <ul>
            <li><strong>Print:</strong> Use your browser's print function to print all QR codes</li>
            <li><strong>Download Individual:</strong> Right-click on any QR code image and "Save image as..."</li>
            <li><strong>Bulk Download:</strong> All images are saved in the <code>qr-codes-images</code> folder</li>
            <li><strong>Size:</strong> Each QR code is optimized for printing at 3cm x 3cm</li>
        </ul>
    </div>
    
    <div class="gallery">
"""
    
    for room in rooms:
        filename = f"qr-{room['room_number']}.png"
        html_content += f"""
        <div class="qr-item">
            <div class="room-title">{room['room_name']}</div>
            <img src="{filename}" alt="QR Code for {room['room_name']}">
            <div style="font-size: 12px; color: #666; margin-top: 5px;">
                Token: {room['token'][:20]}...
            </div>
            <a href="{filename}" download class="download-btn">Download PNG</a>
        </div>
"""
    
    html_content += """
    </div>
</body>
</html>"""
    
    with open(os.path.join(output_dir, "qr-codes-gallery.html"), 'w', encoding='utf-8') as f:
        f.write(html_content)

def main():
    print("🏨 La Strada Hotel - QR Code Image Generator")
    print("=" * 50)
    
    # Load tokens
    print("📖 Loading room data...")
    tokens = load_tokens()
    rooms = get_room_data(tokens)
    
    print(f"✅ Found {len(rooms)} rooms")
    
    # Create output directory
    output_dir = OUTPUT_DIR
    os.makedirs(output_dir, exist_ok=True)
    print(f"📁 Output directory: {output_dir}")
    
    # Generate QR codes
    print("\n🎨 Generating QR code images...")
    success_count = 0
    
    for i, room in enumerate(rooms, 1):
        filename = f"qr-{room['room_number']}.png"
        output_path = os.path.join(output_dir, filename)
        
        try:
            create_qr_code(room['qr_url'], room['room_name'], output_path)
            print(f"  ✅ {i:2d}/{len(rooms)} - {room['room_name']} -> {filename}")
            success_count += 1
        except Exception as e:
            print(f"  ❌ {i:2d}/{len(rooms)} - {room['room_name']} -> Error: {e}")
    
    # Create HTML gallery
    print("\n🌐 Creating HTML gallery...")
    create_html_gallery(rooms, output_dir)
    
    # Summary
    print("\n" + "=" * 50)
    print("🎉 QR Code generation complete!")
    print(f"✅ Successfully generated: {success_count}/{len(rooms)} QR codes")
    print(f"📂 Files saved in: {output_dir}/")
    print(f"🌐 View gallery: {output_dir}/qr-codes-gallery.html")
    
    print("\n📋 Next steps:")
    print("1. Open qr-codes-gallery.html in your browser")
    print("2. Print the page or download individual images")
    print("3. Cut out QR codes and place in rooms")
    print("4. Test with your phone camera")
    
    if success_count < len(rooms):
        print(f"\n⚠️  Warning: {len(rooms) - success_count} QR codes failed to generate")

if __name__ == "__main__":
    main() 