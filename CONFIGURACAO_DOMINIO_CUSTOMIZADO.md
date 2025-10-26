# 🌐 Configuração do Domínio Customizado no Render

## ❌ Problema Atual
O site funciona em: `https://conselhos-esotericos.onrender.com`  
Mas **NÃO funciona** em: `https://conselhosesotericos.com.br`

**Motivo:** O domínio customizado não está configurado no Render.

---

## ✅ Solução: Configurar Domínio no Render

### 📋 **Passo 1: Adicionar Domínio no Render**

1. **Acesse o Dashboard do Render:**
   - URL: https://dashboard.render.com/web/srv-d3v2qhbe5dus73a2vifg
   
2. **Vá para a seção "Custom Domains":**
   - No menu lateral, clique em **"Settings"**
   - Role até a seção **"Custom Domains"**

3. **Adicione seu domínio:**
   - Clique em **"+ Add Custom Domain"**
   - Digite: `conselhosesotericos.com.br`
   - Clique em **"Save"**

4. **O Render vai fornecer os registros DNS:**
   ```
   Tipo: CNAME
   Nome: @  (ou deixe vazio)
   Valor: conselhos-esotericos.onrender.com
   ```

---

### 📋 **Passo 2: Configurar DNS no Registro.br (ou seu provedor)**

Se seu domínio está registrado no **Registro.br**:

1. **Acesse o painel do Registro.br:**
   - URL: https://registro.br
   - Faça login com suas credenciais

2. **Vá para a gestão de DNS:**
   - Clique em **"Meus Domínios"**
   - Selecione `conselhosesotericos.com.br`
   - Clique em **"Editar Zona"**

3. **Adicione/Edite os registros DNS:**

   **Opção A: Usando CNAME (Recomendado)**
   ```
   www    CNAME    conselhos-esotericos.onrender.com.
   ```

   **Opção B: Usando A Record (para domínio raiz)**
   ```
   @    A    216.24.57.1
   ```
   
   **IMPORTANTE:** O Render fornece IPs específicos. Verifique no dashboard qual IP usar.

4. **Adicione também o subdomínio www:**
   ```
   www    CNAME    conselhos-esotericos.onrender.com.
   ```

5. **Salve as alterações**

---

### 📋 **Passo 3: Configurar Redirecionamento (Opcional)**

Para redirecionar `www.conselhosesotericos.com.br` → `conselhosesotericos.com.br`:

No Render, você pode adicionar ambos os domínios:
- `conselhosesotericos.com.br` (principal)
- `www.conselhosesotericos.com.br` (redireciona)

---

### ⏱️ **Passo 4: Aguardar Propagação DNS**

- **Tempo de propagação:** 5 minutos a 48 horas
- **Média:** 1-4 horas
- **Verificar propagação:** https://www.whatsmydns.net/

---

## 🔒 Certificado SSL Automático

O Render **gera automaticamente** um certificado SSL gratuito via Let's Encrypt:

- ✅ Configurado automaticamente após adicionar o domínio
- ✅ Renovação automática
- ✅ HTTPS habilitado

---

## 📊 Verificação de Status

### **Ferramenta 1: WhatsMyDNS**
```
URL: https://www.whatsmydns.net/
Domínio: conselhosesotericos.com.br
Tipo: A ou CNAME
```

### **Ferramenta 2: DNS Checker**
```
URL: https://dnschecker.org/
Domínio: conselhosesotericos.com.br
```

### **Ferramenta 3: Comando Terminal**
```bash
# Windows (PowerShell)
nslookup conselhosesotericos.com.br

# Linux/Mac
dig conselhosesotericos.com.br
```

---

## 🚨 Problemas Comuns

### **1. "DNS_PROBE_FINISHED_NXDOMAIN"**
- **Causa:** DNS não configurado corretamente
- **Solução:** Verifique os registros DNS no Registro.br

### **2. "Site não carrega após 24h"**
- **Causa:** Registros DNS incorretos
- **Solução:** Verifique se o CNAME aponta para `conselhos-esotericos.onrender.com`

### **3. "Certificado SSL inválido"**
- **Causa:** SSL ainda sendo gerado
- **Solução:** Aguarde 10-30 minutos após adicionar o domínio

### **4. "ERR_TOO_MANY_REDIRECTS"**
- **Causa:** Redirecionamento circular
- **Solução:** Remova redirecionamentos no .htaccess ou no Render

---

## 📝 Configuração Completa Exemplo

### **No Registro.br:**
```
# Zona DNS
conselhosesotericos.com.br.
@        A        216.24.57.1       (IP do Render)
www      CNAME    conselhos-esotericos.onrender.com.
```

### **No Render Dashboard:**
```
Custom Domains:
- conselhosesotericos.com.br (Principal)
- www.conselhosesotericos.com.br (Alias)

SSL: Automático (Let's Encrypt)
Status: ✅ Active
```

---

## 🎯 Checklist de Configuração

- [ ] Domínio adicionado no Render
- [ ] Registros DNS configurados no Registro.br
- [ ] Aguardado propagação DNS (1-4h)
- [ ] SSL gerado automaticamente
- [ ] Teste: `https://conselhosesotericos.com.br` funciona
- [ ] Teste: `https://www.conselhosesotericos.com.br` redireciona

---

## 📞 Suporte

Se após 48h o domínio ainda não funcionar:

1. **Verifique os logs no Render:**
   - Dashboard → Logs
   
2. **Entre em contato com suporte Render:**
   - https://render.com/support

3. **Verifique DNS no Registro.br:**
   - Certifique-se que os registros estão salvos e ativos

---

## 🔗 Links Úteis

- **Dashboard Render:** https://dashboard.render.com/web/srv-d3v2qhbe5dus73a2vifg
- **Registro.br:** https://registro.br
- **Verificar DNS:** https://www.whatsmydns.net/
- **Documentação Render:** https://render.com/docs/custom-domains

---

**Status Atual:**
- ✅ Site funcionando: `https://conselhos-esotericos.onrender.com`
- ❌ Domínio customizado: `https://conselhosesotericos.com.br` (não configurado)
- 🔧 Ação necessária: Seguir passos 1 e 2 acima

