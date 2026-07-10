import { useState, useEffect, useCallback, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import { fetchPublishedTestimonials } from '../../redux/slices/testimonialsSlice';
import './Testimonials.css';

function Testimonials() {
  const dispatch = useDispatch();
  const { items: testimonials, loading } = useSelector((s) => s.testimonials);
  const [active, setActive] = useState(0);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!testimonials.length) {
      dispatch(fetchPublishedTestimonials());
    }
  }, [dispatch, testimonials.length]);

  const startAutoPlay = useCallback(() => {
    stopAutoPlay();
    intervalRef.current = setInterval(() => {
      setActive((prev) => (prev + 1) % testimonials.length);
    }, 5000);
  }, [testimonials.length]);

  const stopAutoPlay = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
  }, []);

  useEffect(() => {
    if (testimonials.length > 1) startAutoPlay();
    return stopAutoPlay;
  }, [testimonials.length, startAutoPlay, stopAutoPlay]);

  useEffect(() => {
    if (active >= testimonials.length && testimonials.length > 0) {
      setActive(0);
    }
  }, [testimonials.length, active]);

  const goTo = (idx) => { setActive(idx); startAutoPlay(); };
  const goPrev = () => { setActive((prev) => (prev - 1 + testimonials.length) % testimonials.length); startAutoPlay(); };
  const goNext = () => { setActive((prev) => (prev + 1) % testimonials.length); startAutoPlay(); };

  if (loading && !testimonials.length) {
    return (
      <section className="testimonials section" id="testimonials">
        <div className="container">
          <div className="section-header animate-fadeInUp">
            <h2 className="section-title">What People Say</h2>
          </div>
          <div className="testimonials__loader">
            <div className="page-loader">
              <span className="page-loader__dot" />
              <span className="page-loader__dot" />
              <span className="page-loader__dot" />
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (!testimonials.length) return null;

  const t = testimonials[active];

  return (
    <section className="testimonials section" id="testimonials">
      <div className="container">
        <div className="section-header animate-fadeInUp">
          <h2 className="section-title">What People Say</h2>
        </div>

        <div className="testimonials__carousel animate-fadeInUp delay-100"
          onMouseEnter={stopAutoPlay} onMouseLeave={startAutoPlay}
          role="region" aria-label="Testimonials" aria-roledescription="carousel"
          aria-live="polite">
          <div className="testimonials__track" style={{ transform: `translateX(-${active * 100}%)` }}>
            {testimonials.map((item, idx) => (
              <div key={item._id} className="testimonials__slide"
                role="group" aria-roledescription="slide"
                aria-label={`Testimonial ${idx + 1} of ${testimonials.length}`}>
                <div className="testimonials__card">
                  <Quote className="testimonials__quote-icon" size={32} />
                  <p className="testimonials__message">&ldquo;{item.message}&rdquo;</p>
                  <div className="testimonials__rating">
                    {Array.from({ length: 5 }, (_, i) => (
                      <Star key={i} size={14} fill={i < item.rating ? 'var(--color-primary)' : 'none'}
                        stroke={i < item.rating ? 'var(--color-primary)' : 'var(--color-text-muted)'} />
                    ))}
                  </div>
                  <div className="testimonials__author">
                    {item.photo ? (
                      <img src={item.photo} alt={item.name} className="testimonials__photo" />
                    ) : (
                      <div className="testimonials__photo testimonials__photo--placeholder">
                        {item.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="testimonials__info">
                      <strong className="testimonials__name">{item.name}</strong>
                      <span className="testimonials__role">{item.role}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {testimonials.length > 1 && (
          <div className="testimonials__controls animate-fadeInUp delay-200">
            <button className="testimonials__arrow" onClick={goPrev} aria-label="Previous testimonial">
              <ChevronLeft size={20} />
            </button>
            <div className="testimonials__dots" role="tablist" aria-label="Testimonial navigation">
              {testimonials.map((_, idx) => (
                <button key={idx} role="tab" aria-selected={idx === active}
                  aria-label={`Go to testimonial ${idx + 1}`}
                  className={`testimonials__dot${idx === active ? ' testimonials__dot--active' : ''}`}
                  onClick={() => goTo(idx)} />
              ))}
            </div>
            <button className="testimonials__arrow" onClick={goNext} aria-label="Next testimonial">
              <ChevronRight size={20} />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

export default Testimonials;
