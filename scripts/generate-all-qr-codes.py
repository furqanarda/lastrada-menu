#!/usr/bin/env python3
"""
Complete QR Code Generator for La Strada Hotel
Generates QR codes for ALL locations: hotel rooms, restaurant tables, and garden tables.
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
OUTPUT_DIR = "all-qr-codes"
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

def get_all_locations(tokens):
    """Extract all location data from tokens"""
    locations = {
        'rooms': [],
        'restaurant': [],
        'garden': []
    }
    
    for key, data in tokens.items():
        location_type = data.get('type')
        if location_type in locations:
            locations[location_type].append({
                'location_id': key,
                'location_name': data['name'],
                'token': data['token'],
                'qr_url': f"{BASE_URL}?token={data['token']}",
                'type': location_type
            })
    
    # Sort each category
    def sort_key(item):
        location_id = item['location_id']
        # Handle numeric IDs (like S1, S10, B1, B10)
        if location_id[1:].isdigit():
            return (0, int(location_id[1:]))
        # Handle alphanumeric IDs
        return (1, location_id)
    
    for category in locations:
        locations[category] = sorted(locations[category], key=sort_key)
    
    return locations

def create_qr_code(url, output_path):
    """Create a QR code image"""
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_M,
        box_size=10,
        border=4,
    )
    qr.add_data(url)
    qr.make(fit=True)
    
    qr_img = qr.make_image(fill_color="black", back_color="white")
    qr_img.save(output_path, 'PNG')
    return True

def create_html_gallery(locations, output_dir):
    """Create an HTML gallery of all QR codes"""
    total_locations = sum(len(locations[cat]) for cat in locations)
    
    html_content = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>La Strada Hotel - Complete QR Codes Gallery</title>
    <style>
        body {{ font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }}
        .header {{ text-align: center; margin-bottom: 30px; background: white; padding: 20px; border-radius: 10px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }}
        .stats {{ display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }}
        .stat-card {{ background: white; padding: 20px; border-radius: 10px; text-align: center; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }}
        .stat-number {{ font-size: 2em; font-weight: bold; margin-bottom: 10px; }}
        .rooms .stat-number {{ color: #007bff; }}
        .restaurant .stat-number {{ color: #28a745; }}
        .garden .stat-number {{ color: #6f42c1; }}
        .section {{ margin-bottom: 40px; }}
        .section-title {{ font-size: 24px; font-weight: bold; margin-bottom: 20px; padding: 15px; background: white; border-radius: 10px; text-align: center; }}
        .rooms .section-title {{ background: #e3f2fd; color: #1976d2; }}
        .restaurant .section-title {{ background: #e8f5e8; color: #388e3c; }}
        .garden .section-title {{ background: #f3e5f5; color: #7b1fa2; }}
        .gallery {{ display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px; }}
        .qr-item {{ background: white; padding: 20px; border-radius: 10px; text-align: center; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }}
        .qr-item img {{ max-width: 200px; height: 200px; border: 1px solid #ddd; }}
        .location-title {{ font-size: 18px; font-weight: bold; margin-bottom: 15px; color: #333; }}
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
        <h1>🏨 La Strada Hotel - Complete QR Codes</h1>
        <p>All QR codes for hotel rooms, restaurant tables, and garden tables</p>
        <p>Total Locations: {total_locations} | Generated: {__import__('datetime').datetime.now().strftime('%Y-%m-%d %H:%M:%S')}</p>
    </div>
    
    <div class="stats">
        <div class="stat-card rooms">
            <div class="stat-number">{len(locations['rooms'])}</div>
            <div>Hotel Rooms</div>
        </div>
        <div class="stat-card restaurant">
            <div class="stat-number">{len(locations['restaurant'])}</div>
            <div>Restaurant Tables</div>
        </div>
        <div class="stat-card garden">
            <div class="stat-number">{len(locations['garden'])}</div>
            <div>Garden Tables</div>
        </div>
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
        <p><strong>💡 Tip:</strong> Cut out each QR code and place it in the corresponding location. Consider laminating for durability!</p>
    </div>
"""

    # Generate sections for each location type
    section_configs = [
        ('rooms', '🏨 Hotel Rooms', 'rooms'),
        ('restaurant', '🍽️ Restaurant Tables', 'restaurant'), 
        ('garden', '🌿 Garden Tables', 'garden')
    ]
    
    for section_key, section_title, css_class in section_configs:
        if locations[section_key]:
            html_content += f"""
    <div class="section {css_class}">
        <div class="section-title">{section_title} ({len(locations[section_key])} locations)</div>
        <div class="gallery">
"""
            for location in locations[section_key]:
                filename = f"qr-{location['location_id']}.png"
                html_content += f"""
            <div class="qr-item">
                <div class="location-title">{location['location_name']}</div>
                <img src="{filename}" alt="QR Code for {location['location_name']}">
                <div class="token-info">Token: {location['token']}</div>
                <div class="url-info">{location['qr_url']}</div>
                <a href="{filename}" download class="download-btn">Download PNG</a>
            </div>
"""
            html_content += """
        </div>
    </div>
"""
    
    html_content += """
    <div style="margin-top: 40px; text-align: center; color: #666; background: white; padding: 20px; border-radius: 10px;">
        <h3>🏨 La Strada Hotel Digital Menu System</h3>
        <p>Each QR code links directly to the menu with automatic location detection</p>
        <p><strong>Hotel Rooms:</strong> Guests can order room service</p>
        <p><strong>Restaurant Tables:</strong> Dine-in ordering system</p>
        <p><strong>Garden Tables:</strong> Outdoor dining experience</p>
    </div>
</body>
</html>"""
    
    with open(os.path.join(output_dir, "all-qr-codes-gallery.html"), 'w', encoding='utf-8') as f:
        f.write(html_content)

