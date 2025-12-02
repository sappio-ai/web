# Study Pack Creation API Documentation

## Overview

This document describes the API endpoints for the Study Pack Creation feature in Sappio V2. All endpoints require authentication unless otherwise specified.

## Base URL

```
Development: http://localhost:3000/api
Production: https://your-domain.com/api
```

## Authentication

All endpoints require a valid Supabase session cookie. Users must be authenticated via the auth system.

**Authentication Error Response:**
```json
{
  "error": "Unauthorized"
}
```
**Status Code:** `401`

---

## Endpoints

### 1. Upload Material (File)

Upload a file (PDF, DOCX, or image) to create a study pack.

**Endpoint:** `POST /api/materials/upload`

**Content-Type:** `multipart/form-data`

**Request Body:**
- `file` (File, required): The file to upload
  - Supported types: PDF, DOCX, JPG, JPEG, PNG, WEBP, GIF
  - Max size: 50MB

**Success Response:**
```json
{
  "materialId": "550e8400-e29b-41d4-a716-446655440000",
  "status": "processing",
  "message": "Material uploaded successfully"
}
```
**Status Code:** `201`

**Error Responses:**

| Status | Error Code | Description |
|--------|------------|-------------|
| 400 | `INVALID_INPUT` | No file provided |
| 401 | - | User not authenticated |
| 403 | `PLAN_LIMIT_EXCEEDED` | User has reached monthly pack limit |
| 413 | `FILE_TOO_LARGE` | File exceeds 50MB limit |
| 415 | `INVALID_FILE_TYPE` | Unsupported file type |
| 500 | `UPLOAD_FAILED` | Upload or storage error |

**Example Error Response:**
```json
{
  "error": "File too large. Maximum size is 50MB.",
  "code": "FILE_TOO_LARGE"
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:3000/api/materials/upload \
  -H "Cookie: sb-access-token=..." \
  -F "file=@/path/to/document.pdf"
```

---

### 2. Submit URL/YouTube

Submit a URL or YouTube link to create a study pack.

**Endpoint:** `POST /api/materials/url`

**Content-Type:** `application/json`

**Request Body:**
```json
{
  "url": "https://example.com/article",
  "type": "url"  // or "youtube"
}
```

**Fields:**
- `url` (string, required): The URL to process
- `type` (string, required): Either `"url"` or `"youtube"`

**Success Response:**
```json
{
  "materialId": "550e8400-e29b-41d4-a716-446655440000",
  "status": "processing",
  "message": "URL submitted successfully"
}
```
**Status Code:** `201`

**Error Responses:**

| Status | Error Code | Description |
|--------|------------|-------------|
| 400 | `INVALID_INPUT` | Missing or invalid URL/type |
| 400 | `INVALID_URL` | URL format is invalid |
| 401 | - | User not authenticated |
| 403 | `PLAN_LIMIT_EXCEEDED` | User has reached monthly pack limit |
| 500 | `DATABASE_ERROR` | Database error |

**cURL Example:**
```bash
curl -X POST http://localhost:3000/api/materials/url \
  -H "Cookie: sb-access-token=..." \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    "type": "youtube"
  }'
```

---

### 3. Get Material Status

Poll the processing status of a material.

**Endpoint:** `GET /api/materials/:id/status`

**URL Parameters:**
- `id` (string, required): Material ID

**Success Response:**
```json
{
  "materialId": "550e8400-e29b-41d4-a716-446655440000",
  "status": "processing",
  "progress": 50,
  "stage": "Analyzing",
  "description": "Breaking content into chunks...",
  "isComplete": false,
  "studyPackId": null,
  "estimatedTimeRemaining": 30,
  "error": null,
  "createdAt": "2024-10-22T10:30:00Z"
}
```
**Status Code:** `200`

**Response Fields:**
- `materialId`: UUID of the material
- `status`: Current status (`uploading`, `processing`, `chunking`, `ready`, `failed`)
- `progress`: Progress percentage (0-100)
- `stage`: Human-readable stage name
- `description`: Description of current stage
- `isComplete`: Boolean indicating if pack is ready
- `studyPackId`: UUID of study pack (null until complete)
- `estimatedTimeRemaining`: Estimated seconds remaining (null if complete/failed)
- `error`: Error message if status is `failed`
- `createdAt`: ISO timestamp of material creation

**Status Stages:**

| Status | Progress | Stage | Description |
|--------|----------|-------|-------------|
| uploading | 10% | Uploading | Uploading your file... |
| processing | 25% | Processing | Extracting text from your material... |
| chunking | 50% | Analyzing | Breaking content into chunks... |
| ready | 75% | Generating | Creating your study pack... |
| complete | 100% | Complete | Your study pack is ready! |
| failed | 0% | Failed | Processing failed. Please try again. |

**Error Responses:**

