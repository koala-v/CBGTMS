@echo on
set target="\\192.168.0.230\wwwroot\app\tms\tan"
xcopy /y/e/s www %target%\www
pause 
copy /y index.html %target%
copy /y update.json %target%
copy /y Tan-TMS.apk %target%\Tan-TMS.apk
del Tan-TMS.apk /f /q
pause 