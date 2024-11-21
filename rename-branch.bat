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
set "FOLDER=%~1"
for %%I in ("%FOLDER%\..") do set "PARENT_NAME=%%~nxI"
pushd "%FOLDER%"
for /f "tokens=* usebackq" %%B in (`git rev-parse --abbrev-ref HEAD`) do set "BRANCH_NAME=%%B"
if not "!BRANCH_NAME!"=="%PARENT_NAME%" (
    echo Renaming branch from '!BRANCH_NAME!' to '%PARENT_NAME%' in: %FOLDER%
    git branch -m !BRANCH_NAME! %PARENT_NAME%
    git push origin -u %PARENT_NAME%
    git push origin --delete !BRANCH_NAME!
)
popd

goto :eof