def main():
    print("🏨 La Strada Hotel - Complete QR Code Generator")
    print("=" * 60)
    
    # Load tokens
    print("📖 Loading location data...")
    tokens = load_tokens()
    locations = get_all_locations(tokens)
    
    # Display summary
    total_locations = sum(len(locations[cat]) for cat in locations)
    print(f"✅ Found {total_locations} total locations:")
    print(f"   🏨 Hotel Rooms: {len(locations['rooms'])}")
    print(f"   🍽️  Restaurant Tables: {len(locations['restaurant'])}")
    print(f"   🌿 Garden Tables: {len(locations['garden'])}")
    
    # Create output directory
    output_dir = OUTPUT_DIR
    os.makedirs(output_dir, exist_ok=True)
    print(f"📁 Output directory: {output_dir}")
    
    # Generate QR codes for all locations
    print(f"\n🎨 Generating {total_locations} QR code images...")
    success_count = 0
    total_count = 0
    
    for category, items in locations.items():
        if items:
            print(f"\n📍 {category.title()}:")
            for i, location in enumerate(items, 1):
                total_count += 1
                filename = f"qr-{location['location_id']}.png"
                output_path = os.path.join(output_dir, filename)
                
                try:
                    create_qr_code(location['qr_url'], output_path)
                    print(f"  ✅ {i:2d}/{len(items)} - {location['location_name']} -> {filename}")
                    success_count += 1
                except Exception as e:
                    print(f"  ❌ {i:2d}/{len(items)} - {location['location_name']} -> Error: {e}")
    
    # Create HTML gallery
    print("\n🌐 Creating HTML gallery...")
    create_html_gallery(locations, output_dir)
    
    # Create separate directories for each type
    for category in locations:
        if locations[category]:
            category_dir = os.path.join(output_dir, category)
            os.makedirs(category_dir, exist_ok=True)
            
            # Copy QR codes to category-specific folders
            for location in locations[category]:
                filename = f"qr-{location['location_id']}.png"
                src_path = os.path.join(output_dir, filename)
                dst_path = os.path.join(category_dir, filename)
                
                if os.path.exists(src_path):
                    import shutil
                    shutil.copy2(src_path, dst_path)
    
    # Summary
    print("\n" + "=" * 60)
    print("🎉 QR Code generation complete!")
    print(f"✅ Successfully generated: {success_count}/{total_count} QR codes")
    print(f"📂 Files saved in: {output_dir}/")
    print(f"🌐 View gallery: {output_dir}/all-qr-codes-gallery.html")
    
    print(f"\n📁 Organized folders:")
    print(f"   📂 {output_dir}/rooms/ - Hotel room QR codes")
    print(f"   📂 {output_dir}/restaurant/ - Restaurant table QR codes") 
    print(f"   📂 {output_dir}/garden/ - Garden table QR codes")
    
    print("\n📋 Next steps:")
    print("1. Open all-qr-codes-gallery.html in your browser")
    print("2. Print the page or download individual images")
    print("3. Distribute QR codes to their respective locations")
    print("4. Test with your phone camera")
    
    if success_count < total_count:
        print(f"\n⚠️  Warning: {total_count - success_count} QR codes failed to generate")
    else:
        print(f"\n🎊 Perfect! All {success_count} QR codes generated successfully!")
        print("\n🏨 Your hotel now has complete QR coverage:")
        print("   ✅ All hotel rooms")
        print("   ✅ All restaurant tables") 
        print("   ✅ All garden tables")

if __name__ == "__main__":
    main() 