import { useEffect, useRef, useState } from 'react';
import { Send, CheckCircle, AlertCircle, Loader, ArrowRight } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface FormData {
  fullName: string;
  company: string;
  email: string;
  website: string;
  subject: string;
  message: string;
}

export default function Contact() {
  const sectionRef = useRef<HTMLElement>(null);
  const [form, setForm] = useState<FormData>({
    fullName: '',
    company: '',
    email: '',
    website: '',
    subject: '',
    message: '',
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.querySelectorAll('.reveal, .reveal-scale').forEach((el, i) => {
              setTimeout(() => el.classList.add('visible'), i * 100);
            });
          }
        });
      },
      { threshold: 0.05 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.fullName || !form.email || !form.message) {
      setErrorMsg('Please fill in all required fields.');
      setStatus('error');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      setErrorMsg('Please enter a valid email address.');
      setStatus('error');
      return;
    }

    setStatus('loading');
    setErrorMsg('');

    try {
      const { error } = await supabase
        .from('contact_submissions')
        .insert([{
          full_name: form.fullName,
          company_name: form.company,
          email: form.email,
          website: form.website,
          message: form.message,
        }]);

      if (error) throw error;

      await supabase.functions.invoke('send-contact-email', {
        body: {
          fullName: form.fullName,
          company: form.company,
          email: form.email,
          website: form.website,
          message: form.message,
        },
      });

      setStatus('success');
      setForm({ fullName: '', company: '', email: '', website: '', subject: '', message: '' });
    } catch (err) {
      console.error(err);
      setStatus('error');
      setErrorMsg('Something went wrong. Please try again or email us directly.');
    }
  };

  const inputClass = "w-full rounded-xl px-4 py-3.5 text-sm text-white placeholder-[var(--ink-dim)] focus:outline-none transition-all duration-200 font-medium"
    + " bg-white/[0.04] border border-white/[0.10] focus:border-brand-purple/50 focus:bg-white/[0.06]";
  const labelClass = "block text-[11px] font-semibold text-ink-muted mb-2 uppercase tracking-[0.08em] font-heading";

  return (
    <section ref={sectionRef} className="relative py-20 md:py-36 [overflow-x:clip]" id="contact" style={{ background: 'transparent' }}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* CTA Banner */}
        <div className="reveal mb-12 md:mb-16 gradient-border-wrap">
          <div className="glass-card rounded-[20px] p-8 sm:p-12 text-center" style={{ background: 'var(--bg-elev)' }}>
            <div className="relative z-10">
              <h2 className="font-heading font-bold leading-tight tracking-tight mb-4" style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)' }}>
                <span className="text-white">Ready to Build Ads That </span>
                <span style={{ color: 'var(--ink)' }}>Actually Convert?</span>
              </h2>
              <p className="text-ink-body text-sm sm:text-lg max-w-lg mx-auto leading-relaxed">
                For enterprise deals, custom briefs, partnership inquiries, or anything else — reach out here. Free creative requests are handled inside your dashboard after signing up.
              </p>
            </div>
          </div>
        </div>

        <div className="reveal-scale delay-200 glass-card rounded-3xl p-6 sm:p-10 lg:p-12">
          <form onSubmit={handleSubmit} className="relative z-10">
            <div className="grid sm:grid-cols-2 gap-4 sm:gap-5">
              <div>
                <label className={labelClass}>Full Name <span className="text-brand-purple">*</span></label>
                <input type="text" name="fullName" value={form.fullName} onChange={handleChange} placeholder="John Smith" className={inputClass} />
              </div>

              <div>
                <label className={labelClass}>Company Name</label>
                <input type="text" name="company" value={form.company} onChange={handleChange} placeholder="Acme Inc." className={inputClass} />
              </div>

              <div>
                <label className={labelClass}>Email Address <span className="text-brand-purple">*</span></label>
                <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="john@company.com" className={inputClass} />
              </div>

              <div>
                <label className={labelClass}>Website</label>
                <input type="url" name="website" value={form.website} onChange={handleChange} placeholder="https://yourwebsite.com" className={inputClass} />
              </div>

              <div className="sm:col-span-2">
                <label className={labelClass}>Subject</label>
                <select
                  name="subject"
                  value={form.subject}
                  onChange={(e) => setForm(prev => ({ ...prev, subject: e.target.value }))}
                  className={inputClass}
                  style={{ appearance: 'none' }}
                >
                  <option value="" style={{ background: '#111' }}>Select a subject</option>
                  <option value="General Question" style={{ background: '#111' }}>General Question</option>
                  <option value="Custom Project" style={{ background: '#111' }}>Custom Project</option>
                  <option value="Partnership" style={{ background: '#111' }}>Partnership</option>
                  <option value="Enterprise" style={{ background: '#111' }}>Enterprise</option>
                  <option value="Other" style={{ background: '#111' }}>Other</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className={labelClass}>Tell Us About Your Brand <span className="text-brand-purple">*</span></label>
                <textarea
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  rows={5}
                  placeholder="What do you sell? Who's your audience? What have you tried? What do you need?"
                  className={`${inputClass} resize-none`}
                />
              </div>

              {status === 'error' && (
                <div className="sm:col-span-2 flex items-center gap-3 bg-red-500/[0.05] border border-red-500/20 rounded-xl p-4">
                  <AlertCircle size={15} className="text-red-400 flex-shrink-0" />
                  <span className="text-red-300 text-sm">{errorMsg}</span>
                </div>
              )}

              <div className="sm:col-span-2">
                {status === 'success' ? (
                  <div className="flex items-center justify-center gap-3 py-4 rounded-2xl border border-brand-cyan/20 bg-brand-cyan/5">
                    <CheckCircle size={18} className="text-brand-cyan" />
                    <div>
                      <div className="text-white font-semibold font-heading text-sm">Message Received!</div>
                      <div className="text-ink-muted text-xs mt-0.5">We'll be in touch within 24 hours.</div>
                    </div>
                  </div>
                ) : (
                  <button
                    type="submit"
                    disabled={status === 'loading'}
                    className="btn-primary w-full justify-center text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {status === 'loading' ? (
                      <Loader size={15} className="animate-spin" />
                    ) : (
                      <Send size={14} />
                    )}
                    {status === 'loading' ? 'Sending...' : 'Send Inquiry'}
                    {status !== 'loading' && <ArrowRight size={14} />}
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>

        <p className="reveal delay-400 text-center text-ink-dim text-sm mt-7">
          Prefer email?{' '}
          <a href="mailto:inquiry@clout-kart.com" className="text-ink-muted hover:text-white transition-colors underline underline-offset-2">
            inquiry@clout-kart.com
          </a>
        </p>
      </div>
    </section>
  );
}
