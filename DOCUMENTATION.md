# Challenge Backend Sr. – Node.js

## Project Overview

This project implements a backend challenge with three main endpoints:

1. **/unique-array** (POST)  
   Receives an array of numbers and returns the unique numbers in sorted order.

2. **/external-data** (GET)  
   Queries an external service using one of three approaches (GraphQL, REST, or SOAP) and returns processed data. The client can specify additional parameters:
   - **source**: Specifies the approach to use. Valid values are:
     - `graphql` (default)
     - `rest`
     - `soap`
   - **pokemon**: For GraphQL and REST endpoints, specifies which Pokémon to query (default is `"pikachu"`).
   - **number**: For the SOAP endpoint, specifies the number to convert to words (default is `123`).

3. **/health** (GET)  
   Provides health check endpoints with basic and detailed information about the service and its dependencies.

## Key Features

- **Modular Architecture**: Well-organized code structure with clear separation of concerns
- **Logging System**: Comprehensive logging using Pino
- **Request Tracing**: Unique request IDs for tracking requests through the system
- **Rate Limiting**: Protection against excessive requests
- **API Documentation**: Swagger documentation available at `/documentation`
- **Error Handling**: Consistent error responses across endpoints
- **Caching**: In-memory caching for external data requests
- **Health Checks**: Basic and detailed health checks

## File Structure

```
.
├── src
│   ├── app.js                        # Fastify app definition with route registration
│   ├── main.js                       # Entry point to start the server
│   ├── config
│   │   ├── logger.js                 # Logging configuration using Pino
│   │   └── swagger.js                # Swagger/OpenAPI configuration
│   ├── controllers
│   │   ├── externalDataController.js # Controller for /external-data endpoint
│   │   └── uniqueArrayController.js  # Controller for /unique-array endpoint
│   ├── middlewares
│   │   ├── rateLimiter.js            # Rate limiting configuration
│   │   └── requestId.js              # Request ID generation and tracking
│   ├── routes
│   │   ├── externalData.js           # Route for /external-data endpoint
│   │   ├── healthCheck.js            # Route for /health endpoints
│   │   └── uniqueArray.js            # Route for /unique-array endpoint
│   ├── services
│   │   ├── externalDataService.js           # Service dispatcher that selects a strategy
│   │   ├── externalDataGraphQLService.js    # GraphQL implementation for external data
│   │   ├── externalDataRestService.js       # REST implementation for external data
│   │   └── externalDataSoapService.js       # SOAP implementation for external data
│   └── validators
│       └── uniqueArrayValidator.js          # JSON schema validation for array endpoint
├── test
│   ├── app.test.js                   # Tests for the root endpoint
│   ├── externalData.test.js          # Tests for the /external-data endpoint
│   └── uniqueArray.test.js           # Tests for the /unique-array endpoint
├── docker-compose.yml                # Docker Compose file for local development
├── Dockerfile                        # Docker build file for the project
├── terraform
│   └── main.tf                       # Terraform configuration for deployment
├── DOCUMENTATION.md                  # This documentation file
└── README.md                         # Original challenge readme
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
Queries an external service and returns processed data. This endpoint supports three approaches via the `source` query parameter:

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
The `externalDataController` extracts query parameters and delegates to the service dispatcher (`externalDataService.js`). The dispatcher selects the appropriate strategy, and each service handles its own caching and response processing.

### 3. `/health` (GET)

**Description:**  
Provides a basic health check with status and timestamp.

**Response Example:**

```json
{
  "status": "ok",
  "timestamp": "2025-03-15T12:00:00.000Z"
}
```

### 3.1 `/health/detailed` (GET)

**Description:**  
Provides a detailed health check including:
- Server uptime
- Host information
- External service statuses (GraphQL, REST, SOAP)
- Memory usage statistics

**Response Example:**

```json
{
  "status": "ok",
  "timestamp": "2025-03-15T12:00:00.000Z",
  "uptime": 1234.56,
  "host": "server-hostname",
  "services": {
    "graphql": { "status": "ok" },
    "rest": { "status": "ok" },
    "soap": { "status": "ok" }
  },
  "memory": {
    "rss": "45MB",
    "heapTotal": "32MB",
    "heapUsed": "25MB"
  }
}
```

## Core Technical Components

### 1. Logging System

The application uses Pino for structured logging with the following features:
- Log levels configurable via environment variables
- Pretty printing in development mode
- JSON output in production
- Request context enrichment
- Service identification in logs

### 2. Request Tracking

Every request receives a unique identifier:
- Generated using UUID v4 if not provided
- Preserved in request header (`x-request-id`)
- Included in all log entries related to the request
- Passed to external services for distributed tracing

### 3. Rate Limiting

Protection against excessive requests with:
- Configurable request limits via environment variables
- IP-based rate limiting
- Structured error responses
- Detailed logging of rate limit violations

### 4. Error Handling

Consistent error handling throughout the application:
- Validation errors return 400 with details
- External service errors map to appropriate HTTP status codes
- Detailed logging of all errors
- User-friendly error messages

### 5. Caching

In-memory caching for external data requests:
- Time-based expiration (60 seconds)
- Separate caches for each external service
- Detailed cache hit/miss logging

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

## Environment Variables

The application can be configured using the following environment variables:

| Variable | Description | Default Value |
|----------|-------------|---------------|
| `PORT` | Port number for the server | `3000` |
| `HOST` | Host address to bind to | `0.0.0.0` |
| `NODE_ENV` | Environment (`development` or `production`) | `development` |
| `LOG_LEVEL` | Logging level (debug, info, warn, error) | `info` (`debug` in development) |
| `RATE_LIMIT_MAX` | Maximum requests per window | `100` |
| `RATE_LIMIT_WINDOW` | Time window for rate limiting | `1 minute` |

## Testing

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

- **Health Check Endpoint:**
  - Verifies that the basic health check endpoint (`GET /health`) returns status information.
  - Tests the detailed health check endpoint (`GET /health/detailed`) for comprehensive system status.
  - Validates that the health check correctly reports service status (ok, degraded, or error).

To run the tests, use:

```bash
npm test
```

## Terraform Deployment

The included Terraform configuration (`terraform/main.tf`) provides an example for deploying the application to AWS ECS Fargate. Be sure to customize the configuration with your actual AWS resource identifiers before deployment.

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

## Security Considerations

The application implements several security best practices:
- Rate limiting to prevent abuse
- Request tracking for audit trails
- Structured error responses that don't expose sensitive information
- Validation of all inputs
- Timeouts on external service calls

## Continuous Integration/Continuous Deployment

The project includes a CI/CD pipeline implemented with GitHub Actions for automated testing, building, and deployment.

This pipeline automatically:
- Runs on pushes to the main branch and on pull requests
- Sets up a Node.js environment
- Installs dependencies
- Runs the test suite
- Builds a Docker image
- Pushes the image to Docker Hub

To use this pipeline, configure the following secrets in your GitHub repository:
- `DOCKERHUB_USERNAME`: Your Docker Hub username
- `DOCKERHUB_TOKEN`: A Docker Hub access token with push permissions
