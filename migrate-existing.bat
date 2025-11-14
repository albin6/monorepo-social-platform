@echo off
echo Social Platform Migration Script
echo This script will help migrate existing code to the new monorepo structure.
echo.

REM Check if we're in the right directory
if not exist "social-platform" (
    echo ERROR: social-platform directory not found in current location: %cd%
    echo Please run this script from the directory containing the social-platform folder.
    exit /b 1
)

echo Found social-platform directory. Beginning migration process...
echo.

REM Example migration commands - uncomment and modify these as needed for your existing directories
REM This is just a template showing how to migrate services

REM Example: If you had an existing 'users' directory that should become users-service
REM if exist "users" (
REM     if exist "social-platform\apps\services\users-service" (
REM         echo Backing up existing social-platform\apps\services\users-service to users-service_backup
REM         move "social-platform\apps\services\users-service" "users-service_backup"
REM     )
REM     echo Moving users to social-platform\apps\services\users-service
REM     move "users" "social-platform\apps\services\users-service"
REM )

REM Example: If you had an existing 'posts' directory that should become posts-service
REM if exist "posts" (
REM     if exist "social-platform\apps\services\posts-service" (
REM         echo Backing up existing social-platform\apps\services\posts-service to posts-service_backup
REM         move "social-platform\apps\services\posts-service" "posts-service_backup"
REM     )
REM     echo Moving posts to social-platform\apps\services\posts-service
REM     move "posts" "social-platform\apps\services\posts-service"
REM )

echo.
echo Migration process completed!
echo.
echo Note: This script only moves directories. You may need to:
echo 1. Update import paths in your code to reflect the new structure
echo 2. Update any configuration files with new relative paths
echo 3. Update build scripts to work with the new structure
echo 4. Update Docker or other deployment configurations