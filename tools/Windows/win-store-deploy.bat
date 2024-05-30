
set Packages="%LOCALAPPDATA%\Packages"

for /f "delims=" %%i in ('dir /B %Packages%\Resco.MobileCrmDev_*') do (
    set AppPackageName=%%i
    goto :found
)
for /f "delims=" %%i in ('dir /B %Packages%\Resco.MobileCRM_*') do (
    set AppPackageName=%%i
    goto :found
)
echo "Mobile CRM package was not found"
goto :done
:found
    set OfflineHtmlDir=%Packages%\%AppPackageName%\LocalState\MobileCRM\WWW
    copy /Y %1 %OfflineHtmlDir%\
:done