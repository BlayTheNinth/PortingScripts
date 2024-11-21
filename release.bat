@echo off
setlocal EnableDelayedExpansion

if "%~1"=="" (
    echo Error: Version argument is required
    echo Usage: %0 version modname [loader]
    exit /b 1
)

if "%~2"=="" (
    echo Error: Mod name argument is required
    echo Usage: %0 version modname [loader]
    exit /b 1
)

set VERSION=%~1
set MODNAME=%~2
set LOADER=%~3

if "%LOADER%"=="" (
    set FABRIC=true
    set NEOFORGE=true
    set FORGE=true
) else (
    if /i "%LOADER%"=="fabric" (
        set FABRIC=true
    ) else (
        set FABRIC=false
    )
    if /i "%LOADER%"=="neoforge" (
        set NEOFORGE=true
    ) else (
        set NEOFORGE=false
    )
    if /i "%LOADER%"=="forge" (
        set FORGE=true
    ) else (
        set FORGE=false
    )
)

echo Starting release workflow for %MODNAME% version %VERSION%
cd %VERSION%\%MODNAME%
gh workflow run publish-release.yml --ref %VERSION% -f forge=%FORGE% -f fabric=%FABRIC% -f neoforge=%NEOFORGE%
if errorlevel 1 (
    echo Error: Failed to run workflow
    exit /b 1
)