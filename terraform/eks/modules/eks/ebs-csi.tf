
# Retrieve the cluster OIDC issuer
data "aws_eks_cluster" "cloudcart" {
  name = var.cluster_name
}

locals {
  ebs_csi_oidc_issuer = trimprefix(
    data.aws_eks_cluster.cloudcart.identity[0].oidc[0].issuer,
    "https://"
  )
}

# IAM role for the EBS CSI controller
data "aws_iam_policy_document" "ebs_csi_assume_role" {
  statement {
    effect  = "Allow"
    actions = ["sts:AssumeRoleWithWebIdentity"]

    principals {
      type        = "Federated"
      identifiers = [module.eks.oidc_provider_arn]
    }

    condition {
      test     = "StringEquals"
      variable = "${local.ebs_csi_oidc_issuer}:aud"
      values   = ["sts.amazonaws.com"]
    }

    condition {
      test     = "StringEquals"
      variable = "${local.ebs_csi_oidc_issuer}:sub"
      values = [
        "system:serviceaccount:kube-system:ebs-csi-controller-sa"
      ]
    }
  }
}

resource "aws_iam_role" "ebs_csi" {
  name               = "cc-eks-dev-ebs-csi"
  assume_role_policy = data.aws_iam_policy_document.ebs_csi_assume_role.json

  tags = var.tags
}

# AWS managed EBS CSI permissions
resource "aws_iam_role_policy_attachment" "ebs_csi" {
  role       = aws_iam_role.ebs_csi.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonEBSCSIDriverPolicy"
}

# EKS managed EBS CSI add-on
resource "aws_eks_addon" "ebs_csi" {
  cluster_name             = var.cluster_name
  addon_name               = "aws-ebs-csi-driver"
  addon_version            = "v1.67.2-eksbuild.1"
  service_account_role_arn = aws_iam_role.ebs_csi.arn

  depends_on = [
    aws_iam_role_policy_attachment.ebs_csi
  ]

  tags = var.tags
}

output "ebs_csi_role_arn" {
  description = "IAM role used by the EBS CSI controller"
  value       = aws_iam_role.ebs_csi.arn
}
