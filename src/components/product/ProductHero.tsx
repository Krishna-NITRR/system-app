import type { ProductHero as ProductHeroType } from '../../types/product';

interface Props {
  hero: ProductHeroType;
}

export default function ProductHero({ hero }: Props) {
  return (
    <section id="hero" className="product-hero">
      <div className="hero-inner">
        <div>
          <h1>{hero.headline}</h1>
          <p className="hero-sub">{hero.subheadline}</p>
          <div className="hero-cta-row">
            <a href="#pricing" className="btn btn-primary">{hero.cta}</a>
          </div>
        </div>
      </div>
    </section>
  );
}
