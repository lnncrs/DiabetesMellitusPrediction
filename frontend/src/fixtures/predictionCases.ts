import type { PredictionInput } from '../api/prediction'

// Linhas 0, 3, 8, 12 e 25 do Parquet NIDDK preparado, sem identificador ou alvo.
// Exemplos de preenchimento; não constituem validação independente do modelo.
export const predictionCases: { name: string; values: PredictionInput }[] = [
  {
    name: 'Caso 1',
    values: {
      gestacoes: 0,
      glicose_plasmatica: 171,
      pressao_arterial_diastolica: 80,
      espessura_triceps: 34,
      insulina_serica: 23,
      imc: 43.50972593,
      indice_hereditariedade_diabetes: 1.213191354,
      idade: 21,
    },
  },
  {
    name: 'Caso 2',
    values: {
      gestacoes: 9,
      glicose_plasmatica: 103,
      pressao_arterial_diastolica: 78,
      espessura_triceps: 25,
      insulina_serica: 304,
      imc: 29.58219193,
      indice_hereditariedade_diabetes: 1.282869847,
      idade: 43,
    },
  },
  {
    name: 'Caso 3',
    values: {
      gestacoes: 8,
      glicose_plasmatica: 80,
      pressao_arterial_diastolica: 95,
      espessura_triceps: 33,
      insulina_serica: 24,
      imc: 26.62492885,
      indice_hereditariedade_diabetes: 0.443947388,
      idade: 53,
    },
  },
  {
    name: 'Caso 4',
    values: {
      gestacoes: 5,
      glicose_plasmatica: 114,
      pressao_arterial_diastolica: 101,
      espessura_triceps: 43,
      insulina_serica: 70,
      imc: 36.49531966,
      indice_hereditariedade_diabetes: 0.079190164,
      idade: 38,
    },
  },
  {
    name: 'Caso 5',
    values: {
      gestacoes: 9,
      glicose_plasmatica: 104,
      pressao_arterial_diastolica: 68,
      espessura_triceps: 42,
      insulina_serica: 40,
      imc: 51.85540108,
      indice_hereditariedade_diabetes: 0.182937824,
      idade: 21,
    },
  },
]
