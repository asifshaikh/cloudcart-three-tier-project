variable "aws_region" {
  description = "AWS region for CloudCart"
  type        = string
  default     = "ap-south-1"
}

variable "project_name" {
  description = "Name of the Project"
  type        = string
  default     = "cloudcart"
}

variable "instance_type" {
  description = "EC2 instance type for cloudcart"
  type        = string
  default     = "t3.micro"
}

# variable "ssh_public_key_path" {
#   description = "Path to your SSH public key"
#   type        = string
# }

variable "allowed_ssh_cidr" {
  description = "Your public IPv4 address in CIDR notation"
  type        = string
  validation {
    condition = (
      can(cidrnetmask(var.allowed_ssh_cidr)) &&
      endswith(var.allowed_ssh_cidr, "/32")
    )

    error_message = "Provide one IPv4 address with /32, for example 203.0.113.10/32."
  }
}

variable "enable_ssh" {
  description = "Whether to allow restricted SSH administration"
  type        = bool
  default     = false
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
