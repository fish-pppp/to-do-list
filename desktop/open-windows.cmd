@echo off
setlocal EnableExtensions EnableDelayedExpansion
cd /d "%~dp0"

where node >nul 2>&1
if %errorlevel%==0 (
  node "%~dp0open.cjs" --electron
  if %errorlevel%==0 exit /b 0
  node "%~dp0open.cjs" --browser
  exit /b %errorlevel%
)

if defined SP_WEB_URL goto have_url
for /f "usebackq eol=# tokens=*" %%A in ("%~dp0web-url.txt") do (
  set "LINE=%%A"
  if not "!LINE!"=="" (
    set "SP_WEB_URL=!LINE!"
    goto have_url
  )
)

echo Set SP_WEB_URL or put an https URL in desktop\web-url.txt
exit /b 1

:have_url
set "APP=--app=!SP_WEB_URL!#/tag/TODAY/tasks"
set "SIZE=--window-size=420,780"

if exist "%ProgramFiles%\Google\Chrome\Application\chrome.exe" (
  start "" "%ProgramFiles%\Google\Chrome\Application\chrome.exe" !APP! !SIZE!
  exit /b 0
)
if exist "%LocalAppData%\Google\Chrome\Application\chrome.exe" (
  start "" "%LocalAppData%\Google\Chrome\Application\chrome.exe" !APP! !SIZE!
  exit /b 0
)
if exist "%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe" (
  start "" "%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe" !APP! !SIZE!
  exit /b 0
)
if exist "%ProgramFiles%\Microsoft\Edge\Application\msedge.exe" (
  start "" "%ProgramFiles%\Microsoft\Edge\Application\msedge.exe" !APP! !SIZE!
  exit /b 0
)
if exist "%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe" (
  start "" "%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe" !APP! !SIZE!
  exit /b 0
)

echo Install Google Chrome or Microsoft Edge.
exit /b 1
