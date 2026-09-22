import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { promises as fs } from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import request from 'supertest'
import type { Express } from 'express'

let app: Express
let tempFile: string

// Cada test arranca con un archivo de datos temporal y una instancia fresca
// de la app (vía import dinámico + resetModules), así no se pisan entre sí
// ni tocan server/data/expenses.json de verdad.
beforeEach(async () => {
  tempFile = path.join(os.tmpdir(), `control-gastos-test-${Date.now()}-${Math.random()}.json`)
  process.env.EXPENSES_DATA_FILE = tempFile

  vi.resetModules()
  const { createApp } = await import('../app.js')
  app = createApp()
})

afterEach(async () => {
  delete process.env.EXPENSES_DATA_FILE
  await fs.rm(tempFile, { force: true })
})

describe('GET /api/health', () => {
  it('responde ok: true', async () => {
    const res = await request(app).get('/api/health')
    expect(res.status).toBe(200)
    expect(res.body).toEqual({ ok: true })
  })
})

describe('GET /api/expenses', () => {
  it('devuelve un array vacío cuando no hay gastos cargados', async () => {
    const res = await request(app).get('/api/expenses')
    expect(res.status).toBe(200)
    expect(res.body).toEqual([])
  })
})

describe('POST /api/expenses', () => {
  it('crea un gasto válido y lo devuelve con id, createdAt y source "web"', async () => {
    const res = await request(app).post('/api/expenses').send({
      description: 'Supermercado',
      amount: 3500,
      category: 'comida',
      date: '2026-09-22',
    })

    expect(res.status).toBe(201)
    expect(res.body).toMatchObject({
      description: 'Supermercado',
      amount: 3500,
      category: 'comida',
      date: '2026-09-22',
      source: 'web',
    })
    expect(res.body.id).toEqual(expect.any(String))
    expect(res.body.createdAt).toEqual(expect.any(Number))
  })

  it('rechaza con 400 si faltan campos requeridos', async () => {
    const res = await request(app).post('/api/expenses').send({ description: 'Sin monto' })
    expect(res.status).toBe(400)
  })

  it('el gasto creado aparece luego en GET /api/expenses', async () => {
    await request(app).post('/api/expenses').send({
      description: 'Nafta',
      amount: 8000,
      category: 'transporte',
      date: '2026-09-22',
    })

    const res = await request(app).get('/api/expenses')
    expect(res.body).toHaveLength(1)
    expect(res.body[0].description).toBe('Nafta')
  })
})

describe('PUT /api/expenses/:id', () => {
  it('actualiza un gasto existente', async () => {
    const created = await request(app).post('/api/expenses').send({
      description: 'Cine',
      amount: 4000,
      category: 'entretenimiento',
      date: '2026-09-22',
    })

    const res = await request(app)
      .put(`/api/expenses/${created.body.id}`)
      .send({ description: 'Cine', amount: 4500, category: 'entretenimiento', date: '2026-09-22' })

    expect(res.status).toBe(200)
    expect(res.body.amount).toBe(4500)
    expect(res.body.id).toBe(created.body.id)
  })

  it('devuelve 404 si el gasto no existe', async () => {
    const res = await request(app)
      .put('/api/expenses/no-existe')
      .send({ description: 'x', amount: 1, category: 'otros', date: '2026-09-22' })

    expect(res.status).toBe(404)
  })
})

describe('DELETE /api/expenses/:id', () => {
  it('elimina un gasto existente', async () => {
    const created = await request(app).post('/api/expenses').send({
      description: 'Farmacia',
      amount: 1200,
      category: 'salud',
      date: '2026-09-22',
    })

    const del = await request(app).delete(`/api/expenses/${created.body.id}`)
    expect(del.status).toBe(204)

    const list = await request(app).get('/api/expenses')
    expect(list.body).toEqual([])
  })

  it('devuelve 404 si el gasto no existe', async () => {
    const res = await request(app).delete('/api/expenses/no-existe')
    expect(res.status).toBe(404)
  })
})
