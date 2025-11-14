# PowerShell script to migrate existing code to the new social-platform structure
# This script should be run from the parent directory of your current project

Write-Host "Social Platform Migration Script" -ForegroundColor Green
Write-Host "This script will help migrate existing code to the new monorepo structure." -ForegroundColor Yellow
Write-Host ""

# Check if we're in the right directory
$currentDir = Get-Location
$targetDir = "social-platform"

if (!(Test-Path $targetDir)) {
    Write-Host "ERROR: social-platform directory not found in current location: $currentDir" -ForegroundColor Red
    Write-Host "Please run this script from the directory containing the social-platform folder." -ForegroundColor Red
    exit 1
}

Write-Host "Found social-platform directory. Beginning migration process..." -ForegroundColor Green
Write-Host ""

# Function to safely move directories with backup
function Move-Directory-With-Backup {
    param(
        [string]$Source,
        [string]$Destination
    )
    
    if (Test-Path $Source) {
        # Create backup if destination already exists
        if (Test-Path $Destination) {
            $backupPath = $Destination + "_backup_$(Get-Date -Format 'yyyyMMdd_HHmmss')"
            Write-Host "  Destination already exists, backing up to: $backupPath" -ForegroundColor Yellow
            Move-Item -Path $Destination -Destination $backupPath
        }
        
        # Ensure destination parent directory exists
        $destParent = Split-Path $Destination -Parent
        if (!(Test-Path $destParent)) {
            New-Item -ItemType Directory -Path $destParent -Force | Out-Null
        }
        
        Write-Host "  Moving $Source to $Destination" -ForegroundColor Cyan
        Move-Item -Path $Source -Destination $Destination
        Write-Host "  Successfully moved $Source" -ForegroundColor Green
    } else {
        Write-Host "  Source directory does not exist: $Source" -ForegroundColor Yellow
    }
}

# Function to merge directories if needed
function Merge-Directories {
    param(
        [string]$Source,
        [string]$Destination
    )
    
    if (Test-Path $Source) {
        if (!(Test-Path $Destination)) {
            # If destination doesn't exist, just move the entire directory
            Move-Directory-With-Backup -Source $Source -Destination $Destination
        } else {
            # If destination exists, merge the contents
            Write-Host "  Merging $Source into $Destination" -ForegroundColor Cyan
            $items = Get-ChildItem -Path $Source
            foreach ($item in $items) {
                $destItemPath = Join-Path $Destination $item.Name
                if (Test-Path $destItemPath) {
                    Write-Host "    WARNING: Item already exists: $destItemPath" -ForegroundColor Red
                } else {
                    Move-Item -Path $item.FullName -Destination $Destination
                    Write-Host "    Moved: $($item.Name)" -ForegroundColor Green
                }
            }
            # Remove the now-empty source directory
            Remove-Item -Path $Source -Recurse -Force
        }
    } else {
        Write-Host "  Source directory does not exist: $Source" -ForegroundColor Yellow
    }
}

Write-Host "Beginning migration of existing services/directories..." -ForegroundColor Green
Write-Host ""

# Example migration - uncomment and modify these lines as needed for your existing directories
# This is just a template showing how to migrate services

<#
# Example: If you had an existing 'users' directory that should become users-service
Move-Directory-With-Backup -Source "users" -Destination "$targetDir\apps\services\users-service"

# Example: If you had an existing 'posts' directory that should become posts-service
Move-Directory-With-Backup -Source "posts" -Destination "$targetDir\apps\services\posts-service"

# Example: If you had an existing 'web' frontend that should become web-frontend
Move-Directory-With-Backup -Source "web" -Destination "$targetDir\apps\web-frontend"

# Example: If you had an existing 'mobile' directory that should become mobile-frontend
Move-Directory-With-Backup -Source "mobile" -Destination "$targetDir\apps\mobile-frontend"
#>

# You can also create a mapping of existing directories to their new locations
# For example, if your existing project structure was different

Write-Host ""
Write-Host "Migration process completed!" -ForegroundColor Green
Write-Host ""
Write-Host "Note: This script only moves directories. You may need to:" -ForegroundColor Yellow
Write-Host "1. Update import paths in your code to reflect the new structure" -ForegroundColor Yellow
Write-Host "2. Update any configuration files with new relative paths" -ForegroundColor Yellow
Write-Host "3. Update build scripts to work with the new structure" -ForegroundColor Yellow
Write-Host "4. Update Docker or other deployment configurations" -ForegroundColor Yellow