import { useEffect } from "react";
import { Link } from "react-router";
import { contact, socials } from "../data/siteContent";
import { categoryById } from "../data/categories";
import { useWorldStore } from "../hooks/useWorldStore";
import { useHeroReveal } from "../hooks/useHeroReveal";
import CategoryBanner from "../components/layout/CategoryBanner";
import s from "../styles/interior.module.css";

export default function Contact() {
  const markExplored = useWorldStore((st) => st.markExplored);
  const setContactOpen = useWorldStore((st) => st.setContactOpen);
  const category = categoryById("contact");
  const heroRef = useHeroReveal();
  useEffect(() => {
    markExplored("contact");
  }, [markExplored]);

  return (
    <>
      {category && <CategoryBanner src={category.landmarkImage} />}

      <div className={`container ${s.page} ${s.hasBanner}`}>
      <header className={`${s.hero} ${s.heroBanner}`}>
        <div className={s.heroText} ref={heroRef}>
          <p className={s.breadcrumb}>WORLD / Contact</p>
          <h1 className={s.title}>Contact</h1>
          <p className={s.tagline}>{contact.heading}</p>

          <div className={s.metaRow} style={{ flexDirection: "column", gap: "var(--space-4)" }}>
            <div className={s.metaItem}>
              <span className={s.metaLabel}>Email</span>
              <a className={s.metaValue} href={`mailto:${socials.email}`}>{socials.email}</a>
            </div>
            <div className={s.metaItem}>
              <span className={s.metaLabel}>Location</span>
              <span className={s.metaValue}>{contact.address.join(", ")}</span>
            </div>
          </div>

          <div className={s.related} style={{ marginTop: "var(--space-8)" }}>
            <a href={socials.linkedin} target="_blank" rel="noopener noreferrer" className={s.chip}>LinkedIn ↗</a>
            <a href={socials.deviantart} target="_blank" rel="noopener noreferrer" className={s.chip}>DeviantArt ↗</a>
          </div>
        </div>
      </header>

      <div className={s.returnStrip}>
        <button type="button" className={s.returnBtn} onClick={() => setContactOpen(true)}>
          Send a message →
        </button>
        <Link to="/" className={s.returnBtn}>Return to World</Link>
      </div>
      </div>
    </>
  );
}
