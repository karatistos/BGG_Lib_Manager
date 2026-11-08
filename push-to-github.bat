@echo off
title Push to GitHub
cd /d "%~dp0"

echo ========================================================
echo       Pushing BGG Library Manager to GitHub
echo ========================================================
echo.
git push -u origin main
echo.
echo ========================================================
echo Done! Check your GitHub page:
echo https://github.com/karatistos/BGG_Lib_Manager
echo ========================================================
pause

