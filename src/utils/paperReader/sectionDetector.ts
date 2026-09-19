// ──────────────────────────────────────────────────────────
// Section Detector — detects academic paper sections from raw text
// ──────────────────────────────────────────────────────────
import type { PaperSection, SectionType } from '../../types/paperReader';

/** Known section heading patterns (case-insensitive match after trimming) */
const SECTION_PATTERNS: { pattern: RegExp; type: SectionType }[] = [
  { pattern: /^abstract$/i, type: 'abstract' },
  { pattern: /^(?:\d+\.?\s*)?introduction$/i, type: 'introduction' },
  { pattern: /^(?:\d+\.?\s*)?(?:materials?\s*(?:and|&)\s*)?methods?$/i, type: 'methods' },
  { pattern: /^(?:\d+\.?\s*)?experimental\s*(?:procedure|setup|methods?|details?)?$/i, type: 'methods' },
  { pattern: /^(?:\d+\.?\s*)?methodology$/i, type: 'methods' },
  { pattern: /^(?:\d+\.?\s*)?results?$/i, type: 'results' },
  { pattern: /^(?:\d+\.?\s*)?results?\s*(?:and|&)\s*discussion$/i, type: 'results' },
  { pattern: /^(?:\d+\.?\s*)?discussion$/i, type: 'discussion' },
  { pattern: /^(?:\d+\.?\s*)?conclusions?$/i, type: 'conclusion' },
  { pattern: /^(?:\d+\.?\s*)?summary$/i, type: 'conclusion' },
  { pattern: /^(?:\d+\.?\s*)?(?:summary\s*(?:and|&)\s*)?conclusions?$/i, type: 'conclusion' },
  { pattern: /^references?$/i, type: 'references' },
  { pattern: /^bibliography$/i, type: 'references' },
  { pattern: /^works?\s*cited$/i, type: 'references' },
  { pattern: /^acknowledgm?ents?$/i, type: 'other' },
  { pattern: /^(?:appendix|appendices)/i, type: 'other' },
  { pattern: /^(?:supplementary|supporting)\s*(?:information|materials?|data)/i, type: 'other' },
];

/** Detects if a line is a section heading */
function isHeading(line: string): { isHeading: boolean; level: number; type: SectionType } {
  const trimmed = line.trim();
  if (!trimmed || trimmed.length > 120) {
    return { isHeading: false, level: 0, type: 'other' };
  }

  // Check known patterns
  for (const sp of SECTION_PATTERNS) {
    if (sp.pattern.test(trimmed)) {
      return { isHeading: true, level: 1, type: sp.type };
    }
  }

  // Numbered heading: "1.", "2.1", "3.2.1" followed by text
  const numberedMatch = trimmed.match(/^(\d+(?:\.\d+)*)\.\s+(.+)$/);
  if (numberedMatch) {
    const depthLevel = numberedMatch[1].split('.').length;
    const headingText = numberedMatch[2].trim();
    // Headings are typically shorter than 80 chars and don't end with a period
    if (headingText.length < 80 && !headingText.endsWith('.')) {
      // Try to classify the heading text
      let type: SectionType = 'other';
      for (const sp of SECTION_PATTERNS) {
        if (sp.pattern.test(headingText)) {
          type = sp.type;
          break;
        }
      }
      return { isHeading: true, level: depthLevel, type };
    }
  }

  // ALL CAPS heading (at least 3 characters, no lowercase)
  if (
    trimmed.length >= 3 &&
    trimmed.length < 80 &&
    trimmed === trimmed.toUpperCase() &&
    /[A-Z]/.test(trimmed) &&
    !trimmed.endsWith('.') &&
    !/\d{3,}/.test(trimmed) // not a number-heavy line
  ) {
    let type: SectionType = 'other';
    for (const sp of SECTION_PATTERNS) {
      if (sp.pattern.test(trimmed)) {
        type = sp.type;
        break;
      }
    }
    return { isHeading: true, level: 1, type };
  }

  return { isHeading: false, level: 0, type: 'other' };
}

/** Generate a slug from a section title */
function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 60);
}

