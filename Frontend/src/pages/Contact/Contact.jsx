import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { sendMessage, resetSent } from '../../redux/slices/messagesSlice';
import { Mail, Send, Phone, MapPin } from 'lucide-react';
import { trackContactSubmission, trackSocialClick } from '../../services/analytics';
import './Contact.css';

const CONTACT_INFO = [
  { icon: <Mail size={20} />, label: 'Email', value: 'teshelin7@gmail.com', href: 'mailto:teshelin7@gmail.com', track: () => trackSocialClick('email') },
  { icon: <Phone size={20} />, label: 'Phone', value: '+251988044439', href: null },
  { icon: <MapPin size={20} />, label: 'Location', value: 'Bahir Dar, Ethiopia', href: null },
];

const initialForm = { name: '', email: '', subject: '', message: '' };

function Contact() {
  const dispatch = useDispatch();
  const { loading, sent, error } = useSelector((s) => s.messages);
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (sent) {
      toast.success('Thank you for contacting me! I\'ll get back to you soon.');
      setForm(initialForm);
      dispatch(resetSent());
    }
  }, [sent, dispatch]);

  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  const validate = () => {
    const e = {};
    if (!form.name.trim())    e.name    = 'Name is required';
    if (!form.email.trim())   e.email   = 'Email is required';
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = 'Invalid email address';
    if (!form.subject.trim()) e.subject = 'Subject is required';
    if (!form.message.trim()) e.message = 'Message is required';
    return e;
  };

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    if (errors[e.target.name]) setErrors((err) => ({ ...err, [e.target.name]: '' }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const e_ = validate();
    if (Object.keys(e_).length > 0) { setErrors(e_); return; }
    dispatch(sendMessage(form));
    trackContactSubmission();
  };

  return (
    <section className="contact section" id="contact">
      <div className="container">
        <div className="section-header animate-fadeInUp">
          <h2 className="section-title">
            Get In <span>Touch</span>
          </h2>
          <p className="section-desc">
            Have a project in mind or want to collaborate? I'd love to hear from you.
          </p>
        </div>

        <div className="contact__grid">
          <div className="contact__info animate-fadeInUp">
            <h3 className="contact__info-title">Let's Work Together</h3>
            <p className="contact__info-text">
              I'm currently open to new opportunities — whether it's a full-time role, freelance project, or just a friendly chat about tech.
            </p>

            <div className="contact__cards">
              {CONTACT_INFO.map((c) =>
                c.href ? (
                  <a key={c.label} href={c.href} target="_blank" rel="noopener noreferrer" className="contact__card" onClick={c.track}>
                    <div className="contact__card-icon">{c.icon}</div>
                    <div>
                      <div className="contact__card-label">{c.label}</div>
                      <div className="contact__card-value">{c.value}</div>
                    </div>
                  </a>
                ) : (
                  <div key={c.label} className="contact__card">
                    <div className="contact__card-icon">{c.icon}</div>
                    <div>
                      <div className="contact__card-label">{c.label}</div>
                      <div className="contact__card-value">{c.value}</div>
                    </div>
                  </div>
                )
              )}
            </div>


          </div>

          <div className="contact__form-col animate-fadeInUp delay-100">
            <form className="contact__form" onSubmit={handleSubmit} noValidate id="contact-form">
              <div className="contact__form-row">
                <div className="form-group">
                  <label htmlFor="contact-name" className="form-label">Your Name</label>
                  <input id="contact-name" name="name" type="text" placeholder="Teshome Bizuayehu"
                    className={`form-input${errors.name ? ' form-input--error' : ''}`}
                    value={form.name} onChange={handleChange} autoComplete="name" />
                  {errors.name && <span className="contact__error">{errors.name}</span>}
                </div>
                <div className="form-group">
                  <label htmlFor="contact-email" className="form-label">Email Address</label>
                  <input id="contact-email" name="email" type="email" placeholder="you@example.com"
                    className={`form-input${errors.email ? ' form-input--error' : ''}`}
                    value={form.email} onChange={handleChange} autoComplete="email" />
                  {errors.email && <span className="contact__error">{errors.email}</span>}
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="contact-subject" className="form-label">Subject</label>
                <input id="contact-subject" name="subject" type="text" placeholder="Project collaboration / Job opportunity..."
                  className={`form-input${errors.subject ? ' form-input--error' : ''}`}
                  value={form.subject} onChange={handleChange} />
                {errors.subject && <span className="contact__error">{errors.subject}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="contact-message" className="form-label">Message</label>
                <textarea id="contact-message" name="message" placeholder="Tell me about your project or opportunity..."
                  className={`form-textarea${errors.message ? ' form-input--error' : ''}`}
                  value={form.message} onChange={handleChange} />
                {errors.message && <span className="contact__error">{errors.message}</span>}
              </div>

              <button type="submit" id="contact-submit" className="btn btn-primary contact__submit" disabled={loading}>
                {loading ? (
                  <><span className="contact__spinner" /> Sending...</>
                ) : (
                  <><Send size={16} /> Send Message</>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Contact;
