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
    if not "%%~nxD"=="template" (
        call :ProcessFolder "%%D"
    )
)
exit /b 0

:ProcessFolder
set "FOLDER=%~n1"
call update-labels.bat %DIRECTORY% %FOLDER%
goto :eof
