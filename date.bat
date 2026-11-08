:: Batch pour écrire version.js automatiquement

@echo off
setlocal enabledelayedexpansion

set "filename=version.js"
set "suffix="
set "alphabet=ABCDEFGHIJKLMNOPQRSTUVWXYZ"

:: 1. Extraction de la date (AAMM.JJ) via PowerShell
for /f "usebackq" %%i in (`powershell -NoProfile -Command "Get-Date -Format 'yyMM.dd'"`) do set base_version=%%i

:: 2. Vérification version actuelle
set /p current_line=<%filename%

:: On extrait la version entre les guillemets
for /f tokens^=2^ delims^=^" %%A in ("!current_line!") do set old_version=%%A

:: Si la date est identique, on cherche le suffixe
echo !old_version! | findstr /C:"%base_version%" >nul
if !errorlevel! == 0 (
    :: La parenthese DOIT être sur cette ligne
    call :increment "!old_version!"
)

:: 3. Création du fichier avec la version finale
set "final_version=%base_version%%suffix%"
echo const VERSION = "%final_version%"; > %filename%
:: Génération robuste du caractère ESC (ASCII 27)
for /F "tokens=1,2 delims=#" %%a in ('"prompt #$H#$E# & echo on & for %%b in (1) do rem"') do set "ESC=%%b"
:: Affichage en VERT (92m pour vert clair, 32m pour vert foncé)
echo %ESC%[92mVersion generee : %final_version%%ESC%[0m
:: ----------------------

goto :eof

:increment
set "current_v=%~1"
set "current_suffix=%current_v:~7,1%"
if "%current_suffix%"=="" (
    set "suffix=A"
) else (
    for /L %%i in (0,1,24) do (
        if "!alphabet:~%%i,1!"=="%current_suffix%" (
            set /a next=%%i+1
            for /f "tokens=1" %%j in ("!next!") do set "suffix=!alphabet:~%%j,1!"
        )
    )
)