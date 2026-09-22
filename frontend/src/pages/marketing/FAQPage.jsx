import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { ChevronDown, ArrowRight } from 'lucide-react';

export const FAQPage = () => {
  const [openIdx, setOpenIdx] = useState(0);

  const faqs = [
    {
      q: 'How does Ratevia pricing work?',
      a: 'Ratevia is available for a ₹1,000 one-time payment for small businesses. There are no monthly subscriptions, recurring fees, or limits on customer QR scans or feedback submissions.',
    },
    {
      q: 'How does a business get started with Ratevia?',
      a: 'Because Ratevia is a curated product for small hospitality venues, businesses are provisioned directly by our administrative team. Once you contact us, we set up your venue profile, configure your target Google review URL, and provide your dashboard credentials along with high-resolution printable QR standee graphics.',
    },
    {
      q: 'Does Ratevia comply with Google Maps review guidelines?',
      a: 'Yes, 100%. Google strictly prohibits review gating (blocking or hiding negative reviews). With Ratevia, all customers—regardless of their 1–5 star rating—have direct access to continue to your official Google review page. Ratevia never posts reviews automatically and never asks for customer Google credentials.',
    },
    {
      q: 'How does the AI review assistance work?',
      a: 'Customers often want to leave a nice review but struggle with what to write. Based on the positive topics they select (e.g. "Cold Brew", "Friendly Baristas", "Cozy Atmosphere"), Ratevia generates articulate review suggestions. The customer can edit any words, copy the text with one tap, and paste it directly onto your Google review page.',
    },
    {
      q: 'What is Ratevia\'s privacy and data retention policy?',
      a: 'Ratevia practices privacy-by-design. For 4–5 star ratings, we record only aggregate analytics (rating counts, topic tallies, Google clicks) without storing raw customer comments. For 1–3 star ratings, raw feedback is temporarily retained for up to 30 days so your management team can address operational concerns, after which it is automatically deleted. Long-term analytics remain permanent.',
    },
    {
      q: 'What business categories are currently supported?',
      a: 'Ratevia is designed for local businesses across multiple industries, including Cafés, Restaurants, Hotels, Clothing Shops, Electronics Shops, Salons, Garages / Auto Services, Bakeries, Gyms, Retail Shops, and other local trades. The topic suggestions, feedback categories, and review generation are customized to each specific business type.',
    },
    {
      q: "Can I use Ratevia if my specific business type isn't listed?",
      a: 'Yes. You can select "Other" during provisioning for a versatile, general customer service and quality review experience, and contact our team if you need specialized category configurations.',
    },
    {
      q: 'Can 1–3 star customers still leave a Google review?',
      a: 'Absolutely. Customers who select 1, 2, or 3 stars are invited to share constructive feedback to help your team improve, but they are never blocked from generating a review or continuing to Google.',
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
          Everything you need to know about our ₹1,000 one-time model, Google compliance, and privacy-first data retention.
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
        <h3 className="font-display text-xl text-foreground">Ready to get Ratevia for your venue?</h3>
        <p className="text-xs text-muted-foreground max-w-md mx-auto">
          Contact our team to get your business provisioned for a ₹1,000 one-time payment.
        </p>
        <div className="pt-2">
          <Link to="/contact">
            <Button variant="primary" size="md">
              Contact Us to Get Ratevia
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
};
