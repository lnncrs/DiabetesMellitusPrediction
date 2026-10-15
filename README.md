# Diabetes Mellitus Prediction

**Predição de diabetes com uma interface usável e inteligência artificial explicável**

![UFABC Logo](assets/logotipo-ufabc-extenso.png)

Universidade Federal do ABC - Bacharelado em Ciência e Tecnologia<br />
Interação Humano-Computador - disciplina e quadrimestre a confirmar

Lenin Cristi<br />
lenin.cristi@aluno.ufabc.edu.br

## Resumo

Projeto didático para explorar a explicabilidade de modelos de aprendizado de máquina e a usabilidade de uma interface em português através da predição de diabetes. A proposta integra notebooks de preparação e treinamento, registro de modelos em MLflow, uma API em FastAPI e uma interface em Vite + React.

O projeto já possui notebooks de preparação e uma aplicação inicial: a página em React consulta a saúde da API FastAPI. O treinamento, a predição e a explicabilidade serão desenvolvidos nas próximas etapas. Os resultados terão finalidade educacional e não constituirão diagnóstico médico.

## Estrutura do projeto

```text
.
├── assets/                     # Identidade visual
├── ml/
│   ├── notebooks/              # Preparação, treinamento e explicabilidade
│   └── pyproject.toml          # Ambiente Python de experimentação
├── backend/
│   ├── src/app/                # Aplicação FastAPI e endpoints de saúde
│   ├── tests/                  # Testes da API
│   └── pyproject.toml          # Ambiente Python da API
├── frontend/
│   └── src/                    # Página React/Vite com status da API
├── data/
│   ├── uci-diabetes/           # Dados originais e Parquet do dataset UCI
│   └── niddk-diabetes/         # Dados originais e Parquet do dataset NIDDK Diabetes
├── outputs/
│   ├── mlflow/                 # Banco SQLite e artefatos do MLflow local
│   └── models/                 # Exportações opcionais de modelos
├── docs/                       # Documentação do projeto
├── .vscode/                    # Configurações e tarefas para o grupo
├── .gitignore                  # Inicialmente vazio
└── LICENSE                     # Licença MIT
```

As pastas `data/` e `outputs/` são ignoradas pelo Git e serão criadas pelos notebooks e processos que as utilizarem, quando não existirem. Os ambientes `.venv` serão criados localmente dentro de `ml/` e `backend/`.

## Ambiente local

Instale Python 3.14 (ou permita que o `uv` o instale), `uv` e Node.js 24 LTS com NPM. Há dois ambientes virtuais independentes, `ml/.venv` e `backend/.venv`, e dependências NPM em `frontend/node_modules`. As versões Python estão registradas nos respectivos `uv.lock`; o frontend usa `package-lock.json`. PyTorch será incorporado quando o experimento com rede neural for definido.

### Operação pelo VS Code

Abra a raiz deste repositório e instale as extensões recomendadas. Use **Ctrl+Shift+P → Tasks: Run Task** (Tarefas: Executar Tarefa):

1. **Preparar todos os ambientes** instala as dependências das três áreas.
2. **Registrar kernel Diabetes ML** disponibiliza o kernel com o nome **Diabetes — ML**. Se necessário, selecione esse nome uma vez no canto superior direito do notebook.
3. **Iniciar aplicação (backend + frontend)** abre os dois servidores em terminais separados.

A tarefa **Abrir Jupyter** inicia o JupyterLab no ambiente ML. Para encerrar os servidores, use **Ctrl+C** nos respectivos terminais ou **Tasks: Terminate Task**. A configuração aponta inicialmente para o ambiente ML, mas a seleção do kernel é independente e pode exigir uma escolha inicial. Depois de recriar ou mover o ambiente, execute novamente o registro do kernel.

Os comandos abaixo também funcionam sem VS Code. Eles não exigem ativar manualmente um `.venv`: `uv run` utiliza o ambiente da pasta correspondente. Se `uv` ou `npm` não aparecerem após a instalação, reinicie o VS Code para atualizar o PATH.

O `.gitignore` exclui ambientes virtuais, `node_modules`, arquivos locais de configuração e as pastas `data/` e `outputs/`.

### Experimentação e notebooks

Na raiz do repositório:

```powershell
cd ml
uv sync --locked
uv run --locked jupyter lab
```

