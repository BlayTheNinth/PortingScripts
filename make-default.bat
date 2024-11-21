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
echo Making '%DIRECTORY%' the default branch for %FOLDER%
pushd "%FOLDER%"
for /f "tokens=*" %%a in ('git remote get-url origin') do set "REMOTE=%%a"
for /f "tokens=2 delims=:" %%i in ("!REMOTE!") do set "OWNERREPO=%%i"
for /f "tokens=1,2 delims=/" %%i in ("!OWNERREPO!") do (
    set "OWNER=%%i"
    set "REPO=%%~nj"
)
gh api --method PATCH -H "Accept: application/vnd.github+json" -H "X-GitHub-Api-Version: 2022-11-28" /repos/%OWNER%/%REPO% -f "default_branch=%DIRECTORY%"
popd
goto :eof
