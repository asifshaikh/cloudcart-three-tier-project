module "vpc" {
  source               = "terraform-aws-modules/vpc/aws"
  version              = "6.7.3"
  name                 = var.name
  cidr                 = var.vpc_cidr
  azs                  = var.availability_zones
  public_subnets       = var.public_subnet_cidrs
  private_subnets      = var.private_subnet_cidrs
  enable_dns_hostnames = true
  enable_dns_support   = true

  # Public subnet routing
  create_igw = true

  # Budget NAT design
  enable_nat_gateway = true
  single_nat_gateway = true

  # Do not assign public IPs to public subnets by default
  map_public_ip_on_launch = false

  # Tags for future ALBs
  public_subnet_tags = {
    "kubernetes.io/role/elb" = 1
  }
  private_subnet_tags = {
    "kubernetes.io/role/internal-elb" = 1
  }
  tags = var.tags
}
