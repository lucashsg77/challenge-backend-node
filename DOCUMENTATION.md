# Challenge Backend Sr. – Node.js

## Project Overview

This project implements a backend challenge with two main endpoints:

1. **/unique-array** (POST)  
   Receives an array of numbers and returns the unique numbers in sorted order.

2. **/external-data** (GET)  
   Queries an external Pokémon API using one of three approaches (GraphQL, REST, or SOAP) and returns processed data. The client can specify additional parameters:
   - **source**: Specifies the approach to use. Valid values are:
     - `graphql` (default)
     - `rest`
     - `soap`
   - **pokemon**: For GraphQL and REST endpoints, specifies which Pokémon to query (default is `"pikachu"`).
   - **number**: For the SOAP endpoint, specifies the number to convert to words (default is `123`).

## File Structure

```
.
├── src
│   ├── app.js                   # Fastify app definition with route registration
│   ├── main.js                  # Entry point to start the server
│   ├── controllers
│   │   ├── externalDataController.js   # Controller for /external-data endpoint
│   │   └── uniqueArrayController.js      # Controller for /unique-array endpoint
│   ├── routes
│   │   ├── externalData.js        # Route for /external-data endpoint
│   │   └── uniqueArray.js         # Route for /unique-array endpoint
│   ├── services
│   │   ├── externalDataService.js           # Service dispatcher that selects a strategy based on query params
│   │   ├── externalDataGraphQLService.js      # GraphQL implementation for external data
│   │   ├── externalDataRestService.js         # REST implementation for external data
│   │   └── externalDataSoapService.js         # SOAP implementation for external data
│   └── validators
│       └── uniqueArrayValidator.js            # JSON schema validation for /unique-array endpoint
├── test
│   ├── app.test.js              # Tests for the root endpoint
│   ├── externalData.test.js     # Tests for the /external-data endpoint
│   └── uniqueArray.test.js      # Tests for the /unique-array endpoint
├── docker-compose.yml           # Docker Compose file for local development/testing
├── Dockerfile                   # Docker build file for the project
├── terraform
│   └── main.tf                  # Terraform configuration to deploy the containerized application (ECS Fargate example)
├── DOCUMENTATION.md             # This documentation file
└── README.md                    # Original challenge readme
```

## Endpoints

### 1. `/unique-array` (POST)

**Description:**  
Receives a JSON object containing an array of numbers and returns an array of unique numbers sorted in ascending order.

**Request Body Example:**

```json
{
  "array": [1, 2, 3, 4, 5, 6, 2, 5, 4, 3, 9, 1, 4, 8, 2, 6, 5, 4]
}
```

**Response Example:**

```json
{
  "uniqueArray": [1, 2, 3, 4, 5, 6, 8, 9]
}
```

**Controller Implementation:**  
The `uniqueArrayController` iterates through the provided array using an object as a hash table to filter duplicates and then sorts the unique numbers in ascending order before returning them.

### 2. `/external-data` (GET)

**Description:**  
Queries an external Pokémon service and returns processed data. This endpoint supports three approaches via the `source` query parameter:

