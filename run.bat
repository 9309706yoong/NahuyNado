@echo off
setlocal enabledelayedexpansion
chcp 65001 >nul

REM Переходим в папку, где лежит run.bat
cd /d "%~dp0"

echo ==========================================
echo   Нафиг надо — локальный запуск
echo ==========================================
echo.

REM Проверяем наличие Python
python --version >nul 2>&1
if errorlevel 1 (
    echo [ОШИБКА] Python не найден. Установи Python 3 с https://www.python.org/downloads/
    echo          И не забудь поставить галочку "Add Python to PATH".
    pause
    exit /b 1
)

REM Если виртуальное окружение еще не создано — создаем и ставим Flask
if not exist "venv\Scripts\python.exe" (
    echo [*] Создаю виртуальное окружение...
    python -m venv venv
    if errorlevel 1 (
        echo [ОШИБКА] Не удалось создать venv.
        pause
        exit /b 1
    )

    call venv\Scripts\activate.bat

    echo [*] Устанавливаю Flask...
    pip install flask
    if errorlevel 1 (
        echo [ОШИБКА] Не удалось установить Flask.
        pause
        exit /b 1
    )
) else (
    call venv\Scripts\activate.bat
)

echo.
echo [*] Запускаю сервер...
echo [*] Когда откроешь http://127.0.0.1:5000, появится сообщение об успехе.
echo.

REM Запускаем Flask в отдельном минимизированном окне с фиксированным заголовком
start "NafigNado Server" /MIN cmd /c "python app.py"

:waitloop
REM Ждем 1 секунду
 timeout /t 1 >nul

REM Проверяем, открыл ли пользователь сайт, через /api/status
powershell -Command "try { $r = Invoke-WebRequest -Uri http://127.0.0.1:5000/api/status -UseBasicParsing -TimeoutSec 1; if ($r.Content -like '*true*') { exit 0 } else { exit 1 } } catch { exit 1 }"

if errorlevel 1 goto waitloop

echo.
echo ==========================================
echo   УСПЕХ! Приложение запущено.
echo   Открой http://127.0.0.1:5000 в браузере.
echo ==========================================
echo.
echo Нажми любую клавишу, чтобы остановить сервер.
pause >nul

REM Останавливаем только наше окно сервера
taskkill /F /FI "WINDOWTITLE eq NafigNado Server" >nul 2>&1

echo [*] Сервер остановлен. Пока.
