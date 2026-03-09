import Link from "next/link";
import { templates } from "@/app/lib/mock-data";

export default function LandingPage() {
  return (
    <div className="min-h-screen px-6 py-10 lg:px-16">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between">
        <div className="text-2xl font-bold text-orange-500">Eventra</div>
        <div className="space-x-3">
          <Link href="/login" className="rounded-xl border border-slate-200 px-4 py-2 text-sm">Login</Link>
          <Link href="/signup" className="rounded-xl bg-orange-500 px-4 py-2 text-sm text-white">Get Started</Link>
        </div>
      </header>
      <section className="mx-auto mt-14 grid max-w-6xl gap-10 lg:grid-cols-2 lg:items-center">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-orange-500">SaaS event OS</p>
          <h1 className="mt-4 text-5xl font-bold leading-tight">Plan, book, and manage events in one elegant workspace.</h1>
          <p className="mt-5 text-slate-600">From templates to vendor chats and checkout, Eventra helps planners and businesses collaborate seamlessly.</p>
          <Link href="/templates" className="mt-8 inline-block rounded-xl bg-slate-900 px-5 py-3 text-sm font-medium text-white">Explore Templates</Link>
        </div>
        <div className="glass-card grid grid-cols-2 gap-4 p-4">
          {templates.slice(0, 4).map((template) => (
            <div key={template.title} className="rounded-xl bg-white p-4 shadow-sm">
              <p className="font-semibold">{template.title}</p>
              <p className="mt-2 text-xs text-slate-500">{template.budget}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