| Status | Description |
|--------|-------------|
| 401 | User not authenticated |
| 404 | Material not found or user doesn't own it |
| 500 | Internal server error |

**cURL Example:**
```bash
curl http://localhost:3000/api/materials/550e8400-e29b-41d4-a716-446655440000/status \
  -H "Cookie: sb-access-token=..."
```

**Polling Recommendation:**
- Poll every 2 seconds while `isComplete` is `false`
- Stop polling when `isComplete` is `true` or `status` is `failed`
- Cache responses for 10 seconds to reduce load

---

### 4. Get Study Pack

Retrieve a complete study pack with all generated content.

**Endpoint:** `GET /api/study-packs/:id`

**URL Parameters:**
- `id` (string, required): Study pack ID

**Success Response:**
```json
{
  "id": "660e8400-e29b-41d4-a716-446655440000",
  "title": "Introduction to Machine Learning",
  "summary": "Overview of ML concepts...",
  "createdAt": "2024-10-22T10:35:00Z",
  "updatedAt": "2024-10-22T10:35:00Z",
  "material": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "kind": "pdf",
    "sourceUrl": null,
    "pageCount": 25
  },
  "stats": {
    "coverage": "high",
    "generationTime": 45000,
    "cardCount": 50,
    "quizQuestionCount": 20,
    "mindMapNodeCount": 35,
    "chunkUtilization": 18
  },
  "notes": {
    "overview": "This material covers...",
    "keyConcepts": [
      {
        "title": "Supervised Learning",
        "description": "Learning from labeled data..."
      }
    ],
    "definitions": [
      {
        "term": "Neural Network",
        "definition": "A computing system inspired by..."
      }
    ],
    "likelyExamQuestions": [
      "What is the difference between supervised and unsupervised learning?"
    ],
    "commonPitfalls": [
      "Overfitting occurs when..."
    ]
  },
  "flashcards": [
    {
      "id": "770e8400-e29b-41d4-a716-446655440000",
      "kind": "qa",
      "front": "What is supervised learning?",
      "back": "A type of machine learning where...",
      "tags": ["machine-learning", "basics"],
      "ease": 2.5,
      "intervalDays": 0,
      "reps": 0,
      "lapses": 0,
      "dueAt": "2024-10-22T10:35:00Z",
      "createdAt": "2024-10-22T10:35:00Z"
    }
  ],
  "quiz": {
    "id": "880e8400-e29b-41d4-a716-446655440000",
    "configJson": {
      "timeLimit": null,
      "shuffleQuestions": true
    },
    "createdAt": "2024-10-22T10:35:00Z",
    "items": [
      {
        "id": "990e8400-e29b-41d4-a716-446655440000",
        "kind": "mcq",
        "question": "Which of the following is a supervised learning algorithm?",
        "options": [
          "K-means clustering",
          "Linear regression",
          "PCA",
          "Autoencoders"
        ],
        "correctAnswer": "Linear regression",
        "explanation": "Linear regression is a supervised learning algorithm...",
        "tags": ["algorithms"],
        "orderIndex": 0
      }
    ]
  },
  "mindMap": {
    "id": "aa0e8400-e29b-41d4-a716-446655440000",
    "title": "Machine Learning Concepts",
    "layoutJson": {
      "type": "tree",
      "direction": "TB"
    },
    "createdAt": "2024-10-22T10:35:00Z",
    "updatedAt": "2024-10-22T10:35:00Z",
    "nodes": [
      {
        "id": "bb0e8400-e29b-41d4-a716-446655440000",
        "label": "Machine Learning",
        "parentId": null,
        "orderIndex": 0,
        "sourceChunkIds": ["chunk-1", "chunk-2"]
      }
    ]
  }
}
```
**Status Code:** `200`

**Error Responses:**

| Status | Description |
|--------|-------------|
| 401 | User not authenticated |
| 404 | Study pack not found or user doesn't own it |
| 500 | Internal server error |

**cURL Example:**
```bash
curl http://localhost:3000/api/study-packs/660e8400-e29b-41d4-a716-446655440000 \
  -H "Cookie: sb-access-token=..."
```

**Caching:**
- Responses are cached for 5 minutes
- Cache is invalidated on pack deletion

---

### 5. Delete Study Pack

Delete a study pack and its associated material.

**Endpoint:** `DELETE /api/study-packs/:id`

**URL Parameters:**
- `id` (string, required): Study pack ID

**Success Response:**
```json
{
  "success": true,
  "message": "Study pack deleted successfully"
}
```
**Status Code:** `200`

**Error Responses:**

| Status | Error Code | Description |
|--------|------------|-------------|
| 400 | `PROCESSING_IN_PROGRESS` | Cannot delete while material is processing |
| 401 | - | User not authenticated |
| 404 | - | Study pack not found or user doesn't own it |
| 500 | - | Failed to delete study pack |

