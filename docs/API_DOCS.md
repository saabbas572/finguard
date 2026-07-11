# FINGAURD API Documentation

Complete API reference for the FINGAURD financial rule engine and alert management system.

## Quick Start

### 1. **View Interactive Swagger Documentation**

The Swagger/OpenAPI documentation is available in YAML format at `docs/SWAGGER_DOCS.yaml`.

**To view interactively:**
- Copy the content from `SWAGGER_DOCS.yaml`
- Visit [Swagger Editor](https://editor.swagger.io/)
- Paste the YAML content
- Explore all endpoints interactively

**Or run locally with Swagger UI:**
```bash
# Install Swagger UI globally (optional)
npm install -g swagger-ui

# Open in your default browser
swagger-ui SWAGGER_DOCS.yaml
```

### 2. **Use Postman Collection**

Import the Postman collection for automated testing with pre-configured requests.

**Steps:**
1. Open Postman
2. Click **Import** → **Upload Files**
3. Select `docs/POSTMAN_COLLECTION.json`
4. Set environment variables in Postman:
   - Create a new environment called "FINGAURD"
   - Add base URL variable if needed
5. Start with **Authentication** folder → **Login**
6. Tests will auto-populate token and other variables
7. Use generated IDs in subsequent requests

---

## API Overview

### Base URL
```
http://localhost:5000/api
```

### Authentication

All endpoints (except login/register) require Bearer token authentication:

```bash
Authorization: Bearer <token>
```

**Token obtained from:**
- `POST /auth/register` — New user registration
- `POST /auth/login` — User login

**Token expiration:** 7 days

---

## Endpoints Summary

### **Authentication** (No token required)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Create new user account |
| POST | `/auth/login` | Authenticate and get token |

### **Scenarios** (Token required)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/scenarios` | Create new scenario/rule |
| GET | `/scenarios` | Get all user's scenarios |
| GET | `/scenarios/{id}` | Get specific scenario |
| PUT | `/scenarios/{id}` | Update scenario |
| DELETE | `/scenarios/{id}` | Delete scenario |
| PATCH | `/scenarios/{id}/toggle` | Toggle active status |

### **Pipeline** (Token required)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/pipeline/evaluate` | Evaluate transaction against scenarios |

### **Alerts** (Token required)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/alerts` | Get all alerts (with optional filters) |
| GET | `/alerts/stats` | Get alert statistics |
| PATCH | `/alerts/{id}/resolve` | Mark alert as resolved |
| DELETE | `/alerts/{id}` | Delete alert |

---

## Common Workflows

### Workflow 1: Register and Login

**Step 1: Register**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "securePassword123",
    "role": "analyst"
  }'
```

**Response:**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "name": "John Doe",
  "email": "john@example.com",
  "role": "analyst",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Step 2: Save token for future requests**
```bash
export TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

### Workflow 2: Create Scenarios and Evaluate Transactions

**Step 1: Create a scenario with amount threshold**
```bash
curl -X POST http://localhost:5000/api/scenarios \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Large Transfer Alert",
    "description": "Alert on transfers exceeding $5000",
    "type": "custom",
    "parameters": {
      "amountThreshold": 5000
    }
  }'
```

**Step 2: Create a scenario with country restrictions**
```bash
curl -X POST http://localhost:5000/api/scenarios \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "High-Risk Country Block",
    "description": "Block transactions from sanctioned countries",
    "type": "custom",
    "parameters": {
      "blockedCountries": ["IR", "SY", "KP"]
    }
  }'
```

**Step 3: Evaluate a transaction (should trigger first scenario)**
```bash
curl -X POST http://localhost:5000/api/pipeline/evaluate \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "transaction": {
      "amount": 6000,
      "type": "transfer",
      "country": "US"
    }
  }'
```

**Response:**
```json
{
  "triggeredScenarios": [
    {
      "title": "Large Transfer Alert",
      "reason": "amount threshold exceeded"
    }
  ],
  "summary": {
    "totalChecked": 2,
    "triggeredCount": 1
  }
}
```

An alert is automatically created in the database.

---

### Workflow 3: View and Manage Alerts

**Step 1: Get all alerts**
```bash
curl -X GET http://localhost:5000/api/alerts \
  -H "Authorization: Bearer $TOKEN"
```

**Step 2: Get only unresolved high-severity alerts**
```bash
curl -X GET "http://localhost:5000/api/alerts?isResolved=false&severity=high" \
  -H "Authorization: Bearer $TOKEN"
```

**Step 3: Get alert statistics**
```bash
curl -X GET http://localhost:5000/api/alerts/stats \
  -H "Authorization: Bearer $TOKEN"
```

**Response:**
```json
{
  "total": 42,
  "unresolved": 15,
  "high": 8
}
```

**Step 4: Resolve an alert**
```bash
curl -X PATCH http://localhost:5000/api/alerts/ALERT_ID/resolve \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"
```

**Step 5: Delete an alert**
```bash
curl -X DELETE http://localhost:5000/api/alerts/ALERT_ID \
  -H "Authorization: Bearer $TOKEN"
```

---

### Workflow 4: Complex Multi-Condition Rules

**Create scenario with multiple conditions:**
```bash
curl -X POST http://localhost:5000/api/scenarios \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "High-Risk Crypto Rule",
    "description": "Block large crypto transfers from high-risk countries",
    "type": "custom",
    "parameters": {
      "amountThreshold": 10000,
      "blockedCountries": ["CN", "RU"],
      "blockedTransactionTypes": ["crypto_transfer"]
    }
  }'
```

