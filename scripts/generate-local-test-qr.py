#!/usr/bin/env python3
"""
Local Development QR Code Generator for La Strada Hotel
Generates QR codes pointing to localhost:3000 for local testing.
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

# Configuration for local testing
LOCAL_URL = "http://localhost:3000"
OUTPUT_DIR = "local-test-qr"
TOKENS_FILE = "data/tokens.json"

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

def get_test_locations(tokens):
    """Get a sample of locations for testing"""
    test_locations = []
    
    # Get a few examples from each type
    room_count = 0
    restaurant_count = 0
    garden_count = 0
    
    for key, data in tokens.items():
        location_type = data.get('type')
        
        # Add a few rooms for testing
        if location_type == 'room' and room_count < 5:
            test_locations.append({
                'location_id': key,
                'location_name': data['name'],
                'token': data['token'],
                'qr_url': f"{LOCAL_URL}?token={data['token']}",
                'type': location_type
            })
            room_count += 1
        
        # Add a few restaurant tables for testing
        elif location_type == 'restaurant' and restaurant_count < 3:
            test_locations.append({
                'location_id': key,
                'location_name': data['name'],
                'token': data['token'],
                'qr_url': f"{LOCAL_URL}?token={data['token']}",
                'type': location_type
            })
            restaurant_count += 1
        
        # Add a few garden tables for testing
        elif location_type == 'garden' and garden_count < 3:
            test_locations.append({
                'location_id': key,
                'location_name': data['name'],
                'token': data['token'],
                'qr_url': f"{LOCAL_URL}?token={data['token']}",
                'type': location_type
            })
            garden_count += 1
    
    return test_locations

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

def create_test_gallery(test_locations, output_dir):
    """Create an HTML gallery for local testing"""
    html_content = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>La Strada Hotel - Local Test QR Codes</title>
    <style>
        body {{ font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }}
        .header {{ text-align: center; margin-bottom: 30px; background: white; padding: 30px; border-radius: 15px; box-shadow: 0 4px 10px rgba(0,0,0,0.1); }}
        .header h1 {{ color: #2c3e50; margin-bottom: 10px; }}
        .alert {{ background: #fff3cd; border: 1px solid #ffeaa7; color: #856404; padding: 15px; border-radius: 10px; margin-bottom: 30px; }}
        .gallery {{ display: grid; grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); gap: 25px; }}
        .qr-item {{ background: white; padding: 25px; border-radius: 15px; text-align: center; box-shadow: 0 4px 10px rgba(0,0,0,0.1); }}
        .qr-item img {{ max-width: 200px; height: 200px; border: 2px solid #ecf0f1; border-radius: 10px; }}
        .location-title {{ font-size: 20px; font-weight: bold; margin-bottom: 15px; color: #2c3e50; }}
        .location-type {{ font-size: 14px; color: #7f8c8d; margin-bottom: 10px; padding: 5px 10px; border-radius: 15px; display: inline-block; }}
        .room {{ background: #e3f2fd; color: #1976d2; }}
        .restaurant {{ background: #e8f5e8; color: #388e3c; }}
        .garden {{ background: #f3e5f5; color: #7b1fa2; }}
        .token-info {{ font-size: 12px; color: #7f8c8d; margin: 10px 0; font-family: 'Courier New', monospace; background: #f8f9fa; padding: 8px; border-radius: 5px; }}
        .url-info {{ font-size: 11px; color: #95a5a6; margin: 10px 0; word-break: break-all; background: #f8f9fa; padding: 8px; border-radius: 5px; }}
        .test-btn {{ display: inline-block; margin: 5px; padding: 10px 20px; background: #28a745; color: white; text-decoration: none; border-radius: 8px; transition: background 0.3s; }}
        .test-btn:hover {{ background: #218838; }}
        .instructions {{ background: linear-gradient(135deg, #74b9ff, #0984e3); color: white; padding: 25px; border-radius: 15px; margin-bottom: 30px; }}
        .instructions h3 {{ margin-top: 0; }}
    </style>
</head>
<body>
    <div class="header">
        <h1>🧪 La Strada Hotel - Local Test QR Codes</h1>
        <p>QR codes for testing on your local development server</p>
        <p><strong>Server:</strong> {LOCAL_URL} | <strong>Test Locations:</strong> {len(test_locations)}</p>
    </div>
    
    <div class="alert">
        <h4>🚀 Local Testing Instructions:</h4>
        <ol>
            <li><strong>Make sure your server is running:</strong> <code>npm run dev</code> or <code>yarn dev</code></li>
            <li><strong>Scan QR codes with your phone</strong> (make sure phone is on same WiFi network)</li>
            <li><strong>Test the flow:</strong> QR scan → Language selection → Menu → Cart → Checkout</li>
            <li><strong>Verify location detection:</strong> Check that the correct room/table is detected</li>
        </ol>
        <p><strong>Note:</strong> Your phone must be on the same WiFi network as your computer for localhost to work!</p>
    </div>
    
    <div class="instructions">
        <h3>📱 Testing Checklist:</h3>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px;">
            <div>
                <h4>✅ QR Code Scanning</h4>
                <ul>
                    <li>QR codes scan correctly</li>
                    <li>Redirects to localhost:3000</li>
                    <li>Token parameter is included</li>
                </ul>
            </div>
            <div>
                <h4>✅ Access Control</h4>
                <ul>
                    <li>Valid tokens are accepted</li>
                    <li>Location is detected correctly</li>
                    <li>Restaurant hours validation works</li>
                </ul>
            </div>
            <div>
                <h4>✅ User Flow</h4>
                <ul>
                    <li>Language selection appears</li>
                    <li>Menu loads with location context</li>
                    <li>Cart shows correct location</li>
                </ul>
            </div>
            <div>
                <h4>✅ Ordering Process</h4>
                <ul>
                    <li>Items can be added to cart</li>
                    <li>Checkout shows location info</li>
                    <li>Orders include location data</li>
                </ul>
            </div>
        </div>
    </div>
    
    <div class="gallery">
"""
    
    for location in test_locations:
        filename = f"local-qr-{location['location_id']}.png"
        type_class = location['type']
        
        html_content += f"""
        <div class="qr-item">
            <div class="location-type {type_class}">{location['type'].title()}</div>
            <div class="location-title">{location['location_name']}</div>
            <img src="{filename}" alt="QR Code for {location['location_name']}">
            <div class="token-info">Token: {location['token']}</div>
            <div class="url-info">{location['qr_url']}</div>
            <a href="{location['qr_url']}" target="_blank" class="test-btn">🌐 Test in Browser</a>
            <a href="{filename}" download class="test-btn">📱 Download QR</a>
        </div>
"""
    
    html_content += """
    </div>
    
    <div style="margin-top: 40px; text-align: center; color: #7f8c8d; background: white; padding: 25px; border-radius: 15px; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
        <h3>🧪 Local Development Testing</h3>
        <p>These QR codes point to your local development server for testing the complete user experience.</p>
        <p><strong>Remember:</strong> Your phone needs to be on the same WiFi network to access localhost!</p>
        <p>Once testing is complete, use the production QR codes that point to your live domain.</p>
    </div>
</body>
</html>"""
    
    with open(os.path.join(output_dir, "local-test-gallery.html"), 'w', encoding='utf-8') as f:
        f.write(html_content)

