import { LoaderCircle, Send } from 'lucide-react'
import {
  useId,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from 'react'
import { validateContactForm } from '../lib/contactValidation'
import { submitContact } from '../lib/submitContact'
import {
  CONTACT_ERROR_MESSAGE,
  CONTACT_LIMITS,
  CONTACT_SUCCESS_MESSAGE,
  type ContactFieldErrors,
  type ContactFormData,
} from '../types/contact'

const INITIAL_VALUES: ContactFormData = {
  name: '',
  email: '',
  phone: '',
  subject: '',
  message: '',
}

const inputClass =
  'mt-2 w-full border-b border-ink/15 bg-transparent py-3 text-base text-ink outline-none transition-colors placeholder:text-ink/35 focus:border-accent disabled:opacity-60 dark:border-mist/20 dark:text-mist dark:placeholder:text-mist/35 dark:focus:border-accent-bright'

export function ContactForm() {
  const idPrefix = useId()
  const sendingLock = useRef(false)
  const [values, setValues] = useState<ContactFormData>(INITIAL_VALUES)
  const [website, setWebsite] = useState('')
  const [errors, setErrors] = useState<ContactFieldErrors>({})
  const [sending, setSending] = useState(false)
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [statusMessage, setStatusMessage] = useState('')

  function updateField<K extends keyof ContactFormData>(
    field: K,
    value: ContactFormData[K],
  ) {
    setValues((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({ ...current, [field]: undefined }))
    if (status !== 'idle') {
      setStatus('idle')
      setStatusMessage('')
    }
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (sendingLock.current || sending) return

    const validation = validateContactForm(values)
    if (!validation.ok) {
      setErrors(validation.errors)
      setStatus('error')
      setStatusMessage('Please check the highlighted fields and try again.')
      return
    }

    sendingLock.current = true
    setSending(true)
    setErrors({})
    setStatus('idle')
    setStatusMessage('')

    const result = await submitContact({
      ...validation.values,
      website,
    })

    setSending(false)
    sendingLock.current = false

    if (result.success) {
      setValues(INITIAL_VALUES)
      setWebsite('')
      setStatus('success')
      setStatusMessage(CONTACT_SUCCESS_MESSAGE)
      return
    }

    setStatus('error')
    setStatusMessage(result.message || CONTACT_ERROR_MESSAGE)
  }

  return (
    <form
      id="contact-form"
      onSubmit={onSubmit}
      noValidate
      className="relative scroll-mt-24 pt-8 dark:border-mist/10"
    >
      <div className="max-w-2xl">
        <h3 className="font-display text-2xl font-bold text-ink dark:text-mist">
          Send a message
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-ink-soft/75 dark:text-fog">
          Share a few details and I&apos;ll get back to you by email.
        </p>
      </div>

      <div
        className="absolute -left-[10000px] h-0 w-0 overflow-hidden"
        aria-hidden="true"
      >
        {/*
          The field is named "hp-field" rather than "website" because password
          managers treat a website/url field as an autofill target, and an
          autofilled honeypot is indistinguishable from a bot server-side. The
          data-* attributes are the documented opt-outs for 1Password,
          LastPass, Bitwarden and Dashlane. The wire format still calls this
          "website", so the API contract is unchanged.
        */}
        <label htmlFor={`${idPrefix}-hp-field`}>Leave this field empty</label>
        <input
          id={`${idPrefix}-hp-field`}
          name="hp-field"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          data-1p-ignore
          data-lpignore="true"
          data-bwignore
          data-form-type="other"
          value={website}
          onChange={(event) => setWebsite(event.target.value)}
        />
      </div>

      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        <Field
          id={`${idPrefix}-name`}
          label="Full name"
          error={errors.name}
        >
          <input
            id={`${idPrefix}-name`}
            name="name"
            type="text"
            autoComplete="name"
            required
            maxLength={CONTACT_LIMITS.name}
            value={values.name}
            disabled={sending}
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? `${idPrefix}-name-error` : undefined}
            className={inputClass}
            onChange={(event) => updateField('name', event.target.value)}
          />
        </Field>

        <Field id={`${idPrefix}-email`} label="Email" error={errors.email}>
          <input
            id={`${idPrefix}-email`}
            name="email"
            type="email"
            autoComplete="email"
            inputMode="email"
            required
            maxLength={CONTACT_LIMITS.email}
            value={values.email}
            disabled={sending}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={
              errors.email ? `${idPrefix}-email-error` : undefined
            }
            className={inputClass}
            onChange={(event) => updateField('email', event.target.value)}
          />
        </Field>

        <Field
          id={`${idPrefix}-phone`}
          label="Phone number"
          error={errors.phone}
        >
          <input
            id={`${idPrefix}-phone`}
            name="phone"
            type="tel"
            autoComplete="tel"
            inputMode="tel"
            required
            maxLength={CONTACT_LIMITS.phone}
            value={values.phone}
            disabled={sending}
            aria-invalid={Boolean(errors.phone)}
            aria-describedby={
              errors.phone ? `${idPrefix}-phone-error` : undefined
            }
            className={inputClass}
            onChange={(event) => updateField('phone', event.target.value)}
          />
        </Field>

        <Field
          id={`${idPrefix}-subject`}
          label="Subject"
          optional
          error={errors.subject}
        >
          <input
            id={`${idPrefix}-subject`}
            name="subject"
            type="text"
            autoComplete="off"
            maxLength={CONTACT_LIMITS.subject}
            value={values.subject}
            disabled={sending}
            aria-invalid={Boolean(errors.subject)}
            aria-describedby={
              errors.subject ? `${idPrefix}-subject-error` : undefined
            }
            className={inputClass}
            onChange={(event) => updateField('subject', event.target.value)}
          />
        </Field>
      </div>

      <Field
        id={`${idPrefix}-message`}
        label="Message"
        error={errors.message}
        className="mt-6"
      >
        <textarea
          id={`${idPrefix}-message`}
          name="message"
          required
          rows={6}
          maxLength={CONTACT_LIMITS.message}
          value={values.message}
          disabled={sending}
          aria-invalid={Boolean(errors.message)}
          aria-describedby={
            errors.message ? `${idPrefix}-message-error` : undefined
          }
          className={`${inputClass} resize-y`}
          onChange={(event) => updateField('message', event.target.value)}
        />
        <p className="mt-2 text-xs tracking-wide text-ink/40 dark:text-mist/35">
          {values.message.length}/{CONTACT_LIMITS.message}
        </p>
      </Field>

      <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
        <button
          type="submit"
          disabled={sending}
          className="inline-flex items-center justify-center gap-2 bg-ink px-5 py-3 text-sm font-semibold text-paper transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 dark:bg-mist dark:text-night"
        >
          {sending ? (
            <LoaderCircle size={16} className="animate-spin" />
          ) : (
            <Send size={16} />
          )}
          {sending ? 'Sending...' : 'Send message'}
        </button>

        <p
          role="status"
          aria-live="polite"
          className={`text-sm leading-relaxed ${
            status === 'success'
              ? 'text-accent dark:text-accent-bright'
              : status === 'error'
                ? 'text-red-700 dark:text-red-400'
                : 'sr-only'
          }`}
        >
          {statusMessage}
        </p>
      </div>
    </form>
  )
}

function Field({
  id,
  label,
  optional = false,
  error,
  className = '',
  children,
}: {
  id: string
  label: string
  optional?: boolean
  error?: string
  className?: string
  children: ReactNode
}) {
  return (
    <div className={className}>
      <label
        htmlFor={id}
        className="text-sm tracking-wide text-ink/50 uppercase dark:text-mist/45"
      >
        {label}
        {optional ? (
          <span className="ml-2 normal-case tracking-normal text-ink/40 dark:text-mist/35">
            Optional
          </span>
        ) : null}
      </label>
      {children}
      {error ? (
        <p
          id={`${id}-error`}
          className="mt-2 text-sm text-red-700 dark:text-red-400"
          role="alert"
        >
          {error}
        </p>
      ) : null}
    </div>
  )
}