**Evaluate transaction that matches ALL conditions:**
```bash
curl -X POST http://localhost:5000/api/pipeline/evaluate \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "transaction": {
      "amount": 15000,
      "type": "crypto_transfer",
      "country": "CN"
    }
  }'
```

**Response shows concatenated reasons:**
```json
{
  "triggeredScenarios": [
    {
      "title": "High-Risk Crypto Rule",
      "reason": "amount threshold exceeded | transaction from blocked country: CN | blocked transaction type: crypto_transfer"
    }
  ],
  "summary": {
    "totalChecked": 3,
    "triggeredCount": 1
  }
}
```

---

## Scenario Parameters Guide

### Amount Threshold
**Type:** Number  
**Example:**
```json
{
  "parameters": {
    "amountThreshold": 5000
  }
}
```
Triggers when transaction amount >= threshold.

### Blocked Countries
**Type:** Array of strings OR comma-separated string  
**Examples:**
```json
{
  "parameters": {
    "blockedCountries": ["IR", "SY", "KP"]
  }
}
```
Or:
```json
{
  "parameters": {
    "blockedCountries": "IR,SY,KP"
  }
}
```
Triggers when transaction country matches (case-insensitive).

### Blocked Transaction Types
**Type:** Array of strings OR comma-separated string  
**Examples:**
```json
{
  "parameters": {
    "blockedTransactionTypes": ["crypto_transfer", "wire"]
  }
}
```
Or:
```json
{
  "parameters": {
    "blockedTransactionTypes": "crypto_transfer,wire"
  }
}
```
Triggers when transaction type matches (case-insensitive).

---

## Error Handling

### Error Response Format
```json
{
  "message": "User-friendly error description",
  "error": "Detailed error information"
}
```

### Common Error Codes

| Code | Meaning | Solution |
|------|---------|----------|
| 400 | Bad Request | Check request body format and required fields |
| 401 | Unauthorized | Token missing, expired, or invalid. Re-login. |
| 403 | Forbidden | Not authorized to access/modify this resource |
| 404 | Not Found | Resource (scenario/alert) doesn't exist |
| 500 | Server Error | Server error. Check server logs. |

---

## Query Parameters

### Scenarios - GET /scenarios
- `isActive` (boolean): Filter by active status
- `type` (string): Filter by scenario type
- `sort` (string): 'newest' or 'oldest'

### Alerts - GET /alerts
- `isResolved` (boolean): Filter by resolution status
- `severity` (string): 'low', 'medium', or 'high'
- `sort` (string): 'newest' or 'oldest' (default: newest)

---

## Testing Checklist

Use this checklist when testing the API:

- [ ] **Auth**
  - [ ] Register new user
  - [ ] Login with valid credentials
  - [ ] Login fails with invalid credentials
  
- [ ] **Scenarios**
  - [ ] Create scenario with amount threshold
  - [ ] Create scenario with blocked countries
  - [ ] Create scenario with blocked types
  - [ ] Create scenario with multiple conditions
  - [ ] Get all scenarios
  - [ ] Get specific scenario
  - [ ] Update scenario
  - [ ] Toggle scenario active status
  - [ ] Delete scenario

- [ ] **Pipeline**
  - [ ] Evaluate transaction with no matches
  - [ ] Evaluate transaction matching amount threshold
  - [ ] Evaluate transaction matching country restriction
  - [ ] Evaluate transaction matching type restriction
  - [ ] Evaluate transaction matching multiple conditions
  - [ ] Verify alerts auto-created in database

- [ ] **Alerts**
  - [ ] Get all alerts
  - [ ] Filter by resolved status
  - [ ] Filter by severity
  - [ ] Get alert statistics
  - [ ] Resolve alert
  - [ ] Delete alert

---

## Performance Tips

1. **Use query filters** for alerts to reduce response size:
   ```bash
   # Good: Returns only unresolved alerts
   GET /alerts?isResolved=false
   
   # Less efficient: Returns all alerts, then filter client-side
   GET /alerts
   ```

2. **Index frequently queried fields:**
   - Alerts are indexed on `userId` and `isResolved` for fast queries
   - Scenarios are indexed on `userId` for fast retrieval

3. **Batch operations:** If evaluating multiple transactions, call pipeline endpoint separately for each (no batch endpoint available yet)

---

## Security Notes

1. **Token Security:**
   - Tokens expire in 7 days
   - Store tokens securely (never in plain JavaScript variables)
   - Always use HTTPS in production

2. **Password Requirements:**
   - Minimum 6 characters
   - Hashed with bcrypt before storing
   - Never send password in responses

3. **Data Isolation:**
   - All data filtered by `userId` from JWT token
   - Users cannot access other users' scenarios or alerts
   - Backend verifies ownership before PATCH/DELETE operations

---

## Support

For issues or questions:
1. Check the Swagger documentation for detailed endpoint specs
2. Review this guide for common workflows
3. Check server logs for error details
4. Test with Postman collection before integrating into client

---

## File Reference

- **OpenAPI/Swagger:** `docs/SWAGGER_DOCS.yaml` — Interactive API specification
- **Postman Collection:** `docs/POSTMAN_COLLECTION.json` — Pre-configured requests
- **This Guide:** `docs/API_DOCS.md` — Comprehensive documentation
