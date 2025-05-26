#!/usr/bin/env python3
"""
Simple QR Code Image Generator for La Strada Hotel
Generates QR code images without text labels to avoid compatibility issues.
"""

import json
import os
import sys

try:
    import qrcode
except ImportError:
    print("❌ Required library not installed!")
    print("📦 Please install it with:")
    print("   pip install qrcode[pil]")
    print("\nOr if you have pip3:")
    print("   pip3 install qrcode[pil]")
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

def create_qr_code(url, output_path):
    """Create a simple QR code image"""
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
    
    # Save image
    qr_img.save(output_path, 'PNG')
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
        .gallery {{ display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px; }}
        .qr-item {{ background: white; padding: 20px; border-radius: 10px; text-align: center; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }}
        .qr-item img {{ max-width: 200px; height: 200px; border: 1px solid #ddd; }}
        .room-title {{ font-size: 20px; font-weight: bold; margin-bottom: 15px; color: #333; }}
        .token-info {{ font-size: 12px; color: #666; margin: 10px 0; font-family: monospace; }}
        .url-info {{ font-size: 11px; color: #888; margin: 10px 0; word-break: break-all; }}
        .download-btn {{ display: inline-block; margin-top: 15px; padding: 10px 20px; background: #007bff; color: white; text-decoration: none; border-radius: 5px; }}
        .download-btn:hover {{ background: #0056b3; }}
        .instructions {{ background: #e7f3ff; padding: 20px; border-radius: 10px; margin-bottom: 30px; }}
        @media print {{ 
            .qr-item {{ page-break-inside: avoid; margin-bottom: 20px; }}
            .download-btn {{ display: none; }}
        }}
    </style>
</head>
<body>
    <div class="header">
        <h1>🏨 La Strada Hotel - QR Codes</h1>
        <p>Total Rooms: {len(rooms)} | Generated: {__import__('datetime').datetime.now().strftime('%Y-%m-%d %H:%M:%S')}</p>
    </div>
    
    <div class="instructions">
        <h3>📋 How to Use:</h3>
        <ul>
            <li><strong>Print All:</strong> Use Ctrl+P (Cmd+P on Mac) to print this entire page</li>
            <li><strong>Download Individual:</strong> Click the "Download PNG" button under each QR code</li>
            <li><strong>Right-click Save:</strong> Right-click any QR code image and "Save image as..."</li>
            <li><strong>Size:</strong> Each QR code is 200x200 pixels, perfect for printing at 3cm x 3cm</li>
            <li><strong>Test:</strong> Scan with your phone camera to verify they work</li>
        </ul>
        <p><strong>💡 Tip:</strong> Cut out each QR code and place it in the corresponding room. Consider laminating for durability!</p>
    </div>
    
    <div class="gallery">
"""
    
    for room in rooms:
        filename = f"qr-{room['room_number']}.png"
        html_content += f"""
        <div class="qr-item">
            <div class="room-title">{room['room_name']}</div>
            <img src="{filename}" alt="QR Code for {room['room_name']}">
            <div class="token-info">Token: {room['token']}</div>
            <div class="url-info">{room['qr_url']}</div>
            <a href="{filename}" download class="download-btn">Download PNG</a>
        </div>
"""
    
    html_content += """
    </div>
    
    <div style="margin-top: 40px; text-align: center; color: #666;">
        <p>🏨 La Strada Hotel Digital Menu System</p>
        <p>Each QR code links directly to the menu with automatic room detection</p>
    </div>
</body>
</html>"""
    
    with open(os.path.join(output_dir, "qr-codes-gallery.html"), 'w', encoding='utf-8') as f:
        f.write(html_content)

def main():
    print("🏨 La Strada Hotel - Simple QR Code Generator")
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
            create_qr_code(room['qr_url'], output_path)
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
    else:
        print(f"\n🎊 Perfect! All {success_count} QR codes generated successfully!")

if __name__ == "__main__":
    main() 