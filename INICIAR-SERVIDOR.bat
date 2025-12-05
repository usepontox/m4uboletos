@echo off
echo ========================================
echo   Sistema de Automacao de Boletos
echo ========================================
echo.

REM Procurar Node.js em locais comuns
set NODE_PATH=
if exist "C:\Program Files\nodejs\node.exe" set NODE_PATH=C:\Program Files\nodejs
if exist "C:\Program Files (x86)\nodejs\node.exe" set NODE_PATH=C:\Program Files (x86)\nodejs
if exist "%APPDATA%\npm\node.exe" set NODE_PATH=%APPDATA%\npm

if "%NODE_PATH%"=="" (
    echo ERRO: Node.js nao encontrado!
    echo.
    echo Por favor, instale o Node.js de: https://nodejs.org
    echo.
    pause
    exit /b 1
)

echo Node.js encontrado em: %NODE_PATH%
echo.

REM Adicionar ao PATH temporariamente
set PATH=%NODE_PATH%;%PATH%

echo [1/3] Verificando instalacao...
"%NODE_PATH%\node.exe" --version
echo.

echo [2/3] Instalando dependencias...
echo (Isso pode demorar alguns minutos na primeira vez)
echo.

REM Tentar instalar dependencias
"%NODE_PATH%\npm.cmd" install
if %errorlevel% neq 0 (
    echo.
    echo ========================================
    echo   ERRO ao instalar dependencias!
    echo ========================================
    echo.
    echo Possivel solucao:
    echo 1. Verifique sua conexao com internet
    echo 2. Tente executar este script como Administrador
    echo    (clique com botao direito e "Executar como administrador")
    echo.
    pause
    exit /b 1
)

echo.
echo Dependencias instaladas com sucesso!
echo.

echo [3/3] Iniciando servidor...
echo.
echo ========================================
echo   SERVIDOR RODANDO!
echo   Acesse: http://localhost:3000
echo.
echo   MANTENHA ESTA JANELA ABERTA!
echo   Pressione Ctrl+C para parar
echo ========================================
echo.

"%NODE_PATH%\node.exe" server.js

REM Se o servidor parar, manter janela aberta
echo.
echo ========================================
echo   Servidor parado!
echo ========================================
pause
