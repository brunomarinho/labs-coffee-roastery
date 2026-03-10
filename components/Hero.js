import Link from 'next/link'

export default function Hero() {
  return (
      <div className='hero animate-fade-up'>
        <h1>Mameluca é uma nano-torrefação experimental de cafés brasileiros.</h1>
        <p className="hero-subtitle">Torra clara, pouco desenvolvimento. Terroir e fruta primeiro. <a href='/sobre'>Sobre</a>.</p>
        
    </div>
  )
}