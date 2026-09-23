import { Cpu, CircuitBoard, MemoryStick, Zap, Microchip } from 'lucide-react'
export const categories = [
  { value: 'CPU', label: 'Procesadores', icon: Cpu },
  { value: 'GPU', label: 'Tarjetas gráficas', icon: Microchip },
  { value: 'Motherboard', label: 'Placas madre', icon: CircuitBoard },
  { value: 'RAM', label: 'Memorias RAM', icon: MemoryStick },
  { value: 'PSU', label: 'Fuentes de poder', icon: Zap },
]
export function categoryHref(value: string) { return `/productos?category=${encodeURIComponent(value)}` }
export function categoryInfo(value: string) {
  return categories.find(item => item.value.toLowerCase() === value.toLowerCase() || item.label.toLowerCase() === value.toLowerCase())
}
