import { motion } from "framer-motion";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Button from "../components/Button.jsx";
import Input from "../components/Input.jsx";
import Page from "../components/Page.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { loginEmployee } from "../lib/api.js";
import { rise, stagger } from "../lib/motion.js";

export default function Login() {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [form, setForm] = useState({ employeeName: "", username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await loginEmployee({ username: form.username, password: form.password });
      signIn(response.access_token);
      navigate("/generate");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Page className="grid min-h-screen place-items-center px-5 py-10">
      <div className="absolute inset-0 soft-grid opacity-60" />
      <motion.div variants={stagger} initial="initial" animate="animate" className="relative z-10 w-full max-w-md">
        <motion.div variants={rise} className="mb-8 text-center">
          <Link to="/" className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-3xl bg-ink-950 p-3 text-white shadow-lift">
            <ShieldCheck className="h-7 w-7" />
          </Link>
          <h1 className="mt-5 text-3xl font-semibold text-ink-950">Employee login</h1>
          <p className="mt-2 text-sm leading-6 text-ink-700/65">Continue to authenticated document generation.</p>
        </motion.div>

        <motion.form variants={rise} onSubmit={handleSubmit} className="glass-panel rounded-[2rem] p-5 sm:p-6">
          <div className="space-y-4">
            <Input
              label="Employee name"
              placeholder="Full name"
              value={form.employeeName}
              onChange={(event) => setForm({ ...form, employeeName: event.target.value })}
            />
            <Input
              label="Employee ID / Username"
              placeholder="admin"
              value={form.username}
              onChange={(event) => setForm({ ...form, username: event.target.value })}
              required
            />
            <Input
              label="Password"
              type="password"
              placeholder="admin123"
              value={form.password}
              onChange={(event) => setForm({ ...form, password: event.target.value })}
              required
            />
          </div>

          {error ? <p className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</p> : null}

          <Button type="submit" icon={ArrowRight} loading={loading} className="mt-6 w-full">
            Login securely
          </Button>
        </motion.form>
      </motion.div>
    </Page>
  );
}
