# Mobile App API (ELP)

Base URL: `http://localhost:4000/api`

## Demo Accounts

- Student: `student@university.edu` / `password123`
- Lecturer: `lecturer@university.edu` / `password123`
- Admin: `admin@university.edu` / `password123`

## Auth

### POST `/auth/login`

Request:

```json
{
  "email": "student@university.edu",
  "password": "password123"
}
```

Response:

```json
{
  "token": "<jwt-like-token>",
  "user": {
    "id": "u1",
    "email": "student@university.edu",
    "name": "Alex Johnson",
    "role": "student"
  },
  "expires_in_seconds": 28800
}
```

Use token for all protected endpoints:

`Authorization: Bearer <token>`

## Bootstrap (recommended for mobile app startup)

### GET `/mobile/bootstrap`

Returns all primary data needed for app home screen:

- `user`
- `courses`
- `assignments`
- `notifications`
- `upload_policies`

## Core Endpoints

- `GET /me`
- `GET /courses`
- `GET /courses/:courseId`
- `GET /courses/:courseId/assignments`
- `GET /assignments`
- `GET /assignments/:assignmentId`
- `POST /assignments/:assignmentId/submissions`
- `GET /assignments/:assignmentId/submissions` (lecturer/admin)
- `PATCH /submissions/:submissionId/grade` (lecturer/admin)
- `GET /notifications`
- `PATCH /notifications/:notificationId/read`
- `GET /upload-policies`

## Submission Create Payload

`POST /assignments/:assignmentId/submissions`

```json
{
  "text_entry": "My final submission.",
  "files": [
    {
      "name": "wireframe.pdf",
      "url": "https://files.example.com/wireframe.pdf",
      "size_bytes": 920120
    }
  ]
}
```

## Notes for Real Deployment

- Replace in-memory store with PostgreSQL.
- Replace random token with JWT + refresh token.
- Add file storage service (S3/MinIO) for real uploads.
- Add pagination for notifications and submissions.
