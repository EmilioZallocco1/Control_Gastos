import { useState, type FormEvent } from 'react'
import { Modal } from '../ui/Modal'
import { Input } from '../ui/Input'
import { Select } from '../ui/Select'
import { Button } from '../ui/Button'
import { CATEGORY_LIST } from '../../utils/categories'
import { todayIso } from '../../utils/formatters'
import type { Expense, ExpenseInput, CategoryId } from '../../types/expense'

interface ExpenseFormProps {
  open: boolean
  onClose: () => void
  onSubmit: (input: ExpenseInput) => void
  initialExpense?: Expense | null
}

const EMPTY_FORM = {
  description: '',
  amount: '',
  category: 'otros' as CategoryId,
  date: todayIso(),
}

export function ExpenseForm({ open, onClose, onSubmit, initialExpense }: ExpenseFormProps) {
  const [form, setForm] = useState(() =>
    initialExpense
      ? {
          description: initialExpense.description,
          amount: String(initialExpense.amount),
          category: initialExpense.category,
          date: initialExpense.date,
        }
      : EMPTY_FORM,
  )

  const isEditing = Boolean(initialExpense)

  const handleClose = () => {
    setForm(EMPTY_FORM)
    onClose()
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    const amount = Number(form.amount)
    if (!form.description.trim() || !amount || amount <= 0) return

    onSubmit({
      description: form.description.trim(),
      amount,
      category: form.category,
      date: form.date,
    })
    setForm(EMPTY_FORM)
  }

  return (
    <Modal open={open} onClose={handleClose} title={isEditing ? 'Editar gasto' : 'Nuevo gasto'}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="Descripción"
          placeholder="Ej: Supermercado"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          required
          autoFocus
        />
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Monto"
            type="number"
            inputMode="decimal"
            min="0"
            step="0.01"
            placeholder="0"
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
            required
          />
          <Input
            label="Fecha"
            type="date"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
            required
          />
        </div>
        <Select
          label="Categoría"
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value as CategoryId })}
        >
          {CATEGORY_LIST.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.label}
            </option>
          ))}
        </Select>

        <div className="mt-2 flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={handleClose}>
            Cancelar
          </Button>
          <Button type="submit">{isEditing ? 'Guardar cambios' : 'Agregar gasto'}</Button>
        </div>
      </form>
    </Modal>
  )
}