def main():
    print("🧪 La Strada Hotel - Local Test QR Generator")
    print("=" * 60)
    
    # Load tokens
    print("📖 Loading location data...")
    tokens = load_tokens()
    
    if not tokens:
        print("❌ No tokens found. Cannot generate test QR codes.")
        return
    
    test_locations = get_test_locations(tokens)
    
    print(f"✅ Selected {len(test_locations)} locations for testing:")
    
    # Group by type for display
    by_type = {}
    for loc in test_locations:
        loc_type = loc['type']
        if loc_type not in by_type:
            by_type[loc_type] = []
        by_type[loc_type].append(loc)
    
    for loc_type, locations in by_type.items():
        print(f"   {loc_type.title()}: {len(locations)} locations")
        for loc in locations:
            print(f"     - {loc['location_name']}")
    
    # Create output directory
    output_dir = OUTPUT_DIR
    os.makedirs(output_dir, exist_ok=True)
    print(f"\n📁 Output directory: {output_dir}")
    
    # Generate QR codes
    print(f"\n🎨 Generating {len(test_locations)} test QR codes...")
    success_count = 0
    
    for i, location in enumerate(test_locations, 1):
        filename = f"local-qr-{location['location_id']}.png"
        output_path = os.path.join(output_dir, filename)
        
        try:
            create_qr_code(location['qr_url'], output_path)
            print(f"  ✅ {i:2d}/{len(test_locations)} - {location['location_name']} -> {filename}")
            success_count += 1
        except Exception as e:
            print(f"  ❌ {i:2d}/{len(test_locations)} - {location['location_name']} -> Error: {e}")
    
    # Create test gallery
    print("\n🌐 Creating test gallery...")
    create_test_gallery(test_locations, output_dir)
    
    # Summary
    print("\n" + "=" * 60)
    print("🎉 Local test QR codes generated!")
    print(f"✅ Successfully generated: {success_count}/{len(test_locations)} QR codes")
    print(f"📂 Files saved in: {output_dir}/")
    print(f"🌐 View gallery: {output_dir}/local-test-gallery.html")
    
    print(f"\n🧪 Testing setup:")
    print(f"   🌐 Local server: {LOCAL_URL}")
    print(f"   📱 Test QR codes: {success_count}")
    print(f"   🏨 Sample locations from all areas")
    
    print("\n📋 Next steps:")
    print("1. Make sure your dev server is running on port 3000")
    print("2. Open local-test-gallery.html in your browser")
    print("3. Scan QR codes with your phone (same WiFi network)")
    print("4. Test the complete user flow")
    print("5. Verify location detection and ordering")
    
    print("\n💡 Pro tip:")
    print("   Use 'Test in Browser' buttons to quickly test URLs")
    print("   Your phone must be on the same WiFi for localhost access")

if __name__ == "__main__":
    main() 