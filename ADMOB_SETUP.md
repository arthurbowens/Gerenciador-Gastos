# 🚀 Configuração Completa do Google AdMob

## 📱 **1. Criar Conta no Google AdMob**

### Passo 1: Acesso ao AdMob
1. Acesse [Google AdMob](https://admob.google.com/)
2. Faça login com sua conta Google
3. Clique em "Começar" para criar uma conta

### Passo 2: Informações da Conta
- **Nome da conta**: Seu nome ou nome da empresa
- **País**: Brasil
- **Moeda**: BRL (Real brasileiro)
- **Fuso horário**: UTC-3 (Brasília)

## 🏗️ **2. Configurar o App no AdMob**

### Passo 1: Adicionar App
1. Clique em "Apps" no menu lateral
2. Clique em "Adicionar app"
3. **Nome do app**: "Controle Financeiro Pro"
4. **Plataforma**: Android
5. **Bundle ID**: `com.seuapp.controlefinancas`

### Passo 2: Configurar App
- **Categoria**: Finanças
- **Tipo de conteúdo**: Aplicativo
- **Público-alvo**: Todas as idades

## 💰 **3. Criar Unidades de Anúncios**

### Passo 1: Banner
1. Clique em "Unidades de anúncios"
2. Clique em "Criar unidade de anúncios"
3. **Nome**: "Banner Principal"
4. **Formato**: Banner
5. **Tamanho**: Padrão (320x50)
6. **Localização**: Rodapé da tela

### Passo 2: Intersticial
1. Clique em "Criar unidade de anúncios"
2. **Nome**: "Intersticial Principal"
3. **Formato**: Intersticial
4. **Localização**: Transições de tela

### Passo 3: Recompensado
1. Clique em "Criar unidade de anúncios"
2. **Nome**: "Recompensado Premium"
3. **Formato**: Recompensado
4. **Localização**: Tela Premium

## 🔧 **4. Configurar AndroidManifest.xml**

### Passo 1: Adicionar Permissões
```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
```

### Passo 2: Adicionar Meta-data
```xml
<meta-data
    android:name="com.google.android.gms.ads.APPLICATION_ID"
    android:value="ca-app-pub-3940256099942544~3347511713"/>
```

## 📱 **5. Configurar build.gradle**

### Passo 1: Dependências
```gradle
dependencies {
    implementation 'com.google.android.gms:play-services-ads:22.0.0'
}
```

### Passo 2: Versão mínima
```gradle
android {
    defaultConfig {
        minSdkVersion 21
        targetSdkVersion 33
    }
}
```

## 🎯 **6. IDs das Unidades de Anúncios**

### IDs de Teste (Desenvolvimento)
```javascript
const TEST_IDS = {
  BANNER: 'ca-app-pub-3940256099942544/6300978111',
  INTERSTITIAL: 'ca-app-pub-3940256099942544/1033173712',
  REWARDED: 'ca-app-pub-3940256099942544/5224354917',
};
```

### IDs de Produção (Substitua pelos seus)
```javascript
const PRODUCTION_IDS = {
  BANNER: 'ca-app-pub-SEU_ID_AQUI/BANNER_ID',
  INTERSTITIAL: 'ca-app-pub-SEU_ID_AQUI/INTERSTITIAL_ID',
  REWARDED: 'ca-app-pub-SEU_ID_AQUI/REWARDED_ID',
};
```

## 🔒 **7. Configurações de Privacidade**

### Passo 1: Política de Privacidade
1. **URL da política**: `https://seuapp.com/privacy`
2. **Coleta de dados**: Limitada
3. **Personalização**: Desabilitada

### Passo 2: Consentimento
```javascript
// Solicitar consentimento do usuário
const requestConsent = async () => {
  try {
    await UserMessagingPlatform.requestConsentInfoUpdate();
    const consentInfo = await UserMessagingPlatform.getConsentInfo();
    
    if (consentInfo.isConsentFormAvailable) {
      await UserMessagingPlatform.showConsentForm();
    }
  } catch (error) {
    console.error('Erro ao solicitar consentimento:', error);
  }
};
```

## 📊 **8. Configurações de Anúncios**

### Passo 1: Frequência
- **Banner**: Sempre visível
- **Intersticial**: Máximo 1 por minuto
- **Recompensado**: Máximo 3 por dia

### Passo 2: Segmentação
```javascript
const adRequest = {
  requestNonPersonalizedAdsOnly: true,
  keywords: ['finance', 'budget', 'money', 'savings'],
  contentRating: ['G', 'PG'],
  maxAdContentRating: 'PG',
};
```

## 🚀 **9. Teste e Validação**

### Passo 1: Teste em Desenvolvimento
1. **Usar IDs de teste**
2. **Verificar logs** no console
3. **Testar em dispositivo real**

### Passo 2: Teste em Produção
1. **Substituir IDs de teste**
2. **Testar em beta**
3. **Monitorar métricas**

## 📈 **10. Monitoramento e Otimização**

### Passo 1: Métricas Importantes
- **eCPM**: Receita por 1000 impressões
- **Fill Rate**: Taxa de preenchimento
- **CTR**: Taxa de clique
- **Revenue**: Receita total

### Passo 2: Otimizações
- **Ajustar frequência** de anúncios
- **Testar diferentes** formatos
- **Otimizar posicionamento**
- **Segmentar público**

## ⚠️ **11. Problemas Comuns**

### Problema 1: Anúncios Não Carregam
**Solução**:
- Verificar conexão com internet
- Verificar IDs das unidades
- Verificar permissões no manifest

### Problema 2: Anúncios Rejeitados
**Solução**:
- Verificar política de conteúdo
- Ajustar configurações de segmentação
- Verificar idade do público

### Problema 3: Baixa Receita
**Solução**:
- Otimizar frequência
- Melhorar posicionamento
- Testar diferentes formatos

## 🎯 **12. Checklist Final**

- [ ] Conta AdMob criada
- [ ] App configurado
- [ ] Unidades de anúncios criadas
- [ ] IDs configurados no código
- [ ] AndroidManifest.xml configurado
- [ ] build.gradle configurado
- [ ] Política de privacidade configurada
- [ ] Testes realizados
- [ ] IDs de produção configurados
- [ ] Monitoramento configurado

## 💡 **Dicas Importantes**

1. **Sempre teste** com IDs de teste primeiro
2. **Monitore métricas** diariamente
3. **Otimize frequência** baseado no feedback
4. **Respeite limites** de anúncios
5. **Mantenha política** de privacidade atualizada
6. **Teste em dispositivos** reais
7. **Implemente fallbacks** para erros

---

**🎉 Parabéns! Seu app está pronto para gerar receita com anúncios!**

> **Lembre-se**: O sucesso com anúncios depende do equilíbrio entre experiência do usuário e monetização.
