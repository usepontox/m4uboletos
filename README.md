# 🎯 Sistema de Automação de Boletos Estrutural

Sistema web para automatizar o processamento diário de boletos usando OCR (Reconhecimento Óptico de Caracteres) para extrair dados de imagens/prints de planilhas.

## 📋 Funcionalidades

- ✅ Upload de imagens (prints) de planilhas de vendas e desmembramentos
- ✅ Processamento automático com OCR (Tesseract.js)
- ✅ Aplicação de regras de negócio por DDD:
  - **DDD 42/47:** Soma de Vendas Líquidas + Cobranças Líquidas
  - **DDD 61:** Apenas Vendas Líquidas, divisão de boletos > R$5.000
  - **DDD 63:** Apenas Vendas Líquidas, divisão de boletos > R$1.000
- ✅ Aplicação automática de desmembramentos
- ✅ Numeração sequencial automática
- ✅ Geração de Excel formatado para download
- ✅ Interface web moderna e responsiva

## 🚀 Instalação

### Pré-requisitos

- Node.js 16+ instalado
- Navegador moderno (Chrome, Firefox, Edge)

### Passos

1. **Abra o terminal na pasta do projeto:**
   ```bash
   cd C:\Users\M4U\.gemini\antigravity\scratch\boletos-automation
   ```

2. **Instale as dependências:**
   ```bash
   npm install
   ```

3. **Inicie o servidor:**
   ```bash
   npm start
   ```

4. **Acesse no navegador:**
   ```
   http://localhost:3000
   ```

## 📖 Como Usar

1. **Tire prints/screenshots das planilhas:**
   - Planilha de vendas do Paranauê
   - Planilha de desmembramentos

2. **Acesse o sistema no navegador**

3. **Faça upload das imagens:**
   - Arraste e solte ou clique para selecionar
   - Imagem 1: Planilha de Vendas
   - Imagem 2: Desmembramentos

4. **Configure:**
   - Número inicial da sequência
   - Data (pré-preenchida com hoje)

5. **Clique em "Processar e Gerar Excel"**

6. **Aguarde o processamento** (OCR pode levar alguns segundos)

7. **Baixe o Excel gerado!**

## 📁 Estrutura do Projeto

```
boletos-automation/
├── server.js                 # Servidor Express
├── package.json              # Dependências
├── public/                   # Frontend
│   ├── index.html           # Interface web
│   ├── css/
│   │   └── styles.css       # Estilos
│   └── js/
│       └── app.js           # JavaScript frontend
├── src/
│   ├── ocr/
│   │   └── imageProcessor.js    # Processamento OCR
│   ├── business/
│   │   └── rulesEngine.js       # Regras de negócio
│   ├── excel/
│   │   └── excelGenerator.js    # Geração de Excel
│   └── processors/
│       └── mainProcessor.js     # Orquestrador principal
└── uploads/                  # Pasta temporária (criada automaticamente)
```

## ⚙️ Tecnologias Utilizadas

- **Backend:**
  - Node.js + Express
  - Tesseract.js (OCR)
  - ExcelJS (geração de planilhas)
  - Sharp (processamento de imagens)
  - Multer (upload de arquivos)

- **Frontend:**
  - HTML5 + CSS3 + JavaScript
  - Design moderno com glassmorphism
  - Drag and drop de arquivos

## 🌐 Deploy Gratuito Online

### Opção 1: Render (Recomendado)

1. Crie conta em [render.com](https://render.com)
2. Conecte seu repositório GitHub
3. Crie um novo "Web Service"
4. Configure:
   - Build Command: `npm install`
   - Start Command: `npm start`
5. Deploy automático!

### Opção 2: Railway

1. Crie conta em [railway.app](https://railway.app)
2. Conecte GitHub
3. Deploy com um clique
4. URL automática gerada

## ⚠️ Observações Importantes

### OCR - Qualidade das Imagens

Para melhor precisão do OCR:
- ✅ Use imagens com boa resolução
- ✅ Evite imagens borradas ou com baixo contraste
- ✅ Certifique-se que o texto está legível
- ✅ PNG ou JPG de alta qualidade

### Validação dos Dados

Sempre revise o Excel gerado antes de usar em produção, pois:
- OCR pode ter pequenos erros de leitura
- Números similares (0 vs O, 1 vs l) podem ser confundidos
- Recomenda-se validação manual dos valores críticos

## 🔧 Troubleshooting

### Erro: "Nenhum dado encontrado"
- Verifique a qualidade da imagem
- Certifique-se que a imagem contém uma tabela com dados
- Tente aumentar o contraste da imagem

### Erro: "Arquivo muito grande"
- Limite: 10MB por imagem
- Comprima a imagem antes de enviar

### Servidor não inicia
- Verifique se o Node.js está instalado: `node --version`
- Reinstale as dependências: `npm install`
- Verifique se a porta 3000 está livre

## 📞 Suporte

Para problemas ou dúvidas, verifique:
1. Qualidade das imagens enviadas
2. Logs do console do navegador (F12)
3. Logs do servidor no terminal

## 📝 Licença

MIT License - Livre para uso e modificação

---

**Desenvolvido para automação do processo de boletos estrutural** 🚀
