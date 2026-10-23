# Discover available availability zones in the selected region
data "aws_availability_zones" "available" {
  state = "available"
}

# CloudCart VPC
resource "aws_vpc" "cloudcart" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name = "${var.project_name}-vpc"
  }
}

# Public subnet for the initial EC2 deployment
resource "aws_subnet" "public" {
  vpc_id                  = aws_vpc.cloudcart.id
  cidr_block              = "10.0.1.0/24"
  availability_zone       = data.aws_availability_zones.available.names[0]
  map_public_ip_on_launch = true

  tags = {
    Name = "${var.project_name}-public-subnet"
    Tier = "Public"
  }
}

# Internet Gateway connects the VPC to the internet
resource "aws_internet_gateway" "cloudcart" {
  vpc_id = aws_vpc.cloudcart.id

  tags = {
    Name = "${var.project_name}-igw"
  }
}

# Route table for the public subnet
resource "aws_route_table" "public" {
  vpc_id = aws_vpc.cloudcart.id

  tags = {
    Name = "${var.project_name}-public-rt"
  }
}

# Route the public subnet traffic through the IGW
resource "aws_route" "public_internet" {
  route_table_id         = aws_route_table.public.id
  destination_cidr_block = "0.0.0.0/0"
  gateway_id             = aws_internet_gateway.cloudcart.id
}

# Associate the public route table to the public subnet
resource "aws_route_table_association" "public" {
  subnet_id      = aws_subnet.public.id
  route_table_id = aws_vpc.cloudcart.main_route_table_id
}
