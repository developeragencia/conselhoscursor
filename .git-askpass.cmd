@echo off
setlocal ENABLEDELAYEDEXPANSION
set PROMPTSTR=%*
echo !PROMPTSTR! | find /I "Username" >nul
if !ERRORLEVEL! == 0 (
  echo developeragencia
) else (
  echo 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
)
endlocal