/** Split raw text into sections with detected types */
export function detectSections(text: string): PaperSection[] {
  const lines = text.split('\n');
  const sections: PaperSection[] = [];

  let currentLines: string[] = [];
  let currentTitle = 'Untitled Section';
  let currentLevel = 1;
  let currentType: SectionType = 'other';
  let sectionIndex = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const headingInfo = isHeading(line);

    if (headingInfo.isHeading) {
      // Save previous section if it has content
      if (currentLines.length > 0) {
        const contentText = currentLines.join('\n').trim();
        if (contentText.length > 0) {
          sections.push({
            id: `sec-${sectionIndex}-${slugify(currentTitle)}`,
            title: currentTitle,
            level: currentLevel,
            paragraphs: [], // filled by paragraph segmentation later
          });
          sectionIndex++;
        }
      }

      currentTitle = line.trim();
      currentLevel = headingInfo.level;
      currentType = headingInfo.type;
      currentLines = [];
    } else {
      currentLines.push(line);
    }
  }

  // Push final section
  if (currentLines.length > 0) {
    const contentText = currentLines.join('\n').trim();
    if (contentText.length > 0) {
      sections.push({
        id: `sec-${sectionIndex}-${slugify(currentTitle)}`,
        title: currentTitle,
        level: currentLevel,
        paragraphs: [],
      });
    }
  }

  // If no sections detected, treat entire text as one section
  if (sections.length === 0) {
    sections.push({
      id: 'sec-0-full-paper',
      title: 'Full Paper',
      level: 1,
      paragraphs: [],
    });
  }

  // Attach raw text lines to sections for later paragraph segmentation
  // We re-split to pair content with sections
  return attachContentToSections(text, sections);
}

/** Re-walk the text and pair content lines with their sections */
function attachContentToSections(text: string, sections: PaperSection[]): PaperSection[] {
  const lines = text.split('\n');
  let sectionIdx = 0;
  let contentLines: string[] = [];
  let inFirstSection = true;

  for (const line of lines) {
    const headingInfo = isHeading(line);

    if (headingInfo.isHeading) {
      if (sectionIdx < sections.length && !inFirstSection) {
        sections[sectionIdx].paragraphs = splitIntoParagraphs(
          contentLines.join('\n'),
          sections[sectionIdx].id
        );
        sectionIdx++;
      }
      inFirstSection = false;
      contentLines = [];
    } else {
      contentLines.push(line);
    }
  }

  // Assign remaining content to the last (or first) section
  if (sectionIdx < sections.length) {
    sections[sectionIdx].paragraphs = splitIntoParagraphs(
      contentLines.join('\n'),
      sections[sectionIdx].id
    );
  }

  // Handle the case where all text ended up in one section without headings
  if (sections.length === 1 && sections[0].paragraphs.length === 0) {
    sections[0].paragraphs = splitIntoParagraphs(text, sections[0].id);
  }

  return sections;
}

/** Split text into paragraphs based on blank lines */
function splitIntoParagraphs(text: string, sectionId: string): { id: string; sentences: [] }[] {
  const blocks = text.split(/\n\s*\n/);
  const paragraphs: { id: string; sentences: [] }[] = [];

  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i].trim();
    if (block.length > 0) {
      paragraphs.push({
        id: `${sectionId}-p${i}`,
        sentences: [], // filled by sentence segmenter later
      });
    }
  }

  return paragraphs;
}

/** Classify a section title into a SectionType */
export function classifySectionType(title: string): SectionType {
  const trimmed = title.trim();
  for (const sp of SECTION_PATTERNS) {
    if (sp.pattern.test(trimmed)) {
      return sp.type;
    }
  }
  // Also check just the text portion of numbered headings
  const numberedMatch = trimmed.match(/^(\d+(?:\.\d+)*)\.\s+(.+)$/);
  if (numberedMatch) {
    for (const sp of SECTION_PATTERNS) {
      if (sp.pattern.test(numberedMatch[2].trim())) {
        return sp.type;
      }
    }
  }
  return 'other';
}

/** Get the raw text content for a section by re-parsing (utility) */
export function getSectionRawText(fullText: string, sectionIndex: number): string {
  const lines = fullText.split('\n');
  const sectionStarts: number[] = [];

  for (let i = 0; i < lines.length; i++) {
    if (isHeading(lines[i]).isHeading) {
      sectionStarts.push(i);
    }
  }

  if (sectionStarts.length === 0) return fullText;

  const start = sectionStarts[sectionIndex];
  const end = sectionIndex + 1 < sectionStarts.length
    ? sectionStarts[sectionIndex + 1]
    : lines.length;

  // Skip the heading line itself
  return lines.slice(start + 1, end).join('\n').trim();
}
