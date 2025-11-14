#!/bin/bash

# Coturn (TURN) Server Setup Script for Social Platform

set -e

echo "Starting Coturn (TURN) server setup..."

# Update system packages
apt-get update

# Install coturn
apt-get install -y coturn

# Backup original config
cp /etc/turnserver.conf /etc/turnserver.conf.backup

# Create new config
cat > /etc/turnserver.conf << EOF
# Coturn (TURN) Server Configuration for Social Platform

# Listening IP address
listening-ip=0.0.0.0

# Listening port for TURN/TURNS
listening-port=3478

# Alternate port for relaying
alt-listening-port=3480

# Listening port for TLS/TLS
tls-listening-port=5349

# Alternate port for DTLS/DTLS
alt-tls-listening-port=5350

# Relayed IP address
relay-ip=0.0.0.0

# TURN server name
server-name=${COTURN_SERVER_NAME:-social-platform-turn.example.com}

# FQDN is not used
fingerprint

# Max port
max-port=65535

# Min port
min-port=49152

# Realm
realm=${COTURN_REALM:-social-platform.example.com}

# Server name in response
server-name=${COTURN_SERVER_NAME:-social-platform.example.com}

# Authentication mechanism
lt-cred-mech

# User accounts (format: username:password)
# These users will be added dynamically from the users file

# Database for user accounts
userdb=/var/lib/turn/turndb

# No CLI
no-cli

# Verbose logging
verbose
fingerprint

# Allow self-signed certificates
no-tlsv1
no-tlsv1_1

# Bandwidth throttling
max-bps=0

# Stale nonce
stale-nonce

# Allowed peers (for TURN relay)
no-multicast-peers

# Log file
log-file=/var/log/turnserver.log
simple-log

# Coturn will work as a relay server, not as a standalone server
no-stdout-log

# Enable listening on external IP
external-ip=$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)
EOF

# Enable coturn to start on boot
echo "TURNSERVER_ENABLED=1" > /etc/default/coturn

# Create user database
mkdir -p /var/lib/turn
chown turnserver:turnserver /var/lib/turn

# Add users from environment variable
if [ ! -z "$COTURN_USERS" ]; then
    while IFS=':' read -r username password; do
        echo "Adding user: $username"
        turnadmin -a -u "$username" -r "${COTURN_REALM:-social-platform.example.com}" -p "$password"
    done <<< "$(echo "$COTURN_USERS" | tr ',' '\n')"
fi

# Set up log rotation
cat > /etc/logrotate.d/coturn << EOF
/var/log/turnserver.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 640 turnserver adm
    postrotate
        invoke-rc.d coturn restart > /dev/null 2>&1 || true
    endscript
}
EOF

# Start coturn service
systemctl enable coturn
systemctl start coturn

# Verify the service is running
if systemctl is-active --quiet coturn; then
    echo "Coturn server setup completed successfully!"
    echo "Public IP: $(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)"
    echo "Turn server is running on ports 3478 (TCP/UDP) and 5349 (TLS/DTLS)"
else
    echo "Error: Coturn service failed to start"
    exit 1
fi