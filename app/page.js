import Header from '../components/Header'
import Footer from '../components/Footer'
import Hero from '../components/Hero'
import SelectedProducts from '../components/SelectedProducts'
import AboutSnippet from '../components/AboutSnippet'

export default function Home() {
  return (
    <>
      <Header />
      <main className='container'>
        <Hero />
        <SelectedProducts />
        <AboutSnippet />
      </main>
      <Footer />
    </>
  )
}