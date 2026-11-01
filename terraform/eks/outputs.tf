
output "aws_region" {
  value = var.aws_region
}

output "cluster_name" {
  value = var.cluster_name
}

output "vpc_id" {
  description = "CloudCart EKS VPC ID"
  value       = module.network.vpc_id
}

output "vpc_cidr" {
  description = "CloudCart EKS VPC CIDR"
  value       = module.network.vpc_cidr_block
}

output "public_subnet_ids" {
  value = module.network.public_subnet_ids
}

output "private_subnet_ids" {
  value = module.network.private_subnet_ids
}

output "nat_public_ips" {
  value = module.network.nat_public_ips
}
