import { useEffect, useRef, useState } from "react";
import { socials } from "../../data/siteContent";
import { useWorldStore } from "../../hooks/useWorldStore";
import styles from "./ContactDialog.module.css";

/**
 * Compose-a-message dialog.
 *
 * The site is static, so nothing is sent from here — pressing Send builds a
 * pre-filled message and hands it to the visitor's own mail app. The UI says
 * exactly that, both before and after, so nobody is left believing a message
 * was delivered when it wasn't. If no mail client opens, the confirmation
 * step offers the address and a copy button as a way out.
 *
 * Modal behaviour matches IndexMenu/Lightbox: Esc to close, focus trap,
 * body-scroll lock, focus restored to whatever opened it.
 */

const MAX_MESSAGE = 1800; // mailto URLs get unreliable much past ~2000 chars

type Errors = Partial<Record<"name" | "email" | "message", string>>;

export default function ContactDialog() {
  const open = useWorldStore((s) => s.contactOpen);
  const setOpen = useWorldStore((s) => s.setContactOpen);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [handedOff, setHandedOff] = useState(false);
  const [copied, setCopied] = useState(false);

  const panelRef = useRef<HTMLDivElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const messageRef = useRef<HTMLTextAreaElement>(null);

  // Esc to close
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, setOpen]);

  // Scroll lock + focus restore. The dialog always opens blank — the
  // component stays mounted for the life of the page, so without this reset
  // the previous draft would still be sitting there waiting to be deleted.
  useEffect(() => {
    if (!open) return;
    const prev = document.activeElement as HTMLElement | null;
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    setName("");
    setEmail("");
    setSubject("");
    setMessage("");
    setHandedOff(false);
    setCopied(false);
    setErrors({});
    const t = window.setTimeout(() => nameRef.current?.focus(), 40);
    return () => {
      document.body.style.overflow = overflow;
      window.clearTimeout(t);
      prev?.focus?.();
    };
  }, [open]);

  if (!open) return null;

  const trapTab = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== "Tab") return;
    const els = e.currentTarget.querySelectorAll<HTMLElement>(
      'button, [href], input, textarea, [tabindex]:not([tabindex="-1"])',
    );
    if (!els.length) return;
    const first = els[0];
    const last = els[els.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

  const validate = (): Errors => {
    const next: Errors = {};
    if (!name.trim()) next.name = "Please add your name so I know who's writing.";
    if (!email.trim()) next.email = "Please add an email address so I can reply.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
      next.email = "That doesn't look like an email address — check for a typo.";
    if (!message.trim()) next.message = "Please write a message before sending.";
    return next;
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const next = validate();
    setErrors(next);
    if (Object.keys(next).length) {
      // move focus to the first field that needs attention
      if (next.name) nameRef.current?.focus();
      else if (next.email) emailRef.current?.focus();
      else messageRef.current?.focus();
      return;
    }

    const subj = subject.trim() || `Portfolio enquiry from ${name.trim()}`;
    const body = `${message.trim()}\n\n—\n${name.trim()}\n${email.trim()}`;
    const href = `mailto:${socials.email}?subject=${encodeURIComponent(
      subj,
    )}&body=${encodeURIComponent(body)}`;

    // Hand off to the mail client. We can't detect whether one opened, so the
    // confirmation below is worded as "should have opened", never "sent".
    window.location.href = href;
    setHandedOff(true);
  };

  const copyAddress = async () => {
    try {
      await navigator.clipboard.writeText(socials.email);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(false);
    }
  };

  const remaining = MAX_MESSAGE - message.length;

  return (
    <div className={styles.overlay} onKeyDown={trapTab}>
      <button
        type="button"
        className={styles.scrim}
        aria-label="Close message composer"
        onClick={() => setOpen(false)}
      />

      <div
        className={styles.panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby="contact-dialog-title"
        ref={panelRef}
      >
        <div className={styles.head}>
          <div>
            <h2 id="contact-dialog-title" className={styles.title}>
              {handedOff ? "Ready to send" : "Write a message"}
            </h2>
            <p className={styles.to}>
              To <span className={styles.toAddr}>{socials.email}</span>
            </p>
          </div>
          <button type="button" className={styles.close} onClick={() => setOpen(false)}>
            Close <span aria-hidden="true">✕</span>
          </button>
        </div>

        {handedOff ? (
          <div className={styles.done}>
            <p className={styles.doneLead}>
              Your email app should have opened with this message ready to send.
              Nothing has been sent yet — press send in your mail app to finish.
            </p>
            <p className={styles.doneNote}>
              Nothing opened? Some browsers and shared computers have no mail app
              set up. You can write to the address directly instead:
            </p>
            <div className={styles.doneActions}>
              <button type="button" className={styles.ghost} onClick={copyAddress}>
                {copied ? "Address copied ✓" : "Copy address"}
              </button>
              <a className={styles.ghost} href={`mailto:${socials.email}`}>
                Open mail app again
              </a>
            </div>
            <p className={styles.addrOut}>{socials.email}</p>
          </div>
        ) : (
          <form className={styles.form} onSubmit={onSubmit} noValidate>
            <p className={styles.lead}>
              This opens your own email app with everything filled in — the website
              doesn't send it for you.
            </p>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="cd-name">
                Name <span aria-hidden="true">*</span>
              </label>
              <input
                id="cd-name"
                ref={nameRef}
                className={`${styles.input} ${errors.name ? styles.inputBad : ""}`}
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
                aria-required="true"
                aria-invalid={!!errors.name}
                aria-describedby={errors.name ? "cd-name-err" : undefined}
              />
              {errors.name && (
                <p className={styles.error} id="cd-name-err" role="alert">
                  {errors.name}
                </p>
              )}
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="cd-email">
                Your email <span aria-hidden="true">*</span>
              </label>
              <input
                id="cd-email"
                ref={emailRef}
                type="email"
                inputMode="email"
                className={`${styles.input} ${errors.email ? styles.inputBad : ""}`}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                aria-required="true"
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? "cd-email-err" : "cd-email-hint"}
              />
              {errors.email ? (
                <p className={styles.error} id="cd-email-err" role="alert">
                  {errors.email}
                </p>
              ) : (
                <p className={styles.hint} id="cd-email-hint">
                  Added to the message so a reply can reach you.
                </p>
              )}
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="cd-subject">
                Subject
              </label>
              <input
                id="cd-subject"
                className={styles.input}
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Portfolio enquiry"
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="cd-message">
                Message <span aria-hidden="true">*</span>
              </label>
              <textarea
                id="cd-message"
                ref={messageRef}
                rows={6}
                maxLength={MAX_MESSAGE}
                className={`${styles.textarea} ${errors.message ? styles.inputBad : ""}`}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                aria-required="true"
                aria-invalid={!!errors.message}
                aria-describedby={errors.message ? "cd-message-err" : "cd-message-count"}
              />
              {errors.message ? (
                <p className={styles.error} id="cd-message-err" role="alert">
                  {errors.message}
                </p>
              ) : (
                <p
                  className={`${styles.hint} ${remaining < 200 ? styles.hintWarn : ""}`}
                  id="cd-message-count"
                  aria-live="polite"
                >
                  {remaining < 200
                    ? `${remaining} characters left`
                    : "Keep it brief — long messages are better written in your mail app."}
                </p>
              )}
            </div>

            <div className={styles.actions}>
              <button type="submit" className={styles.submit}>
                Open in mail app →
              </button>
              <button
                type="button"
                className={styles.ghost}
                onClick={() => setOpen(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
