import React, { useState } from 'react';
import './FAQ.css';
import { FaChevronDown, FaQuestionCircle } from 'react-icons/fa';

const faqData = [
  {
    question: 'How do I place an order on Pics Prism?',
    answer:
      'Browse products, add items to your cart, and proceed to checkout. You must be logged in to complete your purchase.',
  },
  {
    question: 'What payment methods are accepted?',
    answer:
      'We accept credit cards, debit cards, UPI, net banking, and other secure online payment methods.',
  },
  {
    question: 'Is online payment safe on Pics Prism?',
    answer:
      'Yes. All payments are processed through secure and encrypted payment gateways to ensure your data is protected.',
  },
  {
    question: 'How can I track my order?',
    answer:
      'Go to Order Status in your account dashboard. You will find real-time tracking information once the order is placed.',
  },
  {
    question: 'What is your shipping timeline?',
    answer:
      'Orders are usually delivered within 3–7 business days, depending on your location and product availability.',
  },
  {
    question: 'Can I cancel my order after placing it?',
    answer:
      'Yes, you can cancel your order before it is shipped by visiting the Order Status section.',
  },
  {
    question: 'What is the return and exchange policy?',
    answer:
      'Products can be returned or exchanged within 7 days of delivery if they are unused and in original condition.',
  },
  {
    question: 'When will I receive my refund?',
    answer:
      'Refunds are processed within 5–7 business days after the returned item passes quality inspection.',
  },
  {
    question: 'Do I need an account to shop?',
    answer:
      'You can browse products without an account, but you must sign up or log in to place an order.',
  },
  {
    question: 'How can I contact customer support?',
    answer:
      'You can reach us via the Contact Us page or email support@picsprism.com for assistance.',
  },
];

const FAQ = () => {
  const [activeIndex, setActiveIndex] = useState(null);

  const toggleFAQ = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <div className="faq-page">
      {/* Header */}
      <div className="faq-header">
        <FaQuestionCircle className="faq-header-icon" />
        <h1>Frequently Asked Questions</h1>
        <p>
          Find answers to common questions about orders, payments, shipping,
          returns, and more.
        </p>
      </div>

      {/* FAQ List */}
      <div className="faq-container">
        {faqData.map((item, index) => (
          <div
            key={index}
            className={`faq-item ${activeIndex === index ? 'active' : ''}`}
          >
            <div className="faq-question" onClick={() => toggleFAQ(index)}>
              <h3>{item.question}</h3>
              <FaChevronDown className="faq-arrow" />
            </div>

            {activeIndex === index && (
              <div className="faq-answer">
                <p>{item.answer}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default FAQ;
