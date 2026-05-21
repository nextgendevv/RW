const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'client', 'src', 'App.css');
let content = fs.readFileSync(filePath, 'utf8');

// Match the spaced out . p l a n - i t e m block at the bottom of the file
const badBlockPattern = /\/\s*\*\s*P\s*l\s*a\s*n\s*O\s*f\s*f\s*e\s*r\s*S\s*t\s*y\s*l\s*e\s*s\s*\*\s*\/\s*\.\s*p\s*l\s*a\s*n\s*-\s*i\s*t\s*e\s*m[\s\S]+$/;

const cleanReplacement = `/* Plan Offer Styles */
.plan-item {
    position: relative;
}

.plan-offer-badge {
    position: absolute;
    top: -12px;
    right: -12px;
    background: linear-gradient(135deg, #1DB954 0%, #15803d 100%);
    color: white;
    padding: 4px 10px;
    border-radius: 20px;
    font-size: 0.75rem;
    font-weight: 800;
    box-shadow: 0 4px 10px rgba(29, 185, 84, 0.3);
    z-index: 10;
    animation: pulse-badge 2s infinite;
}

@keyframes pulse-badge {
    0% { transform: scale(1); }
    50% { transform: scale(1.05); }
    100% { transform: scale(1); }
}

.plan-price-group {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
}

.original-price {
    font-size: 0.9rem;
    color: var(--text-dim);
    text-decoration: line-through;
    opacity: 0.7;
}

.plan-price {
    font-size: 1.8rem;
    font-weight: 800;
    color: var(--text-main);
}`;

if (badBlockPattern.test(content)) {
  console.log("Found malformed CSS block! Replacing...");
  content = content.replace(badBlockPattern, cleanReplacement);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log("Success! App.css has been cleaned up.");
} else {
  console.log("Malformed block not found! Let's double check content.");
}
