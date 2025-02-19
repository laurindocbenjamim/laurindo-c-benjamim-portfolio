@echo off


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
    SET FLASK_APP=app.py
    python -m pip install --upgrade pip 
    python -m pip install -r requirements.txt
    echo Running and Debugging the application...
    python -m flask db init
    python -m flask db stamp
    python -m flask db migrate
    python -m flask db upgrade
    :: python app.py  
    python -m flask run --cert=adhoc --debug
    
) ELSE IF "%resp%"=="4" (
    echo Process stopped by the user.
)

ENDLOCAL
