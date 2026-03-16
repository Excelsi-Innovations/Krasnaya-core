# Management API Documentation

The Management API provides a public interface for managing bot scripts, executing commands, and monitoring outputs.

## Base URL
```
http://localhost:3000/management
```

## Authentication
*Note: Authentication is planned for future versions. Currently, the API is open.*

## Script Management Endpoints

### Create a Script
**POST** `/scripts`

Create a new bot script.

**Request Body:**
```json
{
  "name": "Welcome Command",
  "description": "Greets new users",
  "version": "1.0.0",
  "ast": {
    "type": "sequence",
    "nodes": [
      {
        "type": "say",
        "text": "Welcome to our server!"
      }
    ]
  },
  "isActive": true,
  "metadata": {
    "tags": ["welcome", "onboarding"]
  }
}
```

**Response:** `201 Created`
```json
{
  "id": 1,
  "name": "Welcome Command",
  "description": "Greets new users",
  "version": "1.0.0",
  "isActive": true,
  "createdAt": "2026-03-16T15:00:00.000Z",
  "updatedAt": "2026-03-16T15:00:00.000Z"
}
```

### List All Scripts
**GET** `/scripts`

**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "name": "Welcome Command",
    "description": "Greets new users",
    "version": "1.0.0",
    "isActive": true,
    "createdAt": "2026-03-16T15:00:00.000Z",
    "updatedAt": "2026-03-16T15:00:00.000Z"
  }
]
```

### Get Script by ID
**GET** `/scripts/:id`

**Response:** `200 OK` or `404 Not Found`

### Update Script
**PUT** `/scripts/:id`

**Request Body:** Same as Create, partial updates allowed.

### Delete Script
**DELETE** `/scripts/:id`

**Response:** `204 No Content`

## Execution Endpoints

### Execute Command Manually
**POST** `/execution/execute`

Execute a script immediately (synchronous execution for manual triggers).

**Request Body:**
```json
{
  "scriptId": "1",
  "platform": "discord",
  "chatId": "123456789",
  "userId": "user123",
  "context": {
    "priority": "high"
  }
}
```

**Response:** `202 Accepted`
```json
{
  "id": 1,
  "scriptId": 1,
  "platform": "discord",
  "chatId": "123456789",
  "userId": "user123",
  "status": "success",
  "output": "Execution completed",
  "executionTime": 150,
  "createdAt": "2026-03-16T15:00:00.000Z"
}
```

### Get Execution Logs
**GET** `/execution/logs`

**Query Parameters:**
- `scriptId` (optional): Filter by script ID
- `limit` (optional, default: 50): Number of logs to return
- `offset` (optional, default: 0): Pagination offset

**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "scriptId": 1,
    "platform": "discord",
    "chatId": "123456789",
    "userId": "user123",
    "status": "success",
    "output": "Execution completed",
    "executionTime": 150,
    "createdAt": "2026-03-16T15:00:00.000Z"
  }
]
```

### Get Execution Log by ID
**GET** `/execution/logs/:id`

**Response:** `200 OK` or `404 Not Found`

### Get Dashboard Statistics
**GET** `/execution/stats`

**Response:** `200 OK`
```json
{
  "totalScripts": 5,
  "activeScripts": 4,
  "totalExecutions": 150,
  "failedExecutions": 3,
  "successRate": "98.00"
}
```

## Example Workflow

1. **Create a script:**
   ```bash
   curl -X POST http://localhost:3000/management/scripts \
     -H "Content-Type: application/json" \
     -d '{
       "name": "Greeting",
       "version": "1.0.0",
       "ast": {
         "type": "say",
         "text": "Hello World!"
       }
     }'
   ```

2. **Execute it manually:**
   ```bash
   curl -X POST http://localhost:3000/management/execution/execute \
     -H "Content-Type: application/json" \
     -d '{
       "scriptId": "1",
       "platform": "discord",
       "chatId": "123456789"
     }'
   ```

3. **Check the logs:**
   ```bash
   curl http://localhost:3000/management/execution/logs?scriptId=1
   ```

## Error Responses

**Validation Error (400 Bad Request):**
```json
{
  "statusCode": 400,
  "message": ["name must be a string"],
  "error": "Bad Request"
}
```

**Not Found (404 Not Found):**
```json
{
  "statusCode": 404,
  "message": "Script with ID 999 not found",
  "error": "Not Found"
}
```
