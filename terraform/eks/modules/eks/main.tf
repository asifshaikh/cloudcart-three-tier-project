
module "eks" {
  source  = "terraform-aws-modules/eks/aws"
  version = "21.26.0"

  name               = var.cluster_name
  kubernetes_version = var.kubernetes_version

  # Existing CloudCart networking
  vpc_id     = var.vpc_id
  subnet_ids = var.private_subnet_ids

  # Kubernetes API endpoint
  endpoint_private_access      = true
  endpoint_public_access       = true
  endpoint_public_access_cidrs = var.cluster_endpoint_public_access_cidrs

  # Give the Terraform execution identity
  # administrator access to the cluster.
  enable_cluster_creator_admin_permissions = true

  # Explicit EKS authentication configuration
  authentication_mode = "API"

  # Managed EKS add-ons
  addons = {
    vpc-cni = {
      before_compute = true
    }

    kube-proxy = {}

    coredns = {}
  }

  # Managed worker nodes

  eks_managed_node_groups = {
    cloudcart-workers = {
      name = "${var.cluster_name}-workers"

      # Explicit, shorter IAM role name
      iam_role_name            = "cc-eks-dev-workers"
      iam_role_use_name_prefix = false

      ami_type       = "AL2023_x86_64_STANDARD"
      instance_types = ["m7i-flex.large"]
      capacity_type  = "ON_DEMAND"

      min_size     = 1
      max_size     = 3
      desired_size = 2

      subnet_ids = var.private_subnet_ids

      disk_size = 20

      labels = {
        Project     = "CloudCart"
        Environment = var.environment
      }
    }
  }


  # Consistent tagging
  tags = var.tags
}
