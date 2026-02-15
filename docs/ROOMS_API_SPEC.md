# Rooms API spec (for backend implementation)

Base URL: `http://localhost:5005/api`  
All requests use `withCredentials: true` (cookies). The frontend sends `Authorization: Bearer <token>` when the user is logged in (see `api.ts` interceptor).

---

## 1. Create room

**POST** `/rooms`

**Request body:**

```json
{
  "difficulty": "easy" | "medium" | "hard",
  "duration": 60,
  "category": "common"
}
```

| Field       | Type   | Required | Notes                          |
|------------|--------|----------|--------------------------------|
| difficulty | string | yes      | One of: `easy`, `medium`, `hard` |
| duration   | number | yes      | Race duration in seconds (e.g. 60) |
| category   | string | yes      | e.g. `common`                  |

**Response:** Room object (see below). Backend should generate and return a 6-character `roomCode` if not sent in body.

**Note:** The current frontend does not call this on “Create Room”; it generates a code client-side and navigates to `/room/:code`, then calls **GET /rooms/:code**. So the backend can either:
- Create the room on first **GET /rooms/:code** (if room not found), or
- Expose **POST /rooms** and have the frontend call it with optional `roomCode` + `settings` before navigating.

---

## 2. Get room by code

**GET** `/rooms/:code`  

Example: `GET http://localhost:5005/api/rooms/9UAOQI`

**Request:** No body. `code` is the 6-character room code (e.g. `9UAOQI`).

**Response:** Room object:

```json
{
  "_id": "string",
  "roomCode": "string",
  "hostId": "string",
  "players": [
    {
      "userId": "string",
      "username": "string",
      "avatar": null,
      "ready": false,
      "stats": {
        "totalMatches": 0,
        "bestWPM": 0,
        "avgWPM": 0,
        "avgAccuracy": 0,
        "totalTimeTyped": 0
      }
    }
  ],
  "status": "WAITING",
  "settings": {
    "difficulty": "medium",
    "duration": 60,
    "category": "common"
  },
  "passageId": "string",
  "createdAt": "string"
}
```

| Field     | Type   | Notes |
|----------|--------|--------|
| status   | string | One of: `WAITING`, `COUNTDOWN`, `IN_PROGRESS`, `FINISHED` |
| players  | array  | May be empty. Frontend uses first player’s `userId === hostId` as host. |
| settings | object | Same shape as create/update body. |

**On 404:** Frontend treats as “room doesn’t exist yet” and shows the current user as the only player in the lobby (no join/create call in that flow).

---

## 3. Join room

**POST** `/rooms/:code/join`  

Example: `POST http://localhost:5005/api/rooms/9UAOQI/join`

**Request body:** `null` (no body). Auth via cookie/Authorization header.

**Response:** Room object (same as GET /rooms/:code).

---

## 4. Leave room

**POST** `/rooms/:code/leave`  

Example: `POST http://localhost:5005/api/rooms/9UAOQI/leave`

**Request body:** `null`.

**Response:** No specific shape required; frontend navigates to `/dashboard` on success.

---

## 5. Update room settings

**PATCH** `/rooms/:code/settings`  

Example: `PATCH http://localhost:5005/api/rooms/9UAOQI/settings`

**Request body:**

```json
{
  "difficulty": "easy" | "medium" | "hard",
  "duration": 60,
  "category": "common"
}
```

Same shape as create. Partial updates (only some fields) are allowed; frontend sends the full `RoomSettings` object.

**Response:** Room object or 204/200 with no body; frontend only cares about success.

---

## 6. Get room results

**GET** `/rooms/:code/results`  

Example: `GET http://localhost:5005/api/rooms/9UAOQI/results`

**Request:** No body.

**Response:**

```json
{
  "results": [
    {
      "userId": "string",
      "username": "string",
      "wpm": 72,
      "rawWpm": 75,
      "accuracy": 96,
      "errors": 2,
      "time": 60,
      "rank": 1,
      "status": "FINISHED",
      "wpmTimeline": [
        { "time": 0, "wpm": 0 },
        { "time": 10, "wpm": 65 }
      ]
    }
  ]
}
```

| Field        | Type   | Notes |
|-------------|--------|--------|
| results     | array  | Sorted by rank (winner first). |
| status     | string | `FINISHED` or `DNF`. |
| wpmTimeline| array  | Optional; used for WPM chart. |

---

## 7. Submit game results (save match for Dashboard/Analytics)

**POST** `/rooms/:code/results`

The frontend calls this when the user finishes a race and lands on the Results page with client-side results (so the backend can persist the match and update user stats; Dashboard and Analytics then show the new data).

**Request body:**

```json
{
  "results": [
    {
      "userId": "string",
      "username": "string",
      "wpm": 72,
      "rawWpm": 75,
      "accuracy": 96,
      "errors": 2,
      "time": 60,
      "rank": 1,
      "status": "FINISHED",
      "wpmTimeline": [{ "time": 0, "wpm": 0 }, { "time": 10, "wpm": 65 }]
    }
  ]
}
```

**Response:** 200/201 with saved match or room results; no specific shape required. The backend should update the room’s results and each user’s match history/stats so `GET /users/:id/matches` and `GET /users/:id/analytics` return the new data.

---

## TypeScript types (from frontend)

```ts
// Room
interface Room {
  _id: string;
  roomCode: string;
  hostId: string;
  players: Player[];
  status: 'WAITING' | 'COUNTDOWN' | 'IN_PROGRESS' | 'FINISHED';
  settings: RoomSettings;
  passageId?: string;
  createdAt: string;
}

interface RoomSettings {
  difficulty: 'easy' | 'medium' | 'hard';
  duration: number;
  category: string;
}

interface Player {
  userId: string;
  username: string;
  avatar?: string | null;
  ready: boolean;
  stats?: UserStats;
  progress?: number;
  wpm?: number;
}

interface PlayerResult {
  userId: string;
  username: string;
  wpm: number;
  rawWpm: number;
  accuracy: number;
  errors: number;
  time: number;
  rank: number;
  wpmTimeline: { time: number; wpm: number }[];
  status: 'FINISHED' | 'DNF';
}
```

---

## Summary table

| Method | Endpoint                     | Body                    | Purpose           |
|--------|------------------------------|-------------------------|-------------------|
| POST   | `/rooms`                     | `RoomSettings`           | Create room       |
| GET    | `/rooms/:code`               | —                       | Get room          |
| POST   | `/rooms/:code/join`          | —                       | Join room         |
| POST   | `/rooms/:code/leave`         | —                       | Leave room        |
| PATCH  | `/rooms/:code/settings`      | `RoomSettings` (partial) | Update settings   |
| GET    | `/rooms/:code/results`       | —                       | Get game results  |
| POST   | `/rooms/:code/results`       | `{ results: PlayerResult[] }` | Submit/save game results (for match history & analytics) |

For **GET** `http://localhost:5005/api/rooms/9UAOQI` specifically: no payload; respond with the Room JSON above or 404 if the room does not exist.