- **GraphQL (default):**  
  Uses the [PokeAPI beta GraphQL endpoint](https://beta.pokeapi.co/graphql/v1beta) to fetch Pokémon data.  
  **Additional Parameter:**  
  - `pokemon`: Specify the Pokémon name (e.g., `charizard`). Default: `"pikachu"`.

- **REST:**  
  Uses the [PokeAPI REST endpoint](https://pokeapi.co/api/v2) to fetch Pokémon data.  
  **Additional Parameter:**  
  - `pokemon`: Specify the Pokémon name (e.g., `charizard`). Default: `"pikachu"`.

- **SOAP:**  
  Uses a SOAP service ([DataAccess Number Conversion](https://www.dataaccess.com/webservicesserver/numberconversion.wso?WSDL)) to convert a number to words.  
  **Additional Parameter:**  
  - `number`: Specify the number to convert (e.g., `456`). Default: `123`.

**Examples:**

- **GraphQL (default):**

  ```bash
  curl -X GET 'http://localhost:3000/external-data?pokemon=Charizard'
  ```

- **REST:**

  ```bash
  curl -X GET 'http://localhost:3000/external-data?source=rest&pokemon=charizard'
  ```

- **SOAP:**

  ```bash
  curl -X GET 'http://localhost:3000/external-data?source=soap&number=456'
  ```

**Controller Implementation:**  
The `externalDataController` extracts query parameters (`source`, `pokemon`, and `number`) and delegates to the service dispatcher (`externalDataService.js`). The dispatcher selects the appropriate strategy (GraphQL, REST, or SOAP), and each service handles its own caching and response processing.

## Running the Project

### Using Node.js

1. **Install Dependencies:**

   ```bash
   npm install
   ```

2. **Start the Server:**

   ```bash
   npm start
   ```

   The server listens on port `3000` by default.

### Using Docker

1. **Build the Docker Image:**

   ```bash
   docker build -t challenge-backend-node .
   ```

2. **Run with Docker Compose:**

   ```bash
   docker-compose up
   ```

   This will build and run the container, mapping port `3000` to your local machine.

## Terraform Deployment

The following is an example Terraform configuration (`terraform/main.tf`) to deploy the containerized application on AWS ECS Fargate. Be sure to replace placeholder values (e.g., `<YOUR_ECR_REPO_URI>`, `<YOUR_SUBNET_ID>`, `<YOUR_SECURITY_GROUP_ID>`) with your actual AWS resource identifiers.

```hcl
# terraform/main.tf
provider "aws" {
  region = "us-east-1"
}

resource "aws_ecs_cluster" "app_cluster" {
  name = "challenge-backend-node-cluster"
}

resource "aws_iam_role" "ecs_task_execution_role" {
  name = "ecsTaskExecutionRole"

  assume_role_policy = jsonencode({
    Version = "2012-10-17",
    Statement = [{
      Action = "sts:AssumeRole",
      Effect = "Allow",
      Principal = {
        Service = "ecs-tasks.amazonaws.com"
      }
    }]
  })
}

resource "aws_iam_role_policy_attachment" "ecs_task_execution_role_policy" {
  role       = aws_iam_role.ecs_task_execution_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

resource "aws_ecs_task_definition" "app_task" {
  family                   = "challenge-backend-node-task"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = "256"
  memory                   = "512"
  execution_role_arn       = aws_iam_role.ecs_task_execution_role.arn

  container_definitions = jsonencode([
    {
      name      = "challenge-backend-node"
      image     = "<YOUR_ECR_REPO_URI>:latest",
      portMappings = [
        {
          containerPort = 3000,
          hostPort      = 3000,
          protocol      = "tcp"
        }
      ],
      essential = true
    }
  ])
}

resource "aws_ecs_service" "app_service" {
  name            = "challenge-backend-node-service"
  cluster         = aws_ecs_cluster.app_cluster.id
  task_definition = aws_ecs_task_definition.app_task.arn
  desired_count   = 1
  launch_type     = "FARGATE"

  network_configuration {
    subnets         = ["<YOUR_SUBNET_ID>"]
    security_groups = ["<YOUR_SECURITY_GROUP_ID>"]
  }
}
```

### Testing the Terraform Configuration

To deploy using Terraform:

1. **Initialize Terraform:**

   ```bash
   terraform init
   ```

2. **Plan the Deployment:**

   ```bash
   terraform plan
   ```

3. **Apply the Deployment:**

   ```bash
   terraform apply
   ```

   Confirm the action when prompted.

## CI/CD Pipeline

A GitHub Actions workflow is provided to run tests, build your Docker image, and push it to Docker Hub on pushes to the `main` branch. Ensure you configure the necessary secrets (e.g., `DOCKERHUB_USERNAME` and `DOCKERHUB_TOKEN`) in your GitHub repository settings.

## Tests

The test suite includes the following:

- **App Root Endpoint:**  
  - Verifies that the root endpoint (`GET /`) returns `{ hello: 'world' }`.

- **Unique Array Endpoint:**  
  - Validates that a POST to `/unique-array` returns a sorted array of unique numbers.
  - Validates error handling for invalid input (e.g., an empty array).

- **External Data Endpoint:**  
  Tests are organized into three describe blocks for each approach:
  - **GraphQL Approach:**  
    Tests successful data retrieval and error handling using the GraphQL service.
  - **REST Approach:**  
    Tests successful data retrieval and error handling using the REST service.
  - **SOAP Approach:**  
    Tests successful data retrieval and error handling using the SOAP service.

To run the tests, use:

```bash
npm test
```

Test files are located in the `test` folder.
