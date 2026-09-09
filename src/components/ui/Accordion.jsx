import React, { useState, useId } from 'react';
import { Plus, Minus } from 'lucide-react';

export const AccordionItem = ({
  question,
  answer,
  isOpen,
  onToggle,
  index,
}) => {
  const generatedId = useId();
  const headerId = `faq-header-${index !== undefined ? index : generatedId}`;
  const panelId = `faq-panel-${index !== undefined ? index : generatedId}`;

  return (
    <div className="border border-border-subtle bg-charcoal transition-colors duration-300">
      <h3>
        <button
          type="button"
          id={headerId}
          aria-expanded={isOpen}
          aria-controls={panelId}
          onClick={onToggle}
          className="w-full text-left p-6 sm:p-7 flex items-center justify-between gap-4 cursor-pointer focus-visible:outline-2 focus-visible:outline-champagne bg-transparent"
        >
          <span className="font-editorial text-lg sm:text-xl md:text-2xl text-warm-ivory font-normal leading-snug">
            {question}
          </span>
          <span className="shrink-0 p-1.5 border border-border-medium text-champagne">
            {isOpen ? <Minus size={15} /> : <Plus size={15} />}
          </span>
        </button>
      </h3>
      {isOpen && (
        <div
          id={panelId}
          role="region"
          aria-labelledby={headerId}
          className="px-6 pb-6 sm:px-7 sm:pb-7 text-ivory-muted text-sm sm:text-base font-light leading-relaxed border-t border-border-subtle pt-4"
        >
          {answer}
        </div>
      )}
    </div>
  );
};

export const Accordion = ({ items = [], allowMultiple = false, className = '' }) => {
  const [openIndexes, setOpenIndexes] = useState([0]); // First item open by default

  const handleToggle = (index) => {
    if (allowMultiple) {
      setOpenIndexes((prev) =>
        prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
      );
    } else {
      setOpenIndexes((prev) => (prev.includes(index) ? [] : [index]));
    }
  };

  return (
    <div className={`flex flex-col gap-4 ${className}`}>
      {items.map((item, index) => (
        <AccordionItem
          key={item.id || item.q || index}
          index={index}
          question={item.question || item.q}
          answer={item.answer || item.a}
          isOpen={openIndexes.includes(index)}
          onToggle={() => handleToggle(index)}
        />
      ))}
    </div>
  );
};
