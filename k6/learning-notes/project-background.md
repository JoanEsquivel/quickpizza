# QuickPizza Monolithic Architecture Overview

## What is QuickPizza?

QuickPizza is a demonstration web application built by Grafana that generates creative pizza combinations. It's designed specifically for showcasing performance testing with k6 and observability with the Grafana stack.

## Monolithic Architecture

In monolithic mode (the default), QuickPizza runs as a single Go binary that contains all services within one process. The architecture follows a modular design where different functional areas are organized as separate service components that can be enabled or disabled via environment variables.

### Core Architecture Story

The application starts as a single HTTP server on port 3333, built using the Chi router framework. When a request arrives, it flows through a middleware stack that handles cross-cutting concerns like metrics collection, logging, CORS, and authentication. The router then directs the request to the appropriate service handler based on the URL path.

### Service Components

#### 1. HTTP Server Foundation
The central `Server` struct in `pkg/http/` orchestrates all functionality:

- **Router**: Chi-based HTTP router with middleware stack
- **Middleware**: Prometheus metrics, structured logging, CORS, authentication, error recovery
- **Service Registration**: Modular service enablement based on environment variables

#### 2. Database Layer
Unified data access using Bun ORM with two database instances:

- **Catalog Database**: Manages pizzas, ingredients, users, ratings, and tools
- **Copy Database**: Manages text content (quotes, names, adjectives for pizza naming)
- **Database Support**: SQLite (default, in-memory) or PostgreSQL
- **Migrations**: Automated schema creation and seed data population

#### 3. Service Enablement Logic
Services are enabled using flexible environment variable configuration:

```
Default: All services enabled (QUICKPIZZA_ENABLE_ALL_SERVICES not set or true)
Individual: Set QUICKPIZZA_ENABLE_*_SERVICE=true to enable specific services
```

#### 4. Core Business Services

**Frontend Service**: Serves the embedded Svelte.js web application with static assets built into the binary.

**Catalog Service**: The data backbone of the application:
- Manages pizza ingredients categorized by type (olive_oil, tomato, mozzarella, topping)
- Handles dough varieties and pizza-making tools
- Provides user registration, authentication, and session management
- Manages pizza ratings with full CRUD operations
- Stores generated pizza recommendations

**Copy Service**: Provides textual content for pizza naming:
- Pizza-related quotes for flavor text
- Classical pizza names (Margherita, Napolitana, etc.)
- Descriptive adjectives for creative pizza naming

**Recommendations Service**: The core pizza generation engine:
- Accepts user restrictions (calories, vegetarian preferences, excluded ingredients)
- Fetches ingredients, tools, and doughs from the Catalog service
- Retrieves naming components from the Copy service
- Generates randomized pizza combinations with creative names
- Calculates nutritional information and validates restrictions
- Persists recommendations to the database for future reference

**WebSocket Service**: Enables real-time communication with simple message broadcasting.

**Configuration Service**: Exposes runtime configuration through environment variables.

#### 5. Testing and Utility Services

**HTTP Testing Service**: Provides httpbin-like endpoints for testing:
- Status code generation, data echo, delays, header inspection
- Cookie manipulation and basic authentication testing

**Test K6.io Service**: Legacy compatibility for test.k6.io endpoints with interactive features.

**gRPC Service**: Optional Protocol Buffer-based API for advanced testing scenarios.

### Data Models

The application uses well-defined Go structs with JSON serialization:

- **Pizza**: Contains ID, name, dough type, ingredients list, and cooking tool
- **Ingredient**: Defines name, calories per slice, vegetarian status, and type category
- **User**: Manages authentication tokens and user data
- **Rating**: Links users to pizza ratings with 1-5 star values

### Request Flow Example

1. User makes POST request to `/api/pizza` with dietary restrictions
2. Middleware stack processes authentication and logging
3. Recommendations service validates restrictions and fetches data from Catalog/Copy services
4. Algorithm generates pizza with randomized ingredients and creative naming
5. Nutritional calculation ensures restrictions are met
6. Generated pizza is stored in database and returned to user
7. Prometheus metrics record the recommendation event

### Observability Integration

**Metrics**: Built-in Prometheus metrics for pizza recommendations, HTTP requests, ingredient counts, and calorie distributions.

**Logging**: Structured JSON logging with request correlation and configurable levels.

**Tracing**: OpenTelemetry integration for distributed tracing across service boundaries.

**Profiling**: Pyroscope integration with CPU, memory, and goroutine profiling capabilities.

### Configuration

The monolithic application is highly configurable through environment variables:

- **Service Control**: Enable/disable individual services
- **Database**: Connection strings for SQLite or PostgreSQL
- **Observability**: Endpoints for metrics, tracing, and profiling systems
- **HTTP Client**: Retry logic, timeouts, and backoff strategies

### Why This Architecture Works

The monolithic design provides several advantages:

1. **Simplicity**: Single binary deployment with no service coordination complexity
2. **Performance**: In-process communication eliminates network latency between services
3. **Development**: Easy local development and debugging experience
4. **Observability**: Comprehensive instrumentation built into every component
5. **Flexibility**: Can selectively disable services or migrate to microservices later

This architecture demonstrates how to build a modern, observable monolithic application that maintains clean separation of concerns while providing excellent performance and developer experience.