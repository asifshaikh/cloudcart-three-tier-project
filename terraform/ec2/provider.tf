provider "aws" {
  region = var.aws_region
  default_tags {
    tags = {
      Project     = "CloudCart"
      Environment = "Learning"
      ManagedBy   = "Terraform"
    }
  }
}
