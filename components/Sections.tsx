import { Mail, Phone, MapPin } from "lucide-react";
import { Logo } from "./Logo";
import { riskLine } from "@/lib/content";
import { classes } from "@/lib/classes";

const cols = [
  { title: "Classes", links: classes.map((c) => [c.name, `/classes/${c.slug}/`]) },
  { title: "Wealth", links: [["How copy-trading works", "/#plans"], ["Markets", "/#markets"], ["Fees", "/#faq"], ["Risk disclosure", "/#risk"]] },
  { title: "Community", links: [["About us", "/#about"], ["Member stories", "/#stories"], ["FAQ", "/#faq"], ["Book now", "/#enquiry"]] },
];

export function Footer() {
  return (
    <footer className="footer">
      <div className="footer__top">
        <div className="footer__brand">
          <Logo />
          <p>Get 1% better every day, in your body and with your money. A community built on small, steady steps.</p>
          <ul className="footer__contact">
            <li>
              <Mail size={16} aria-hidden />
              hello@onepercentdaily.in
            </li>
            <li>
              <Phone size={16} aria-hidden />
              +91 80000 00000
            </li>
            <li>
              <MapPin size={16} aria-hidden />
              India
            </li>
          </ul>
        </div>
        {cols.map((col) => (
          <div key={col.title} className="footer__col">
            <h3>{col.title}</h3>
            <ul>
              {col.links.map(([l, h]) => (
                <li key={l}>
                  <a href={h}>{l}</a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="footer__risk" id="risk">
        <h3>Risk disclosure</h3>
        <p>
          {riskLine} Copy-trading places real trades in your own trading account, and you can lose some or all of the
          money you trade with. Any daily or monthly figure we mention is a target, not an assurance of returns. The
          trading institute is a separate entity and is not part of this programme. Please read the full terms and
          consider your own circumstances before linking an account.
        </p>
      </div>

      <div className="footer__bottom">
        <p>© {new Date().getFullYear()} 1% Daily Healthy Wealthy. All rights reserved.</p>
        <p>Registration and regulatory details will be listed here before launch.</p>
      </div>
    </footer>
  );
}
