import { BarChart3, FileSignature, LogOut, ShieldCheck } from "lucide-react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import Button from "./Button.jsx";

export default function AppShell({ children, eyebrow = "Workspace", title, subtitle }) {
  const { signOut, userRole, username } = useAuth();
  const navigate = useNavigate();

  function handleSignOut() {
    signOut();
    navigate("/");
  }

  return (
    <div className="min-h-screen bg-ivory text-ink-950">
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-72 border-r border-ink-950/10 bg-white/70 px-5 py-6 backdrop-blur-xl lg:block">
        <Link to="/" className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-ink-950 text-white">
            <ShieldCheck className="h-5 w-5" />
          </span>
          <span>
            <span className="block text-sm font-bold">VeriDoc</span>
            <span className="block text-xs text-ink-700/55">Union Bank of Cameroon</span>
          </span>
        </Link>

        <nav className="mt-10 space-y-2">
          <NavItem to="/generate" icon={FileSignature} label="Generate" />
          {userRole === "admin" ? <NavItem to="/admin" icon={BarChart3} label="Admin" /> : null}
        </nav>

        <div className="absolute bottom-6 left-5 right-5 rounded-3xl border border-ink-950/10 bg-ivory p-4">
          <p className="text-xs uppercase text-ink-700/45">Signed in</p>
          <p className="mt-1 text-sm font-semibold text-ink-950">{username}</p>
          <Button variant="subtle" icon={LogOut} className="mt-3 w-full justify-start rounded-2xl px-3" onClick={handleSignOut}>
            Sign out
          </Button>
        </div>
      </aside>

      <div className="lg:pl-72">
        <header className="sticky top-0 z-10 border-b border-ink-950/10 bg-ivory/78 px-5 py-4 backdrop-blur-xl sm:px-8">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase text-bank-700">{eyebrow}</p>
              <h1 className="mt-1 text-2xl font-semibold text-ink-950 sm:text-3xl">{title}</h1>
              {subtitle ? <p className="mt-1 text-sm text-ink-700/65">{subtitle}</p> : null}
            </div>
            <Button variant="secondary" icon={LogOut} className="hidden sm:inline-flex" onClick={handleSignOut}>
              Sign out
            </Button>
          </div>
        </header>
        <div className="mx-auto max-w-7xl px-5 py-6 sm:px-8">{children}</div>
      </div>
    </div>
  );
}

function NavItem({ to, icon: Icon, label }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition ${
          isActive ? "bg-ink-950 text-white shadow-lift" : "text-ink-700 hover:bg-ink-950/[0.04] hover:text-ink-950"
        }`
      }
    >
      <Icon className="h-4 w-4" />
      {label}
    </NavLink>
  );
}
