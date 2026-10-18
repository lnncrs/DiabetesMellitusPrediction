# Diabetes Mellitus Prediction

**Predição de diabetes com uma interface usável e inteligência artificial explicável**

![UFABC Logo](assets/logotipo-ufabc-extenso.png)

Universidade Federal do ABC - Bacharelado em Ciência e Tecnologia<br />
Interação Humano-Computador - disciplina e quadrimestre a confirmar

Lenin Cristi<br />
lenin.cristi@aluno.ufabc.edu.br

## Resumo

Projeto didático para explorar a explicabilidade de modelos de aprendizado de máquina e a usabilidade de uma interface em português através da predição de diabetes. A proposta integra notebooks de preparação e treinamento, registro de modelos em MLflow, uma API em FastAPI e uma interface em Vite + React.

O projeto possui notebooks de preparação e treinamento, registro de modelos em MLflow, uma API e um formulário de predição em React. A página Home reúne a apresentação e o status da API. A explicabilidade será desenvolvida nas próximas etapas. Os resultados têm finalidade educacional e não constituem diagnóstico médico.

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
- [Classificação com XGBoost - NIDDK Diabetes](ml/notebooks/03-xgboost-niddk-diabetes.ipynb): em português brasileiro, carrega o Parquet preparado, separa `X` e `y`, cria conjuntos de treino/teste e avalia um classificador XGBoost.
- [XGBoost com MLflow - NIDDK Diabetes](ml/notebooks/04-mlflow-niddk-diabetes.ipynb): reproduz o experimento do 03 de forma independente, usa `mlflow.sklearn.autolog()` para registrar parâmetros, métricas de treino e o pipeline no Model Registry, mantém métricas de teste e artefatos específicos explícitos e verifica a recarga. Execute a preparação 02 e inicie o servidor MLflow antes de rodá-lo; não é necessário executar o 03.

Os notebooks de preparação (01 e 02) criam sua pasta de dados, mantêm uma cópia do CSV original e registram a URL, a data do download e o hash do arquivo em `source.json`. Downloads existentes são reutilizados; `FORCE_DOWNLOAD = True` permite atualizá-los. A inspeção inclui tipos, ausências, duplicatas, estatísticas, balanceamento das classes e gráficos. O treinamento acontece nos notebooks 03 e 04.

### Backend

Em outro terminal, partindo da raiz:

```powershell
cd backend
uv sync --locked
```

O ambiente inclui FastAPI, Uvicorn e as bibliotecas necessárias para carregar o pipeline do notebook 04. As versões de MLflow, scikit-learn, XGBoost, pandas, NumPy, SciPy e cloudpickle estão alinhadas ao ambiente de treinamento.

Dentro de `backend/`, copie `.env.example` para `.env` (se ainda não existir) e escolha uma versão existente no Model Registry:

```dotenv
APP_MLFLOW_TRACKING_URI=http://127.0.0.1:5000
APP_MLFLOW_MODEL_NAME=niddk-diabetes-xgboost
APP_MLFLOW_MODEL_VERSION=4
```

O `.env` é lido a partir de `backend/`, mesmo quando a aplicação é importada de outro diretório. Variáveis do processo têm precedência. Nome e versão devem ser configurados juntos; a versão é um inteiro positivo. Inicie primeiro o MLflow com o modelo registrado e depois a API:

```powershell
uv run --locked uvicorn app.main:app --reload
```

A API fica em <http://127.0.0.1:8000>, com documentação e exemplo executável em <http://127.0.0.1:8000/docs>.

- `GET /api/health/live`: confirma que a API está funcionando.
- `GET /api/health/ready`: retorna 200 quando o modelo está carregado e 503 quando está indisponível.
- `POST /api/predict`: recebe os oito atributos em português e retorna a classe, a probabilidade da classe 1 e a identificação do modelo usado.

O modelo é baixado e carregado uma vez na inicialização. Uma versão fixa é utilizada até reiniciar a API; alterar o `.env` também exige reinício. Se o MLflow estiver inacessível, a versão não existir ou o contrato for incompatível, a API mantém o health e retorna 503 nas predições. Depois de corrigir a configuração, reinicie a API. Sem nome e versão configurados, ela também permanece sem modelo. Após carregar, as predições usam o modelo em memória e não consultam o MLflow a cada requisição.

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

As classes 0 e 1 correspondem aos rótulos sem diabetes e diabetes no dataset. A probabilidade é a estimativa do modelo para a classe 1. Não envie identificador ou alvo. Campos ausentes, extras, valores negativos ou não finitos retornam 422. Os campos definidos como inteiros devem ser enviados como inteiros. Esta versão da API atende somente ao contrato numérico do NIDDK; não é intercambiável com o dataset UCI.

### Frontend

A aplicação usa React, Vite e TypeScript. Em outro terminal, partindo da raiz:

```powershell
cd frontend
npm ci
npm run dev
```

Abra <http://127.0.0.1:5173>. O Vite encaminha `/api` para o backend. As portas são fixas: encerre qualquer aplicação que esteja ocupando 8000 ou 5173 antes de iniciar.

- `/`: formulário com os oito campos em português, botão **Consultar modelo**, botão **Limpar formulário** e área de resultado com classe, probabilidade, nome e versão do modelo.
- `/home`: apresentação do projeto e status da API, com **Verificar novamente**. Essa consulta tem timeout de cinco segundos.

Os botões **Caso 1** a **Caso 5** preenchem o formulário com as linhas 0, 3, 8, 12 e 25 do dataset NIDDK preparado, sem identificador ou alvo. Os valores estão versionados em `frontend/src/fixtures/predictionCases.ts`, portanto o frontend não precisa acessar a pasta de dados local. São exemplos de preenchimento, não um conjunto independente de avaliação. A consulta só acontece ao clicar em **Consultar modelo**.

Todos os campos são obrigatórios e devem respeitar o contrato numérico da API. A consulta tem timeout de 30 segundos. A interface apresenta carregamento e erros, impede envios duplicados enquanto aguarda e remove o resultado antigo ao editar os campos ou selecionar outro caso. **Limpar formulário** apaga os campos, o resultado e eventuais erros, além de cancelar uma consulta pendente. Nenhum dado é persistido no navegador.

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

A interface ficará disponível em <http://127.0.0.1:5000>. O notebook 04 registra parâmetros, métricas, gráficos, metadados e versões do pipeline nesse servidor. Cada execução cria uma nova run e uma nova versão de `niddk-diabetes-xgboost`. O notebook também recarrega a versão criada e confere suas previsões. Para utilizá-la na API, configure nome e versão no `backend/.env` e reinicie o backend.

## Datasets em avaliação

- [Early Stage Diabetes Risk Prediction - UCI](https://archive.ics.uci.edu/dataset/529/early+stage+diabetes+risk+prediction+dataset)
- [Diabetes - NIDDK](https://www.niddk.nih.gov/) — CSV distribuído pelo [MicrosoftLearning/AI-900-AIFundamentals](https://github.com/MicrosoftLearning/AI-900-AIFundamentals/blob/main/data/ml/diabetes.csv)

Ambos possuem notebooks separados de download, preparação e análise exploratória. A escolha do dataset para o modelo será feita posteriormente.

## Licença

O código deste projeto é disponibilizado sob a licença [MIT](LICENSE).

A base de backend e frontend foi adaptada do projeto [SampleCodex](https://github.com/lnncrs/SampleCodex)

___

CMCC - Universidade Federal do ABC (UFABC) - Santo André - SP - Brasil
