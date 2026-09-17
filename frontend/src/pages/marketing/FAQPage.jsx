import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { ChevronDown, HelpCircle, ArrowRight } from 'lucide-react';

export const FAQPage = () => {
  const [openIdx, setOpenIdx] = useState(0);

  const faqs = [
    {
      q: 'How does the Ratevia QR code work?',
      a: 'When customers scan your custom QR standee, they are directed to your private mobile landing page (ratevia.com/r/your-slug). There, they rate their experience on a 1–5 star scale and select what they liked or what could be improved. The customer is guided through an easy review assistance process before copying their review and opening your official Google Review link.',
    },
    {
      q: 'Does Ratevia comply with Google Maps review guidelines?',
      a: 'Yes, 100%. Google prohibits review gating (hiding negative feedback or preventing unsatisfied customers from posting reviews). With Ratevia, all customers—regardless of their star rating—have full freedom and a direct button to continue to your Google Review page. Ratevia never posts reviews automatically and never asks for customer Google credentials.',
    },
    {
      q: 'How does the AI review assistance work?',
      a: 'Customers often want to leave a nice review but suffer from writer\'s block. Based on the positive topics they tap (e.g. "Cold Brew", "Friendly Baristas", "Cozy Atmosphere"), Ratevia generates an articulate, friendly review suggestion in seconds. The customer can review it, edit any wording, copy it with one tap, and paste it directly onto Google.',
    },
    {
      q: 'What happens when a customer has a negative experience (1–3 stars)?',
      a: 'If a customer had an unsatisfactory visit, Ratevia offers an empathetic screen asking what went wrong (Food quality, Wait time, Service, Cleanliness, etc.) and allows them to leave an optional written note. This feedback is immediately routed to your business dashboard so your team can take corrective action. The customer still retains the option to proceed to Google if they wish.',
    },
    {
      q: 'What business categories are currently supported?',
      a: 'Ratevia is designed specifically for local hospitality businesses: Cafés, Restaurants, and Hotels. The topic keywords, review generation tone, and feedback categories are customized to each of these three industries.',
    },
    {
      q: 'What happens when my 20-day free trial ends?',
      a: 'When your trial period ends, customer intake at your QR code is temporarily paused, and a polite pause notice is shown. All of your historical reviews, analytics, and business configurations are permanently preserved. Your access can be reactivated or extended by our platform team without any data loss.',
    },
    {
      q: 'Do I need any technical knowledge or hardware?',
      a: 'None at all. You can register, set up your profile, and download high-resolution QR graphics in less than two minutes. Print the QR code on your office printer, table standee, or receipt paper, and you are ready to collect reviews immediately.',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 space-y-12">
      {/* Header */}
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <Badge variant="outline" className="font-mono text-xs uppercase">
          Got Questions?
        </Badge>
        <h1 className="font-display text-4xl sm:text-5xl text-foreground font-normal">
          Frequently Asked Questions<span className="text-accent">.</span>
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
          Everything you need to know about our customer review workflow, Google compliance, and trial accounts.
        </p>
      </div>

      {/* Accordion List */}
      <div className="space-y-4">
        {faqs.map((faq, idx) => {
          const isOpen = openIdx === idx;
          return (
            <Card
              key={idx}
              className={`transition-all border ${
                isOpen ? 'border-accent shadow-xs' : 'border-border/80'
              }`}
            >
              <button
                type="button"
                onClick={() => setOpenIdx(isOpen ? -1 : idx)}
                className="w-full p-5 text-left flex items-center justify-between gap-4"
              >
                <span className="font-semibold text-foreground text-sm sm:text-base">
                  {faq.q}
                </span>
                <ChevronDown
                  className={`h-4 w-4 text-muted-foreground shrink-0 transition-transform duration-200 ${
                    isOpen ? 'rotate-180 text-accent' : ''
                  }`}
                />
              </button>

              {isOpen && (
                <div className="px-5 pb-5 text-xs sm:text-sm text-muted-foreground leading-relaxed border-t border-border/40 pt-3">
                  {faq.a}
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {/* Help Banner */}
      <Card className="p-8 text-center space-y-4 bg-muted/20">
        <h3 className="font-display text-xl text-foreground">Ready to try Ratevia in your business?</h3>
        <p className="text-xs text-muted-foreground max-w-md mx-auto">
          Start your 20-day free trial now and experience how easy customer reviews can be.
        </p>
        <div className="pt-2">
          <Link to="/signup">
            <Button variant="primary" size="md">
              Start Your Free Trial
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
};
