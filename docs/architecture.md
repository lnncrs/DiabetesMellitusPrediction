# Base local

O monorepo separa experimentação (`ml/`), API (`backend/`) e interface (`frontend/`). Os ambientes Python usam 3.14 e lockfiles independentes. O frontend usa Node.js 24 LTS e NPM.

O backend e o frontend foram adaptados do SampleCodex. Foram preservados a fábrica FastAPI, configurações Pydantic, lifecycle, schemas, request IDs, respostas de erro, organização React e proxy `/api`. A licença da base está em `LICENSE-SampleCodex`.

Nesta etapa, a API expõe apenas saúde e documentação OpenAPI. A página consulta `GET /api/health/live`, apresenta os estados de conexão e permite repetir a consulta. `ready` verifica somente a aplicação: não representa disponibilidade de um modelo.

MLflow e ferramentas de análise permanecem no ambiente ML. O backend receberá as dependências de inferência quando o modelo e seu contrato forem definidos. Telemetria em nuvem, containers e integração contínua ficam para etapas posteriores.

As tarefas do VS Code usam diretórios de trabalho explícitos e `uv run`, sem depender de ativação manual. O interpretador inicial aponta para `ml/.venv`. O registro do kernel é local a cada usuário e precisa ser repetido após mover ou recriar o ambiente.

Os notebooks criam `data/` quando necessário. Os processos que gerarem modelos e armazenamento de experimentos criarão `outputs/`. Ambas são ignoradas pelo Git.
