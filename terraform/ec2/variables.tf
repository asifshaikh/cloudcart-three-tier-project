
variable "aws_region" {
  description = "AWS region for CloudCart"
  type        = string
  default     = "ap-south-1"
}

variable "project_name" {
  description = "Name of the project"
  type        = string
  default     = "cloudcart"
}

variable "instance_type" {
  description = "EC2 instance type for CloudCart"
  type        = string
  default     = "t3.micro"
}

variable "ssh_public_key_path" {
  description = "Path to the SSH public key"
  type        = string
  default     = "~/.ssh/id_ed25519.pub"
}

variable "allowed_ssh_cidr" {
  description = "Public IPv4 address permitted to SSH"
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
  description = "Enable SSH access to EC2"
  type        = bool
  default     = true
}

variable "enable_github_actions_ssh" {
  description = "Enable GitHub Actions SSH access to EC2"
  type        = bool
  default     = true
}
