'use client';

import { useState } from 'react';
import { Plus, Minus } from 'lucide-react';

const faqs = [
  {
    id: 1,
    question: 'How does it work?',
    answer:
      'Our platform offers comprehensive digital skills training with expert instructors, hands-on projects, and mentorship. You can enroll in courses, attend live sessions, and get industry-recognized certifications upon completion.',
  },
  {
    id: 2,
    question: 'Is it free?',
    answer:
      'We offer both free and paid courses. Free courses provide foundational knowledge, while premium courses offer advanced content, personalized mentoring, and certification. Choose the plan that best fits your learning goals.',
  },
  {
    id: 3,
    question: 'How can I join?',
    answer:
      'Joining is simple! Create an account, browse our course catalog, and enroll in your desired courses. You can start learning immediately with lifetime access to course materials and resources.',
  },
  {
    id: 4,
    question: 'How can I join?',
    answer:
      'The same enrollment process applies. Sign up, select your courses, complete the registration, and you will have instant access to all learning materials and our supportive community.',
  },
];

export function FAQ() {
  const [expanded, setExpanded] = useState<number | null>(null);

  const toggleExpanded = (id: number) => {
    setExpanded(expanded === id ? null : id);
  };

  return (
    <section className="py-16 sm:py-20 md:py-24 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-center text-3xl sm:text-4xl md:text-5xl font-black text-pink-500 mb-12 sm:mb-16">
          FAQs
        </h2>

        <div className="space-y-4 sm:space-y-5">
          {faqs.map((faq) => (
            <div
              key={faq.id}
              className="bg-gray-50 rounded-xl overflow-hidden transition-all duration-300 hover:shadow-md"
            >
              <button
                onClick={() => toggleExpanded(faq.id)}
                className="w-full flex items-center justify-between p-5 sm:p-6 text-left hover:bg-gray-100 transition-colors"
              >
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 pr-4">
                  {faq.question}
                </h3>
                <div className="flex-shrink-0">
                  {expanded === faq.id ? (
                    <Minus className="w-5 h-5 sm:w-6 sm:h-6 text-pink-500" />
                  ) : (
                    <Plus className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400" />
                  )}
                </div>
              </button>

              {expanded === faq.id && (
                <div className="px-5 sm:px-6 pb-5 sm:pb-6 bg-white border-t border-gray-200">
                  <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
