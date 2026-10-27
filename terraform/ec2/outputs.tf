
output "vpc_id" {
  description = "CloudCart VPC ID"
  value       = aws_vpc.cloudcart.id
}

output "public_subnet_id" {
  description = "CloudCart public subnet ID"
  value       = aws_subnet.public.id
}

output "availability_zone" {
  description = "Availability zone used by the public subnet"
  value       = aws_subnet.public.availability_zone
}

output "ec2_instance_id" {
  description = "CloudCart EC2 instance ID"
  value       = aws_instance.cloudcart.id
}

output "ec2_public_ip" {
  description = "CloudCart EC2 public IPv4 address"
  value       = aws_instance.cloudcart.public_ip
}

output "ec2_public_dns" {
  description = "CloudCart EC2 public DNS"
  value       = aws_instance.cloudcart.public_dns
}

output "application_url" {
  description = "CloudCart frontend URL"
  value       = "http://${aws_instance.cloudcart.public_ip}"
}

output "ssh_command" {
  description = "SSH command to connect to EC2"
  value       = "ssh -i ${pathexpand(var.ssh_public_key_path) != "" ? replace(pathexpand(var.ssh_public_key_path), ".pub", "") : "cloudcart_ec2"} ubuntu@${aws_instance.cloudcart.public_ip}"
}
