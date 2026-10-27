# Diabetes Mellitus Prediction

**Predição de diabetes com uma interface usável e inteligência artificial explicável**

![UFABC Logo](assets/logotipo-ufabc-extenso.png)

Universidade Federal do ABC - Bacharelado em Ciência e Tecnologia<br />
Interação Humano-Computador - disciplina e quadrimestre a confirmar

Lenin Cristi - RA 21030114

Murilo Davanso - RA 11202230695

Arthur Vieira Freitas de Jesus - RA 11202321538

Igor Santos Botelho - RA 11202232309

Enric - RA 11202320596

Thalita Kelly Ferreira da Costa - RA 11202131854

Leonardo Jae Yong Noh - RA 11202230594

## Resumo

Projeto didático para explorar a explicabilidade de modelos de aprendizado de máquina e a usabilidade de uma interface em português para predição de diabetes.

A proposta integra **Ciência de Dados** em notebooks de preparação e treinamento, **MLOps** no registro de modelos em MLflow, **Engenharia de Software Backend** na construção de uma API em FastAPI + Uvicorn que busca e serve estes modelos e **Engenharia de Software Frontend** na criação de uma interface em Vite + React para uma UX intuitiva de predição de diabetes.

<mark>Os resultados têm finalidade educacional e não constituem diagnóstico médico.</mark>

## Início rápido

Voce vai precisar preparar o ambiente de ML, registrar um modelo, configurar e iniciar o backend e o frontend para utilizar a aplicação. Siga os passos abaixo para começar rapidamente.

Certifique-se de ter instalado:

