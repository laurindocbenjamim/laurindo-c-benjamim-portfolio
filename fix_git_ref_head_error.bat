@echo off

echo 1. To fix 'ref HEAD' error
echo 2. To create new commit
echo 3. To start commiting
echo 4. To fix the error like "error: failed to push some refs to <<repository>>"
echo 5. To fix the error like "error: bad signature 0x00000000. fatal: index file corrupt"
echo 6. To skip everything

set /p op=": "

if "%op%"=="1" (
    :: Check for Stale Lock Files: Sometimes, a previous Git operation might have left a lock file behind. You can remove it manually:
    del .git\refs\heads\main.lock

    :: Prune Old Branches: Remove references to branches that no longer exist on the remote repository:
    git remote prune origin

    :: Garbage Collection: Run Git's garbage collection to clean up and optimize your repository:
    git gc

    :: Recreate the Branch: If the reference is broken, you might need to recreate the branch:
    git checkout -b new-branch
    git branch -D main
    git checkout -b main

    git log
    git status

    timeout /t 4

    git branch
    git add .

    set /p userCommit="Please enter your commit description: "
    echo You entered: %userCommit%
    git commit -m "%userCommit%"

    set /p push="Enter (1) to push, (0) to stop: "

    if "%push%"=="1" (
        timeout /t 4
        echo ========= Starting pushing the commits ...
        git push -u origin main
    ) else (
        echo ========= Process ended =========.
    )
) else if "%op%"=="2" (
    timeout /t 4
    echo ========= Starting pushing the commits ...

    git add .

    set /p newCommit="Please enter your commit description: "

    echo You entered: %newCommit%

    git commit -m "%newCommit%"

    git push -u origin main

) else if "%op%"=="3" (
    echo You've entered %op%
) else if "%op%"=="4" (
    echo You've entered %op%
    echo Starting with pull request

    :: Fetch and Merge Changes: Update your local repository with the latest changes from the remote repository.
    git pull origin main

    :: Rebase Your Changes: If the above command doesn't work, try rebasing your changes.
    git pull --rebase origin main

    :: Force Push (Use with Caution): If you are sure that your local changes should overwrite the remote changes, you can force push. Be careful with this command as it can overwrite changes in the remote repository.
    git push -f origin main

    echo Finished ...

)else if "%op%"=="5" (
	
    REM Display the current directory path
    echo Current directory: %cd%

    REM Get the current directory path
    set current_path=%cd%

    REM Access the .git directory
    cd /d "%current_path%\.git" || (
        echo .git directory not found. Exiting...
        pause
        exit /b 1
    )

    REM Delete the index file
    del /f /q "index"

    REM Go back to the original directory and reset the Git index
    cd /d "%current_path%"
    git reset

    echo The index file has been reset. You can now commit your changes.
    pause

)
else (
    echo ========= Process ended =========.
)

echo ========= Push process ended =========.
