import type { Testimonial } from '../../types/testimonial';

interface Props {
  testimonials: Testimonial[];
}

export default function TestimonialGrid({ testimonials }: Props) {
  if (testimonials.length === 0) return null;

  return (
    <section className="sec bg3" id="testimonials">
      <div className="wrap">
        <span className="eyebrow">Early Readers</span>
        <h2 className="section-title">What students are saying</h2>
        <div className="testi-layout fade">
          {testimonials.map((t) => (
            <div key={t.id} className="testi-item">
              <p className="testi-text">"{t.text}"</p>
              <div className="testi-author">
                <div className="testi-av">{t.initials}</div>
                <div>
                  <div className="testi-name">{t.name}</div>
                  <div className="testi-role">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
