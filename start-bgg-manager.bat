@echo off
title BGG Library Manager
cd /d "%~dp0"

echo ========================================================
echo       Starting BoardGameGeek Library Manager
echo ========================================================
echo.
echo Opening app in your browser...
start "" "http://localhost:5173"

echo.
echo Running server... (Keep this window open while using the app)
echo Press Ctrl+C to close the server when done.
echo.
npm.cmd run dev

