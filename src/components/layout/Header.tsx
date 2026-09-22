import { Wallet, Plus } from 'lucide-react'
import { Button } from '../ui/Button'

interface HeaderProps {
  onAddClick: () => void
}

export function Header({ onAddClick }: HeaderProps) {
  return (
    <header className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl2 bg-brand-600 text-white shadow-soft">
          <Wallet size={22} />
        </div>
        <div>
          <h1 className="text-xl font-extrabold tracking-tight text-slate-800">Mis Gastos</h1>
          <p className="text-sm text-slate-400">Controlá tu plata, mes a mes</p>
        </div>
      </div>
      <Button onClick={onAddClick}>
        <Plus size={18} />
        <span className="hidden sm:inline">Nuevo gasto</span>
      </Button>
    </header>
  )
}
