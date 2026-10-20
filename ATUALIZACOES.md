# Atualizações do David Hub para Windows

## O que está preparado

A pasta está conectada ao repositório público `davidgabrielsb/david-hub` no GitHub. O fluxo `.github/workflows/publish-windows.yml` publica uma versão Windows quando mudanças do aplicativo chegam à branch `main`, ou quando executado manualmente em Actions. Salvar um arquivo no Mac não publica nada: a mudança precisa ser enviada ao GitHub.

Cada execução recebe uma versão crescente `0.2.N`, executa os testes e gera um instalador NSIS assinado. A release só fica disponível depois do envio do instalador, da assinatura e do manifesto `latest.json`. O Windows consulta um endereço fixo para localizar a versão mais recente.

Em **Dados e backup → Atualizações do Hub**, o aplicativo verifica novas versões ao abrir essa tela. O botão **Atualizar e reiniciar** baixa, verifica a assinatura e instala a versão. No navegador e nas compilações sem canal configurado, os botões de atualização ficam indisponíveis.

## Ativação inicial no GitHub

1. Criar o repositório, conectar esta pasta e usar `main` como branch principal.
2. Em Settings → Secrets and variables → Actions, cadastrar:
   - Secret `TAURI_SIGNING_PRIVATE_KEY`: conteúdo do arquivo `.release-keys/updater.key`.
   - Variável `TAURI_UPDATER_PUBLIC_KEY`: conteúdo de `.release-keys/updater.key.pub`.
   - Se a chave tiver senha, secret `TAURI_SIGNING_PRIVATE_KEY_PASSWORD`.
   - Para manter login e sincronização, variáveis `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` com os mesmos valores públicos da configuração local.
3. Enviar o código e executar **Publicar atualização Windows** em Actions.
4. Instalar o novo `setup.exe` no Windows uma vez. A versão antiga 0.1.1 não consegue receber automaticamente o recurso que ainda não possui.

O canal configurado usa downloads públicos do GitHub Releases. Um repositório privado exige um canal de distribuição público separado ou um servidor autenticado; não coloque tokens do GitHub dentro do aplicativo. A visibilidade deve ser escolhida antes de ativar a publicação.

## Chave de assinatura

As chaves foram geradas localmente em `.release-keys/`, com acesso restrito, e estão fora do Git. Guarde uma cópia segura: futuras atualizações precisam da mesma chave. Nunca envie a chave privada ao repositório, em mensagens ou no instalador. A assinatura do atualizador é diferente de um certificado de reputação do Windows.

## Trabalho diário

Depois da ativação, execute `npm run publicar` para validar, salvar e enviar as mudanças aprovadas à branch `main`. O comando não inclui dados locais, chaves ou documentos pessoais. O GitHub gera e publica o instalador; no Windows, abra **Dados e backup** e clique em **Atualizar e reiniciar** quando houver uma nova versão. O Mac não precisa estar ligado durante a geração.

A automação não foi executada no GitHub e a instalação de uma atualização real no Windows ainda precisa ser validada após conectar o repositório.
