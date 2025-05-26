# QR Code Generation Guide for La Strada Hotel

This guide explains how to create QR codes for every room and location in La Strada Hotel.

## 🏨 Available Locations

Your system currently has QR codes configured for:

### Hotel Rooms (30+ rooms)
- **Special Rooms**: L1, L2, L3
- **First Floor**: 101-111 (11 rooms)
- **Second Floor**: 201-212 (12 rooms)  
- **Third Floor**: 301-308 (8 rooms)
- **Executive Suites**: EP1, EP2, EP3

### Restaurant Tables
- **Indoor Tables**: S1-S16 (16 tables)

### Garden Tables  
- **Outdoor Tables**: B1-B16 (16 tables)

**Total**: 60+ unique QR codes

## 🚀 Quick Start Methods

### Method 1: Use the Admin Interface (Recommended)
1. Go to `/admin/qr-generator` in your browser
2. Select the "Rooms" tab
3. Click "Download HTML" to get a printable page with all room QR codes
4. Open the downloaded HTML file and print it
5. Cut out individual QR codes and place them in rooms

### Method 2: Run the Generation Script
```bash
# Navigate to your project directory
cd /path/to/la-strada-menu

# Run the QR code generation script
node scripts/generate-qr-codes.js
```

This will create a `qr-codes-output` folder with:
- `room-qr-codes.html` - Printable webpage with all QR codes
- `room-qr-codes.csv` - Spreadsheet format
- `room-qr-codes.json` - Data format for developers
- `individual-rooms/` - Separate file for each room

### Method 3: Manual Generation
1. Copy any room's QR URL from the admin interface
2. Go to [qr-code-generator.com](https://qr-code-generator.com)
3. Paste the URL and generate the QR code
4. Download and print

## 📋 Step-by-Step Room QR Code Creation

### For All Rooms at Once:

1. **Access the Admin Panel**
   ```
   https://menu.theplazahoteledirne.com/admin/qr-generator
   ```

2. **Select Rooms Tab**
   - Click on "Rooms" to see all hotel rooms
   - You'll see 30+ room cards with their QR URLs

3. **Download Printable Version**
   - Click "Download HTML" button
   - Open the downloaded file in your browser
   - Print the page (it's optimized for printing)

4. **Cut and Distribute**
   - Cut out each QR code
   - Place in the corresponding room
   - Consider laminating for durability

### For Individual Rooms:

Each room has a unique URL format:
```
https://menu.theplazahoteledirne.com?token=[UNIQUE_TOKEN]
```

**Example URLs:**
- Room 101: `https://menu.theplazahoteledirne.com?token=qr_101_t9u2v5w8x1y4`
- Room 201: `https://menu.theplazahoteledirne.com?token=qr_201_h7i0j3k6l9m2`
- Room L1: `https://menu.theplazahoteledirne.com?token=qr_l1_a7b9c2d8e4f1`

## 🛠️ Advanced Options

### Bulk QR Code Generation Services

For generating many QR codes at once:

1. **QR Code Generator Pro** (Recommended)
   - Website: [qr-code-generator.org](https://www.qr-code-generator.org)
   - Supports bulk upload via CSV
   - High-quality PNG/SVG output

2. **QR.io**
   - Website: [qr.io](https://qr.io)
   - API available for automation
   - Batch processing capabilities

3. **QRStuff**
   - Website: [qrstuff.com](https://www.qrstuff.com)
   - Bulk generation tools
   - Custom design options

### Using the CSV File

1. Download `room-qr-codes.csv` from the admin interface
2. Upload to a bulk QR generator service
3. Generate all QR codes at once
4. Download the ZIP file with all images

### Custom Styling

To customize QR code appearance:
- Use SVG format for scalability
- Add your hotel logo in the center
- Use hotel brand colors
- Ensure minimum 2cm x 2cm size for reliable scanning

## 📱 QR Code Placement Guidelines

### Room Placement
- **Location**: Inside the room, near the entrance
- **Height**: Eye level (150-170cm from floor)
- **Visibility**: Well-lit area, not behind furniture
- **Protection**: Consider laminating or using acrylic holders

### Size Requirements
- **Minimum**: 2cm x 2cm (for close scanning)
- **Recommended**: 3cm x 3cm (optimal for most phones)
- **Maximum**: 5cm x 5cm (for easy scanning from distance)

### Material Suggestions
- **Paper**: Standard for temporary use
- **Laminated**: Weather-resistant, longer lasting
- **Acrylic Stand**: Professional appearance
- **Vinyl Sticker**: Permanent mounting option

## 🔧 Technical Details

### Token Security
- Each room has a unique, secure token
- Tokens are validated server-side
- Invalid tokens redirect to access denied page
- Tokens don't expire (permanent access)

### User Flow
1. Guest scans QR code
2. Redirected to language selection page
3. After selecting language, goes to menu
4. Room information automatically detected
5. Orders are tagged with correct room number

### Restaurant Hours
- QR codes work 24/7 for scanning
- Menu access restricted to 12:00 PM - 12:00 AM
- Outside hours shows "Restaurant Closed" message

## 📊 Monitoring and Analytics

### Admin Tools Available
- `/admin/qr-generator` - Generate and download QR codes
- `/admin/qr-test` - Test QR codes functionality
- View usage statistics (if analytics are enabled)

### Testing QR Codes
1. Scan with your phone camera
2. Should redirect to language selection
3. Select a language
4. Should show menu with room info
5. Test ordering process

## 🆘 Troubleshooting

### Common Issues

**QR Code Not Working**
- Check if URL is correct
- Verify token exists in database
- Test with different QR scanner apps

**Wrong Room Detected**
- Verify QR code matches room number
- Check token in admin interface
- Regenerate QR code if needed

**Menu Not Loading**
- Check internet connection
- Verify restaurant hours (12 PM - 12 AM)
- Clear browser cache

### Support Contacts
- Technical issues: Check admin panel
- QR code regeneration: Use admin interface
- System updates: Restart application

## 📈 Scaling and Updates

### Adding New Rooms
1. Add room data to `data/tokens.json`
2. Generate new token following existing pattern
3. Regenerate QR codes using admin interface
4. Print and place new QR codes

### Updating Existing Rooms
1. Modify room data in `data/tokens.json`
2. Regenerate QR codes
3. Replace physical QR codes in rooms

### Backup and Recovery
- Keep backup of `data/tokens.json`
- Save generated QR code files
- Document room-to-token mappings

---

## 🎯 Quick Action Checklist

- [ ] Access admin panel at `/admin/qr-generator`
- [ ] Download HTML file with all room QR codes
- [ ] Print the QR codes page
- [ ] Cut out individual QR codes
- [ ] Place QR codes in corresponding rooms
- [ ] Test a few QR codes with your phone
- [ ] Train staff on QR code system
- [ ] Keep backup of QR code files

**Need help?** Check the admin interface or regenerate QR codes using the provided tools. 