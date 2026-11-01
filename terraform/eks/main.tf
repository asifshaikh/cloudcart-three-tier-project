module "network" {
  source               = "./modules/network"
  name                 = var.cluster_name
  vpc_cidr             = var.vpc_cidr
  availability_zones   = var.availability_zones
  public_subnet_cidrs  = var.public_subnet_cidrs
  private_subnet_cidrs = var.private_subnet_cidrs
  tags = {
    Project     = "CloudCart"
    Environment = var.environment
    ManagedBy   = "Terraform"
  }
}


module "eks" {
  source = "./modules/eks"

  cluster_name       = var.cluster_name
  kubernetes_version = var.kubernetes_version
  environment        = var.environment

  vpc_id             = module.network.vpc_id
  private_subnet_ids = module.network.private_subnet_ids

  cluster_endpoint_public_access_cidrs = var.cluster_endpoint_public_access_cidrs

  tags = {
    Project     = "CloudCart"
    Environment = var.environment
    ManagedBy   = "Terraform"
  }
}

