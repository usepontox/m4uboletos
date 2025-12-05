# 🎯 Sistema de Automação de Boletos - Início Rápido

## ⚠️ Pré-requisito: Instalar Node.js

O sistema precisa do Node.js para funcionar. Siga os passos:

### 1. Baixar Node.js

1. Acesse: https://nodejs.org
2. Baixe a versão **LTS** (recomendada)
3. Execute o instalador
4. Clique em "Next" → "Next" → "Install"
5. Aguarde a instalação

### 2. Verificar Instalação

Abra um novo terminal (PowerShell) e digite:

```bash
node --version
npm --version
```

Se aparecer os números de versão, está instalado! ✅

---

## 🚀 Iniciar o Sistema

### Passo 1: Abrir Terminal na Pasta

```bash
cd C:\Users\M4U\.gemini\antigravity\scratch\boletos-automation
```

### Passo 2: Instalar Dependências (primeira vez)

```bash
npm install
```

⏳ Aguarde 2-5 minutos (baixa bibliotecas necessárias)

### Passo 3: Iniciar Servidor

```bash
npm start
```

Você verá:
```
🚀 Servidor rodando em http://localhost:3000
📊 Sistema de Automação de Boletos
⏰ Iniciado em: [data/hora]
```

### Passo 4: Abrir no Navegador

Abra seu navegador e acesse:
```
http://localhost:3000
```

---

## 📸 Como Usar

1. **Tire prints das planilhas:**
   - Print da planilha de vendas do Paranauê
   - Print da planilha de desmembramentos

2. **Na interface web:**
   - Arraste ou clique para fazer upload dos prints
   - Digite o número inicial (ex: 213573)
   - Confirme a data (já vem preenchida)
   - Clique em "Processar e Gerar Excel"

3. **Aguarde o processamento** (30-60 segundos)

4. **Baixe o Excel gerado!** 📥

---

## 🛑 Parar o Servidor

No terminal onde está rodando, pressione:
```
Ctrl + C
```

---

## 💡 Dicas

- ✅ Use imagens com boa qualidade (nítidas)
- ✅ Certifique-se que o texto está legível
- ✅ Sempre revise o Excel gerado
- ✅ Mantenha o terminal aberto enquanto usa

---

## 🌐 Usar Online (sem instalar nada)

Siga o guia em `DEPLOY.md` para colocar online gratuitamente!

Plataformas recomendadas:
- **Render** (mais fácil)
- **Railway** (mais rápido)
- **Vercel** (mais popular)

---

## ❓ Problemas?

### "npm não é reconhecido"
→ Instale o Node.js (passo 1 acima)

### "Erro ao instalar dependências"
→ Verifique sua conexão com internet
→ Tente novamente: `npm install`

### "Porta 3000 em uso"
→ Feche outros programas que usam a porta
→ Ou mude a porta no `server.js`

---

**Pronto para automatizar seus boletos! 🚀**
