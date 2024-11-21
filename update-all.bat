@echo off
setlocal enabledelayedexpansion

if "%~1"=="" (
    echo Please provide a directory path
    exit /b 1
)

set "DIRECTORY=%~1"

if not exist "%DIRECTORY%" (
    echo Directory does not exist: %DIRECTORY%
    exit /b 1
)

for /d %%D in ("%DIRECTORY%\*") do (
    if not "%%~nxD"=="template" if not "%%~nxD"=="Balm" if not "%%~nxD"=="Kuma" (
        call :ProcessFolder "%%D"
    )
)
exit /b 0

:ProcessFolder
set "FOLDER=%~n1"
node update.js %DIRECTORY% %FOLDER%
goto :eof
