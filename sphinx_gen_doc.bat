@echo off
REM Prompt for project name and owner name
set /p project_name="Enter the project name: "
set /p owner_name="Enter the owner name: "

REM Check if Sphinx is already installed
pip show sphinx >nul 2>&1
if %errorlevel% neq 0 (
    echo Sphinx is not installed. Installing Sphinx...
    pip install sphinx
) else (
    echo Sphinx is already installed.
)

REM Get the path of the package
for /f "delims=" %%i in ('pip show sphinx ^| findstr /i "Location"') do set package_path=%%i
set package_path=%package_path:Location=%
echo Sphinx installed at: %package_path%

REM Set the path to Windows environment variables
echo Updating PATH environment variable...
setx PATH "%PATH%;%package_path%"

REM Verify if sphinx-quickstart is recognized
sphinx-quickstart --version >nul 2>&1
if %errorlevel% neq 0 (
    echo 'sphinx-quickstart' is not recognized. Restarting command prompt...
    cmd /k
) else (
    echo 'sphinx-quickstart' is recognized.
)

REM Generate Sphinx project
echo Creating Sphinx documentation...
sphinx-quickstart docs -q -p "%project_name%" -a "%owner_name%" -v "1.0" --sep

REM Build the documentation
echo Building Sphinx documentation...
sphinx-build -b html docs docs/_build

echo Sphinx documentation has been created and built.
pause
