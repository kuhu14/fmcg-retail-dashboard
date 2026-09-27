#!/bin/bash
set -e

sudo mv ~/fmcg-backend.service /etc/systemd/system/fmcg-backend.service
sudo systemctl daemon-reload
sudo systemctl enable fmcg-backend
sudo systemctl restart fmcg-backend
sleep 2
sudo systemctl status fmcg-backend --no-pager | head -10

sudo mv ~/nginx-fmcg-backend.conf /etc/nginx/sites-available/fmcg-backend
sudo ln -sf /etc/nginx/sites-available/fmcg-backend /etc/nginx/sites-enabled/fmcg-backend
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx

echo "INSTALL_OK"
