#!/usr/bin/env python3
"""
Complete Local Test URLs Generator for La Strada Hotel
Generates an HTML file with ALL test URLs for local development testing.
"""

import json
import os

# Configuration
LOCAL_URL = "http://localhost:3000"
TOKENS_FILE = "data/tokens.json"
OUTPUT_FILE = "complete-local-test-urls.html"

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
        'room': [],
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
                'qr_url': f"{LOCAL_URL}?token={data['token']}",
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

def create_complete_test_html(locations):
    """Create comprehensive HTML with all test URLs"""
    total_locations = sum(len(locations[cat]) for cat in locations)
    
    html_content = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>La Strada Hotel - Complete Local Test URLs</title>
    <style>
        body {{
            font-family: Arial, sans-serif;
            margin: 20px;
            background: #f5f5f5;
        }}
        .header {{
            text-align: center;
            margin-bottom: 30px;
            background: white;
            padding: 30px;
            border-radius: 15px;
            box-shadow: 0 4px 10px rgba(0,0,0,0.1);
        }}
        .stats {{
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }}
        .stat-card {{
            background: white;
            padding: 20px;
            border-radius: 15px;
            text-align: center;
            box-shadow: 0 4px 10px rgba(0,0,0,0.1);
        }}
        .stat-number {{
            font-size: 2em;
            font-weight: bold;
            margin-bottom: 10px;
        }}
        .rooms .stat-number {{ color: #3498db; }}
        .restaurant .stat-number {{ color: #27ae60; }}
        .garden .stat-number {{ color: #9b59b6; }}
        .total .stat-number {{ color: #e74c3c; }}
        .alert {{
            background: #d4edda;
            border: 1px solid #c3e6cb;
            color: #155724;
            padding: 20px;
            border-radius: 10px;
            margin-bottom: 30px;
        }}
        .test-sections {{
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
            gap: 30px;
        }}
        .test-section {{
            background: white;
            padding: 25px;
            border-radius: 15px;
            box-shadow: 0 4px 10px rgba(0,0,0,0.1);
        }}
        .section-title {{
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 20px;
            padding: 15px;
            border-radius: 10px;
            text-align: center;
        }}
        .rooms .section-title {{
            background: linear-gradient(135deg, #3498db, #2980b9);
            color: white;
        }}
        .restaurant .section-title {{
            background: linear-gradient(135deg, #27ae60, #229954);
            color: white;
        }}
        .garden .section-title {{
            background: linear-gradient(135deg, #9b59b6, #8e44ad);
            color: white;
        }}
        .test-links {{
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
            gap: 10px;
        }}
        .test-link {{
            display: block;
            padding: 12px 15px;
            background: #007bff;
            color: white;
            text-decoration: none;
            border-radius: 8px;
            transition: background 0.3s;
            text-align: center;
            font-weight: 500;
        }}
        .test-link:hover {{
            background: #0056b3;
            transform: translateY(-2px);
        }}
        .token-display {{
            font-size: 10px;
            color: rgba(255,255,255,0.8);
            font-family: monospace;
            margin-top: 5px;
        }}
        .search-box {{
            background: white;
            padding: 20px;
            border-radius: 15px;
            margin-bottom: 30px;
            box-shadow: 0 4px 10px rgba(0,0,0,0.1);
        }}
        .search-input {{
            width: 100%;
            padding: 12px;
            border: 2px solid #ddd;
            border-radius: 8px;
            font-size: 16px;
        }}
        .search-input:focus {{
            border-color: #007bff;
            outline: none;
        }}
        .server-status {{
            display: inline-block;
            padding: 8px 16px;
            border-radius: 20px;
            font-weight: bold;
            margin-left: 10px;
        }}
        .server-running {{
            background: #d4edda;
            color: #155724;
        }}
        .server-stopped {{
            background: #f8d7da;
            color: #721c24;
        }}
    </style>
</head>
<body>
    <div class="header">
        <h1>🧪 La Strada Hotel - Complete Local Test URLs</h1>
        <p>All {total_locations} test URLs for your localhost:3000 server</p>
        <p><strong>Server Status:</strong> <span id="server-status" class="server-status">Checking...</span></p>
    </div>

    <div class="stats">
        <div class="stat-card rooms">
            <div class="stat-number">{len(locations['room'])}</div>
            <div><strong>Hotel Rooms</strong></div>
        </div>
        <div class="stat-card restaurant">
            <div class="stat-number">{len(locations['restaurant'])}</div>
            <div><strong>Restaurant Tables</strong></div>
        </div>
        <div class="stat-card garden">
            <div class="stat-number">{len(locations['garden'])}</div>
            <div><strong>Garden Tables</strong></div>
        </div>
        <div class="stat-card total">
            <div class="stat-number">{total_locations}</div>
            <div><strong>Total Test URLs</strong></div>
        </div>
    </div>

    <div class="alert">
        <h4>🚀 Complete Testing Instructions:</h4>
        <ol>
            <li><strong>Make sure your server is running:</strong> <code>npm run dev</code> or <code>yarn dev</code></li>
            <li><strong>Click any test link below</strong> to open in a new tab</li>
            <li><strong>Use the search box</strong> to quickly find specific rooms/tables</li>
            <li><strong>Test the complete flow:</strong> Language selection → Menu → Cart → Checkout</li>
            <li><strong>Verify location detection:</strong> Check that the correct room/table is shown in cart</li>
        </ol>
    </div>

    <div class="search-box">
        <input type="text" id="search-input" class="search-input" placeholder="🔍 Search for room number or table (e.g., 101, S1, B5)..." onkeyup="filterLinks()">
    </div>

    <div class="test-sections">
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
        <div class="test-section {css_class}">
            <div class="section-title">{section_title} ({len(locations[section_key])} locations)</div>
            <div class="test-links">
"""
            for location in locations[section_key]:
                html_content += f"""
                <a href="{location['qr_url']}" target="_blank" class="test-link" data-search="{location['location_id'].lower()} {location['location_name'].lower()}">
                    {location['location_name']}
                    <div class="token-display">{location['location_id']}</div>
                </a>
"""
            html_content += """
            </div>
        </div>
"""
    
    html_content += f"""
    </div>

    <div style="margin-top: 40px; text-align: center; color: #7f8c8d; background: white; padding: 25px; border-radius: 15px; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
        <h3>🧪 Complete Local Development Testing</h3>
        <p>All {total_locations} test URLs for comprehensive testing of your QR access system.</p>
        <p><strong>Expected Flow:</strong> Click link → Language selection → Menu → Add items → Cart → Checkout</p>
        <p><strong>Check:</strong> Location should be automatically detected and displayed in cart/checkout</p>
        <div style="margin-top: 20px; font-size: 14px;">
            <strong>Coverage:</strong> {len(locations['room'])} Rooms | {len(locations['restaurant'])} Restaurant Tables | {len(locations['garden'])} Garden Tables
        </div>
    </div>

    <script>
        // Check if server is running
        async function checkServer() {{
            const statusElement = document.getElementById('server-status');
            try {{
                const response = await fetch('{LOCAL_URL}', {{ mode: 'no-cors' }});
                statusElement.textContent = '✅ Server is running';
                statusElement.className = 'server-status server-running';
            }} catch (error) {{
                statusElement.textContent = '❌ Server not running - Start with npm run dev';
                statusElement.className = 'server-status server-stopped';
            }}
        }}

        // Filter test links based on search
        function filterLinks() {{
            const searchTerm = document.getElementById('search-input').value.toLowerCase();
            const links = document.querySelectorAll('.test-link');
            
            links.forEach(link => {{
                const searchData = link.getAttribute('data-search');
                if (searchData.includes(searchTerm)) {{
                    link.style.display = 'block';
                }} else {{
                    link.style.display = 'none';
                }}
            }});
        }}

        // Check server status on page load
        checkServer();
        
        // Check every 10 seconds
        setInterval(checkServer, 10000);
    </script>
</body>
</html>"""
    
    return html_content

def main():
    print("🧪 La Strada Hotel - Complete Local Test URLs Generator")
    print("=" * 60)
    
    # Load tokens
    print("📖 Loading location data...")
    tokens = load_tokens()
    
    if not tokens:
        print("❌ No tokens found. Cannot generate test URLs.")
        return
    
    locations = get_all_locations(tokens)
    
    # Display summary
    total_locations = sum(len(locations[cat]) for cat in locations)
    print(f"✅ Found {total_locations} total locations:")
    print(f"   🏨 Hotel Rooms: {len(locations['room'])}")
    print(f"   🍽️  Restaurant Tables: {len(locations['restaurant'])}")
    print(f"   🌿 Garden Tables: {len(locations['garden'])}")
    
    # Generate HTML
    print(f"\n🌐 Generating complete test URLs HTML...")
    html_content = create_complete_test_html(locations)
    
    # Save HTML file
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        f.write(html_content)
    
    # Summary
    print("\n" + "=" * 60)
    print("🎉 Complete local test URLs generated!")
    print(f"✅ Generated {total_locations} test URLs")
    print(f"📂 File saved: {OUTPUT_FILE}")
    print(f"🌐 Local server: {LOCAL_URL}")
    
    print("\n📋 What's included:")
    print(f"   🏨 {len(locations['room'])} hotel room test URLs")
    print(f"   🍽️  {len(locations['restaurant'])} restaurant table test URLs")
    print(f"   🌿 {len(locations['garden'])} garden table test URLs")
    
    print("\n📋 Features:")
    print("   🔍 Search functionality to find specific rooms/tables")
    print("   📊 Statistics dashboard")
    print("   🚦 Server status checker")
    print("   📱 Responsive design")
    
    print("\n📋 Next steps:")
    print(f"1. Open {OUTPUT_FILE} in your browser")
    print("2. Make sure your dev server is running on port 3000")
    print("3. Click any test link to open in a new tab")
    print("4. Use search to quickly find specific locations")
    print("5. Test the complete user flow for each location type")

if __name__ == "__main__":
    main() 