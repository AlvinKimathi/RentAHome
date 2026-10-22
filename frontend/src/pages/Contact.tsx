// frontend/src/pages/Contact.tsx
import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle2, GraduationCap } from 'lucide-react';

export const Contact: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
    setTimeout(() => {
      setName('');
      setEmail('');
      setPhone('');
      setMessage('');
      setIsSubmitted(false);
    }, 3500);
  };

  return (
    <div className="pt-28 md:pt-36 pb-24 bg-neutral-50 min-h-screen">
      <div className="max-w-[1280px] mx-auto px-4 md:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-block px-4 py-1.5 rounded-full bg-neutral-200/70 text-neutral-800 text-xs font-bold uppercase tracking-wider mb-3">
            Contact Support & Inquiries
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold text-neutral-950 tracking-tight">
            We are here to assist you.
          </h1>
          <p className="text-neutral-500 text-sm md:text-base mt-2">
            Have questions about listing a house, booking an inspection, or platform partnerships? Reach out directly.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 max-w-5xl mx-auto">
          {/* Contact Details Column */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-neutral-200 shadow-sm space-y-6">
              <h3 className="text-lg font-bold text-neutral-950 border-b border-neutral-100 pb-3">
                Headquarters
              </h3>

              <div className="flex items-start gap-3 text-xs text-neutral-600">
                <MapPin className="w-5 h-5 text-neutral-900 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-neutral-900 block">Nairobi Office</span>
                  <span>Thika Road, Nairobi, Kenya</span>
                </div>
              </div>

              <div className="flex items-center gap-3 text-xs text-neutral-600">
                <Mail className="w-5 h-5 text-neutral-900 flex-shrink-0" />
                <div>
                  <span className="font-bold text-neutral-900 block">Email Inquiries</span>
                  <span>support@rentahome.co.ke</span>
                </div>
              </div>

              <div className="flex items-center gap-3 text-xs text-neutral-600">
                <Phone className="w-5 h-5 text-neutral-900 flex-shrink-0" />
                <div>
                  <span className="font-bold text-neutral-900 block">Phone & WhatsApp</span>
                  <a href="https://wa.me/254718608582" target="_blank" rel="noopener noreferrer" className="hover:text-black hover:underline transition-colors">
                    +254 718 608582
                  </a>
                </div>
              </div>
            </div>

            {/* Support Promise Box */}
            <div className="bg-neutral-950 text-white rounded-3xl p-6 border border-neutral-800 space-y-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <h4 className="font-bold text-sm">Our Support Promise</h4>
              </div>
              <p className="text-xs text-neutral-400 leading-relaxed">
                We respond to all tenant and landlord viewing inquiries within 24 hours. Zero agent fees guaranteed on every verified property.
              </p>
            </div>
          </div>

          {/* Contact Form Column */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-3xl p-8 border border-neutral-200 shadow-md">
              <h3 className="text-xl font-bold text-neutral-950 mb-2">Send us a Message</h3>
              <p className="text-xs text-neutral-500 mb-6">
                Fill in the form below and we will respond to your inquiry promptly.
              </p>

              {isSubmitted ? (
                <div className="p-8 text-center bg-emerald-50 rounded-2xl border border-emerald-200">
                  <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto mb-3" />
                  <h4 className="text-lg font-bold text-emerald-950 mb-1">Message Received!</h4>
                  <p className="text-xs text-emerald-700">Thank you for contacting us. We will get back to you shortly.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                      Your Full Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. John Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-2xl text-xs font-medium focus:outline-none focus:border-neutral-900"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                        Email Address
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="john@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-2xl text-xs font-medium focus:outline-none focus:border-neutral-900"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="+254 7..."
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-2xl text-xs font-medium focus:outline-none focus:border-neutral-900"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                      Your Message or Inquiry
                    </label>
                    <textarea
                      rows={4}
                      required
                      placeholder="How can we assist you with vacant house listings or viewing appointments?"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-2xl text-xs font-medium focus:outline-none focus:border-neutral-900 resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-4 rounded-full bg-neutral-950 hover:bg-neutral-800 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-colors cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Message</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
