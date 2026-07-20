import type { ProductFaq } from '../../types/product';

interface Props {
  faq: ProductFaq[];
}

export default function ProductFAQ({ faq }: Props) {
  return (
    <section className="sec bg2" id="faq">
      <div className="wrap">
        <div className="text-center fade" style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h2 className="section-title">Frequently Asked Questions</h2>
        </div>
        <div className="product-faq fade" style={{ maxWidth: '800px', margin: '0 auto' }}>
          {faq.map((item, idx) => (
            <details key={idx}>
              <summary>{item.question}</summary>
              <div className="faq-answer">{item.answer}</div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
