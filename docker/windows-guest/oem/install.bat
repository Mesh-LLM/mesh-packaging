@echo off
rem Runs once, at the end of the unattended Windows install (dockur/windows OEM hook).
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0provision.ps1" > "%~dp0provision.log" 2>&1