- [git](https://git-scm.com/)
- [vscode (Visual Studio Code)](https://code.visualstudio.com/)
- [uv](https://docs.astral.sh/uv/)
- [Node.js 24 LTS](https://nodejs.org/)

Clone este repositório de https://github.com/lnncrs/DiabetesMellitusPrediction

### 1. Prepare o ambiente de ML

Abra um terminal na pasta do repositório, navegue até a pasta ml, instale as dependências:

```powershell
cd ml
uv sync
```

### 2. Inicie o servidor MLflow

Abra um novo terminal na pasta do repositório, navegue até a pasta ml e inicie o servidor MLflow:

```powershell
cd ml
uv run mlflow server --host 127.0.0.1 --port 5000 --backend-store-uri sqlite:///../outputs/mlflow/mlflow.db --artifacts-destination ../outputs/mlflow/artifacts
```

**A interface do MLflow estará disponível em <http://127.0.0.1:5000>.**

### 3. Prepare os dados

Execute o notebook [02-prepare-niddk-diabetes.ipynb](ml/notebooks/02-prepare-niddk-diabetes.ipynb) do início ao fim, **este notebook faz o download e preparação dos dados** utilizados.

### 4. Treinar & registrar o modelo

Com o servidor MLflow em execução, execute o notebook [03-mlflow-niddk-diabetes.ipynb](ml/notebooks/03-mlflow-niddk-diabetes.ipynb) do início ao fim, **este notebook treina e registra uma versão do modelo**.

### 5. Inicie o backend

Abra um novo terminal na pasta do repositório, navegue até a pasta backend e execute os comandos:

```powershell
cd backend
uv sync
if (-not (Test-Path .env)) { Copy-Item .env.example .env }
uv run uvicorn app.main:app --reload
```

O arquivo `.env` de exemplo usa `APP_MLFLOW_MODEL_VERSION=latest`, que carrega a versão mais recente registrada na inicialização.

### 6. Inicie o frontend

Abra um novo terminal na pasta do repositório, navegue até a pasta frontend e execute os comandos:

```powershell
cd frontend
npm ci
npm run dev
```

**A interface web estará disponível em <http://127.0.0.1:5173>.**

## Estrutura do projeto

```text
.
├── assets/                     # Identidade visual
├── ml/
│   ├── notebooks/              # Preparação, treinamento e explicabilidade
│   └── pyproject.toml          # Ambiente Python de experimentação
├── backend/
│   ├── src/app/                # Aplicação FastAPI, saúde e predição
│   ├── tests/                  # Testes da API
│   └── pyproject.toml          # Ambiente Python da API
├── frontend/
│   └── src/                    # Formulário de predição e Home com status da API
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

Os ambientes de treinamento e backend são preparados usando `uv`: `ml/.venv` e `backend/.venv`. O ambiente frontend é preparado com `npm install`, e dependências NPM ficam em `frontend/node_modules`. As versões Python estão registradas nos respectivos `uv.lock`; o frontend usa `package-lock.json`.

O `.gitignore` exclui ambientes virtuais, `node_modules`, arquivos locais de configuração e as pastas `data/` e `outputs/`.

### Datasets em avaliação

- [Early Stage Diabetes Risk Prediction - UCI](https://archive.ics.uci.edu/dataset/529/early+stage+diabetes+risk+prediction+dataset)

- [Diabetes - NIDDK](https://www.niddk.nih.gov/) distribuído pelo [MicrosoftLearning/AI-900-AIFundamentals](https://github.com/MicrosoftLearning/AI-900-AIFundamentals/blob/main/data/ml/diabetes.csv)

Ambos possuem notebooks separados de download, preparação e análise exploratória.

### Fluxo do projeto

O fluxo do projeto começa com a preparação dos dados, passa pelo treinamento e registro do modelo no MLflow e termina com sua disponibilização pela API e pela interface web. O ambiente `ml` reúne as ferramentas de aquisição, análise e visualização, além de scikit-learn, XGBoost e MLflow.

### Executando o MLflow localmente

Execute o servidor MLFlow a seguir no terminal a partir da raiz do repositório:

```powershell
cd ml
uv sync
uv run mlflow server --host 127.0.0.1 --port 5000 --backend-store-uri sqlite:///../outputs/mlflow/mlflow.db --artifacts-destination ../outputs/mlflow/artifacts
```

**A interface do MLflow estará disponível em <http://127.0.0.1:5000>.**

O notebook 04 usa `mlflow.sklearn.autolog()` para registrar parâmetros, métricas, gráficos, metadados e o modelo no Model Registry.

Cada execução cria uma nova rodada dentro do experimento `niddk-diabetes-xgboost`, que o notebook recarrega para conferir previsões.

### Preparando os dados

Prepare o ambiente de desenvolvimento executando `uv sync` dentro da pasta `ml` para instalar as dependências Python necessárias:

```powershell
cd ml
uv sync
```

Os notebooks 01 e 02 baixam e preparam os dados, seus CSVs originais, metadados de origem e arquivos parquet ficam em `data/`.

Downloads já existentes são reutilizados, mas `FORCE_DOWNLOAD = True` permite sobrescrevê-los. Durante a preparação, os notebooks também verificam tipos, valores ausentes e duplicados, estatísticas, balanceamento das classes e geram gráficos exploratórios.

- [01 - Download e preparação - UCI](ml/notebooks/01-prepare-uci-diabetes.ipynb) gera `data/uci-diabetes/diabetes.parquet`.

- [02 - Download e preparação - NIDDK Diabetes](ml/notebooks/02-prepare-niddk-diabetes.ipynb) gera `data/niddk-diabetes/diabetes.parquet`.

### Treinando o modelo

Com os dados NIDDK preparados pelo notebook 02, o notebook [03 - Classificação com XGBoost - NIDDK Diabetes](ml/notebooks/03-xgboost-niddk-diabetes.ipynb) separa os atributos do alvo, cria os conjuntos de treino e teste e avalia um classificador XGBoost.

O notebook [04 - XGBoost com MLflow - NIDDK Diabetes](ml/notebooks/04-mlflow-niddk-diabetes.ipynb) repete esse experimento de forma independente e registra seu resultado no MLflow, para executá-lo é necessário rodar o servidor do MLflow localmente.

### Executando o Backend

O backend FastAPI carrega o último modelo registrado pelo notebook 04 e suas versões de MLflow, scikit-learn, XGBoost, pandas, NumPy, SciPy e cloudpickle acompanham o ambiente de treinamento para assegurar a compatibilidade do modelo.

Prepare o ambiente de execução do backend executando `uv sync` dentro da pasta `backend` para instalar as dependências Python necessárias:

```powershell
cd backend
uv sync
```

Ainda em `backend/`, copie `.env.example` para `.env`, configuração padrão busca a versão mais recente de `niddk-diabetes-xgboost`:

```dotenv
APP_MLFLOW_TRACKING_URI=http://127.0.0.1:5000
APP_MLFLOW_MODEL_NAME=niddk-diabetes-xgboost
APP_MLFLOW_MODEL_VERSION=latest
```

A variável `APP_MLFLOW_MODEL_VERSION` aceita `latest` ou um inteiro positivo, sendo que `latest` resolve a maior versão disponível na inicialização.

Depois de registrar o modelo e manter o MLflow ativo, inicie a API a partir de `backend/` com:

```powershell
uvicorn app.main:app --reload
```

**O backend estará disponível em <http://127.0.0.1:8000>.**

`GET /api/health/live` confirma que a API está em execução, enquanto `GET /api/health/ready` retorna 200 apenas quando o modelo foi carregado e 503 quando ele não está disponível.

Para prever, envie os oito atributos em português a `POST /api/predict`; a resposta inclui a classe, a probabilidade de diabetes e a identificação da versão usada.

O modelo é baixado apenas durante a inicialização e permanece em memória até o reinício, inclusive quando a versão é resolvida por `latest`.

Reinicie a API após alterar o `.env` ou registrar uma nova versão que deva ser usada. Se o MLflow estiver indisponível, a configuração for inválida ou o contrato do modelo for incompatível, os endpoints de health continuarão acessíveis e as previsões retornarão 503.

Exemplo de corpo JSON para `POST /api/predict`:

```json
{
  "gestacoes": 0,
  "glicose_plasmatica": 171,
  "pressao_arterial_diastolica": 80,
  "espessura_triceps": 34,
  "insulina_serica": 23,
  "imc": 43.50972593,
  "indice_hereditariedade_diabetes": 1.213191354,
  "idade": 21
}
```

Resposta exemplificativa da versão 4:

```json
{
  "predicted_class": 0,
  "probability_diabetes": 0.019996361806988716,
  "model_name": "niddk-diabetes-xgboost",
  "model_version": 4
}
```

**As classes 0 e 1 representam, respectivamente, os rótulos sem diabetes e diabetes; a probabilidade é a estimativa para a classe 1.**

O corpo não deve incluir identificador ou alvo e campos ausentes ou extras, valores negativos ou não finitos retornam 422, assim como valores fora do contrato numérico NIDDK.

Campos inteiros devem ser enviados como inteiros, e a API não é intercambiável com o dataset UCI.

### Executando o Frontend

A aplicação React, Vite e TypeScript consome a API e oferece uma interface para consulta do modelo. Em outro terminal, a partir da raiz execute:

```powershell
cd frontend
npm ci
npm run dev
```

**A interface web estará disponível em <http://127.0.0.1:5173>.**

O Vite encaminha chamadas a `/api` para o backend; como as portas 5173 e 8000 são fixas, elas devem estar livres antes de iniciar os serviços.

Na rota `/`, o formulário reúne os oito campos em português e apresenta a classe, a probabilidade, o nome e a versão do modelo após **Consultar modelo**.

A rota `/home` apresenta o projeto e verifica o status da API.

Os botões **Caso 1** a **Caso 5** preenchem o formulário com as linhas 0, 3, 8, 12 e 25 do NIDDK preparado.

Os valores, sem identificador ou alvo, estão versionados em `frontend/src/fixtures/predictionCases.ts` portanto, o frontend não acessa a pasta de dados local. Eles são apenas exemplos de preenchimento e só geram uma consulta quando **Consultar modelo** é acionado.

Todos os campos são obrigatórios e seguem o contrato numérico da API, a interface aguarda por até 30 segundos, informa carregamento e erros, impede envios duplicados e descarta resultados antigos quando os campos são alterados ou outro caso é selecionado.

**Limpar formulário** também cancela uma consulta pendente, e nenhum dado é persistido no navegador.

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

## Licença

O código deste projeto é disponibilizado sob a licença [MIT](LICENSE).

A base de backend e frontend foi adaptada do projeto [SampleCodex](https://github.com/lnncrs/SampleCodex) que tem licença [MIT](https://opensource.org/licenses/MIT).

___

CMCC - Universidade Federal do ABC (UFABC) - Santo André - SP - Brasil
