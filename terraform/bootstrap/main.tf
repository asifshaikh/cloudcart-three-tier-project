# Identify the AWS account running Terraform
data "aws_caller_identity" "current" {}

# Creating S3 bucket used for main Terraform state
resource "aws_s3_bucket" "terraform_state" {
  bucket = "cloudcart-tfstate-${data.aws_caller_identity.current.account_id}-ap-south-1"

  # Protect against accidential deletion
  lifecycle {
    prevent_destroy = true
  }
}

# Enable versioning to recover earlier state versions.
resource "aws_s3_bucket_versioning" "terraform_state" {
  bucket = aws_s3_bucket.terraform_state.id

  versioning_configuration {
    status = "Enabled"
  }
}

# Encrypt objects stored in the bucket
resource "aws_s3_bucket_server_side_encryption_configuration" "terraform_state" {
  bucket = aws_s3_bucket_versioning.terraform_state.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

# Block public access to the state bucket
resource "aws_s3_bucket_public_access_block" "terraform_state" {
  bucket = aws_s3_bucket.terraform_state.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# Prevent ACLs from granting access to bucket objects
resource "aws_s3_bucket_ownership_controls" "terraform_state" {
  bucket = aws_s3_bucket.terraform_state.id

  rule {
    object_ownership = "BucketOwnerEnforced"
  }
}
