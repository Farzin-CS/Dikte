@echo off
echo ========================================
echo    Dikte App Deployment Helper
echo ========================================
echo.

echo Step 1: Checking if Git is installed...
git --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Git is not installed!
    echo Please install Git from: https://git-scm.com/
    pause
    exit /b 1
)
echo ✓ Git is installed
echo.

echo Step 2: Initializing Git repository...
if not exist .git (
    git init
    echo ✓ Git repository initialized
) else (
    echo ✓ Git repository already exists
)
echo.

echo Step 3: Adding files to Git...
git add .
echo ✓ Files added to Git
echo.

echo Step 4: Committing changes...
git commit -m "Deploy Dikte App to production"
echo ✓ Changes committed
echo.

echo Step 5: Setting up main branch...
git branch -M main
echo ✓ Main branch set
echo.

echo ========================================
echo    NEXT STEPS:
echo ========================================
echo.
echo 1. Create a GitHub repository:
echo    - Go to https://github.com
echo    - Click "New repository"
echo    - Name it "dikte-app"
echo    - Make it Public
echo    - Don't initialize with README
echo.
echo 2. Connect to GitHub (replace YOUR_USERNAME):
echo    git remote add origin https://github.com/YOUR_USERNAME/dikte-app.git
echo    git push -u origin main
echo.
echo 3. Deploy to Netlify:
echo    - Go to https://netlify.com
echo    - Click "New site from Git"
echo    - Choose GitHub and your repository
echo    - Deploy!
echo.
echo Your app will be live at: https://your-name.netlify.app
echo.
pause
