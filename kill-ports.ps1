# PowerShell script to kill processes using ports 5000 and 3000
# Usage: .\kill-ports.ps1

Write-Host "Checking for processes on ports 5000 and 3000..." -ForegroundColor Yellow

# Function to kill process on a port
function Kill-Port {
    param([int]$Port)
    
    $connections = netstat -ano | findstr ":$Port"
    if ($connections) {
        $pids = $connections | ForEach-Object {
            if ($_ -match '\s+(\d+)$') {
                $matches[1]
            }
        } | Sort-Object -Unique
        
        foreach ($pid in $pids) {
            Write-Host "Killing process $pid on port $Port..." -ForegroundColor Red
            taskkill /PID $pid /F 2>$null
            if ($LASTEXITCODE -eq 0) {
                Write-Host "  ✓ Process $pid terminated" -ForegroundColor Green
            } else {
                Write-Host "  ✗ Failed to kill process $pid (may require admin rights)" -ForegroundColor Yellow
            }
        }
    } else {
        Write-Host "  Port $Port is free" -ForegroundColor Green
    }
}

# Kill processes on both ports
Kill-Port -Port 5000
Kill-Port -Port 3000

Write-Host "`nDone! Ports 5000 and 3000 should now be free." -ForegroundColor Green
Write-Host "You can now restart your servers." -ForegroundColor Cyan

