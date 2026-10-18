# Base local

O monorepo separa experimentação (`ml/`), API (`backend/`) e interface (`frontend/`). Os ambientes Python usam 3.14 e lockfiles independentes. O frontend usa Node.js 24 LTS e NPM.

O backend e o frontend foram adaptados do SampleCodex. Foram preservados a fábrica FastAPI, configurações Pydantic, lifecycle, schemas, request IDs, respostas de erro, organização React e proxy `/api`. A licença da base está em `LICENSE-SampleCodex`.

O backend expõe saúde, documentação OpenAPI e `POST /api/predict`. A Home em `/home` consulta `GET /api/health/live`, apresenta os estados de conexão e permite repetir a consulta. `ready` retorna 200 somente com modelo carregado e 503 sem modelo; `live` independe do MLflow.

O serviço `ModelService`, independente de FastAPI, baixa uma versão fixa do Model Registry e carrega o pipeline scikit-learn durante o lifespan, em uma thread. O endereço HTTP do MLflow, o nome e a versão são lidos de `backend/.env` ou do ambiente. Um único registro MLflow é configurado por processo. As bibliotecas de serialização e inferência estão alinhadas às versões do treinamento.

O contrato contém os oito atributos numéricos do notebook NIDDK, sem identificador e alvo. Entradas e saídas são validadas; respostas identificam a versão usada. Falhas de carregamento são registradas no servidor e não impedem liveness, mas desabilitam predição com 503. O modelo em memória não exige chamadas ao MLflow a cada inferência. Alterações na seleção do modelo exigem reiniciar a API. Telemetria em nuvem, containers e integração contínua ficam para etapas posteriores.

A rota `/` apresenta o formulário de predição e chama `POST /api/predict` por meio de `frontend/src/api/prediction.ts`. Cinco fixtures versionadas preenchem os campos para testes manuais. A interface valida números, apresenta resultado e erros e cancela consultas ao limpar ou substituir os dados. Não há armazenamento dos valores no navegador. As duas páginas usam links HTML convencionais, sem biblioteca adicional de roteamento; o servidor de frontend deve oferecer fallback para `index.html` em `/home`, como o Vite faz durante o desenvolvimento.

As tarefas do VS Code usam diretórios de trabalho explícitos e `uv run`, sem depender de ativação manual. O interpretador inicial aponta para `ml/.venv`. O registro do kernel é local a cada usuário e precisa ser repetido após mover ou recriar o ambiente.

Os notebooks criam `data/` quando necessário. Os processos que gerarem modelos e armazenamento de experimentos criarão `outputs/`. Ambas são ignoradas pelo Git.
