AWS_ACCOUNT_ID="984576523012"
AWS_REGION="us-west-2"
ECR_REPOSITORY_NAME="smart-home-api-gateway"

# Log in to AWS ECR
echo "Logging in to Amazon ECR..."
aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com

# Build the Docker image
echo "Building Docker image..."
docker build -t $ECR_REPOSITORY_NAME .

# Tag the image for ECR
echo "Tagging Docker image..."
docker tag $ECR_REPOSITORY_NAME:latest $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPOSITORY_NAME:latest

# Push the image to ECR
echo "Pushing Docker image to ECR..."
docker push $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPOSITORY_NAME:latest

echo "Docker image has been successfully built and pushed to ECR!"