# Kit Backend - Spring Boot REST API

A robust Spring Boot REST API for the Kit Project Management Tool built with Java 21, Spring Security, and PostgreSQL.

## Features

- 🔐 **JWT Authentication** - Stateless token-based security
- 🛡️ **Role-Based Access Control** - Fine-grained permissions
- 📊 **REST APIs** - RESTful endpoints for all operations
- 💾 **JPA Persistence** - Object-relational mapping with Hibernate
- 🔄 **Transaction Management** - ACID compliance
- 📝 **Audit Logging** - Track all data changes
- 🚀 **Spring Boot 3.x** - Latest framework capabilities
- 🧪 **Unit & Integration Tests** - Comprehensive test coverage

## Project Structure

```
backend/
├── src/
│   ├── main/java/com/kit/
│   │   ├── KitBackendApplication.java  # Entry point
│   │   ├── controller/                 # REST endpoints
│   │   │   ├── AuthController.java
│   │   │   ├── ProjectController.java
│   │   │   └── TaskController.java
│   │   ├── service/                    # Business logic
│   │   │   └── AuthService.java
│   │   ├── repository/                 # Data access
│   │   │   ├── UserRepository.java
│   │   │   ├── ProjectRepository.java
│   │   │   └── TaskRepository.java
│   │   ├── entity/                     # JPA entities
│   │   │   ├── User.java
│   │   │   ├── Project.java
│   │   │   ├── Task.java
│   │   │   └── enums/
│   │   ├── dto/                        # Data transfer objects
│   │   │   └── AuthDto.java
│   │   └── security/                   # Security configuration
│   │       ├── SecurityConfig.java
│   │       ├── JwtService.java
│   │       ├── JwtAuthenticationFilter.java
│   │       └── CustomUserDetailsService.java
│   ├── resources/
│   │   └── application.yml             # Configuration
│   └── test/                           # Unit & integration tests
├── pom.xml                             # Maven dependencies
├── mvnw / mvnw.cmd                    # Maven wrapper
├── Dockerfile                          # Container image
└── HELP.md                            # Spring Boot generated docs
```

## Prerequisites

- **Java 21** (JDK)
- **Maven 3.9+**
- **PostgreSQL 15+** (for local development)
- **Docker** (optional, for containerized execution)

## Quick Start

### 1. Local Development Setup

#### Install Java 21

```bash
# Windows (using Chocolatey)
choco install openjdk21

# macOS (using Homebrew)
brew install openjdk@21

# Linux (Ubuntu/Debian)
sudo apt-get install openjdk-21-jdk
```

#### Install Maven

```bash
# Windows
choco install maven

# macOS
brew install maven

# Linux
sudo apt-get install maven
```

#### Setup PostgreSQL (Local)

```bash
# Run PostgreSQL container
docker run -d \
  --name kit-postgres \
  -e POSTGRES_DB=kitdb \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=password \
  -p 5433:5432 \
  postgres:15-alpine
```

### 2. Configure Application

Edit `src/main/resources/application.yml`:

```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5433/kitdb
    username: postgres
    password: password
    driver-class-name: org.postgresql.Driver
  jpa:
    hibernate:
      ddl-auto: update
    properties:
      hibernate:
        dialect: org.hibernate.dialect.PostgreSQLDialect

app:
  jwt:
    secret: your-super-secret-key-min-32-chars
    expiration: 86400000  # 24 hours in ms
```

### 3. Run Locally

#### Using Maven Wrapper

```bash
./mvnw spring-boot:run
```

#### Or using Maven directly

```bash
mvn spring-boot:run
```

The API will be available at: `http://localhost:8080`

### 4. Build JAR

```bash
./mvnw clean package
```

The built JAR will be at: `target/kit-backend-*.jar`

### 5. Run JAR

```bash
java -jar target/kit-backend-0.0.1-SNAPSHOT.jar
```

## Docker Execution

### Build Docker Image

