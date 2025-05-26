#!/usr/bin/env python3
"""
Master QR Code Gallery Creator for La Strada Hotel
Combines all QR codes from different sources into one comprehensive gallery.
"""

import json
import os
import shutil
from pathlib import Path

# Configuration
BASE_URL = "https://menu.theplazahoteledirne.com"
TOKENS_FILE = "data/tokens.json"
ROOMS_DIR = "qr-codes-images"
RESTAURANT_GARDEN_DIR = "all-qr-codes"
OUTPUT_DIR = "master-qr-gallery"

def load_tokens():
    """Load tokens from JSON file"""
    try:
        with open(TOKENS_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    except FileNotFoundError:
        print(f"❌ Error: {TOKENS_FILE} not found!")
        return {}
    except json.JSONDecodeError:
        print(f"❌ Error: Invalid JSON in {TOKENS_FILE}")
        return {}

def get_all_locations(tokens):
    """Extract all location data from tokens"""
    locations = {
        'room': [],  # Changed from 'rooms' to 'room' to match token type
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
        # Handle numeric IDs (like S1, S10, B1, B10, 101, 201)
        if location_id.isdigit():
            return (0, int(location_id))
        elif len(location_id) > 1 and location_id[1:].isdigit():
            return (1, int(location_id[1:]))
        # Handle alphanumeric IDs
        return (2, location_id)
    
    for category in locations:
        locations[category] = sorted(locations[category], key=sort_key)
    
    return locations

def copy_qr_files(locations, output_dir):
    """Copy QR code files from source directories to master directory"""
    os.makedirs(output_dir, exist_ok=True)
    
    copied_files = {
        'room': 0,
        'restaurant': 0,
        'garden': 0
    }
    
    # Copy room QR codes
    if os.path.exists(ROOMS_DIR):
        for location in locations['room']:
            src_file = os.path.join(ROOMS_DIR, f"qr-{location['location_id']}.png")
            dst_file = os.path.join(output_dir, f"qr-{location['location_id']}.png")
            
            if os.path.exists(src_file):
                shutil.copy2(src_file, dst_file)
                copied_files['room'] += 1
    
    # Copy restaurant and garden QR codes
    if os.path.exists(RESTAURANT_GARDEN_DIR):
        for category in ['restaurant', 'garden']:
            for location in locations[category]:
                src_file = os.path.join(RESTAURANT_GARDEN_DIR, f"qr-{location['location_id']}.png")
                dst_file = os.path.join(output_dir, f"qr-{location['location_id']}.png")
                
                if os.path.exists(src_file):
                    shutil.copy2(src_file, dst_file)
                    copied_files[category] += 1
    
    return copied_files

def create_master_gallery(locations, output_dir):
    """Create a comprehensive HTML gallery of all QR codes"""
    total_locations = sum(len(locations[cat]) for cat in locations)
    
    html_content = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>La Strada Hotel - Master QR Codes Gallery</title>
    <style>
        body {{ font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }}
        .header {{ text-align: center; margin-bottom: 30px; background: white; padding: 30px; border-radius: 15px; box-shadow: 0 4px 10px rgba(0,0,0,0.1); }}
        .header h1 {{ color: #2c3e50; margin-bottom: 10px; }}
        .header p {{ color: #7f8c8d; margin: 5px 0; }}
        .stats {{ display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 25px; margin-bottom: 40px; }}
        .stat-card {{ background: white; padding: 25px; border-radius: 15px; text-align: center; box-shadow: 0 4px 10px rgba(0,0,0,0.1); transition: transform 0.3s; }}
        .stat-card:hover {{ transform: translateY(-5px); }}
        .stat-number {{ font-size: 2.5em; font-weight: bold; margin-bottom: 10px; }}
        .rooms .stat-number {{ color: #3498db; }}
        .restaurant .stat-number {{ color: #27ae60; }}
        .garden .stat-number {{ color: #9b59b6; }}
        .total .stat-number {{ color: #e74c3c; }}
        .section {{ margin-bottom: 50px; }}
        .section-title {{ font-size: 28px; font-weight: bold; margin-bottom: 25px; padding: 20px; background: white; border-radius: 15px; text-align: center; box-shadow: 0 4px 10px rgba(0,0,0,0.1); }}
        .rooms .section-title {{ background: linear-gradient(135deg, #3498db, #2980b9); color: white; }}
        .restaurant .section-title {{ background: linear-gradient(135deg, #27ae60, #229954); color: white; }}
        .garden .section-title {{ background: linear-gradient(135deg, #9b59b6, #8e44ad); color: white; }}
        .gallery {{ display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 25px; }}
        .qr-item {{ background: white; padding: 25px; border-radius: 15px; text-align: center; box-shadow: 0 4px 10px rgba(0,0,0,0.1); transition: transform 0.3s; }}
        .qr-item:hover {{ transform: translateY(-5px); }}
        .qr-item img {{ max-width: 220px; height: 220px; border: 2px solid #ecf0f1; border-radius: 10px; }}
        .location-title {{ font-size: 20px; font-weight: bold; margin-bottom: 15px; color: #2c3e50; }}
        .token-info {{ font-size: 12px; color: #7f8c8d; margin: 10px 0; font-family: 'Courier New', monospace; background: #f8f9fa; padding: 5px; border-radius: 5px; }}
        .url-info {{ font-size: 10px; color: #95a5a6; margin: 10px 0; word-break: break-all; }}
        .download-btn {{ display: inline-block; margin-top: 15px; padding: 12px 24px; background: #3498db; color: white; text-decoration: none; border-radius: 8px; transition: background 0.3s; }}
        .download-btn:hover {{ background: #2980b9; }}
        .instructions {{ background: linear-gradient(135deg, #74b9ff, #0984e3); color: white; padding: 25px; border-radius: 15px; margin-bottom: 40px; }}
        .instructions h3 {{ margin-top: 0; }}
        .footer {{ margin-top: 50px; text-align: center; color: #7f8c8d; background: white; padding: 25px; border-radius: 15px; box-shadow: 0 4px 10px rgba(0,0,0,0.1); }}
        @media print {{ 
            .qr-item {{ page-break-inside: avoid; margin-bottom: 20px; }}
            .download-btn, .instructions {{ display: none; }}
        }}
    </style>
</head>
<body>
    <div class="header">
        <h1>🏨 La Strada Hotel - Master QR Codes Gallery</h1>
        <p>Complete collection of QR codes for all hotel locations</p>
        <p><strong>Total Locations: {total_locations}</strong> | Generated: {__import__('datetime').datetime.now().strftime('%Y-%m-%d %H:%M:%S')}</p>
    </div>
    
    <div class="stats">
                 <div class="stat-card rooms">
             <div class="stat-number">{len(locations['room'])}</div>
             <div><strong>Hotel Rooms</strong></div>
             <div style="font-size: 14px; color: #7f8c8d; margin-top: 5px;">Room Service Orders</div>
         </div>
         <div class="stat-card restaurant">
             <div class="stat-number">{len(locations['restaurant'])}</div>
             <div><strong>Restaurant Tables</strong></div>
             <div style="font-size: 14px; color: #7f8c8d; margin-top: 5px;">Dine-in Orders</div>
         </div>
         <div class="stat-card garden">
             <div class="stat-number">{len(locations['garden'])}</div>
             <div><strong>Garden Tables</strong></div>
             <div style="font-size: 14px; color: #7f8c8d; margin-top: 5px;">Outdoor Dining</div>
         </div>
        <div class="stat-card total">
            <div class="stat-number">{total_locations}</div>
            <div><strong>Total QR Codes</strong></div>
            <div style="font-size: 14px; color: #7f8c8d; margin-top: 5px;">Complete Coverage</div>
        </div>
    </div>
    
    <div class="instructions">
        <h3>📋 How to Use This Master Gallery:</h3>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px;">
            <div>
                <h4>🖨️ Printing</h4>
                <ul>
                    <li>Use Ctrl+P (Cmd+P on Mac)</li>
                    <li>Print entire page or specific sections</li>
                    <li>Each QR code is print-optimized</li>
                </ul>
            </div>
            <div>
                <h4>💾 Downloading</h4>
                <ul>
                    <li>Click "Download PNG" for individual codes</li>
                    <li>Right-click images to save</li>
                    <li>All files available in master-qr-gallery folder</li>
                </ul>
            </div>
            <div>
                <h4>📱 Testing</h4>
                <ul>
                    <li>Scan with phone camera</li>
                    <li>Verify automatic location detection</li>
                    <li>Test ordering process</li>
                </ul>
            </div>
            <div>
                <h4>🏨 Distribution</h4>
                <ul>
                    <li>Place in corresponding locations</li>
                    <li>Consider laminating for durability</li>
                    <li>Ensure good lighting for scanning</li>
                </ul>
            </div>
        </div>
    </div>
"""

    # Generate sections for each location type
    section_configs = [
        ('room', '🏨 Hotel Rooms', 'rooms'),
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
                <img src="{filename}" alt="QR Code for {location['location_name']}" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">
                <div style="display:none; color:#e74c3c; padding:20px;">QR Code Image Not Found</div>
                <div class="token-info">Token: {location['token']}</div>
                <div class="url-info">{location['qr_url']}</div>
                <a href="{filename}" download class="download-btn">Download PNG</a>
            </div>
"""
            html_content += """
        </div>
    </div>
"""
    
    html_content += f"""
    <div class="footer">
        <h3>🏨 La Strada Hotel Digital Menu System</h3>
        <p>Complete QR code solution for seamless guest experience</p>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-top: 20px;">
                         <div>
                 <strong>🏨 Hotel Rooms ({len(locations['room'])})</strong><br>
                 <small>Room service ordering with automatic room detection</small>
             </div>
             <div>
                 <strong>🍽️ Restaurant Tables ({len(locations['restaurant'])})</strong><br>
                 <small>Dine-in ordering system for indoor dining</small>
             </div>
             <div>
                 <strong>🌿 Garden Tables ({len(locations['garden'])})</strong><br>
                 <small>Outdoor dining experience with table service</small>
             </div>
        </div>
        <p style="margin-top: 20px; color: #95a5a6;">
            Each QR code automatically detects the location and provides a customized menu experience
        </p>
    </div>
</body>
</html>"""
    
    with open(os.path.join(output_dir, "master-qr-gallery.html"), 'w', encoding='utf-8') as f:
        f.write(html_content)

def main():
    print("🏨 La Strada Hotel - Master QR Gallery Creator")
    print("=" * 60)
    
    # Load tokens
    print("📖 Loading location data...")
    tokens = load_tokens()
    locations = get_all_locations(tokens)
    
    # Display summary
    total_locations = sum(len(locations[cat]) for cat in locations)
    print(f"✅ Found {total_locations} total locations:")
    print(f"   🏨 Hotel Rooms: {len(locations['room'])}")
    print(f"   🍽️  Restaurant Tables: {len(locations['restaurant'])}")
    print(f"   🌿 Garden Tables: {len(locations['garden'])}")
    
    # Create master output directory
    print(f"\n📁 Creating master gallery directory: {OUTPUT_DIR}")
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    
    # Copy QR code files
    print("\n📋 Copying QR code files...")
    copied_files = copy_qr_files(locations, OUTPUT_DIR)
    
    print(f"   ✅ Rooms: {copied_files['room']}/{len(locations['room'])} files copied")
    print(f"   ✅ Restaurant: {copied_files['restaurant']}/{len(locations['restaurant'])} files copied")
    print(f"   ✅ Garden: {copied_files['garden']}/{len(locations['garden'])} files copied")
    
    # Create master HTML gallery
    print("\n🌐 Creating master HTML gallery...")
    create_master_gallery(locations, OUTPUT_DIR)
    
    # Summary
    total_copied = sum(copied_files.values())
    print("\n" + "=" * 60)
    print("🎉 Master QR Gallery creation complete!")
    print(f"✅ Successfully copied: {total_copied}/{total_locations} QR code files")
    print(f"📂 Master gallery: {OUTPUT_DIR}/")
    print(f"🌐 View gallery: {OUTPUT_DIR}/master-qr-gallery.html")
    
    print("\n📋 What you now have:")
    print(f"   📂 {OUTPUT_DIR}/ - All QR code PNG files")
    print(f"   🌐 master-qr-gallery.html - Beautiful comprehensive gallery")
    print(f"   🏨 {len(locations['room'])} hotel room QR codes")
    print(f"   🍽️  {len(locations['restaurant'])} restaurant table QR codes")
    print(f"   🌿 {len(locations['garden'])} garden table QR codes")
    
    print("\n📋 Next steps:")
    print("1. Open master-qr-gallery.html in your browser")
    print("2. Print sections or download individual QR codes")
    print("3. Distribute to all hotel locations")
    print("4. Test with phone cameras")
    print("5. Train staff on the QR system")
    
    if total_copied == total_locations:
        print(f"\n🎊 Perfect! Complete QR coverage achieved!")
        print("   ✅ Every location has a unique QR code")
        print("   ✅ Automatic location detection enabled")
        print("   ✅ Seamless guest ordering experience")
    else:
        missing = total_locations - total_copied
        print(f"\n⚠️  Note: {missing} QR code files were not found")
        print("   Run the individual generators first if needed")

if __name__ == "__main__":
    main() 