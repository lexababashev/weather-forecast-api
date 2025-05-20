# Weather Forecast API

### Main flow of test case done. Sending mails mocked and displayed in console for demo

![Weather API](https://img.shields.io/badge/API-Weather%20Forecast-blue)
![NestJS](https://img.shields.io/badge/NestJS-11.0.1-red)
![Prisma](https://img.shields.io/badge/Prisma-6.8.2-blueviolet)
![License](https://img.shields.io/badge/License-UNLICENSED-yellow)

A powerful Weather API application that allows users to subscribe to weather updates for their city. Receive current weather data and subscribe to regular updates via email.

## 🌦️ Features

- **Current Weather Data**: Get real-time weather information for any city
- **Email Subscriptions**: Subscribe to regular weather updates
- **Customizable Frequency**: Choose between hourly or daily updates
- **Simple Management**: Easy subscription confirmation and unsubscription

## 🚀 Tech Stack

- **[NestJS](https://nestjs.com/)**: A progressive Node.js framework for building efficient and scalable server-side applications
- **[Prisma](https://www.prisma.io/)**: Next-generation ORM for Node.js and TypeScript
- **[TypeScript](https://www.typescriptlang.org/)**: Typed JavaScript at any scale
- **[Docker](https://www.docker.com/)**: Containerization platform for easy deployment
- **[WeatherAPI.com](https://www.weatherapi.com/)**: Third-party service for accurate weather data

## 🛠️ Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm
- Docker and Docker Compose

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/weather-forecast-api.git
cd weather-forecast-api
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
```bash
# Create .env file with your configuration
cp .env.example .env
```

4. Start the database using Docker
```bash
# Start PostgreSQL database in Docker
docker-compose up -d db
```

5. Generate Prisma client
```bash
npx prisma generate
```

6. Run database migrations and Generate Prisma client
```bash
npx prisma migrate dev
```

### Running the Application

#### Development mode
```bash
npm run start:dev
```

#### Production mode
```bash
npm run build
npm run start:prod
```

#### Using Docker
```bash
docker-compose up -d
```

## 📋 API Documentation

### Weather Endpoints

#### Get Current Weather
```http
GET /api/weather?city={cityName}
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `city` | `string` | **Required**. City name for weather forecast |

**Success Response (200)**
```json
{
  "temperature": 25.5,
  "humidity": 65,
  "description": "Partly cloudy"
}
```

### Subscription Endpoints

#### Subscribe to Weather Updates
```http
POST /api/subscribe
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `email` | `string` | **Required**. Email address to subscribe |
| `city` | `string` | **Required**. City for weather updates |
| `frequency` | `string` | **Required**. Frequency of updates ("hourly" or "daily") |

#### Confirm Subscription
```http
GET /api/confirm/{token}
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `token` | `string` | **Required**. Confirmation token |

#### Unsubscribe from Updates
```http
GET /api/unsubscribe/{token}
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `token` | `string` | **Required**. Unsubscribe token |

## 📬 Contact

For any questions or support, please contact [alex.babashev@gmail.com]
(alex.babashev@gmail.com)
