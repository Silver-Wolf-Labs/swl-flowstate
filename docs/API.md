# FlowState API Reference

REST API endpoints for FlowState integration.

---

## Base URL

```
http://localhost:3000/api
```

---

## Endpoints

### `GET /api/flowstate`

Get current FlowState status.

**Response**

```json
{
  "isRunning": false,
  "mode": "focus",
  "timeRemaining": 1500,
  "totalTime": 1500,
  "currentMood": "focus",
  "sessionsCompleted": 3,
  "totalFocusTime": 4500,
  "lastUpdated": 1769820765909,
  "scrollTo": null
}
```

**Fields**

| Field | Type | Description |
|-------|------|-------------|
| `isRunning` | boolean | Timer running state |
| `mode` | string | "focus" or "break" |
| `timeRemaining` | number | Seconds left |
| `totalTime` | number | Total session seconds |
| `currentMood` | string | focus, calm, energetic, creative |
| `sessionsCompleted` | number | Completed pomodoros |
| `totalFocusTime` | number | Total focus seconds |
| `lastUpdated` | number | Unix timestamp (ms) |
| `scrollTo` | string\|null | UI scroll target |

---

### `POST /api/flowstate`

Update FlowState status.

**Request Body**

```json
{
  "currentMood": "calm",
  "isRunning": true,
  "scrollTo": "music"
}
```

All fields are optional - only include what you want to update.

**Response**

```json
{
  "success": true,
  "state": { /* updated state */ }
}
```

**Example: Set Mood**

```bash
curl -X POST http://localhost:3000/api/flowstate \
  -H "Content-Type: application/json" \
  -d '{"currentMood": "focus"}'
```

**Example: Start Timer**

```bash
curl -X POST http://localhost:3000/api/flowstate \
  -H "Content-Type: application/json" \
  -d '{"isRunning": true, "mode": "focus", "timeRemaining": 1500}'
```

**Example: Scroll to Section**

```bash
curl -X POST http://localhost:3000/api/flowstate \
  -H "Content-Type: application/json" \
  -d '{"scrollTo": "music"}'
```

Valid `scrollTo` values: `mood`, `music`, `timer`, `analytics`

---

### `DELETE /api/flowstate`

Reset FlowState to defaults.

**Response**

```json
{
  "success": true,
  "state": {
    "isRunning": false,
    "mode": "focus",
    "timeRemaining": 1500,
    "totalTime": 1500,
    "currentMood": "focus",
    "sessionsCompleted": 0,
    "totalFocusTime": 0,
    "lastUpdated": 1769820765909,
    "scrollTo": null
  }
}
```

---

### `POST /api/contact`

Send contact/demo request emails.

**Request Body**

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "company": "Acme Inc",
  "message": "I'd like a demo",
  "type": "demo"
}
```

**Fields**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Yes | Sender name |
| `email` | string | Yes | Sender email |
| `company` | string | No | Company name |
| `message` | string | No | Message body |
| `type` | string | No | "demo", "contact", or "pricing" |

**Response**

```json
{
  "success": true,
  "message": "Email sent successfully"
}
```

> Requires `RESEND_API_KEY` environment variable

---

## MCP Tools → API Mapping

| MCP Tool | API Call |
|----------|----------|
| `set_mood` | `POST /api/flowstate` with `currentMood` |
| `start_focus_session` | `POST /api/flowstate` with `isRunning: true` |
| `stop_focus_session` | `POST /api/flowstate` with `isRunning: false` |
| `get_timer_status` | `GET /api/flowstate` |
| `get_productivity_stats` | `GET /api/flowstate` |

---

## Polling Strategy

The web UI polls `/api/flowstate` every **500ms** to stay in sync.

For custom integrations, recommended polling interval: **500ms - 2000ms**

```javascript
// Example polling
setInterval(async () => {
  const res = await fetch('/api/flowstate');
  const state = await res.json();
  // Update your UI
}, 500);
```

---

## Error Responses

**400 Bad Request**

```json
{
  "error": "Invalid mood value"
}
```

**500 Internal Server Error**

```json
{
  "error": "Failed to read state file"
}
```

---

## State File

The API uses a file-based state store:

```
.flowstate-state.json
```

This file is auto-created and should be added to `.gitignore`.

---

<p align="center">
  FlowState API v1.0
</p>
