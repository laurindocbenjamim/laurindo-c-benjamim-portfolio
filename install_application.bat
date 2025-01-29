@echo off


:: Check if the .env directory exists in the current path
IF not exist ".env\" (
    echo The .env directory does not exist in the current path.
    echo Creating the .env directory...
    ::mkdir .env
    python -m venv .env
    
    if exist ".env\" (
        echo The .env directory has been created successfully.
    ) else (
        echo Failed to create the .env directory.
    )
) ELSE (
    echo The .env directory already exists in the current path.
)


REM Function to check if the virtual environment is activated
SETLOCAL ENABLEDELAYEDEXPANSION
SET "VIRTUAL_ENV_ACTIVATED=0"
IF DEFINED VIRTUAL_ENV (
    SET "VIRTUAL_ENV_ACTIVATED=1"
)

IF "!VIRTUAL_ENV_ACTIVATED!"=="0" (
    echo Virtual environment not activated. Activating...
    call .env\Scripts\activate.bat
    set "path=%cd%"
    echo Current path: %path%
) ELSE (
    echo Virtual environment already activated.
)

REM Check if the virtual environment folder exists
IF EXIST ".env\" (
    echo Virtual environment '.env' already exists. Activating...
) ELSE (
    echo Creating virtual environment '.env'...
    python -m venv .env
)

REM Activate the virtual environment if not activated already
IF "!VIRTUAL_ENV_ACTIVATED!"=="0" (
    call .env\Scripts\activate.bat
)

set FLASK_ENV=testing

REM Function to install missing packages
call :install_package Flask-Migrate
call :install_package cachetools
call :install_package phonenumbers
call :install_package Flask-Limiter
call :install_package email-validator
call :install_package Flask-Talisman

:: Open VSCode
call code .
echo _______ Installation has finished.
echo 1. To install the libraries
echo 2. To run the application
echo 3. To install the libraries and run the application
echo 4. To stop the process
set /p resp=": "

IF "%resp%"=="1" (
    REM _______ Installing the application libraries
    echo Installing the libraries...
    python -m pip install --upgrade pip 
    python -m pip install -r requirements.txt
) ELSE IF "%resp%"=="2" (
    REM Running and Debugging the application...
    echo Running the Application...
    python -m flask db init
    python -m flask db stamp
    python -m flask db migrate
    python -m flask db upgrade
    :: python app.py  
    python -m flask run --debug 
) ELSE IF "%resp%"=="3" (
    REM _______ Installing the application libraries
    echo Installing the libraries...
    python -m pip install --upgrade pip 
    python -m pip install -r requirements.txt
    echo Running and Debugging the application...
    python -m flask db init
    python -m flask db stamp
    python -m flask db migrate
    python -m flask db upgrade
    :: python app.py  
    python -m flask run --debug
) ELSE IF "%resp%"=="4" (
    echo Process stopped by the user.
)

ENDLOCAL
