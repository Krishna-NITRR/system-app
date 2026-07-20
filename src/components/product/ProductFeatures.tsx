import type { ProductFeature } from '../../types/product';

interface Props {
  features: ProductFeature[];
}

export default function ProductFeatures({ features }: Props) {
  return (
    <section className="sec" id="features">
      <div className="wrap fade">
        <div className="playbooks-grid">
          {features.map((feat, idx) => (
            <div key={idx} className="feat-item playbook-card">
              <span className="feat-num" style={{ fontSize: '1rem', color: 'var(--purple)', marginBottom: '8px', display: 'block' }}>
                {feat.number}
              </span>
              <div>
                <div className="feat-title">{feat.title}</div>
                <div className="feat-desc">{feat.description}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
