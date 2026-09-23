import { ArrowRight, ArrowUpRight, CircuitBoard, Microchip } from 'lucide-react'
import { Link } from 'react-router-dom'
import { AssetImage } from '../common/AssetImage'
export function Hero() {
  return (
    <section className="hero-grid" aria-label="Descubre HardTech Hub">
      <div className="hero-main">
        <div className="hero-gridlines" aria-hidden="true" />
        <div className="hero-copy">
          <span className="eyebrow hero-kicker">
            <span /> EL SIGUIENTE NIVEL ES TUYO
          </span>
          <h1>
            <span className="hero-title-line">POTENCIA</span>
            <span className="hero-title-line">TU <em>MUNDO.</em></span>
          </h1>
          <p>
            Componentes de alto rendimiento para llevar tu experiencia al
            siguiente nivel.
          </p>
          <Link className="button" to="/productos">
            Explorar componentes
            <ArrowRight size={18} />
          </Link>
          <span className="hero-caption">
            PARA JUGAR. PARA CREAR. PARA IR MÁS ALLÁ.
          </span>
        </div>
        <AssetImage
          name="hero-setup.webp"
          alt="Setup gaming de HardTech Hub"
          className="hero-main-art"
        />
      </div>
      <div className="hero-side">
        <Link to="/productos?category=GPU" className="mini-banner gpu-banner">
          <span className="eyebrow">MÁS ALLÁ DE LOS PÍXELES</span>
          <h2>
            GPU de nueva
            <br />
            generación<span>.</span>
          </h2>
          <span className="text-link">
            Explorar gráficas
            <ArrowUpRight size={16} />
          </span>
          <AssetImage
            alt="Tarjeta gráfica"
            fallback={<Microchip aria-hidden="true" size={96} strokeWidth={0.8} />}
          />
        </Link>
        <Link
          to="/productos?category=Motherboard"
          className="mini-banner motherboard-banner"
        >
          <span className="eyebrow">LA BASE DE TU SETUP</span>
          <h2>
            Placas para
            <br />
            construir más<span>.</span>
          </h2>
          <span className="text-link">
            Ver placas madre
            <ArrowUpRight size={16} />
          </span>
          <AssetImage
            alt="Placa madre"
            fallback={<CircuitBoard aria-hidden="true" size={96} strokeWidth={0.8} />}
          />
        </Link>
      </div>
    </section>
  )
}
