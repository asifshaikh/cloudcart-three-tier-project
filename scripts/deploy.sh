
#!/usr/bin/env bash
set -Eeuo pipefail

# CloudCart deployment script
# Executed remotely on EC2 through appleboy/ssh-action.
#
# DEPLOY_SHA is supplied by GitHub Actions.
# Usage: DEPLOY_SHA=<40-char-sha> ./deploy.sh

APP_DIR="/opt/cloudcart"
COMPOSE_FILE="$APP_DIR/compose.prod.yaml"
ENV_FILE="$APP_DIR/.env"
BACKEND_ENV_FILE="$APP_DIR/backend.env"

BACKEND_REPO="sekc69/cloudcart-backend"
FRONTEND_REPO="sekc69/cloudcart-frontend"

SHA="${DEPLOY_SHA:-}"

if [[ ! "$SHA" =~ ^[a-f0-9]{40}$ ]]; then
    echo "ERROR: DEPLOY_SHA must be a valid 40-character commit SHA."
    exit 1
fi

BACKEND_IMAGE="${BACKEND_REPO}:${SHA}"
FRONTEND_IMAGE="${FRONTEND_REPO}:${SHA}"

echo "======================================"
echo " CloudCart Deployment"
echo " Commit: $SHA"
echo "======================================"

# Verify application files
for file in "$COMPOSE_FILE" "$ENV_FILE" "$BACKEND_ENV_FILE"; do
    if [[ ! -f "$file" ]]; then
        echo "ERROR: Required file missing: $file"
        exit 1
    fi
done

cd "$APP_DIR"

# Compose interpolation variables are explicitly supplied.
# This ensures the requested SHA images are used.

compose() {
    sudo env \
        BACKEND_IMAGE="$BACKEND_IMAGE" \
        FRONTEND_IMAGE="$FRONTEND_IMAGE" \
        docker compose \
        --env-file "$ENV_FILE" \
        -f "$COMPOSE_FILE" \
        "$@"
}

echo "Step 1: Validate Compose configuration"

compose config --quiet

echo "Step 2: Pull application images"

sudo docker pull "$BACKEND_IMAGE"
sudo docker pull "$FRONTEND_IMAGE"

echo "Step 3: Deploy application"

compose up -d --remove-orphans

echo "Step 4: Wait for backend health"

backend_healthy=false

for i in $(seq 1 40); do
    backend_id=$(compose ps -q backend 2>/dev/null || true)

    if [[ -n "$backend_id" ]]; then
        health=$(sudo docker inspect \
            --format '{{if .State.Health}}{{.State.Health.Status}}{{else}}no-healthcheck{{end}}' \
            "$backend_id" 2>/dev/null || true)

        if [[ "$health" == "healthy" ]]; then
            backend_healthy=true
            break
        fi
    fi

    sleep 3
done

if [[ "$backend_healthy" != "true" ]]; then
    echo "ERROR: Backend did not become healthy."

    compose ps || true
    compose logs --tail=100 backend || true

    exit 1
fi

echo "Step 5: Verify frontend container"

frontend_id=$(compose ps -q frontend)

if [[ -z "$frontend_id" ]]; then
    echo "ERROR: Frontend container not found."
    exit 1
fi

frontend_running=$(sudo docker inspect \
    --format '{{.State.Running}}' "$frontend_id")

if [[ "$frontend_running" != "true" ]]; then
    echo "ERROR: Frontend container is not running."
    compose logs --tail=100 frontend || true
    exit 1
fi

echo "Step 6: Frontend HTTP smoke test"

if ! curl --fail --silent --show-error \
    --max-time 10 \
    http://127.0.0.1/ >/dev/null; then

    echo "ERROR: Frontend HTTP check failed."
    compose logs --tail=100 frontend || true
    exit 1
fi

echo "Step 7: Deployment summary"

compose ps

echo "======================================"
echo " CloudCart deployment successful"
echo " Commit: $SHA"
echo " Backend: $BACKEND_IMAGE"
echo " Frontend: $FRONTEND_IMAGE"
echo "======================================"
