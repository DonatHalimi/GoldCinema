@echo off
:: Get date in dd-MM-yyyy format using PowerShell
for /f %%i in ('powershell -NoProfile -Command "Get-Date -Format 'dd-MM-yyyy'"') do set "currentDate=%%i"

:: Run the mongodump command targeting the 'test' database
mongodump --uri="mongodb://localhost:27017/test" --out="C:\Users\donat\Documents\GoldCinema\backups\%currentDate%" --gzip

:: Automatically exit without waiting for a keystroke
exit
