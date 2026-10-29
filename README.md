# CloudCart — Three-Tier Cloud-Native Application

CloudCart is a learning and portfolio project demonstrating how to build, containerize, deploy, and operate a **three-tier web application** using modern DevOps practices.

The journey starts with Docker Compose, progresses to local Kubernetes, and is intended to evolve toward AWS EKS, infrastructure as code, CI/CD, and monitoring.

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Technology Stack](#technology-stack)
- [Repository Structure](#repository-structure)
- [Prerequisites](#prerequisites)
- [Run with Docker Compose](#run-with-docker-compose)
- [Access the Application](#access-the-application)
- [Useful Compose Commands](#useful-compose-commands)
- [Local Kubernetes Deployment](#local-kubernetes-deployment)
- [Kubernetes Port Forwarding](#kubernetes-port-forwarding)
- [CI/CD](#cicd)
- [AWS Deployment](#aws-deployment)
- [Configuration and Security](#configuration-and-security)
- [Troubleshooting](#troubleshooting)
- [Up Next](#up-next)

## Overview

CloudCart is a sample e-commerce application and a hands-on environment for learning:

- Three-tier application architecture
- Frontend/backend containerization
- Database persistence
- Docker Compose orchestration
- Kubernetes Deployments, Services, configuration, and storage
- GitHub Actions CI/CD
- Versioned Docker image releases
- Terraform-based AWS infrastructure
- Deployment health checks and troubleshooting

> **Architecture note:** CloudCart has three logical tiers. The current Compose setup runs a frontend, a backend API, and MySQL. Additional independently deployable microservices can be introduced as the project grows.

## Architecture

```text
                      Users / Browser
                             |
                             v
                +------------------------+
                | Presentation Tier      |
                | React frontend + Nginx |
                +------------------------+
                             |
                       /api/* requests
                             |
                             v
                +------------------------+
                | Application Tier       |
                | Flask REST API         |
                | Auth / Products / Cart |
                +------------------------+
                             |
                             v
                +------------------------+
                | Data Tier              |
                | MySQL                  |
                | Persistent storage     |
                +------------------------+
```

### Tiers

1. **Presentation:** React frontend served by Nginx.
2. **Application:** Flask API providing application functionality.
3. **Data:** MySQL for persistent application data.

The frontend uses `/api/` for API requests. Nginx proxies these requests to the backend on the internal application network.

## Technology Stack

| Area | Technology |
|---|---|
| Frontend | React, Vite |
| Web server / reverse proxy | Nginx |
| Backend | Python, Flask |
| Database | MySQL 8.4 |
| Containers | Docker |
| Local orchestration | Docker Compose |
| CI/CD | GitHub Actions |
| Image registry | Docker Hub |
| Infrastructure as Code | Terraform |
| Current cloud deployment | AWS EC2 |
| Local Kubernetes learning | Kind or another supported local cluster |
| Planned Kubernetes platform | Amazon EKS |
| Planned monitoring | Prometheus and Grafana |

## Repository Structure

The exact layout may evolve. A representative structure:

```text
cloudcart/
├── backend/
├── frontend/
├── scripts/
│   ├── user_data.sh
│   └── deploy.sh
├── terraform/
├── k8s/                         # Kubernetes manifests as added
├── .github/
│   └── workflows/
│       ├── orchestrator.yaml
│       ├── ci.yaml
│       ├── docker-push.yaml
│       └── deploy.yaml
├── compose.yaml                 # Local Compose file, if present
├── compose.prod.yaml            # EC2 deployment Compose file
└── README.md
```

## Prerequisites

Install:

- [Git](https://git-scm.com/)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) or Docker Engine
- Docker Compose v2
- For Kubernetes: [kubectl](https://kubernetes.io/docs/tasks/tools/) and [Kind](https://kind.sigs.k8s.io/) (or another supported local cluster)
- Optional for running components outside containers: Node.js and Python

Verify Docker:

```bash
docker --version
docker compose version
```

Verify Kubernetes tooling:

```bash
kubectl version --client
kind version
```

## Run with Docker Compose

Docker Compose is the quickest way to run CloudCart locally.

### 1. Clone the repository

```bash
git clone https://github.com/asifshaikh/cloudcart-three-tier-project.git
cd cloudcart-three-tier-project
```

### 2. Identify the local Compose file

```bash
ls
```

On PowerShell:

```powershell
Get-ChildItem *compose*.y*ml
```

Use the **local development Compose file** if available (for example, `compose.yaml` or `docker-compose.yml`).

> `compose.prod.yaml` is intended for EC2 and references server-side configuration under `/opt/cloudcart`. Do not assume it runs locally without adapting its environment-file paths, variables, and configuration.

### 3. Configure environment variables

Review the chosen Compose file and its `env_file` references. Create the local environment files it expects. Typical configuration includes:

- MySQL database name and application credentials
- MySQL root password
- Backend database connection URL
- Flask application secret/configuration

If the repository provides `.env.example`, copy it and fill in the required values.

PowerShell:

```powershell
Copy-Item .env.example .env
```

Linux/macOS:

```bash
cp .env.example .env
```

If no example file exists, inspect the Compose file and backend settings to determine required variables first. Use local development credentials and do not commit populated secret files.

### 4. Build and start

If the local file is `compose.yaml`:

```bash
docker compose -f compose.yaml up --build -d
```

If it is `docker-compose.yml`:

```bash
docker compose -f docker-compose.yml up --build -d
```

If you deliberately prepared a local configuration based on `compose.prod.yaml`, provide its required configuration and image variables. The production file may depend on EC2-specific paths and settings.

### 5. Inspect services

```bash
docker compose ps
docker compose logs -f
```

Include `-f <compose-file>` if you're using a non-default Compose filename.

## Access the Application

If your local Compose configuration publishes host port 80:

- Frontend: <http://localhost>
- API: use the API routes configured by the application, usually under `/api/`

If the host port differs, use that port (for example, `http://localhost:8080`).

Test the frontend:

```bash
curl -i http://localhost/
```

Test the backend through an actual API endpoint configured by the application. The backend's `/health` endpoint may be internal; Nginx might route `/health` to the frontend instead.

## Useful Compose Commands

```bash
# Show services
docker compose ps

# Follow logs
docker compose logs -f
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f db

# Restart services
docker compose restart

# Rebuild after code changes
docker compose up --build -d

# Stop services while preserving named volumes
docker compose down
```

> **Data warning:** Avoid `docker compose down -v` unless you intentionally want to delete Compose-managed volumes. Removing the database volume can delete local MySQL data.

---

## Local Kubernetes Deployment

Kubernetes deployment is a project milestone. The steps below apply once the `k8s/` manifests have been added and adapted to the actual application.

A local setup will typically need:

- Frontend Deployment and Service
- Backend Deployment and Service
- MySQL StatefulSet (or another deliberate local database approach)
- PersistentVolumeClaim for database persistence
- ConfigMap for non-sensitive configuration
- Kubernetes Secret for local credentials
- Readiness/liveness probes
- Resource requests and limits

For production, prefer a managed database service rather than relying on a single-node local database workload for high availability.

### 1. Create a Kind cluster

```bash
kind create cluster --name cloudcart
kubectl cluster-info
kubectl get nodes
```

### 2. Review the planned manifest layout

```text
k8s/
├── namespace.yaml
├── configmap.yaml
├── mysql/
│   ├── pvc.yaml
│   ├── statefulset.yaml
│   └── service.yaml
├── backend/
│   ├── deployment.yaml
│   └── service.yaml
└── frontend/
    ├── deployment.yaml
    └── service.yaml
```

This is a suggested organization, not a claim that these files already exist. Review image names, ports, environment variables, probes, storage, and resource settings before applying.

### 3. Create local Kubernetes credentials

Do not commit real credentials. For example:

```bash
kubectl create namespace cloudcart

kubectl -n cloudcart create secret generic cloudcart-secrets \
  --from-literal=MYSQL_PASSWORD='<local-db-password>' \
  --from-literal=MYSQL_ROOT_PASSWORD='<local-root-password>' \
  --from-literal=FLASK_SECRET_KEY='<local-secret>'
```

The Secret keys must match the manifests and application configuration. This command creates a Secret but does not automatically configure the database URL or other settings.

Kubernetes Secrets require suitable access controls and security practices; they are not a complete production secret-management solution.

### 4. Apply the manifests

After creating and reviewing the intended manifests:

```bash
kubectl apply -f k8s/
```

If the directory includes examples or resources that should not be applied together, apply only the intended files or subdirectories.

### 5. Inspect Kubernetes resources

```bash
kubectl get pods -n cloudcart
kubectl get deployments -n cloudcart
kubectl get services -n cloudcart
kubectl get pvc -n cloudcart
```

Debug a pod:

```bash
kubectl describe pod <pod-name> -n cloudcart
kubectl logs <pod-name> -n cloudcart
```

Follow backend logs (replace the deployment name as needed):

```bash
kubectl logs -f deployment/<backend-deployment-name> -n cloudcart
```

---

## Kubernetes Port Forwarding

`kubectl port-forward` lets you access a Kubernetes Service or Pod locally without exposing it through a public LoadBalancer or Ingress.

### 1. Find Service names and ports

```bash
kubectl get svc -n cloudcart
```

### 2. Forward the frontend Service

For a frontend Service exposing port 80:

```bash
kubectl port-forward -n cloudcart svc/<frontend-service-name> 8080:80
```

Open <http://localhost:8080>.

Keep the terminal open while using the forwarded connection.

### 3. Forward the backend Service (optional)

If the backend Service exposes port 5000:

```bash
kubectl port-forward -n cloudcart svc/<backend-service-name> 5000:5000
```

The backend is then reachable at <http://localhost:5000>.

This direct backend forwarding is useful for debugging but may bypass the frontend Nginx routing path, so it does not necessarily represent the normal user request flow.

### 4. Port-forward notes

- Forwarding remains active only while the command is running.
- `localhost` refers to the machine running `kubectl`.
- Port forwarding does not create a public endpoint.
- Stop it with `Ctrl+C`.

---

## CI/CD

CloudCart is designed around GitHub Actions with separate reusable workflows:

1. **CI (`ci.yaml`)** — backend tests and frontend validation/build.
2. **Docker Publish (`docker-push.yaml`)** — build and push container images.
3. **Deploy (`deploy.yaml`)** — deploy selected image versions to EC2 over SSH.
4. **Orchestrator (`orchestrator.yaml`)** — coordinate execution with job dependencies (`needs`).

Docker Hub repositories:

- `sekc69/cloudcart-backend`
- `sekc69/cloudcart-frontend`

Commit-SHA image tags help identify the application revision being deployed.

> CI/CD configuration evolves. Verify workflow triggers, permissions, environment protection, image tags, and deployment credentials against the current repository.

## AWS Deployment

The current cloud deployment uses:

- AWS EC2 in `ap-south-1`
- Docker Engine and Docker Compose
- Terraform-managed networking and compute
- Docker Hub images
- GitHub Actions deployment over SSH

The application is available through its configured EC2 HTTP endpoint while the instance and services are running.

This setup is intended for learning and is not a claim of production-grade high availability.

## Configuration and Security

- Never commit private keys, passwords, access tokens, or populated secret files.
- Store deployment credentials in GitHub Actions Secrets and protect the production environment.
- Verify SSH host fingerprints and retain strict host key checking.
- Restrict SSH ingress; avoid internet-wide SSH access.
- Use strong, unique application and database credentials.
- Back up important database data before deployment or infrastructure changes.
- Prefer immutable image references or digests for stronger release reproducibility.
- Update dependencies and GitHub Actions; pin Actions to verified full commit SHAs for a hardened pipeline.
- Review Terraform plans before applying infrastructure changes.
- Protect production deployments with appropriate approval and access controls.

## Troubleshooting

### Compose services are unhealthy

```bash
docker compose ps
docker compose logs --tail=100 backend
docker compose logs --tail=100 db
```

Check credentials, connection configuration, health checks, and startup dependencies.

### Frontend loads but API calls fail

- Inspect browser developer tools and network requests.
- Confirm the frontend uses the expected `/api/` path.
- Check Nginx proxy configuration and backend service/container DNS.
- Inspect backend logs.

### Kubernetes pods are `Pending` or `CrashLoopBackOff`

```bash
kubectl get pods -n cloudcart
kubectl describe pod <pod-name> -n cloudcart
kubectl logs <pod-name> -n cloudcart --previous
kubectl get events -n cloudcart --sort-by=.lastTimestamp
```

Check image references, environment variables, resource requests, storage claims, and probes.

### Port forwarding fails

- Confirm the Service exists in the selected namespace.
- Check Service ports and target ports.
- Confirm the target Pods are ready.
- Ensure the local port is not already in use.

---

## Up Next

Planned improvements and learning milestones:

- [ ] **AWS EKS deployment** — run CloudCart on managed Kubernetes.
- [ ] **Terraform improvements** — reusable modules and stronger infrastructure security.
- [ ] **Kubernetes hardening** — probes, resource limits, autoscaling, ingress, and policy controls.
- [ ] **CI/CD improvements** — release promotion, approvals, image scanning, provenance, and rollback.
- [ ] **Monitoring and observability** — Prometheus, Grafana, dashboards, metrics, and alerting.
- [ ] **UI/UX improvements** — responsive layouts, accessibility, navigation, and user feedback.
- [ ] **More frontend pages** — product details, cart, checkout, order history, and account pages.
- [ ] **Additional services** — introduce independently deployable services where they add value.
- [ ] **Payment gateway integration** — implement a safe payment workflow with a provider's test environment.
- [ ] **Redis integration** — explore caching and suitable performance use cases.
- [ ] **Database improvements** — migrations, managed database, backups, and recovery testing.
- [ ] **Security enhancements** — secret management, least privilege, and vulnerability scanning.

## Learning Goal

CloudCart is an evolving hands-on project showcasing the journey from a local three-tier application to a cloud-native deployment with automation, scalability, security, and observability.

**Build → Containerize → Automate → Deploy → Monitor → Improve**
