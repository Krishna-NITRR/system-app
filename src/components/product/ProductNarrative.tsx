interface Props {
  narrative: string;
}

export default function ProductNarrative({ narrative }: Props) {
  return (
    <section className="sec bg2">
      <div className="wrap">
        <div className="story-grid fade">
          <div className="story-text" style={{ maxWidth: '800px', margin: '0 auto' }}>
            <span className="eyebrow">The Origin</span>
            <p style={{ fontSize: '1.05rem', color: 'var(--tm)', lineHeight: 1.8 }}>
              {narrative}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
