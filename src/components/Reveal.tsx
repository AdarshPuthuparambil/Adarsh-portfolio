import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ElementType,
  type ReactNode,
} from 'react'

type RevealProps = {
  children: ReactNode
  className?: string
  delay?: number
  as?: ElementType
  once?: boolean
}

export function Reveal({
  children,
  className = '',
  delay = 0,
  as: Tag = 'div',
  once = true,
}: RevealProps) {
  const ref = useRef<HTMLElement | null>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const node = ref.current
    if (!node) return

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (mediaQuery.matches) {
      setVisible(true)
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          if (once) observer.unobserve(node)
        } else if (!once) {
          setVisible(false)
        }
      },
      {
        threshold: 0.14,
        rootMargin: '0px 0px -8% 0px',
      },
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [once])

  const style = { transitionDelay: `${delay}ms` } as CSSProperties

  return (
    <Tag
      ref={ref}
      className={`reveal ${visible ? 'reveal-visible' : ''} ${className}`}
      style={style}
    >
      {children}
    </Tag>
  )
}
