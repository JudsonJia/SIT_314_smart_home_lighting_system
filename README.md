# Smart Home Lighting System with Microservices Architecture

## Project Overview

This project implements a comprehensive smart home lighting system based on a microservices architecture. It demonstrates the effective use of microservices in IoT applications, providing modularity, scalability, and ease of maintenance.

## Key Features

- Microservices-based architecture
- Real-time device management and control
- Sensor data collection and analysis
- Automated and manual lighting control
- Task scheduling
- Energy consumption analytics
- User-friendly web interface
- Secure API Gateway with Helmet integration

## System Architecture

The system consists of the following components:

1. API Gateway
2. Authentication Service
3. Device Management Service
4. Sensor Data Service
5. Lighting Control Service
6. Scheduling Service
7. Analytics Service
8. MongoDB Database
9. Web Application

## Technologies Used

- Node.js and Express.js for backend services
- React.js for frontend web application
- MongoDB for data storage
- Docker for containerization
- AWS for cloud deployment
- Helmet for enhanced API security

## Setup and Installation

1. Clone the repository:
https://github.com/JudsonJia/SIT_314_smart_home_lighting_system.git

2. Install dependencies for each service:
cd <service-directory>
npm install

3. Set up environment variables:
- Create a `.env` file in each service directory
- Add necessary environment variables (database URL, API keys, etc.)

4. Start the services:
docker-compose up

5. Access the web application at `http://localhost:3000`

## API Documentation

API documentation can be found in the `docs` directory.

## Security

This project implements several security measures:
- JWT for authentication
- Helmet middleware in API Gateway for enhanced HTTP security
- HTTPS enforcement
- Rate limiting to prevent DoS attacks

## Scalability

The microservices architecture allows for independent scaling of services. The project is deployed on AWS, leveraging cloud scalability features.
