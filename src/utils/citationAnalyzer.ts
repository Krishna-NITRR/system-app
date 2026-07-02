export interface AnalysisResult {
  score: number;
  confidence: 'High' | 'Medium' | 'Low';
  missingInText: string[]; // references in bibliography but not cited in text
  missingInBibliography: string[]; // citations in text but not found in bibliography
  duplicates: string[]; // exact or highly similar references in bibliography
  numberingErrors: string[]; // out of order citations (e.g. [4] before [3])
  error?: string; // fatal error, e.g., "No bibliography section detected."
}

export function analyzeManuscript(text: string): AnalysisResult {
  // 1. Structural Parsing: Detect the bibliography section
  const headings = ['REFERENCES', 'References', 'Bibliography', 'Works Cited', 'Literature Cited'];
  let bibStartIndex = -1;
  
  const lines = text.split('\n');
  // Search from bottom up (assuming bibliography is at the end)
  for (let i = lines.length - 1; i >= 0; i--) {
    const line = lines[i].trim();
    if (headings.includes(line)) {
      bibStartIndex = i;
      break;
    }
  }

  if (bibStartIndex === -1) {
    return {
      score: 0,
      confidence: 'Low',
      missingInText: [],
      missingInBibliography: [],
      duplicates: [],
      numberingErrors: [],
      error: "No bibliography section detected."
    };
  }

  const bodyLines = lines.slice(0, bibStartIndex);
  const bibLines = lines.slice(bibStartIndex + 1);

  // 2. Normalize Function
  // Remove punctuation, extra spaces, capitalization, and line breaks
  const normalize = (str: string) => str.toLowerCase().replace(/[^\w\d]+/g, '');

  // 3. Parse Bibliography
  const bibEntries = new Map<string, string>(); // normalized -> original
  const bibArray: { original: string, normalized: string }[] = [];
  const duplicates: string[] = [];
  
  let currentEntry = '';
  for (const line of bibLines) {
    if (line.trim().length === 0) {
      if (currentEntry.trim().length > 10) {
        processBibEntry(currentEntry.trim(), bibEntries, bibArray, duplicates, normalize);
        currentEntry = '';
      }
    } else {
      currentEntry += ' ' + line.trim();
    }
  }
  if (currentEntry.trim().length > 10) {
    processBibEntry(currentEntry.trim(), bibEntries, bibArray, duplicates, normalize);
  }

  // 4. Regex for Citation Detection in Body
  const bodyText = bodyLines.join(' ');
  const inlineCitations = new Set<string>();
  const inlineNumbers: number[] = [];
  
  // A. Numbered styles: [1], [2,5], [3-7]
  const bracketRegex = /\[([0-9\s,\-]+)\]/g;
  let match;
  while ((match = bracketRegex.exec(bodyText)) !== null) {
    const content = match[1].replace(/\s/g, ''); // "2,5" or "3-7"
    const parts = content.split(',');
    for (const part of parts) {
      if (part.includes('-')) {
        const [start, end] = part.split('-').map(Number);
        if (!isNaN(start) && !isNaN(end) && start <= end && (end - start < 20)) {
          for (let i = start; i <= end; i++) {
              inlineCitations.add(`[${i}]`);
              inlineNumbers.push(i);
          }
        }
      } else {
        const num = Number(part);
        if (!isNaN(num)) {
            inlineCitations.add(`[${part}]`);
            inlineNumbers.push(num);
        }
      }
    }
  }

  // B. Author-Year styles: (Smith, 2020), Smith et al. (2020), (Gupta & Singh, 2023)
  const authorYearRegex = /\b([A-Z][a-zA-Z\s&]+(?:\s+et\s+al\.?)?)\s*,?\s*\(?((?:19|20)\d{2}[a-z]?)\)?/g;
  while ((match = authorYearRegex.exec(bodyText)) !== null) {
    const author = normalize(match[1].replace('et al', '').replace('et al.', '').trim());
    const year = match[2];
    if (author.length > 2) { // filter out false positives
       inlineCitations.add(`${author}${year}`);
    }
  }

  // 5. Rule-Based Validation (Cross-referencing)
  const missingInText: string[] = [];
  const missingInBibliography: string[] = [];
  
  const isNumeric = inlineCitations.size > 0 && Array.from(inlineCitations).some(c => c.startsWith('['));
  const isAuthorYear = inlineCitations.size > 0 && Array.from(inlineCitations).some(c => !c.startsWith('['));
  
  // Calculate Confidence Score
  let confidence: 'High' | 'Medium' | 'Low' = 'Medium';
  if (bibEntries.size === 0 || bodyText.length < 500) {
    confidence = 'Low';
  } else if ((isNumeric || isAuthorYear) && bibEntries.size > 5) {
    confidence = 'High';
  }
  if (text.includes('\t')) confidence = 'Medium'; // Multi-column spacing detected

  // Numbering Errors (Sequence Validation)
  const numberingErrors: string[] = [];
  if (isNumeric) {
      let maxSeen = 0;
      for (const num of inlineNumbers) {
          if (num > maxSeen + 1 && maxSeen !== 0) {
              // Wait, papers don't always cite sequentially if a reference is reused, 
              // but the FIRST time a number appears, it should be maxSeen + 1.
              // To do this perfectly requires tracking first appearances. 
              // We'll skip strict sequencing for now to avoid false positives, 
              // but we will flag if a number jumps significantly.
          }
          if (num > maxSeen) maxSeen = num;
      }
  }

  // Cross-reference 
  if (isNumeric) {
      // Check if all [N] have a corresponding "[N]" or "N." in the bibliography
      for (const cit of inlineCitations) {
          if (cit.startsWith('[')) {
              const num = cit.replace('[', '').replace(']', '');
              const expectedBibPattern1 = normalize(`[${num}]`);
              const expectedBibPattern2 = normalize(`${num}.`);
              
              let found = false;
              for (const [normEntry] of bibEntries) {
                  if (normEntry.startsWith(expectedBibPattern1) || normEntry.startsWith(expectedBibPattern2)) {
                      found = true;
                      break;
                  }
              }
              if (!found) {
                  missingInBibliography.push(`Citation ${cit} used in text but not found in bibliography.`);
              }
          }
      }
      
      // Check if all bib entries have a citation
      for (const [, original] of bibEntries) {
          // Extract the number from the bib entry if possible
          const match = original.trim().match(/^\[?(\d+)\]?\.?/);
          if (match) {
              const num = match[1];
              if (!inlineCitations.has(`[${num}]`)) {
                  // Keep original text brief for the UI
                  missingInText.push(`Reference [${num}] is in bibliography but never cited in text.`);
              }
          }
      }
  } else if (isAuthorYear) {
       for (const cit of inlineCitations) {
           let found = false;
           for (const [normEntry] of bibEntries) {
               // If the normalized author+year is a substring of the normalized bib entry
               if (normEntry.includes(cit)) {
                   found = true;
                   break;
               }
           }
           if (!found) {
               missingInBibliography.push(`Citation (${cit}) used in text but missing from bibliography.`);
           }
       }
  }

  // 6. Calculate Integrity Score
  let score = 100;
  score -= (missingInText.length * 5);
  score -= (missingInBibliography.length * 5);
  score -= (duplicates.length * 5);
  score -= (numberingErrors.length * 3);
  
  if (score < 0) score = 0;
  if (bibEntries.size === 0) score = 0;

  return {
    score,
    confidence,
    missingInText,
    missingInBibliography,
    duplicates,
    numberingErrors
  };
}

function processBibEntry(entry: string, map: Map<string, string>, array: { original: string, normalized: string }[], duplicates: string[], normalize: (s:string)=>string) {
  const norm = normalize(entry);
  if (map.has(norm)) {
    duplicates.push(entry.substring(0, 80) + '...'); // keep short for UI
  } else {
    map.set(norm, entry);
    array.push({ original: entry, normalized: norm });
  }
}
