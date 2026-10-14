# Diabetes Mellitus Prediction

**Predição de diabetes com uma interface usável e inteligência artificial explicável**

![UFABC Logo](assets/logotipo-ufabc-extenso.png)

Universidade Federal do ABC - Bacharelado em Ciência e Tecnologia<br />
Interação Humano-Computador - disciplina e quadrimestre a confirmar

Lenin Cristi<br />
lenin.cristi@aluno.ufabc.edu.br

## Resumo

Projeto didático para explorar a explicabilidade de modelos de aprendizado de máquina e a usabilidade de uma interface em português através da predição de diabetes. A proposta integra notebooks de preparação e treinamento, registro de modelos em MLflow, uma API em FastAPI e uma interface em Vite + React.

O projeto está em sua estrutura inicial. Os notebooks, o treinamento, a API e a interface serão desenvolvidos nas próximas etapas. Os resultados terão finalidade educacional e não constituirão diagnóstico médico.

## Estrutura do projeto

```text
.
├── assets/                     # Identidade visual
├── ml/
│   ├── notebooks/              # Preparação, treinamento e explicabilidade
│   └── pyproject.toml          # Ambiente Python de experimentação
├── backend/
│   ├── src/app/                # Futura aplicação FastAPI
│   ├── tests/                  # Testes da API
│   └── pyproject.toml          # Ambiente Python da API
├── frontend/
│   └── src/                    # Futura aplicação React/Vite com TypeScript
├── data/
│   ├── uci-diabetes/           # Dados originais e Parquet do dataset UCI
│   └── azure-diabetes/         # Dados originais e Parquet do dataset Azure Diabetes
├── outputs/
│   ├── mlflow/                 # Banco SQLite e artefatos do MLflow local
│   └── models/                 # Exportações opcionais de modelos
├── docs/                       # Documentação do projeto
├── .gitignore                  # Inicialmente vazio
└── LICENSE                     # Licença MIT
```

As pastas `data/` e `outputs/` são ignoradas pelo Git e serão criadas pelos notebooks e processos que as utilizarem, quando não existirem. Os ambientes `.venv` serão criados localmente dentro de `ml/` e `backend/`.

## Ambiente local

A versão alvo é Python 3.14, com dois ambientes virtuais independentes gerenciados pelo `uv`. A compatibilidade e as versões das dependências ainda serão validadas; os lockfiles serão gerados nessa etapa. PyTorch será incorporado quando o experimento com rede neural for definido.

O `.gitignore` exclui ambientes virtuais, `node_modules`, arquivos locais de configuração e as pastas `data/` e `outputs/`.

### Experimentação e notebooks

Na raiz do repositório:

```powershell
cd ml
uv sync
uv run jupyter lab
```

O ambiente reúne ferramentas de aquisição de dados, análise, visualização, scikit-learn e MLflow. Execute os notebooks de preparação do início ao fim:

- [Download e preparação - UCI](ml/notebooks/01-prepare-uci-diabetes.ipynb): salva `data/uci-diabetes/diabetes.parquet`.
- [Download e preparação - Azure Diabetes](ml/notebooks/02-prepare-azure-diabetes.ipynb): salva `data/azure-diabetes/diabetes.parquet`.

Cada notebook cria sua pasta de dados, mantém uma cópia do CSV original e registra a URL, a data do download e o hash do arquivo em `source.json`. Downloads existentes são reutilizados; `FORCE_DOWNLOAD = True` permite atualizá-los. A inspeção inclui tipos, ausências, duplicatas, estatísticas, balanceamento das classes e gráficos. Nenhum modelo é treinado nesta etapa.

### Backend

Em outro terminal, partindo da raiz:

```powershell
cd backend
uv sync
```

O ambiente inclui FastAPI, Uvicorn e dependências para carregar pipelines scikit-learn pelo MLflow. Depois da implementação de `app.main`, a API será iniciada com:

```powershell
uv run uvicorn app.main:app --reload
```

O comando de execução ainda não está disponível neste scaffold.

### Frontend

A pasta `frontend/` está reservada para React, Vite e TypeScript. Quando a aplicação e seu `package.json` forem criados, a execução local será:

```powershell
cd frontend
npm install
npm run dev
```

O frontend consultará a API pelo prefixo `/api`.

### MLflow local

O servidor usará o ambiente de `ml/`. Em um terminal separado, partindo da raiz:

```powershell
cd ml
uv run mlflow server --host 127.0.0.1 --port 5000 --backend-store-uri sqlite:///../outputs/mlflow/mlflow.db --artifacts-destination ../outputs/mlflow/artifacts
```

A interface ficará disponível em <http://127.0.0.1:5000>. O futuro notebook de treinamento registrará parâmetros, métricas e versões do pipeline completo nesse servidor. A API carregará a versão escolhida durante sua inicialização.

## Datasets em avaliação

- [Early Stage Diabetes Risk Prediction - UCI](https://archive.ics.uci.edu/dataset/529/early+stage+diabetes+risk+prediction+dataset)
- [Azure Diabetes](https://github.com/MicrosoftLearning/AI-900-AIFundamentals/blob/main/data/ml/diabetes.csv)

Ambos possuem notebooks separados de download, preparação e análise exploratória. A escolha do dataset para o modelo será feita posteriormente.

## Licença

O código deste projeto é disponibilizado sob a [licença MIT](LICENSE). Datasets e marcas institucionais permanecem sujeitos aos termos de seus respectivos titulares.

___

CMCC - Universidade Federal do ABC (UFABC) - Santo André - SP - Brasil
