# Migration Guide

This guide explains how to migrate your existing codebase to the new social-platform monorepo structure.

## Migration Scripts

Two migration scripts are provided:

1. `migrate-existing.ps1` - PowerShell script for Windows
2. `migrate-existing.bat` - Batch script for Windows

## How to Use

1. Place your existing project directories in the same parent directory as `social-platform`
2. Run either migration script from the command line
3. Follow the on-screen instructions

## Important Notes

- The scripts will preserve your existing files and move them to the appropriate locations
- A backup will be created if a destination directory already exists
- After migration, you may need to update:
  - Import/require paths in your code
  - Configuration files with new relative paths
  - Build scripts to work with the new structure
  - Docker or deployment configurations

## Expected Directory Structure After Migration

Your existing services and applications will be moved to:

- Frontend apps: `apps/web-frontend` and `apps/mobile-frontend`
- Backend services: 
  - `apps/services/users-service`
  - `apps/services/posts-service`
  - `apps/services/media-service`
  - `apps/services/notifications-service`
  - `apps/services/messaging-service`
  - `apps/services/search-service`
- Shared libraries: `apps/shared-libraries`

## Example

If you had existing directories like:
```
my-old-project/
├── users/
├── posts/
├── frontend/
└── social-platform/  (freshly created structure)
```

After running the migration script, the `users/` and `posts/` directories would be moved to their appropriate locations in the services folder, and `frontend/` would be moved to web-frontend.