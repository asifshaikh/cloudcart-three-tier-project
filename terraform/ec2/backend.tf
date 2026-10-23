terraform {
  backend "s3" {
    bucket       = "cloudcart-tfstate-825834484870-ap-south-1"
    key          = "cloudcart/terraform/ec2/terraform.tfstate"
    region       = "ap-south-1"
    encrypt      = true
    use_lockfile = true
  }
}
