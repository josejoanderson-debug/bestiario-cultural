# Empacotamento Android

Este invólucro usa a versão publicada do Bestiário Cultural em vez de incorporar uma cópia estática. Por isso, as alterações feitas pelo painel administrativo chegam ao aplicativo assim que o visitante abre ou atualiza a leitura.

Para produzir o APK assinado em uma estação com Android Studio e SDK Android instalados, copie `capacitor.config.json` para a raiz do projeto web e execute:

```bash
npm install @capacitor/core @capacitor/cli @capacitor/android
npx cap add android
npx cap open android
```

No Android Studio, use **Build > Generate Signed Bundle / APK**. O APK deve manter a configuração `server.url` apontando para `https://SEU-DOMINIO-DO-BESTIARIO.example` para consumir o mesmo acervo online.
