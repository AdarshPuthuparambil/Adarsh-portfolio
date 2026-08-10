import { About } from './components/About'
import { ClickBurst } from './components/ClickBurst'
import { Contact } from './components/Contact'
import { Education } from './components/Education'
import { Experience } from './components/Experience'
import { Footer } from './components/Footer'
import { Hero } from './components/Hero'
import { Navbar } from './components/Navbar'
import { PageProgress } from './components/PageProgress'
import { Projects } from './components/Projects'
import { Skills } from './components/Skills'
import { ThemeProvider } from './hooks/useTheme'

function App() {
  return (
    <ThemeProvider>
      <div className="min-h-svh bg-paper text-ink transition-colors duration-300 dark:bg-night dark:text-mist">
        <Navbar />
        <PageProgress />
        <ClickBurst />
        <main>
          <Hero />
          <About />
          <Experience />
          <Skills />
          <Projects />
          <Education />
          <Contact />
        </main>
        <Footer />
      </div>
    </ThemeProvider>
  )
}

export default App
