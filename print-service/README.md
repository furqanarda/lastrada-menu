# La Strada Print Service

A thermal printer service for La Strada Restaurant at The Plaza Hotel Edirne.

## Installation

```
cd print-service
npm install
```

## SSL Certificate Setup

The print service supports both HTTP and HTTPS. For the HTTPS support, SSL certificates are required.

### Development Environment

For development, you can use `mkcert` to create self-signed certificates:

1. Install mkcert:
   ```
   # macOS
   brew install mkcert
   mkcert -install
   
   # Ubuntu/Debian
   sudo apt install libnss3-tools
   sudo apt install mkcert
   mkcert -install
   ```

2. Generate certificates for your service:
   ```
   cd print-service
   mkcert -key-file certs/key.pem -cert-file certs/cert.pem 81.215.205.185 localhost 127.0.0.1
   ```

### Production Environment

For production, use Let's Encrypt certificates:

1. Install certbot:
   ```
   sudo apt-get update
   sudo apt-get install certbot
   ```

2. Get a certificate:
   ```
   sudo certbot certonly --standalone -d print.theplazahoteledirne.com
   ```

3. Copy certificates to the print service:
   ```
   sudo cp /etc/letsencrypt/live/print.theplazahoteledirne.com/privkey.pem /path/to/print-service/certs/key.pem
   sudo cp /etc/letsencrypt/live/print.theplazahoteledirne.com/fullchain.pem /path/to/print-service/certs/cert.pem
   ```

4. Set permissions:
   ```
   sudo chown youruser:youruser /path/to/print-service/certs/*
   ```

## Environment Variables

You can set these environment variables:

- `SSL_KEY_PATH`: Path to your SSL key (default: `./certs/key.pem`)
- `SSL_CERT_PATH`: Path to your SSL certificate (default: `./certs/cert.pem`)

## Running the Service

Development mode:
```
npm run dev
```

Production mode:
```
npm start
```

## Ports

- HTTP: 3001
- HTTPS: 3443 (only active if certificates are found)

## Troubleshooting Mixed Content Issues

If your website is served over HTTPS but the print service is only available over HTTP, modern browsers will block these "mixed content" requests. To fix this:

1. Ensure your print service has proper SSL certificates
2. Make sure your frontend is accessing the print service over HTTPS
3. If accessing through a domain, update your DNS records to point to the server's IP 