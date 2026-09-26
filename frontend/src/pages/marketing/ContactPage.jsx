import React, { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { businessRequestService } from '../../services/businessRequestService';
import { PlanHighlightsCard } from '../../components/contact/PlanHighlightsCard';
import { BusinessRequestForm } from '../../components/contact/BusinessRequestForm';
import { BusinessRequestSuccess } from '../../components/contact/BusinessRequestSuccess';

export const ContactPage = () => {
  const [ownerName, setOwnerName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [businessType, setBusinessType] = useState('CAFE');
  const [countryCode, setCountryCode] = useState('+91');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [city, setCity] = useState('');
  const [message, setMessage] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [isDuplicate, setIsDuplicate] = useState(false);

  const resetForm = () => {
    setOwnerName('');
    setBusinessName('');
    setBusinessType('CAFE');
    setCountryCode('+91');
    setPhoneNumber('');
    setEmail('');
    setCity('');
    setMessage('');
    setErrorMessage(null);
    setIsDuplicate(false);
    setSubmitted(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMessage(null);
    setIsDuplicate(false);

    try {
      await businessRequestService.submitBusinessRequest({
        ownerName: ownerName.trim(),
        businessName: businessName.trim(),
        businessType,
        countryCode: countryCode.trim(),
        phoneNumber: phoneNumber.trim(),
        email: email.trim(),
        city: city.trim(),
        message: message.trim() || null,
      });

      setSubmitted(true);
    } catch (err) {
      if (err.status === 409) {
        setIsDuplicate(true);
        setErrorMessage(
          err.message ||
            'A registration request for this business was recently submitted. Our team will contact you shortly.'
        );
      } else {
        setErrorMessage(err.message || 'Unable to submit request. Please check your details.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 space-y-12">
      {/* Header */}
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <Badge variant="outline" className="font-mono text-xs uppercase">
          Get Started With Ratevia
        </Badge>
        <h1 className="font-display text-4xl sm:text-5xl text-foreground font-normal">
          Request Ratevia for Your Business<span className="text-accent">.</span>
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
          Ratevia is ₹1,000 one-time for local businesses with zero recurring subscription fees. Fill in your details below and our team will get in touch to set up your venue.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Left Column: Plan Highlights */}
        <PlanHighlightsCard />

        {/* Right Column: Request Form or Success Card */}
        <Card className="md:col-span-7 p-6">
          {submitted ? (
            <BusinessRequestSuccess onReset={resetForm} />
          ) : (
            <BusinessRequestForm
              ownerName={ownerName}
              setOwnerName={setOwnerName}
              businessName={businessName}
              setBusinessName={setBusinessName}
              businessType={businessType}
              setBusinessType={setBusinessType}
              countryCode={countryCode}
              setCountryCode={setCountryCode}
              phoneNumber={phoneNumber}
              setPhoneNumber={setPhoneNumber}
              email={email}
              setEmail={setEmail}
              city={city}
              setCity={setCity}
              message={message}
              setMessage={setMessage}
              onSubmit={handleSubmit}
              submitting={submitting}
              errorMessage={errorMessage}
              isDuplicate={isDuplicate}
            />
          )}
        </Card>
      </div>
    </div>
  );
};

export default ContactPage;
