@echo off
echo ______ Starting creating the envirenment application ...
timeout /t 3
:: Create the application envirenment
python -m venv .env 

echo Moving to and activating the envirenment application
:: Move to the .env folder to activate it
cd .env/Scripts/

activate

cd ../../

echo _______ Installig the application libraries
python -m pip install --upgrade pip 
python -m pip install -r requirements.txt

echo _______ Installation has finished.
echo 1. To run the application
echo 2. To stop the process
set /p resp=": "

if "%resp%"=="1"
(
    echo Running and Debuging the application...
    python app.py 
)