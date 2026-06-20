const fs = require('fs');

const htmlContent = fs.readFileSync('C:/Research-website-book/research-main/index.html', 'utf8');

// Extract CSS
const styleMatch = htmlContent.match(/<style>([\s\S]*?)<\/style>/);
let cssContent = styleMatch ? styleMatch[1] : '';

// Simple manual prefixing for CSS
const prefixedCss = cssContent.split('\n').map(line => {
    line = line.trim();
    if (!line || line.startsWith('/*') || line.startsWith('@')) return line;
    // VERY simple parser for standard CSS rules like .class { ... }
    if (line.includes('{')) {
        let parts = line.split('{');
        let selectors = parts[0].split(',').map(s => {
            s = s.trim();
            if (s === ':root' || s === 'body' || s === 'html' || s === '*' || s === '*,*::before,*::after') {
                return '.rm-page';
            }
            if (s.startsWith('.') || s.startsWith('#') || s.match(/^[a-zA-Z]/)) {
                return '.rm-page ' + s;
            }
            return s;
        });
        return selectors.join(', ') + ' {' + parts[1];
    }
    return line;
}).join('\n');

fs.writeFileSync('d:/app/APP/src/pages/ResearchMain.css', prefixedCss);

// Extract HTML body
const bodyMatch = htmlContent.match(/<body>([\s\S]*?)<script>/);
let bodyContent = bodyMatch ? bodyMatch[1] : '';

// Remove massive image string
bodyContent = bodyContent.replace(/src="data:image\/jpeg;base64[^"]+"/, 'src="/qr.jpeg"');

// Convert HTML to JSX
bodyContent = bodyContent.replace(/class=/g, 'className=');
bodyContent = bodyContent.replace(/for=/g, 'htmlFor=');
bodyContent = bodyContent.replace(/onclick="([^"]+)"/g, ''); // Will handle manually
bodyContent = bodyContent.replace(/<!--[\s\S]*?-->/g, ''); // Remove comments
bodyContent = bodyContent.replace(/<br>/g, '<br />'); // Self closing tags
bodyContent = bodyContent.replace(/<img([^>]*[^/])>/g, '<img$1 />'); // Self closing img
bodyContent = bodyContent.replace(/&middot;/g, '{"\\u00B7"}');
bodyContent = bodyContent.replace(/&nbsp;/g, ' ');
bodyContent = bodyContent.replace(/&rarr;/g, '{"\\u2192"}');
bodyContent = bodyContent.replace(/&#8377;/g, '{"\\u20B9"}');

const tsxContent = `import React, { useState } from 'react';
import './ResearchMain.css';

export default function ResearchMain() {
  const [copied, setCopied] = useState(false);

  const openUPI = () => {
    window.location.href = 'upi://pay?pa=krishnazindahai@okhdfcbank&pn=KrishnaMahawar&am=149&cu=INR';
    setTimeout(() => {
      const ok = window.confirm('UPI app not opening?\\n\\nCopy the UPI ID:\\nkrishnazindahai@okhdfcbank\\n\\nClick OK to copy.');
      if (ok) { navigator.clipboard && navigator.clipboard.writeText('krishnazindahai@okhdfcbank'); }
    }, 1500);
  };

  const copyUPI = () => {
    const upi = 'krishnazindahai@okhdfcbank';
    if (navigator.clipboard) {
      navigator.clipboard.writeText(upi).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  };

  const scrollToPayment = () => {
    document.getElementById('payment')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="rm-page">
      ${bodyContent.replace(/onclick="[^"]+"/g, '')}
    </div>
  );
}
`;

// Also fix the hardcoded onclicks
let finalTsx = tsxContent.replace(/<button className="btn-cta"[^>]*>/g, '<button className="btn-cta" onClick={scrollToPayment}>');
finalTsx = finalTsx.replace(/<button className="btn-copy"[^>]*>Copy<\/button>/g, '<button className={`btn-copy \${copied ? "copied" : ""}`} onClick={copyUPI}>{copied ? "Copied!" : "Copy"}</button>');
finalTsx = finalTsx.replace(/<button className="btn-upi"[^>]*>/g, '<button className="btn-upi" onClick={openUPI}>');

fs.writeFileSync('d:/app/APP/src/pages/ResearchMain.tsx', finalTsx);

console.log("Done generating ResearchMain files!");
