# 🚀 Guia Rápido - Configurar Domínio Customizado

## ⚡ 3 Passos Simples

### **1️⃣ No Render (5 minutos)**

```
1. Acesse: https://dashboard.render.com/web/srv-d3v2qhbe5dus73a2vifg
2. Settings → Custom Domains
3. Clique "+ Add Custom Domain"
4. Digite: conselhosesotericos.com.br
5. Salvar
```

**O Render vai mostrar:**
```
Configure seu DNS:
CNAME: conselhos-esotericos.onrender.com
```

---

### **2️⃣ No Registro.br (10 minutos)**

```
1. Acesse: https://registro.br
2. Meus Domínios → conselhosesotericos.com.br
3. Editar Zona DNS
4. Adicione:
   
   Nome: @
   Tipo: A
   Valor: 216.24.57.1 (IP fornecido pelo Render)
   
   Nome: www
   Tipo: CNAME
   Valor: conselhos-esotericos.onrender.com.
   
5. Salvar
```

---

### **3️⃣ Aguardar Propagação (1-4 horas)**

```
Verificar em: https://www.whatsmydns.net/

Quando aparecer verde em vários locais = Pronto! ✅
```

---

## 🎯 URL Final

Antes:
```
❌ https://conselhosesotericos.com.br (não funciona)
✅ https://conselhos-esotericos.onrender.com (funciona)
```

Depois da configuração:
```
✅ https://conselhosesotericos.com.br (funciona)
✅ https://www.conselhosesotericos.com.br (funciona)
✅ https://conselhos-esotericos.onrender.com (funciona)
```

---

## 🔒 SSL/HTTPS

- **Automático:** O Render cria o certificado SSL gratuitamente
- **Tempo:** 10-30 minutos após adicionar o domínio
- **Renovação:** Automática (Let's Encrypt)

---

## ❓ Troubleshooting Rápido

**Problema:** Site não abre após 4 horas
```
Solução:
1. Verifique DNS: nslookup conselhosesotericos.com.br
2. Confirme registros no Registro.br estão salvos
3. Aguarde mais 24h (máximo de propagação)
```

**Problema:** "Certificado inválido"
```
Solução:
1. Aguarde 30 minutos
2. Se persistir, remova e adicione o domínio novamente no Render
```

**Problema:** "Too many redirects"
```
Solução:
1. Verifique se não há redirecionamento no código
2. Desative força HTTPS temporariamente
```

---

## 📞 Precisa de Ajuda?

1. **Documentação Render:** https://render.com/docs/custom-domains
2. **Suporte Registro.br:** https://registro.br/suporte/
3. **Verificar DNS:** https://www.whatsmydns.net/

---

**✅ Pronto! Após seguir esses 3 passos seu site estará acessível em:**
`https://conselhosesotericos.com.br` 🎉

