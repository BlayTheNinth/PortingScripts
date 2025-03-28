@echo off
setlocal EnableDelayedExpansion

if "%~1"=="" (
    echo Error: Version argument is required
    echo Usage: %0 version loaders modname
    exit /b 1
)

if "%~2"=="" (
    echo Error: Loader argument is required
    echo Usage: %0 version loaders modname
    exit /b 1
)

set VERSION=%~1
set LOADERS=%~2
set MODNAME=%~3

set FABRIC=false
set NEOFORGE=false
set FORGE=false

if "%LOADERS%"=="all" (
    set FABRIC=true
    set NEOFORGE=true
    set FORGE=true
) else if "%LOADERS%"=="fane" (
    set FABRIC=true
    set NEOFORGE=true
    set FORGE=false
) else (
    if /i "%LOADERS%"=="fabric" (
        set FABRIC=true
    )
    if /i "%LOADERS%"=="neoforge" (
        set NEOFORGE=true
    )
    if /i "%LOADERS%"=="forge" (
        set FORGE=true
    )
)

echo Starting release workflow for %MODNAME% version %VERSION%
echo Loaders: Fabric=%FABRIC%, NeoForge=%NEOFORGE%, Forge=%FORGE%
cd %VERSION%\%MODNAME%
gh workflow run publish-release.yml --ref %VERSION% -f forge=%FORGE% -f fabric=%FABRIC% -f neoforge=%NEOFORGE%
if errorlevel 1 (
    echo Error: Failed to run workflow
    exit /b 1
)
