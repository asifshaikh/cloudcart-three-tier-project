# Ubuntu Server 24.04 LTS - current amd64 AMI
data "aws_ssm_parameter" "ubuntu_ami" {
  name = "/aws/service/canonical/ubuntu/server/24.04/stable/current/amd64/hvm/ebs-gp3/ami-id"
}

# EC2 instance for CloudCart deployment
resource "aws_instance" "cloudcart" {
  ami                    = data.aws_ssm_parameter.ubuntu_ami.value
  instance_type          = var.instance_type
  subnet_id              = aws_subnet.public.id
  vpc_security_group_ids = [aws_security_group.cloudcart.id]

  iam_instance_profile        = aws_iam_instance_profile.cloudcart_ec2.name
  associate_public_ip_address = true
  metadata_options {
    http_endpoint               = "enabled"
    http_tokens                 = "required"
    http_put_response_hop_limit = 1
  }

  root_block_device {
    volume_size           = 20
    volume_type           = "gp3"
    encrypted             = true
    delete_on_termination = true

    tags = {
      Name = "${var.project_name}-root-volume"
    }
  }

  # Read bootstrap script from a seperate file
  user_data = file("${path.root}/../../scripts/user_data.sh")

  tags = {
    Name = "${var.project_name}-ec2"
    Tier = "Application"
  }
  depends_on = [
    aws_iam_role_policy_attachment.ssm_core
  ]
}
