resource "aws_security_group" "cloudcart" {
  name_prefix = "${var.project_name}-sg-"
  vpc_id      = aws_vpc.cloudcart.id
  description = "Security group for CloudCart EC2 instances"

  ingress {
    description = "HTTP access to CloudCart frontend"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  # Optional administrative SSH access
  dynamic "ingress" {
    for_each = var.enable_ssh ? [1] : []
    content {
      description = "SSH access to CloudCart instances"
      from_port   = 22
      to_port     = 22
      protocol    = "tcp"
      cidr_blocks = [var.allowed_ssh_cidr]
    }
  }
  # Outbound access for package downloads, image pulls, etc.
  egress {
    description = "Outbound IPv4 traffic"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.project_name}-sg"
  }
  lifecycle {
    create_before_destroy = true
  }
}
