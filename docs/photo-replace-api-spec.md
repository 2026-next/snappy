# Spec: Replace Photo File (Host Override Edits)

Status: **implemented** — `POST /photo/{photoId}/replace` (`PhotoController_replaceFile`) is live. This doc remains for reference; the live OpenAPI at `https://snappyku.site/api-json` is authoritative.

## Why

Host edit flow lets a host bake filter/crop/perspective adjustments into a photo and save the result. Two save options exist:

- **새로운 사진으로 저장** (save as new) → upload a brand-new photo, original is untouched.
- **기본 사진으로 저장** (save as default, "override") → replace the **same photo record's file** with the edited bytes. The photo's `id`, `eventId`, `uploadedByGuestId`, message, favorites, group memberships, and uploaded-at timestamp must all be preserved. Only the underlying file (and its derived metadata: `mimeType`, `fileSizeBytes`, `width`, `height`) changes.

There is currently no Photo endpoint that mutates the file of an existing record (`PATCH /photo/{photoId}/favorite` only flips a boolean). Without this, the host's edits land as a separate photo, which breaks the "edit in place" mental model the UX promises.

## Contract

```
POST /photo/{photoId}/replace
Auth:  access-token  (must be the photo's host owner)
Body:  ReplacePhotoFileDto
Resp:  PhotoDetailResponseDto  (the same id, with new file fields)
```

### `ReplacePhotoFileDto`
| Field           | Type     | Required | Notes                                                           |
|-----------------|----------|----------|-----------------------------------------------------------------|
| `fileKey`       | string   | yes      | New S3 object key returned by `POST /photo/upload-url`          |
| `mimeType`      | string   | yes      | e.g. `image/jpeg`                                               |
| `fileSizeBytes` | number   | no       | Recomputed server-side if omitted                               |
| `width`         | number   | no       | Recomputed server-side if omitted                               |
| `height`        | number   | no       | Recomputed server-side if omitted                               |

### Behavior
- 200 returns the full updated `PhotoDetailResponseDto` (preserves `id`, `eventId`, uploader info, message, group memberships, favorite status, comments).
- `exifTakenAt`, `uploadedAt`, `createdAt` are **not** changed. `updatedAt` advances.
- Old S3 object MAY be deleted (or kept under a `versions/` prefix if the team wants version history — `PhotoAiController_listVersions` already implies version retention semantics).
- 403 if the caller is not the photo's host owner.
- 404 if the photo is soft-deleted or doesn't exist.
- 409 (optional) if the photo is currently being mutated by another enhancement job — caller can retry after polling enhancement status.

### Why a new endpoint instead of `PATCH /photo/{photoId}`
The existing photo PATCH surface only covers idempotent metadata (favorite). A dedicated `/replace` makes the destructive intent explicit and keeps standard photo updates additive.

## Frontend integration

- `replacePhotoFile(photoId, input)` in [src/shared/api/photo.ts](../src/shared/api/photo.ts) targets this endpoint.
- The "기본 사진으로 저장" button in [photo-edit-view.tsx](../src/widgets/host-photo-edit/ui/photo-edit-view.tsx) calls `replacePhotoFile` after `PUT`-ing the edited bytes to the signed upload URL.
- Until the backend ships, `handleSaveAsExisting` surfaces a clear error message (`이 기능은 곧 사용 가능해질 예정이에요`) rather than silently creating a duplicate photo.
