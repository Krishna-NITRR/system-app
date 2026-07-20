import type { ProductChapter } from '../../types/product';

interface Props {
  chapters: ProductChapter[];
}

export default function ProductChapters({ chapters }: Props) {
  return (
    <section className="sec bg2" id="chapters">
      <div className="wrap fade" style={{ maxWidth: '800px', margin: '0 auto' }}>
        <ul className="ch-list">
          {chapters.map((ch, idx) => (
            <li key={idx} className="ch-item">
              <span className="ch-num">{ch.number}</span>
              <div>
                <div className="ch-title">{ch.title}</div>
                <div className="ch-desc">{ch.description}</div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
