# Dikte App Deployment Helper (PowerShell)
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "    Dikte App Deployment Helper" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Check if Git is installed
Write-Host "Step 1: Checking if Git is installed..." -ForegroundColor Yellow
try {
    $gitVersion = git --version
    Write-Host "✓ Git is installed: $gitVersion" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Git is not installed!" -ForegroundColor Red
    Write-Host "Please install Git from: https://git-scm.com/" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}
Write-Host ""

# Step 2: Initialize Git repository
Write-Host "Step 2: Initializing Git repository..." -ForegroundColor Yellow
if (-not (Test-Path ".git")) {
    git init
    Write-Host "✓ Git repository initialized" -ForegroundColor Green
} else {
    Write-Host "✓ Git repository already exists" -ForegroundColor Green
}
Write-Host ""

# Step 3: Add files to Git
Write-Host "Step 3: Adding files to Git..." -ForegroundColor Yellow
git add .
Write-Host "✓ Files added to Git" -ForegroundColor Green
Write-Host ""

# Step 4: Commit changes
Write-Host "Step 4: Committing changes..." -ForegroundColor Yellow
git commit -m "Deploy Dikte App to production"
Write-Host "✓ Changes committed" -ForegroundColor Green
Write-Host ""

# Step 5: Set up main branch
Write-Host "Step 5: Setting up main branch..." -ForegroundColor Yellow
git branch -M main
Write-Host "✓ Main branch set" -ForegroundColor Green
Write-Host ""

# Display next steps
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "    NEXT STEPS:" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Create a GitHub repository:" -ForegroundColor White
Write-Host "   - Go to https://github.com" -ForegroundColor Gray
Write-Host "   - Click 'New repository'" -ForegroundColor Gray
Write-Host "   - Name it 'dikte-app'" -ForegroundColor Gray
Write-Host "   - Make it Public" -ForegroundColor Gray
Write-Host "   - Don't initialize with README" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Connect to GitHub (replace YOUR_USERNAME):" -ForegroundColor White
Write-Host "   git remote add origin https://github.com/YOUR_USERNAME/dikte-app.git" -ForegroundColor Gray
Write-Host "   git push -u origin main" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Deploy to Netlify:" -ForegroundColor White
Write-Host "   - Go to https://netlify.com" -ForegroundColor Gray
Write-Host "   - Click 'New site from Git'" -ForegroundColor Gray
Write-Host "   - Choose GitHub and your repository" -ForegroundColor Gray
Write-Host "   - Deploy!" -ForegroundColor Gray
Write-Host ""
Write-Host "Your app will be live at: https://your-name.netlify.app" -ForegroundColor Green
Write-Host ""
Read-Host "Press Enter to continue"
