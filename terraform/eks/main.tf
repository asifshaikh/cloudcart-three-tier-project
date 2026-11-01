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
