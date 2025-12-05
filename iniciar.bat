@echo off
echo ========================================
echo   Diagnostico do Sistema de Boletos
echo ========================================
echo.

echo [1/5] Verificando Node.js...
node --version
if %errorlevel% neq 0 (
    echo ERRO: Node.js nao encontrado!
    pause
    exit /b 1
)
echo OK!
echo.

echo [2/5] Verificando NPM...
npm --version
if %errorlevel% neq 0 (
    echo ERRO: NPM nao encontrado!
    pause
    exit /b 1
)
echo OK!
echo.

echo [3/5] Verificando pasta do projeto...
if not exist "package.json" (
    echo ERRO: Arquivo package.json nao encontrado!
    echo Certifique-se de estar na pasta correta:
    echo C:\Users\M4U\.gemini\antigravity\scratch\boletos-automation
    pause
    exit /b 1
)
echo OK!
echo.

echo [4/5] Verificando node_modules...
if not exist "node_modules" (
    echo AVISO: Dependencias nao instaladas!
    echo.
    echo Instalando dependencias agora...
    call npm install
    if %errorlevel% neq 0 (
        echo ERRO: Falha ao instalar dependencias!
        pause
        exit /b 1
    )
) else (
    echo OK! Dependencias ja instaladas.
)
echo.

echo [5/5] Iniciando servidor...
echo.
echo ========================================
echo   Servidor iniciando...
echo   Acesse: http://localhost:3000
echo   Pressione Ctrl+C para parar
echo ========================================
echo.

node server.js
