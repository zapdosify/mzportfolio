import { useEffect } from "react";
import { Link } from "react-router";
import { contact, socials } from "../data/siteContent";
import { categoryById } from "../data/categories";
import { useWorldStore } from "../hooks/useWorldStore";
import { useInteriorMotion } from "../hooks/useInteriorMotion";
import SplitWords from "../components/motion/SplitWords";
import CategoryBanner from "../components/layout/CategoryBanner";
import s from "../styles/interior.module.css";

export default function Contact() {
  const markExplored = useWorldStore((st) => st.markExplored);
  const setContactOpen = useWorldStore((st) => st.setContactOpen);
  const category = categoryById("contact");
  const { rootRef } = useInteriorMotion<HTMLDivElement>();
  useEffect(() => {
    markExplored("contact");
  }, [markExplored]);

  return (
    <>
      {category && <CategoryBanner src={category.landmarkImage} />}

      <div className={`container ${s.page} ${s.hasBanner}`} ref={rootRef}>
      <header className={`${s.hero} ${s.heroBanner}`} data-hero="">
        <div className={s.heroText}>
          <p className={s.breadcrumb} data-hero-line="">WORLD / Contact</p>
          <h1 className={s.title} data-hero-title="">
            <SplitWords text="Contact" />
          </h1>
          <p className={s.tagline} data-hero-line="">{contact.heading}</p>

          <div
            className={s.metaRow}
            style={{ flexDirection: "column", gap: "var(--space-4)" }}
            data-hero-line=""
          >
            <div className={s.metaItem}>
              <span className={s.metaLabel}>Email</span>
              <a className={s.metaValue} href={`mailto:${socials.email}`}>{socials.email}</a>
            </div>
            <div className={s.metaItem}>
              <span className={s.metaLabel}>Location</span>
              <span className={s.metaValue}>{contact.address.join(", ")}</span>
            </div>
          </div>

          <div className={s.related} style={{ marginTop: "var(--space-8)" }} data-hero-line="">
            <a href={socials.linkedin} target="_blank" rel="noopener noreferrer" className={s.chip}>LinkedIn ↗</a>
            <a href={socials.deviantart} target="_blank" rel="noopener noreferrer" className={s.chip}>DeviantArt ↗</a>
          </div>
        </div>
      </header>

      <div className={s.returnStrip}>
        <button type="button" className={s.returnBtn} data-magnetic="" onClick={() => setContactOpen(true)}>
          Send a message →
        </button>
        <Link to="/" className={s.returnBtn} data-magnetic="">Return to World</Link>
      </div>
      </div>
    </>
  );
}
