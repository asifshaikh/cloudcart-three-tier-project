provider "aws" {
  region = "ap-south-1"

  default_tags {
    tags = {
      Project     = "CloudCart"
      Environment = "Learning"
      ManagedBy   = "Terraform"
    }
  }
}
