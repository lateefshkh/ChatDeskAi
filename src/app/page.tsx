// src/app/page.tsx
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-neutral-900 flex items-center justify-center">
              <span className="text-white font-bold text-lg">C</span>
            </div>
            <span className="text-xl font-semibold text-neutral-900">ChatDesk</span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="#features" className="text-sm text-neutral-600 hover:text-neutral-900">Features</Link>
            <Link href="#pricing" className="text-sm text-neutral-600 hover:text-neutral-900">Pricing</Link>
            <Link href="/login" className="text-sm text-neutral-600 hover:text-neutral-900">Login</Link>
            <Link
              href="/signup"
              className="bg-neutral-900 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-neutral-800 transition-colors"
            >
              Get started free
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="inline-block mb-4 px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-medium rounded-full">
          🎉 10 free chats — no credit card required
        </div>
        <h1 className="text-5xl font-semibold text-neutral-900 mb-6 max-w-3xl mx-auto leading-tight">
          Turn your website into a{" "}
          <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            24/7 AI assistant
          </span>
        </h1>
        <p className="text-lg text-neutral-600 mb-8 max-w-2xl mx-auto leading-relaxed">
          Add your knowledge. Get a chat link. Let AI answer your visitors —
          grounded only in your data. No hallucinations, no setup headaches.
        </p>
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <Link
            href="/signup"
            className="bg-neutral-900 text-white text-sm font-medium px-6 py-3 rounded-lg hover:bg-neutral-800 transition-colors"
          >
            Start with 10 free chats
          </Link>
          <Link
            href="#how-it-works"
            className="text-neutral-700 text-sm font-medium px-6 py-3 rounded-lg border border-neutral-200 hover:bg-neutral-50 transition-colors"
          >
            How it works
          </Link>
        </div>
        <p className="text-xs text-neutral-400 mt-4">No credit card required · Setup in 2 minutes</p>
      </section>

      {/* Stats Section */}
      <section className="border-y border-neutral-200 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <StatBox label="Messages handled" value="12.4M" change="+18%" positive />
            <StatBox label="Leads captured" value="48,203" change="+24%" positive />
            <StatBox label="Avg. response time" value="1.2s" change="-32%" positive />
            <StatBox label="Businesses using" value="1,840" change="+12%" positive />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="max-w-7xl mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-semibold text-neutral-900 mb-4">
            Everything you need to answer visitors
          </h2>
          <p className="text-neutral-600 max-w-2xl mx-auto">
            From scraping your website to capturing leads — ChatDesk handles the entire pipeline.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FeatureCard
            icon="🌐"
            title="Website scraping"
            description="Add any URL and we extract clean text — no manual copy-paste."
          />
          <FeatureCard
            icon="🧠"
            title="RAG-based AI"
            description="Answers come only from your data. No hallucinations."
          />
          <FeatureCard
            icon="📊"
            title="Analytics dashboard"
            description="See chats, leads, unanswered questions, and quota in real time."
          />
          <FeatureCard
            icon="🔒"
            title="Multi-tenant isolation"
            description="Every business's data stays separate, enforced at the database level."
          />
          <FeatureCard
            icon="💬"
            title="Lead capture"
            description="When visitors share name and phone, you get notified instantly."
          />
          <FeatureCard
            icon="⚡"
            title="Live streaming"
            description="Chat responses stream word-by-word — feels fast and natural."
          />
        </div>
      </section>

      {/* Analytics Mock Section */}
      <section className="border-y border-neutral-200 bg-neutral-50 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-semibold text-neutral-900 mb-4">
                Know exactly what's happening
              </h2>
              <p className="text-neutral-600 mb-8 leading-relaxed">
                Track conversations, leads, and unanswered questions. See which
                sources perform best. Export data anytime.
              </p>
              <ul className="space-y-3">
                <CheckItem text="Real-time chat count" />
                <CheckItem text="Unanswered question tracking" />
                <CheckItem text="Lead conversion percentage" />
                <CheckItem text="Quota usage against plan" />
              </ul>
            </div>
            <div className="bg-white rounded-xl border border-neutral-200 p-6 shadow-sm">
              <p className="text-xs text-neutral-500 mb-3">Conversation activity</p>
              <MiniBarChart />
              <div className="mt-6 grid grid-cols-3 gap-4">
                <SmallStat label="Today" value="182" />
                <SmallStat label="This week" value="1,240" />
                <SmallStat label="Answer rate" value="94%" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-semibold text-neutral-900 mb-4">How it works</h2>
          <p className="text-neutral-600">Three steps to your AI assistant.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <StepCard
            number="01"
            title="Add your knowledge"
            description="Upload a URL, paste text, or add documents. We process everything automatically."
          />
          <StepCard
            number="02"
            title="Get your chat link"
            description="Copy your unique URL and share it on your website, WhatsApp, or email."
          />
          <StepCard
            number="03"
            title="Watch leads roll in"
            description="Visitors chat, share contact info, and you get notified instantly."
          />
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="border-y border-neutral-200 bg-neutral-50 py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-semibold text-neutral-900 mb-4">Simple pricing</h2>
            <p className="text-neutral-600">Start free. Upgrade when you need more.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {/* Free Plan */}
            <div className="bg-white rounded-xl border border-neutral-200 p-8">
              <h3 className="text-lg font-semibold text-neutral-900 mb-2">Free Trial</h3>
              <p className="text-sm text-neutral-500 mb-6">Try ChatDesk. No card required.</p>
              <div className="mb-6">
                <span className="text-4xl font-semibold text-neutral-900">₹0</span>
                <span className="text-sm text-neutral-500 ml-1">forever</span>
              </div>
              <ul className="space-y-2 mb-8 text-sm text-neutral-600">
                <li>✓ 10 free chats</li>
                <li>✓ 1 knowledge source</li>
                <li>✓ Lead capture</li>
                <li>✓ Full dashboard access</li>
              </ul>
              <Link
                href="/signup"
                className="block text-center w-full py-2.5 border border-neutral-300 rounded-lg text-sm font-medium text-neutral-900 hover:bg-neutral-50 transition-colors"
              >
                Start free
              </Link>
            </div>

            {/* Starter Plan */}
            <div className="bg-white rounded-xl border border-neutral-200 p-8 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-xs font-medium px-3 py-1 rounded-full">
                Most popular
              </div>
              <h3 className="text-lg font-semibold text-neutral-900 mb-2">Starter Pack</h3>
              <p className="text-sm text-neutral-500 mb-6">One-time pack. Perfect for testing.</p>
              <div className="mb-6">
                <span className="text-4xl font-semibold text-neutral-900">₹49</span>
                <span className="text-sm text-neutral-500 ml-1">one-time</span>
              </div>
              <ul className="space-y-2 mb-8 text-sm text-neutral-600">
                <li>✓ 30 additional chats</li>
                <li>✓ Unlimited sources</li>
                <li>✓ Lead capture + notifications</li>
                <li>✓ Priority support</li>
              </ul>
              <Link
                href="/signup"
                className="block text-center w-full py-2.5 bg-neutral-900 rounded-lg text-sm font-medium text-white hover:bg-neutral-800 transition-colors"
              >
                Buy Starter
              </Link>
            </div>

            {/* Growth Plan */}
            <div className="bg-white rounded-xl border border-neutral-200 p-8">
              <h3 className="text-lg font-semibold text-neutral-900 mb-2">Growth Monthly</h3>
              <p className="text-sm text-neutral-500 mb-6">For growing businesses.</p>
              <div className="mb-6">
                <span className="text-4xl font-semibold text-neutral-900">₹399</span>
                <span className="text-sm text-neutral-500 ml-1">/month</span>
              </div>
              <ul className="space-y-2 mb-8 text-sm text-neutral-600">
                <li>✓ 3,000 chats per month</li>
                <li>✓ Unlimited sources</li>
                <li>✓ Lead capture + notifications</li>
                <li>✓ Priority support</li>
              </ul>
              <Link
                href="/signup"
                className="block text-center w-full py-2.5 border border-neutral-300 rounded-lg text-sm font-medium text-neutral-900 hover:bg-neutral-50 transition-colors"
              >
                Start Growth
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-neutral-900 text-white py-20">
        <div className="max-w-3xl mx-auto text-center px-4">
          <h2 className="text-3xl font-semibold mb-4">
            Ready to turn your website into an assistant?
          </h2>
          <p className="text-neutral-400 mb-8">
            Start with 10 free chats. Upgrade only if you love it.
          </p>
          <Link
            href="/signup"
            className="inline-block bg-white text-neutral-900 text-sm font-medium px-6 py-3 rounded-lg hover:bg-neutral-100 transition-colors"
          >
            Get started free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-neutral-200 py-8">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-neutral-500">
          <div>© 2026 ChatDesk. All rights reserved.</div>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="hover:text-neutral-900">Privacy</Link>
            <Link href="/terms" className="hover:text-neutral-900">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

