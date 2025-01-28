@echo off
:: Setting the application to the env variables
set FLASK_APP=run.py

:: Run the application
python -m flask run --debug