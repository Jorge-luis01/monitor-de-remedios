@echo off
setlocal
set "MAVEN_CMD="
for /f "delims=" %%M in ('where mvn.cmd 2^>nul') do if not defined MAVEN_CMD set "MAVEN_CMD=%%M"
if not defined MAVEN_CMD (
  for /r "%USERPROFILE%\.m2\wrapper\dists" %%M in (mvn.cmd) do if exist "%%M" if not defined MAVEN_CMD set "MAVEN_CMD=%%M"
)
if not defined MAVEN_CMD (
  echo Maven nao encontrado no PATH nem no cache local.
  exit /b 1
)
call "%MAVEN_CMD%" "-Dmaven.repo.local=%USERPROFILE%\.m2\repository" %*
exit /b %errorlevel%
