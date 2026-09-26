import prisma from '../config/prisma.js';
import { normalizePhoneNumber } from '../utils/phone.js';

export const businessRequestService = {
  /**
   * Process and store an inbound business registration request.
   * Performs phone normalization, email normalization, and 24-hour duplicate check.
   */
  createBusinessRequest: async ({
    ownerName,
    businessName,
    businessType,
    phoneNumber,
    countryCode,
    email,
    city,
    message,
  }) => {
    // Normalize phone number (handling country code prefix if separate)
    const combinedPhone = phoneNumber.startsWith('+')
      ? phoneNumber
      : `${countryCode || '+91'} ${phoneNumber}`;
    const normalizedPhone = normalizePhoneNumber(combinedPhone, countryCode || '+91');

    if (!normalizedPhone) {
      const err = new Error('Please provide a valid phone number with 10 to 15 digits.');
      err.status = 400;
      throw err;
    }

    // Normalize email
    const normalizedEmail = email.toLowerCase();

    // Duplicate protection: Check for active requests created within the last 24 hours
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const existingRequest = await prisma.businessRequest.findFirst({
      where: {
        createdAt: { gte: twentyFourHoursAgo },
        status: { in: ['NEW', 'CONTACTED'] },
        OR: [
          { phoneNumber: normalizedPhone },
          { email: normalizedEmail },
        ],
      },
    });

    if (existingRequest) {
      const err = new Error(
        'A registration request for this business was recently submitted. Our team will contact you shortly.'
      );
      err.status = 409;
      err.code = 'DuplicateRequest';
      throw err;
    }

    // Persist BusinessRequest entity
    const businessRequest = await prisma.businessRequest.create({
      data: {
        ownerName,
        businessName,
        businessType,
        phoneNumber: normalizedPhone,
        email: normalizedEmail,
        city,
        message: message || null,
        status: 'NEW',
      },
    });

    console.log(
      `[BusinessRequest] New registration request received from "${businessName}" (${normalizedPhone}, ${normalizedEmail})`
    );

    return {
      id: businessRequest.id,
      businessName: businessRequest.businessName,
      status: businessRequest.status,
      createdAt: businessRequest.createdAt,
    };
  },
};

export default businessRequestService;