O ambiente reúne ferramentas de aquisição de dados, análise, visualização, scikit-learn, XGBoost e MLflow. Execute os notebooks de preparação do início ao fim:

- [Download e preparação - UCI](ml/notebooks/01-prepare-uci-diabetes.ipynb): salva `data/uci-diabetes/diabetes.parquet`.
- [Download e preparação - NIDDK Diabetes](ml/notebooks/02-prepare-niddk-diabetes.ipynb): salva `data/niddk-diabetes/diabetes.parquet`.
- [Classificação com XGBoost - NIDDK Diabetes](ml/notebooks/03-xgboost-niddk-diabetes.en.ipynb): em português brasileiro, carrega o Parquet preparado, separa `X` e `y`, cria conjuntos de treino/teste e avalia um classificador XGBoost.

Cada notebook cria sua pasta de dados, mantém uma cópia do CSV original e registra a URL, a data do download e o hash do arquivo em `source.json`. Downloads existentes são reutilizados; `FORCE_DOWNLOAD = True` permite atualizá-los. A inspeção inclui tipos, ausências, duplicatas, estatísticas, balanceamento das classes e gráficos. Nenhum modelo é treinado nesta etapa.

### Backend

Em outro terminal, partindo da raiz:

```powershell
cd backend
uv sync --locked
```

O ambiente inclui FastAPI, Uvicorn, configurações tipadas e ferramentas de verificação. As dependências para servir modelos serão adicionadas na etapa de inferência. Inicie a API com:

```powershell
uv run --locked uvicorn app.main:app --reload
```

A API fica em <http://127.0.0.1:8000>, com documentação em <http://127.0.0.1:8000/docs>. Os endpoints `GET /api/health/live` e `GET /api/health/ready` confirmam a saúde da aplicação. Nesta etapa, nenhum modelo é carregado. A configuração padrão funciona sem `.env`; `backend/.env.example` documenta as opções locais.

### Frontend

A aplicação usa React, Vite e TypeScript. Em outro terminal, partindo da raiz:

```powershell
cd frontend
npm ci
npm run dev
```

Abra <http://127.0.0.1:5173>. O Vite encaminha `/api` para o backend. A página informa se a conexão está disponível e oferece **Verificar novamente** para repetir a consulta. A consulta tem timeout de cinco segundos. As portas são fixas: encerre qualquer aplicação que esteja ocupando 8000 ou 5173 antes de iniciar.

### Verificações

Em `backend/`:

```powershell
uv run --locked ruff format --check .
uv run --locked ruff check .
uv run --locked pyright
uv run --locked pytest
```

Em `frontend/`:

```powershell
npm run format:check
npm run lint
npm run typecheck
npm run test
npm run build
```

### MLflow local

O servidor usará o ambiente de `ml/`. Em um terminal separado, partindo da raiz:

```powershell
cd ml
uv run --locked python -c "from pathlib import Path; Path('../outputs/mlflow').mkdir(parents=True, exist_ok=True)"
uv run mlflow server --host 127.0.0.1 --port 5000 --backend-store-uri sqlite:///../outputs/mlflow/mlflow.db --artifacts-destination ../outputs/mlflow/artifacts
```

A interface ficará disponível em <http://127.0.0.1:5000>. O futuro notebook de treinamento registrará parâmetros, métricas e versões do pipeline completo nesse servidor. A API carregará a versão escolhida durante sua inicialização.

## Datasets em avaliação

- [Early Stage Diabetes Risk Prediction - UCI](https://archive.ics.uci.edu/dataset/529/early+stage+diabetes+risk+prediction+dataset)
- [Diabetes - NIDDK](https://www.niddk.nih.gov/) — CSV distribuído pelo [MicrosoftLearning/AI-900-AIFundamentals](https://github.com/MicrosoftLearning/AI-900-AIFundamentals/blob/main/data/ml/diabetes.csv)

Ambos possuem notebooks separados de download, preparação e análise exploratória. A escolha do dataset para o modelo será feita posteriormente.

## Licença

O código deste projeto é disponibilizado sob a [licença MIT](LICENSE). A base de backend e frontend foi adaptada do SampleCodex; sua licença original está preservada em [docs/LICENSE-SampleCodex](docs/LICENSE-SampleCodex). Datasets e marcas institucionais permanecem sujeitos aos termos de seus respectivos titulares.

___

CMCC - Universidade Federal do ABC (UFABC) - Santo André - SP - Brasil