```bash
docker build -t kit-backend .
```

### Run Docker Container

```bash
docker run -p 8080:8080 \
  -e SPRING_DATASOURCE_URL=jdbc:postgresql://host.docker.internal:5433/kitdb \
  -e SPRING_DATASOURCE_USERNAME=postgres \
  -e SPRING_DATASOURCE_PASSWORD=password \
  kit-backend
```

### Using Docker Compose (from root directory)

```bash
docker-compose up backend
```

## API Endpoints

### Authentication

```
POST   /api/auth/register      # Register new user
POST   /api/auth/login         # Login user, get JWT
POST   /api/auth/refresh       # Refresh access token
```

### Projects

```
GET    /api/projects           # List projects
POST   /api/projects           # Create project
GET    /api/projects/{id}      # Get project details
PUT    /api/projects/{id}      # Update project
DELETE /api/projects/{id}      # Delete project
```

### Tasks

```
GET    /api/tasks              # List tasks
POST   /api/tasks              # Create task
GET    /api/tasks/{id}         # Get task details
PUT    /api/tasks/{id}         # Update task
DELETE /api/tasks/{id}         # Delete task
```

### Issues

```
GET    /api/issues             # List issues
POST   /api/issues             # Report issue
GET    /api/issues/{id}        # Get issue details
PUT    /api/issues/{id}        # Update issue status
```

### More Endpoints

- `/api/users` - User management
- `/api/notifications` - Notifications
- `/api/daily-activities` - Activity logs
- `/api/meeting-notes` - Meeting records

See `src/main/java/com/kit/controller/` for complete endpoint definitions.

## Security

### JWT Configuration

JWT tokens are configured in `application.yml`:

```yaml
app:
  jwt:
    secret: ${APP_JWT_SECRET:your-super-secret-key}
    expiration: ${APP_JWT_EXPIRATION:86400000}  # 24 hours
```

### Authorization

Endpoints are protected using Spring Security:

```java
@PreAuthorize("hasRole('PROJECT_MANAGER')")
@PostMapping
public ResponseEntity<ProjectDto> createProject(...) { ... }
```

### CORS Configuration

CORS is configured for development. Update `SecurityConfig` for production:

```java
@Bean
public CorsConfigurationSource corsConfigurationSource() {
    CorsConfiguration config = new CorsConfiguration();
    config.setAllowedOrigins(Arrays.asList("http://localhost:3000"));
    config.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE"));
    // ...
}
```

## Database

### Entity-Relationship Diagram (ERD)

Key entities:
- `User` - System users with roles
- `Project` - Project management
- `Task` - Task assignments
- `Issue` - QA issues and bug reports
- `Comment` - Threaded comments
- `Notification` - Event notifications
- `AuditLog` - Change tracking

### Schema Initialization

Database schema is automatically created by Hibernate on startup (`ddl-auto: update`).

To reset database:

```bash
# Delete PostgreSQL volume
docker-compose down -v

# Restart services
docker-compose up
```

## Development

### Running Tests

#### Unit Tests

```bash
./mvnw test
```

#### Integration Tests

```bash
./mvnw verify -Pintegration-test
```

#### Specific Test Class

```bash
./mvnw test -Dtest=AuthServiceTest
```

### Code Quality

#### Format Code

```bash
./mvnw spotless:apply
```

#### Check Code Style

```bash
./mvnw spotless:check
```

### Debugging

#### Enable Debug Mode

```bash
./mvnw spring-boot:run -Dspring-boot.run.arguments="--debug"
```

#### Remote Debugging

```bash
java -agentlib:jdwp=transport=dt_socket,server=y,suspend=n,address=5005 \
  -jar target/kit-backend-0.0.1-SNAPSHOT.jar
```

Then connect remote debugger to `localhost:5005`.

## Configuration

### Application Properties

Create `application-dev.yml` for development overrides:

