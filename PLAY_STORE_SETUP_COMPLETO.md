# 🚀 **CONFIGURAÇÃO COMPLETA PARA PLAY STORE**

## 📱 **Sistema de Anúncios (Google AdMob)**

### 1️⃣ **Criar Conta AdMob**
1. Acesse [admob.google.com](https://admob.google.com)
2. Faça login com sua conta Google
3. Clique em "Começar" para criar uma conta AdMob

### 2️⃣ **Configurar App no AdMob**
1. Clique em "Apps" → "Adicionar app"
2. Selecione "Android"
3. Digite o nome: "Controle Finanças"
4. Selecione "Sim" para "Este app já está na Google Play Store?"
5. Digite o package name: `com.controlefinancas.app`
6. Clique em "Adicionar"

### 3️⃣ **Criar Ad Units**
#### **Banner Ad:**
1. Clique em "Ad units" → "Criar ad unit"
2. Nome: "Banner Principal"
3. Tipo: "Banner"
4. Tamanho: "Banner (320x50)"
5. Clique em "Criar ad unit"
6. **COPIE o Ad Unit ID** (ex: ca-app-pub-1234567890123456/1234567890)

#### **Interstitial Ad:**
1. Clique em "Ad units" → "Criar ad unit"
2. Nome: "Intersticial Principal"
3. Tipo: "Interstitial"
4. Clique em "Criar ad unit"
5. **COPIE o Ad Unit ID**

#### **Rewarded Ad:**
1. Clique em "Ad units" → "Criar ad unit"
2. Nome: "Recompensado Principal"
3. Tipo: "Rewarded"
4. Clique em "Criar ad unit"
5. **COPIE o Ad Unit ID**

### 4️⃣ **Atualizar Código com IDs Reais**
Substitua no arquivo `src/contexts/AdsContext.js`:

```javascript
// IDs de PRODUÇÃO (Play Store) - SUBSTITUIR pelos seus IDs reais
BANNER_PROD: 'SEU_ID_BANNER_AQUI',
INTERSTITIAL_PROD: 'SEU_ID_INTERSTICIAL_AQUI',
REWARDED_PROD: 'SEU_ID_RECOMPENSADO_AQUI',
```

## 💳 **Sistema de Pagamentos (Google Play Billing)**

### 1️⃣ **Configurar Google Play Console**
1. Acesse [play.google.com/console](https://play.google.com/console)
2. Faça login com sua conta Google
3. Clique em "Criar app"
4. Nome: "Controle Finanças"
5. Tipo: "App"
6. Gratuito ou pago: "Gratuito (com compras no app)"
7. Clique em "Criar"

### 2️⃣ **Configurar Produtos**
#### **Assinatura Mensal:**
1. Vá em "Monetização" → "Produtos" → "Assinaturas"
2. Clique em "Criar assinatura"
3. ID do produto: `subscription_month`
4. Nome: "Premium Mensal"
5. Descrição: "Acesso premium por 1 mês"
6. Preço: R$ 9,90
7. Período: 1 mês
8. Clique em "Salvar"

#### **Assinatura Anual:**
1. Clique em "Criar assinatura"
2. ID do produto: `subscription_year`
3. Nome: "Premium Anual"
4. Descrição: "Acesso premium por 1 ano (2 meses grátis)"
5. Preço: R$ 99,90
6. Período: 1 ano
7. Clique em "Salvar"

#### **Produto Vitalício:**
1. Vá em "Monetização" → "Produtos" → "Produtos no app"
2. Clique em "Criar produto"
3. ID do produto: `premium_lifetime`
4. Nome: "Premium Vitalício"
5. Descrição: "Acesso premium para sempre"
6. Preço: R$ 199,90
7. Clique em "Salvar"

### 3️⃣ **Atualizar Código com IDs Reais**
Substitua no arquivo `src/contexts/SubscriptionContext.js`:

```javascript
// IDs dos produtos - SUBSTITUA pelos seus IDs reais do Google Play Console
PREMIUM_MONTH: 'subscription_month',
PREMIUM_YEAR: 'subscription_year',
PREMIUM_LIFETIME: 'premium_lifetime',
SUBSCRIPTION_MONTH: 'subscription_month',
SUBSCRIPTION_YEAR: 'subscription_year',
```

## 🔧 **Configurações Técnicas**

### 1️⃣ **Instalar Dependências**
```bash
npm install react-native-google-mobile-ads react-native-iap
```

### 2️⃣ **Configurar AndroidManifest.xml**
O arquivo já está configurado com:
- Permissões necessárias
- Meta-data do AdMob
- Meta-data do Google Play Billing

### 3️⃣ **Configurar build.gradle**
O arquivo já está configurado com:
- Dependências do AdMob
- Dependências do Google Play Billing
- Multidex habilitado

### 4️⃣ **Configurar package.json**
O arquivo já está configurado com:
- Versões corretas das dependências
- Configurações do Expo
- Permissões Android

## 📋 **Checklist Final**

### ✅ **AdMob:**
- [ ] Conta criada
- [ ] App configurado
- [ ] Ad Units criados (Banner, Interstitial, Rewarded)
- [ ] IDs copiados e atualizados no código
- [ ] App ID configurado no AndroidManifest.xml

### ✅ **Google Play Billing:**
- [ ] App criado no Google Play Console
- [ ] Produtos configurados (Mensal, Anual, Vitalício)
- [ ] IDs dos produtos atualizados no código
- [ ] Permissão BILLING configurada

### ✅ **Código:**
- [ ] AdsContext configurado para produção
- [ ] SubscriptionContext configurado para produção
- [ ] Dependências instaladas
- [ ] Configurações Android atualizadas

### ✅ **Teste:**
- [ ] App compila sem erros
- [ ] Anúncios aparecem (em modo de teste)
- [ ] Sistema de pagamentos funciona
- [ ] Assinaturas são processadas

## 🚀 **Publicar na Play Store**

### 1️⃣ **Gerar APK/AAB**
```bash
npm run build:android
```

### 2️⃣ **Upload no Google Play Console**
1. Vá em "Produção" → "Criar nova versão"
2. Faça upload do arquivo AAB
3. Adicione notas da versão
4. Clique em "Salvar"

### 3️⃣ **Configurar Listagem**
1. Vá em "Presença na loja" → "Listagem do app"
2. Preencha todas as informações
3. Adicione screenshots
4. Configure classificação de conteúdo

### 4️⃣ **Revisar e Publicar**
1. Vá em "Política do app" → "Política de conteúdo"
2. Responda todas as perguntas
3. Clique em "Enviar para revisão"
4. Aguarde aprovação (24-48 horas)

## 💰 **Monetização**

### **Estratégia de Preços:**
- **Gratuito**: Funcionalidades básicas
- **Premium Mensal**: R$ 9,90/mês
- **Premium Anual**: R$ 99,90/ano (17% desconto)
- **Premium Vitalício**: R$ 199,90 (uma vez)

### **Anúncios:**
- **Banners**: Na tela principal
- **Intersticiais**: Entre navegações (máx 3 por sessão)
- **Recompensados**: Para ganhar moedas virtuais

### **Receita Esperada:**
- **Assinaturas**: 70% da receita
- **Anúncios**: 30% da receita
- **ROI estimado**: 3-6 meses

## 🔒 **Segurança e Compliance**

### **GDPR/CCPA:**
- [ ] Política de privacidade
- [ ] Termos de uso
- [ ] Consentimento de anúncios
- [ ] Opção de opt-out

### **Google Play:**
- [ ] Política de conteúdo
- [ ] Política de anúncios
- [ ] Política de assinaturas
- [ ] Suporte ao usuário

---

## 🎯 **RESULTADO FINAL**

Com essa configuração, seu app estará **100% pronto** para a Play Store com:

✅ **Sistema de anúncios real** (Google AdMob)  
✅ **Sistema de pagamentos real** (Google Play Billing)  
✅ **Assinaturas premium funcionais**  
✅ **Monetização completa**  
✅ **Configurações de produção**  
✅ **Compliance com políticas**  

**🚀 Agora é só publicar e começar a ganhar dinheiro!**
