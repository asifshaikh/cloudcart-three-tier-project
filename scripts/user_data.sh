#!/bin/bash
set -euxo pipefail

# Log bootstrap output for troubleshooting
exec > >(tee -a /var/log/cloudcart-bootstrap.log) 2>&1

echo "Starting CloudCart EC2 bootstrap..."

# Ensure this script runs as root
if [ "$(id -u)" -ne 0 ]; then
    echo "ERROR: user_data.sh must run as root"
    exit 1
fi

# Update package index and install prerequisites
apt-get update
apt-get install -y ca-certificates curl

# Remove conflicting packages if present
conflicting_packages=(
    docker.io
    docker-compose
    docker-compose-v2
    docker-doc
    docker-buildx
    podman-docker
    containerd
    runc
)

installed_packages=()

for pkg in "${conflicting_packages[@]}"; do
    if dpkg-query -W -f='${Status}' "$pkg" 2>/dev/null \
        | grep -q "install ok installed"; then
        installed_packages+=("$pkg")
    fi
done

if [ "${#installed_packages[@]}" -gt 0 ]; then
    apt-get remove -y "${installed_packages[@]}"
fi

# Add Docker official GPG key
install -m 0755 -d /etc/apt/keyrings

curl -fsSL https://download.docker.com/linux/ubuntu/gpg \
    -o /etc/apt/keyrings/docker.asc

chmod a+r /etc/apt/keyrings/docker.asc

# Configure Docker's official Ubuntu repository
. /etc/os-release

CODENAME="${UBUNTU_CODENAME:-$VERSION_CODENAME}"
ARCH="$(dpkg --print-architecture)"

cat > /etc/apt/sources.list.d/docker.sources <<EOF
Types: deb
URIs: https://download.docker.com/linux/ubuntu
Suites: ${CODENAME}
Components: stable
Architectures: ${ARCH}
Signed-By: /etc/apt/keyrings/docker.asc
EOF

# Install Docker Engine and plugins
apt-get update

apt-get install -y \
    docker-ce \
    docker-ce-cli \
    containerd.io \
    docker-buildx-plugin \
    docker-compose-plugin

# Enable and start Docker
systemctl enable --now docker

# Create CloudCart deployment directory
mkdir -p /opt/cloudcart
chmod 0755 /opt/cloudcart

# Verify installation
docker --version
docker compose version
docker buildx version
systemctl is-active docker

echo "CloudCart EC2 bootstrap completed successfully."
