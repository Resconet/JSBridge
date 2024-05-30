set OfflineHtmlDir=%APPDATA%\MobileCRM\\WWW
if exist %OfflineHtmlDir% (
    copy /Y %1 %OfflineHtmlDir%\
) else (
    echo "Mobile CRM Offline HTML folder was not found"
)
