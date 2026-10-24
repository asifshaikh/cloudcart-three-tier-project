# IAM role assumed by EC2
resource "aws_iam_role" "cloudcart_ec2" {
  name = "${var.project_name}-ec2-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ec2.amazonaws.com"
        }
      }
    ]
  })

  tags = {
    Name = "${var.project_name}-ec2-role"
  }
}

# Allow EC2 to communicate with AWS Systems Manager
resource "aws_iam_role_policy_attachment" "ssm_core" {
  role       = aws_iam_role.cloudcart_ec2.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
}

# Instance profile connects with the IAM role to EC2
# AWS EC2 uses an instance profile to deliver the role's temporary credentials to the instance.
# When you create a role through the normal IAM console workflow with the EC2 use case, AWS creates an instance profile associated with that role as part of the role creation process.
resource "aws_iam_instance_profile" "cloudcart_ec2" {
  name = "${var.project_name}-ec2-profile"
  role = aws_iam_role.cloudcart_ec2.name
  tags = {
    Name = "${var.project_name}-ec2-profile"
  }
}
