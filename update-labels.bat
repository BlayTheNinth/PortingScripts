@echo off
setlocal EnableDelayedExpansion

if "%~1"=="" (
    echo Error: Version argument is required
    echo Usage: %0 version modname
    exit /b 1
)

if "%~2"=="" (
    echo Error: Mod name argument is required
    echo Usage: %0 version modname
    exit /b 1
)

set VERSION=%~1
set MODNAME=%~2

echo Starting manage labels workflow for %MODNAME% version %VERSION%
cd %VERSION%\%MODNAME%
gh workflow run manage-labels.yaml --ref %VERSION% -f dry=false
if errorlevel 1 (
    echo Error: Failed to run workflow
    exit /b 1
)