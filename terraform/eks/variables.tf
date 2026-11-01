variable "aws_region" {
  description = "AWS region for CloudCart"
  type        = string
  default     = "ap-south-1"
}
variable "environment" {
  description = "Environment for CloudCart"
  type        = string
  default     = "dev"
}
variable "cluster_name" {
  description = "EKS cluster name"
  type        = string
  default     = "cloudcart-eks-dev"
}

variable "vpc_cidr" {
  description = "CIDR range for EKS VPC"
  type        = string
  default     = "10.20.0.0/16"
}

variable "availability_zones" {
  description = "Availability Zones for the cluster network"
  type        = list(string)

  default = [
    "ap-south-1a",
    "ap-south-1b"
  ]
}

variable "public_subnet_cidrs" {
  description = "Public subnet CIDRs"
  type        = list(string)

  default = [
    "10.20.0.0/24",
    "10.20.1.0/24"
  ]
}

variable "private_subnet_cidrs" {
  description = "Private subnet CIDRs"
  type        = list(string)

  default = [
    "10.20.10.0/24",
    "10.20.11.0/24"
  ]
}

variable "kubernetes_version" {
  description = "Kubernetes version for EKS"
  type        = string
}

variable "cluster_endpoint_public_access_cidrs" {
  description = "Allowed IPv4 CIDRs for the public EKS endpoint"
  type        = list(string)

  validation {
    condition = (
      length(var.cluster_endpoint_public_access_cidrs) > 0 &&
      alltrue([
        for cidr in var.cluster_endpoint_public_access_cidrs :
        can(cidrnetmask(cidr))
      ])
    )
    error_message = "Provide at least one valid IPv4 CIDR."
  }
}

