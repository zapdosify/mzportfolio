import { Link } from "react-router-dom";
import s from "../styles/interior.module.css";

export default function NotFound() {
  return (
    <div className={`container ${s.page}`} style={{ textAlign: "center" }}>
      <p className={s.breadcrumb} style={{ marginTop: "var(--space-24)" }}>LOST IN THE VOID</p>
      <h1 className={s.title} style={{ marginBottom: "var(--space-8)" }}>404</h1>
      <p className={s.tagline} style={{ margin: "0 auto var(--space-12)" }}>
        This island drifted beyond the map. Return to the world and pick another destination.
      </p>
      <Link to="/" className={s.returnBtn}>← Return to World</Link>
    </div>
  );
}
