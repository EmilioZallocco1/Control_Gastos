import { describe, expect, it } from 'vitest'
import { parseGastoCommand } from './parser.js'

describe('parseGastoCommand', () => {
  it('parsea monto, categoría reconocida y descripción', () => {
    expect(parseGastoCommand('3500 comida Supermercado Coto')).toEqual({
      amount: 3500,
      category: 'comida',
      description: 'Supermercado Coto',
    })
  })

  it('resuelve alias de categoría (uber -> transporte)', () => {
    expect(parseGastoCommand('1200 uber Vuelta a casa')).toEqual({
      amount: 1200,
      category: 'transporte',
      description: 'Vuelta a casa',
    })
  })

  it('es insensible a mayúsculas y acentos en la categoría', () => {
    expect(parseGastoCommand('500 EDUCACIÓN Curso de inglés')).toEqual({
      amount: 500,
      category: 'educacion',
      description: 'Curso de inglés',
    })
  })

  it('cuando la palabra después del monto no es una categoría, cae en "otros" y la conserva en la descripción', () => {
    expect(parseGastoCommand('500 Regalo cumpleaños')).toEqual({
      amount: 500,
      category: 'otros',
      description: 'Regalo cumpleaños',
    })
  })

  it('sin descripción, usa el nombre de la categoría como descripción por defecto', () => {
    expect(parseGastoCommand('850')).toEqual({
      amount: 850,
      category: 'otros',
      description: 'Otros',
    })
  })

  it('acepta coma como separador decimal', () => {
    expect(parseGastoCommand('2500,50 salud Farmacia')).toEqual({
      amount: 2500.5,
      category: 'salud',
      description: 'Farmacia',
    })
  })

  it('acepta punto como separador decimal', () => {
    const result = parseGastoCommand('99.99 otros Propina')
    expect(result).toMatchObject({ amount: 99.99, category: 'otros' })
  })

  it('rechaza texto no numérico como monto', () => {
    expect(parseGastoCommand('abc comida algo')).toBe('no-amount')
  })

  it('rechaza monto cero', () => {
    expect(parseGastoCommand('0 comida algo')).toBe('no-amount')
  })

  it('rechaza monto negativo', () => {
    expect(parseGastoCommand('-100 comida algo')).toBe('no-amount')
  })

  it('reporta "empty" si no se manda texto', () => {
    expect(parseGastoCommand('')).toBe('empty')
    expect(parseGastoCommand('   ')).toBe('empty')
  })

  it('tolera espacios extra entre palabras', () => {
    expect(parseGastoCommand('  3500    comida   Supermercado   Coto  ')).toEqual({
      amount: 3500,
      category: 'comida',
      description: 'Supermercado Coto',
    })
  })
})
