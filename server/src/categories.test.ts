import { describe, expect, it } from 'vitest'
import { resolveCategory } from './categories.js'

describe('resolveCategory', () => {
  it('resuelve el nombre exacto de una categoría', () => {
    expect(resolveCategory('comida')).toBe('comida')
    expect(resolveCategory('transporte')).toBe('transporte')
  })

  it('resuelve alias conocidos', () => {
    expect(resolveCategory('super')).toBe('comida')
    expect(resolveCategory('nafta')).toBe('transporte')
    expect(resolveCategory('alquiler')).toBe('vivienda')
    expect(resolveCategory('farmacia')).toBe('salud')
  })

  it('ignora mayúsculas y acentos', () => {
    expect(resolveCategory('SÚPER')).toBe('comida')
    expect(resolveCategory('Educación')).toBe('educacion')
  })

  it('devuelve null si la palabra no es una categoría conocida', () => {
    expect(resolveCategory('cochera')).toBeNull()
    expect(resolveCategory('')).toBeNull()
  })
})
