variable "name" {
  description = "Name prefix for networking resources"
  type        = string
}
variable "vpc_cidr" {
  description = "IPv4 CIDR range for the VPC"
  type        = string
}

variable "availability_zones" {
  description = "Availability Zones for the VPC"
  type        = list(string)
}

variable "public_subnet_cidrs" {
  description = "Public subnet CIDRs"
  type        = list(string)
}

variable "private_subnet_cidrs" {
  description = "Private subnet CIDRs"
  type        = list(string)
}

variable "tags" {
  description = "Common resource tags"
  type        = map(string)
  default     = {}
}
