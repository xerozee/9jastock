'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Mail, 
  Send, 
  User, 
  MessageSquare,
  HelpCircle,
  Twitter,
  Instagram,
  Linkedin,
  CheckCircle
} from 'lucide-react';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const subjectOptions = [
    'General Inquiry',
    'Technical Support',
    'Billing & Subscription',
    'Feature Request',
    'Bug Report',
    'Partnership Opportunity',
    'Press & Media',
    'Other'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300 mb-8 transition-colors"
        >
          <ArrowLeft size={18} />
          Back to Home
        </Link>
        
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Get in Touch</h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            Have questions about 9jaStock? We&apos;d love to hear from you. Send us a message and we&apos;ll respond as soon as possible.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            {submitted ? (
              <div className="bg-slate-800/50 rounded-2xl p-8 border border-slate-700/50 text-center">
                <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-emerald-500/20 flex items-center justify-center">
                  <CheckCircle size={32} className="text-emerald-400" />
                </div>
                <h2 className="text-2xl font-bold mb-4">Message Sent!</h2>
                <p className="text-slate-400 mb-6">
                  Thank you for reaching out. We&apos;ll get back to you within 24-48 hours.
                </p>
                <button
                  onClick={() => {
                    setSubmitted(false);
                    setFormData({ name: '', email: '', subject: '', message: '' });
                  }}
                  className="px-6 py-3 bg-emerald-500/20 text-emerald-400 rounded-xl hover:bg-emerald-500/30 transition-colors"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="bg-slate-800/50 rounded-2xl p-8 border border-slate-700/50">
                <div className="space-y-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-2">
                      Your Name
                    </label>
                    <div className="relative">
                      <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        placeholder="Enter your name"
                        className="w-full pl-12 pr-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        placeholder="you@example.com"
                        className="w-full pl-12 pr-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-slate-300 mb-2">
                      Subject
                    </label>
                    <div className="relative">
                      <MessageSquare size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                      <select
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        required
                        className="w-full pl-12 pr-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors appearance-none cursor-pointer"
                      >
                        <option value="" disabled>Select a subject</option>
                        {subjectOptions.map(option => (
                          <option key={option} value={option} className="bg-slate-800">
                            {option}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-slate-300 mb-2">
                      Message
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows={5}
                      placeholder="How can we help you?"
                      className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-semibold rounded-xl transition-all hover:scale-[1.02] shadow-lg shadow-emerald-500/25"
                  >
                    <Send size={18} />
                    Send Message
                  </button>
                </div>
              </form>
            )}
          </div>

          <div className="space-y-6">
            <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center mb-4">
                <Mail size={24} className="text-emerald-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Email Us</h3>
              <a 
                href="mailto:support@9jastock.com" 
                className="text-emerald-400 hover:text-emerald-300 transition-colors"
              >
                support@9jastock.com
              </a>
            </div>

            <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50">
              <div className="w-12 h-12 rounded-xl bg-[#FCD116]/20 flex items-center justify-center mb-4">
                <HelpCircle size={24} className="text-[#FCD116]" />
              </div>
              <h3 className="text-lg font-semibold mb-2">FAQs</h3>
              <p className="text-slate-400 text-sm mb-3">
                Find answers to common questions.
              </p>
              <Link 
                href="/#faqs" 
                className="text-[#FCD116] hover:text-[#fde047] transition-colors text-sm"
              >
                View FAQs →
              </Link>
            </div>

            <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50">
              <h3 className="text-lg font-semibold mb-4">Follow Us</h3>
              <div className="flex gap-3">
                <a 
                  href="#" 
                  className="w-10 h-10 rounded-xl bg-slate-700/50 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
                  aria-label="Twitter"
                >
                  <Twitter size={18} />
                </a>
                <a 
                  href="#" 
                  className="w-10 h-10 rounded-xl bg-slate-700/50 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
                  aria-label="Instagram"
                >
                  <Instagram size={18} />
                </a>
                <a 
                  href="#" 
                  className="w-10 h-10 rounded-xl bg-slate-700/50 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
                  aria-label="LinkedIn"
                >
                  <Linkedin size={18} />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
