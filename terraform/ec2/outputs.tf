output "vpc_id" {
  description = "CloudCart VPC Id"
  value       = aws_vpc.cloudcart.id
}

output "public_subnet_id" {
  description = "CloudCart Public Subnet Id"
  value       = aws_subnet.public.id
}

output "availability_zone" {
  description = "Availability Zone used by the public subnet"
  value       = aws_subnet.public.availability_zone
}