// ─── Helper Components ─────────────────────────────────────────────────

function StatBox({
  label,
  value,
  change,
  positive,
}: {
  label: string;
  value: string;
  change: string;
  positive?: boolean;
}) {
  return (
    <div>
      <p className="text-sm text-neutral-500 mb-1">{label}</p>
      <p className="text-2xl font-semibold text-neutral-900">{value}</p>
      <p className={`text-xs ${positive ? "text-emerald-600" : "text-red-600"}`}>
        {change} vs last week
      </p>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-neutral-200 p-6 hover:shadow-sm transition-shadow">
      <div className="text-3xl mb-4">{icon}</div>
      <h3 className="text-lg font-semibold text-neutral-900 mb-2">{title}</h3>
      <p className="text-sm text-neutral-600 leading-relaxed">{description}</p>
    </div>
  );
}

function CheckItem({ text }: { text: string }) {
  return (
    <li className="flex items-start gap-3">
      <span className="text-emerald-500 mt-0.5">✓</span>
      <span className="text-sm text-neutral-700">{text}</span>
    </li>
  );
}

function SmallStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-neutral-500">{label}</p>
      <p className="text-lg font-semibold text-neutral-900">{value}</p>
    </div>
  );
}

function StepCard({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="text-center md:text-left">
      <div className="text-5xl font-semibold text-neutral-300 mb-2">{number}</div>
      <h3 className="text-lg font-semibold text-neutral-900 mb-2">{title}</h3>
      <p className="text-sm text-neutral-600 leading-relaxed">{description}</p>
    </div>
  );
}

function MiniBarChart() {
  const data = [40, 65, 45, 80, 55, 90, 70];
  const max = Math.max(...data);

  return (
    <div className="flex items-end justify-between gap-2 h-24">
      {data.map((value, i) => (
        <div key={i} className="flex flex-col items-center gap-1 flex-1">
          <div
            className="w-full bg-indigo-500 rounded-sm"
            style={{ height: `${(value / max) * 100}%` }}
          />
        </div>
      ))}
    </div>
  );
}