```yaml
spring:
  jpa:
    hibernate:
      ddl-auto: create-drop  # Fresh DB each restart
    show-sql: true
    properties:
      hibernate:
        format_sql: true
        use_sql_comments: true
```

### Environment Variables

Supported environment variables:

```bash
SPRING_DATASOURCE_URL=jdbc:postgresql://host:port/db
SPRING_DATASOURCE_USERNAME=user
SPRING_DATASOURCE_PASSWORD=pass
APP_JWT_SECRET=your-secret-key
APP_JWT_EXPIRATION=86400000
SERVER_PORT=8080
```

## Health Check

### Actuator Endpoints

```bash
# Health status
GET http://localhost:8080/actuator/health

# Application metrics
GET http://localhost:8080/actuator/metrics

# Environment properties
GET http://localhost:8080/actuator/env
```

## Monitoring

### Logs

View real-time logs:

```bash
# From Docker
docker-compose logs -f backend

# From local run
# Logs appear in console output
```

### Application Metrics

Check application metrics from `application.yml`:

```yaml
management:
  endpoints:
    web:
      exposure:
        include: health,metrics,info
```

## Troubleshooting

### Port Already in Use

```bash
# Find process using port 8080
netstat -ano | findstr :8080
# Kill process
taskkill /PID <PID> /F
```

### Database Connection Failed

```bash
# Check if PostgreSQL is running
docker ps | grep postgres

# Verify connection parameters in application.yml
# Test connection:
psql -h localhost -p 5433 -U postgres -d kitdb
```

### Build Failures

```bash
# Clean build
./mvnw clean install

# Skip tests
./mvnw clean install -DskipTests

# Verbose output
./mvnw -X clean install
```

### JWT Token Errors

- Verify token format: `Bearer <token-string>`
- Check token expiration time
- Ensure secret key matches in both generation and validation
- Check client includes `Authorization` header correctly

## Performance Tips

1. **Use Pagination** - Always paginate list endpoints
2. **Database Indexing** - Add indexes on frequently searched fields
3. **Connection Pooling** - HikariCP is configured by default
4. **Caching** - Consider Redis for frequently accessed data
5. **Query Optimization** - Use projection for large result sets

## Deploy to Production

### Environment Setup

```bash
export APP_JWT_SECRET=$(openssl rand -base64 32)
export SPRING_DATASOURCE_URL=jdbc:postgresql://prod-db:5432/kitdb
export SPRING_DATASOURCE_USERNAME=prod_user
export SPRING_DATASOURCE_PASSWORD=$(openssl rand -base64 32)
```

### Build & Push Docker Image

```bash
docker build -t myregistry/kit-backend:latest .
docker push myregistry/kit-backend:latest
```

### Deploy on Kubernetes/Cloud

Use the provided Dockerfile with your container orchestration platform.

## Dependencies

See `pom.xml` for complete dependency list:

- **Spring Boot 3.x** - Framework
- **Spring Security** - Authentication/Authorization
- **Spring Data JPA** - ORM/Database access
- **PostgreSQL Driver** - Database connectivity
- **JWT (jjwt)** - Token handling
- **Lombok** - Code generation
- **JUnit 5** - Testing framework
- **Mockito** - Mocking library

## Learn More

- [Spring Boot Documentation](https://spring.io/projects/spring-boot)
- [Spring Security Guide](https://spring.io/guides/topicals/spring-security-architecture/)
- [Spring Data JPA](https://spring.io/projects/spring-data-jpa)
- [JWT Introduction](https://jwt.io/)

## Contributing

When contributing to the backend:

1. Follow Spring Boot best practices
2. Write unit tests for new features
3. Update API documentation
4. Ensure backward compatibility
5. Follow the existing code structure

## Support

For issues or questions:
1. Check [HELP.md](HELP.md) for Spring Boot guides
2. Review [DESIGN.md](../DESIGN.md) for architecture
3. Consult [main README](../README.md)
4. Check GitHub issues for similar problems
