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

output "ec2_iam_role_name" {
  description = "IAM role attached to CloudCart EC2"
  value       = aws_iam_role.cloudcart_ec2.name
}

output "ec2_instance_profile_name" {
  description = "Instance profile used by CloudCart EC2"
  value       = aws_iam_instance_profile.cloudcart_ec2.name
}
