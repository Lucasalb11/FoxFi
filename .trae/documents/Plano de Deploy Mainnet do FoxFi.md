## Visão Geral
- Objetivo: levar o FoxFi (Solana + Anchor + Next.js) à mainnet com segurança, observabilidade e rollback.
- Stack: Programa on-chain Anchor em Rust (`programs/foxfi/`), frontend Next.js em `app/`, scripts de deploy/initialização em `scripts/` e testes em `tests/`.

## Pré‑requisitos
- Chave de deploy protegida (hardware wallet) com saldo SOL suficiente.
- RPC mainnet confiável (Helius/GenesysGo/Alchemy), endpoint e API key.
- Definição de autoridade de upgrade, tesouraria e contas operacionais.
- Tabela de parâmetros de produção (taxas, slippage, limites, staking mínimo).

## Auditoria de Segurança
- Revisar constraints e acessos nas instruções do programa (`programs/foxfi/src/instructions/*.rs`) e estados (`programs/foxfi/src/state/*.rs`).
- Validar PDAs/seeds estáveis e não colidíveis; confirmar `bump` e ownership.
- Checar overflows, rent‑exemption, verificação de assinaturas e contas.
- Confirmar controle de upgrade authority e plano de congelamento se necessário.

## Configuração de Deploy
- Ajustar `Anchor.toml` para `cluster = "Mainnet"` e mapear `programs.<nome>.mainnet` para o Program ID desejado.
- Garantir que `declare_id!(...)` em `programs/foxfi/src/lib.rs` corresponde ao ID de produção.
- Definir `wallet` (path da keypair de produção) no `Anchor.toml` ou variável de ambiente.
- Selecionar endpoint RPC mainnet e limites de compute budget.

## Testes e Validação
- Rodar testes de unidade/integração: `anchor test` (adaptar para devnet se necessário).
- Executar testes TS em `tests/foxfi.test.ts` contra devnet com dados realistas.
- Testes de fumaça de cada instrução com fixtures e simulações de falhas.
- Medir custos de transação e latência por instrução.

## Build e Deploy do Programa
- Build: `anchor build` (gera IDL e artefatos).
- Deploy: `anchor deploy --provider.cluster mainnet` usando a wallet de produção.
- Registrar IDL mainnet (se aplicável) e versionar artefatos.
- Guardar autoridade de upgrade em cofre e registrar política de mudanças.

## Inicialização On‑Chain
- Executar `scripts/initialize.ts` com parâmetros de produção (taxas, slippage, staking mínimo, tesouraria) e apontando para mainnet.
- Verificar criação/atualização de contas de `config`, `vaults` e permissões.
- Documentar estados iniciais e hashes de transações.

## Frontend para Mainnet
- Trocar rede para mainnet no provider (`WalletAdapterNetwork.Mainnet`) e usar `clusterApiUrl('mainnet-beta')` ou endpoint RPC custom.
- Configurar chaves via variáveis de ambiente seguras: `NEXT_PUBLIC_RPC_URL`, `NEXT_PUBLIC_PROGRAM_ID`, etc.
- Build prod: `next build` e servir com CDN/edge (Vercel/Netlify).
- Ajustar UI: limites, mensagens de erro, slippage padrão, indicadores de rede.

## Observabilidade e Operação
- Adicionar logs e métricas de transações (frontend) e monitoramento de contas on‑chain.
- Alertas para falhas, rate limit, variação de fees e erros de instrução.
- Registrar dashboards de saúde (TPS, sucesso por instrução, tempo médio).

## CI/CD
- Pipeline: lint, build, `anchor build/test`, publicação de frontend, verificação de IDL.
- Gate de aprovação para upgrades on‑chain; changelog e versionamento semântico.

## Checklist de Lançamento
- Programa e IDL implantados na mainnet e verificados.
- Config inicial criada e validada.
- Frontend apontando para mainnet e testado em produção.
- Planos de rollback e de resposta a incidentes definidos.

## Rollback e Upgrade
- Estratégia de upgrade segura (janela de manutenção, testes de regressão).
- Plano de freeze/desabilitar rotas críticas em caso de incidente.

## Entregáveis
- Programa implantado na mainnet com ID e IDL públicos.
- Scripts de inicialização executados e parâmetros registrados.
- Frontend em produção, com observabilidade ativa.
- Documentação de processos e checklist concluídos.