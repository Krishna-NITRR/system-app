import type { ProductOverview as ProductOverviewType } from '../../types/product';

interface Props {
  overview: ProductOverviewType;
}

export default function ProductOverview({ overview }: Props) {
  return (
    <section className="sec">
      <div className="wrap text-center fade" style={{ textAlign: 'center' }}>
        <span className="eyebrow">{overview.eyebrow}</span>
        <h2 className="section-title">{overview.title}</h2>
        <p className="section-sub" style={{ margin: '0 auto' }}>{overview.description}</p>
      </div>
    </section>
  );
}
