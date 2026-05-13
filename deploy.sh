#!/bin/bash
set -e

echo "=============================="
echo " PHASE 1: System update & deps"
echo "=============================="
export DEBIAN_FRONTEND=noninteractive
apt-get update -y
apt-get upgrade -y -o Dpkg::Options::="--force-confdef" -o Dpkg::Options::="--force-confold"
apt-get install -y git curl nginx certbot python3-certbot-nginx ufw

echo "=============================="
echo " PHASE 2: Install Node.js 22  "
echo "=============================="
curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
apt-get install -y nodejs
node --version
npm --version

echo "=============================="
echo " PHASE 3: Install PM2          "
echo "=============================="
npm install -g pm2

echo "=============================="
echo " PHASE 4: Clone repository     "
echo "=============================="
mkdir -p /var/www
cd /var/www
rm -rf daftk
git clone https://github.com/NikolozBarkalaia/Daftk daftk
cd daftk

echo "=============================="
echo " PHASE 5: Setup backend        "
echo "=============================="
cd /var/www/daftk/backend
npm install

# Generate a strong JWT secret
JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")

cat > .env << EOF
PORT=5001
JWT_SECRET=${JWT_SECRET}
NODE_ENV=production
EOF

echo "Backend .env created with JWT_SECRET"

# Create uploads dir
mkdir -p uploads

echo "=============================="
echo " PHASE 6: Fix frontend API URL "
echo "=============================="
cd /var/www/daftk/frontend

# Update api.js to use env var
sed -i "s|baseURL: 'http://localhost:5001/api'|baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5001/api'|g" src/services/api.js

# Create production env file
cat > .env.production << EOF
REACT_APP_API_URL=https://daftk.ge/api
EOF

echo "=============================="
echo " PHASE 7: Build frontend       "
echo "=============================="
npm install
npm run build
echo "Frontend build complete"

echo "=============================="
echo " PHASE 8: Start backend w/ PM2 "
echo "=============================="
cd /var/www/daftk/backend
pm2 delete daftk-backend 2>/dev/null || true
pm2 start "node --experimental-sqlite src/index.js" --name daftk-backend
pm2 save
pm2 startup systemd -u root --hp /root | tail -1 | bash || true

echo "=============================="
echo " PHASE 9: Configure Nginx      "
echo "=============================="
rm -f /etc/nginx/sites-enabled/default

cat > /etc/nginx/sites-available/daftk.ge << 'NGINXCONF'
server {
    listen 80;
    server_name daftk.ge www.daftk.ge;

    root /var/www/daftk/frontend/build;
    index index.html;

    # React SPA — all non-API routes go to index.html
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Proxy API requests to Express backend
    location /api {
        proxy_pass http://localhost:5001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        client_max_body_size 50M;
    }

    # Serve uploaded files via backend
    location /uploads {
        proxy_pass http://localhost:5001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
}
NGINXCONF

ln -sf /etc/nginx/sites-available/daftk.ge /etc/nginx/sites-enabled/daftk.ge
nginx -t
systemctl restart nginx
systemctl enable nginx

echo "=============================="
echo " PHASE 10: Firewall setup      "
echo "=============================="
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw --force enable

echo ""
echo "=============================="
echo " DEPLOYMENT COMPLETE!          "
echo "=============================="
echo ""
echo "Backend status:"
pm2 list
echo ""
echo "Nginx status:"
systemctl status nginx --no-pager | head -5
echo ""
echo "Next step: Point daftk.ge A record to 159.89.0.113"
echo "Then run: certbot --nginx -d daftk.ge -d www.daftk.ge --non-interactive --agree-tos -m admin@daftk.ge"
