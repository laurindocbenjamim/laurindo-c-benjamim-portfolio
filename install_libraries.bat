@echo off

python -m pip install --upgrade pip

timeout /t 4

pip install -r requirements.txt

echo Proccess finished...