**Example Error Response:**
```json
{
  "error": "Cannot delete while material is processing",
  "code": "PROCESSING_IN_PROGRESS"
}
```

**cURL Example:**
```bash
curl -X DELETE http://localhost:3000/api/study-packs/660e8400-e29b-41d4-a716-446655440000 \
  -H "Cookie: sb-access-token=..."
```

**Note:** This operation:
- Deletes the study pack record
- Deletes all flashcards, quiz items, and mind map nodes
- Deletes the associated material record
- Deletes the file from storage
- Invalidates the cache

---

## Error Codes Reference

### Upload Errors

| Code | Message | HTTP Status |
|------|---------|-------------|
| `FILE_TOO_LARGE` | File too large. Maximum size is 50MB. | 413 |
| `INVALID_FILE_TYPE` | Unsupported file type. Please upload PDF, DOCX, or images. | 415 |
| `UPLOAD_FAILED` | Upload failed. Please try again. | 500 |
| `STORAGE_ERROR` | Storage error. Please try again later. | 500 |

### Processing Errors

| Code | Message | HTTP Status |
|------|---------|-------------|
| `EXTRACTION_FAILED` | Failed to extract content. Please try a different file. | 500 |
| `OCR_FAILED` | Unable to extract text from image. Please ensure the image contains readable text. | 500 |
| `PROCESSING_TIMEOUT` | Processing took too long. Please try a smaller file. | 500 |

### URL Errors

| Code | Message | HTTP Status |
|------|---------|-------------|
| `INVALID_URL` | Invalid URL. Please check the link and try again. | 400 |
| `URL_FETCH_FAILED` | Unable to access URL. Please check the link and try again. | 500 |
| `YOUTUBE_TRANSCRIPT_UNAVAILABLE` | YouTube transcript unavailable. Please try a different video. | 500 |

### Generation Errors

| Code | Message | HTTP Status |
|------|---------|-------------|
| `GENERATION_FAILED` | Generation failed. Please try again or contact support. | 500 |
| `AI_API_ERROR` | AI service error. Please try again later. | 500 |

### Quota Errors

| Code | Message | HTTP Status |
|------|---------|-------------|
| `PLAN_LIMIT_EXCEEDED` | You have reached your monthly pack limit. Please upgrade your plan. | 403 |

### General Errors

| Code | Message | HTTP Status |
|------|---------|-------------|
| `INVALID_INPUT` | Invalid input provided. | 400 |
| `MATERIAL_NOT_FOUND` | Material not found. | 404 |
| `UNAUTHORIZED_ACCESS` | You do not have permission to access this material. | 403 |
| `DATABASE_ERROR` | Database error. Please try again. | 500 |

---

## Rate Limiting

Currently, rate limiting is enforced through plan-based quotas:

- **Free Plan:** 3 packs per month
- **Student Pro:** 300 packs per month
- **Pro+:** Higher limits

Users receive a grace window of 1 additional pack when they reach 100% of their limit.

---

## Webhooks (Future)

Webhook support for pack generation completion is planned for future releases.

---

## SDK Examples

### JavaScript/TypeScript

```typescript
// Upload file
const formData = new FormData()
formData.append('file', file)

const uploadResponse = await fetch('/api/materials/upload', {
  method: 'POST',
  body: formData,
  credentials: 'include',
})

const { materialId } = await uploadResponse.json()

// Poll status
const pollStatus = async () => {
  const response = await fetch(`/api/materials/${materialId}/status`, {
    credentials: 'include',
  })
  const status = await response.json()
  
  if (status.isComplete) {
    // Fetch study pack
    const packResponse = await fetch(`/api/study-packs/${status.studyPackId}`, {
      credentials: 'include',
    })
    const pack = await packResponse.json()
    return pack
  }
  
  // Continue polling
  await new Promise(resolve => setTimeout(resolve, 2000))
  return pollStatus()
}

const studyPack = await pollStatus()
```

### Python

```python
import requests
import time

# Upload file
with open('document.pdf', 'rb') as f:
    response = requests.post(
        'http://localhost:3000/api/materials/upload',
        files={'file': f},
        cookies=cookies
    )

material_id = response.json()['materialId']

# Poll status
while True:
    response = requests.get(
        f'http://localhost:3000/api/materials/{material_id}/status',
        cookies=cookies
    )
    status = response.json()
    
    if status['isComplete']:
        # Fetch study pack
        pack_response = requests.get(
            f'http://localhost:3000/api/study-packs/{status["studyPackId"]}',
            cookies=cookies
        )
        study_pack = pack_response.json()
        break
    
    time.sleep(2)
```

---

## Support

For API support, please contact: support@sappio.com

For bug reports, please open an issue on GitHub.
