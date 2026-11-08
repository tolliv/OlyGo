@echo off
call date.bat
set msg=Auto-update %date% %time%
c:\git\bin\git add .
c:\git\bin\git status
c:\git\bin\git commit -m "%msg%"
c:\git\bin\git push origin main
echo Mise a jour envoyee avec le message : %msg%
