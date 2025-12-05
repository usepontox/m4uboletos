# 🚀 Guia de Deploy Gratuito

Este guia mostra como fazer deploy do sistema de automação de boletos em plataformas gratuitas.

## 📦 Preparação

Antes de fazer deploy, certifique-se de:

1. ✅ Ter uma conta no GitHub
2. ✅ Criar um repositório e fazer push do código
3. ✅ Testar localmente que tudo funciona

### Criar repositório GitHub

```bash
cd C:\Users\M4U\.gemini\antigravity\scratch\boletos-automation
git init
git add .
git commit -m "Initial commit - Sistema de Automação de Boletos"
git branch -M main
git remote add origin https://github.com/SEU-USUARIO/boletos-automation.git
git push -u origin main
```

---

## 🌐 Opção 1: Render (Recomendado)

**Vantagens:**
- ✅ 750 horas grátis/mês
- ✅ SSL automático
- ✅ Deploy automático do GitHub
- ✅ Fácil configuração

### Passos:

1. **Acesse:** https://render.com
2. **Crie uma conta** (pode usar GitHub)
3. **Clique em "New +"** → **"Web Service"**
4. **Conecte seu repositório GitHub**
5. **Configure:**
   - **Name:** boletos-automation
   - **Environment:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Instance Type:** Free
6. **Clique em "Create Web Service"**
7. **Aguarde o deploy** (5-10 minutos)
8. **Acesse a URL gerada!** (ex: `https://boletos-automation.onrender.com`)

### ⚠️ Importante no Render:

- O serviço gratuito "hiberna" após 15 minutos sem uso
- Primeira requisição após hibernar pode demorar ~30 segundos
- Perfeito para uso diário (09:00-13:00)

---

## 🚂 Opção 2: Railway

**Vantagens:**
- ✅ $5 de crédito grátis/mês
- ✅ Não hiberna
- ✅ Deploy super rápido
- ✅ Interface moderna

### Passos:

1. **Acesse:** https://railway.app
2. **Crie conta** com GitHub
3. **Clique em "New Project"**
4. **Selecione "Deploy from GitHub repo"**
5. **Escolha seu repositório**
6. **Railway detecta automaticamente Node.js**
7. **Deploy automático!**
8. **Gere domínio público:**
   - Settings → Generate Domain
9. **Acesse a URL!**

---

## ☁️ Opção 3: Vercel

**Vantagens:**
- ✅ Totalmente gratuito
- ✅ Deploy instantâneo
- ✅ CDN global

### Passos:

1. **Acesse:** https://vercel.com
2. **Crie conta** com GitHub
3. **Clique em "Add New..."** → **"Project"**
4. **Importe seu repositório**
5. **Configure:**
   - Framework Preset: Other
   - Build Command: `npm install`
   - Output Directory: `public`
6. **Deploy!**

### ⚠️ Configuração adicional para Vercel:

Crie arquivo `vercel.json` na raiz:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "server.js"
    }
  ]
}
```

---

## 🔧 Variáveis de Ambiente

Se precisar configurar variáveis de ambiente:

### Render:
- Environment → Add Environment Variable
- `PORT` (já configurado automaticamente)

### Railway:
- Variables → New Variable
- `PORT` (já configurado automaticamente)

### Vercel:
- Settings → Environment Variables
- Adicione conforme necessário

---

## 📊 Monitoramento

### Render:
- Dashboard → Logs (tempo real)
- Metrics (uso de recursos)

### Railway:
- Deployments → Logs
- Observability

### Vercel:
- Deployments → Function Logs
- Analytics

---

## 🐛 Troubleshooting

### Deploy falhou:

1. **Verifique os logs** da plataforma
2. **Certifique-se** que `package.json` está correto
3. **Teste localmente** antes: `npm install && npm start`

### Aplicação não carrega:

1. **Verifique** se o deploy foi concluído
2. **Aguarde** alguns minutos (primeira build pode demorar)
3. **Verifique logs** para erros

### OCR muito lento:

- OCR em servidores gratuitos pode ser mais lento
- Considere upgrade para plano pago se necessário
- Ou use localmente para melhor performance

---

## 💡 Dicas

1. **Use Render** para simplicidade e confiabilidade
2. **Use Railway** se precisar de melhor performance
3. **Use Vercel** para deploy mais rápido
4. **Mantenha backup** do código no GitHub
5. **Monitore logs** regularmente

---

## 🔒 Segurança

Para produção, considere:

1. **Adicionar autenticação** (login/senha)
2. **Limitar uploads** por IP
3. **Validar** dados de entrada
4. **HTTPS** (já incluído nas plataformas)

---

## 📈 Próximos Passos

Após deploy:

1. ✅ Teste com dados reais
2. ✅ Configure domínio customizado (opcional)
3. ✅ Adicione monitoramento
4. ✅ Documente URL para equipe

---

**Pronto! Seu sistema está online e acessível de qualquer lugar! 🎉**
