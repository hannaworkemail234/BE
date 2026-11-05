# Simple Node.js Backend

A simple Node.js backend with POST and GET APIs that save and retrieve user data from a JSON file.

## Features

- **POST /api/users** - Add a new user with name, age, and address
- **GET /api/users** - Retrieve all users
- **GET /api/users/ids** - Retrieve each user's ID with identifying details
- **GET /api/users/:id** - Retrieve one user's details by ID
- **PUT /api/users/:id** - Update a user's name, age, and/or address
- **DELETE /api/users/:id** - Delete a user by ID
- **GET /health** - Health check endpoint

## Installation

1. Install dependencies:
```bash
npm install
```

## Running the Server

Start the server:
```bash
npm start
```

The server will run on `http://localhost:3000`

To use a different port in Command Prompt:
```cmd
set PORT=3001 && npm start
```

## API Endpoints

### POST /api/users
Add a new user to the database.

**Request Body:**
```json
{
  "name": "John Doe",
  "age": 30,
  "address": "123 Main St, City, Country"
}
```

**Response:**
```json
{
  "message": "User added successfully",
  "data": {
    "id": 1,
    "name": "John Doe",
    "age": 30,
    "address": "123 Main St, City, Country",
    "createdAt": "2024-11-04T15:30:00.000Z"
  }
}
```

### GET /api/users
Retrieve all users.

**Response:**
```json
{
  "message": "Users retrieved successfully",
  "count": 1,
  "data": [
    {
      "id": 1,
      "name": "John Doe",
      "age": 30,
      "address": "123 Main St, City, Country",
      "createdAt": "2024-11-04T15:30:00.000Z"
    }
  ]
}
```

### GET /api/users/ids
Retrieve a compact list showing which ID belongs to each user. Age and address are included to distinguish users with the same name.

**Response:**
```json
{
  "message": "User IDs retrieved successfully",
  "count": 2,
  "data": [
    {
      "id": 1,
      "name": "John Doe",
      "age": 30,
      "address": "123 Main St, City, Country"
    },
    {
      "id": 2,
      "name": "Jane Doe",
      "age": 28,
      "address": "456 Oak St, City, Country"
    }
  ]
}
```

### GET /api/users/:id
Retrieve one user's details by ID. Returns `404` if not found and `400` if the ID isn't an integer.

**Response:**
```json
{
  "message": "User retrieved successfully",
  "data": {
    "id": 1,
    "name": "John Doe",
    "age": 30,
    "address": "123 Main St, City, Country",
    "createdAt": "2024-11-04T15:30:00.000Z"
  }
}
```

### PUT /api/users/:id
Update a user by ID. Send any of `name`, `age`, `address`; omitted fields are unchanged. Returns `400` for invalid input or no fields, and `404` if not found.

**Request Body:**
```json
{
  "age": 31,
  "address": "999 New St"
}
```

**Response:**
```json
{
  "message": "User updated successfully",
  "data": {
    "id": 1,
    "name": "John Doe",
    "age": 31,
    "address": "999 New St",
    "createdAt": "2024-11-04T15:30:00.000Z",
    "updatedAt": "2024-11-05T02:00:00.000Z"
  }
}
```

### DELETE /api/users/:id
Delete a user by ID. Returns the deleted record, `404` if not found, and `400` if the ID isn't an integer. IDs of deleted users are not reused while a higher ID exists.

**Response:**
```json
{
  "message": "User deleted successfully",
  "data": {
    "id": 1,
    "name": "John Doe",
    "age": 30,
    "address": "123 Main St, City, Country",
    "createdAt": "2024-11-04T15:30:00.000Z"
  }
}
```

### GET /health
Check if the server is running.

**Response:**
```json
{
  "status": "Server is running"
}
```

## Data Storage

User data is stored in `data.json` file in the root directory. The file is automatically created when the server starts.

## Testing with curl

```bash
# Add a user
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","age":30,"address":"123 Main St"}'

# Get all users
curl http://localhost:3000/api/users

# Get user IDs and identifying details
curl http://localhost:3000/api/users/ids

# Get user by ID
curl http://localhost:3000/api/users/1

# Update user
curl -X PUT http://localhost:3000/api/users/1 \
  -H "Content-Type: application/json" \
  -d '{"age":31}'

# Delete user
curl -X DELETE http://localhost:3000/api/users/1

# Health check
curl http://localhost:3000/health
```
