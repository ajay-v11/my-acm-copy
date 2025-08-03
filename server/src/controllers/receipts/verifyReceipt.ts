import {Request, Response} from 'express';
import {handlePrismaError} from '../../utils/helpers';
import prisma from '../../utils/database';
import {Prisma} from '@prisma/client';

// @desc    Verify if a receipt exists by receiptNumber and bookNumber
// @route   GET /api/receipts/verifyReceipt
// @access  Public
//GET /api/receipts/verifyReceipt?receiptNumber=12345&bookNumber=ABC123&committeeId=committee-uuid
// Search by receipt number only: ?receiptNumber=12345
// Search by receipt number and book: ?receiptNumber=12345&bookNumber=ABC123
// Search within specific committee: ?receiptNumber=12345&committeeId=committee-uuid

export const verifyReceipt = async (req: Request, res: Response) => {
  try {
    const {receiptNumber, bookNumber, committeeId} = req.query;

    // Validate required parameters
    if (!receiptNumber && !(bookNumber && committeeId)) {
      return res.status(400).json({
        message:
          'Provide either receiptNumber or both bookNumber and committeeId for verification.',
      });
    }

    // Build the where clause
    const where: Prisma.ReceiptWhereInput = {
      cancelled: false, // Only non-cancelled receipts
    };

    if (receiptNumber) {
      where.receiptNumber = receiptNumber as string;
    }

    // If bookNumber is provided, filter by specific bookNumber
    if (bookNumber) {
      where.bookNumber = bookNumber as string;
    }

    // If committeeId is provided, filter by specific committee
    if (committeeId) {
      where.committeeId = committeeId as string;
    }

    // Find receipts matching the criteria
    const receipts = await prisma.receipt.findMany({
      where,
      select: {
        receiptNumber: true,
        bookNumber: true,
        receiptDate: true,
        trader: {
          select: {
            name: true,
          },
        },
        payeeName: true,

        commodity: {
          select: {
            name: true,
          },
        },
        feesPaid: true,
        value: true,
        natureOfReceipt: true,
        quantity: true,
        unit: true,
        generatedBy: true,
        receiptSignedBy: true,
        committee: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        receiptDate: 'desc',
      },
    });

    // Check if any receipts were found
    if (receipts.length === 0) {
      return res.status(404).json({
        message:
          'No receipts found with the provided receiptNumber and bookNumber',
        verified: false,
      });
    }

    // Return the found receipts
    res.status(200).json({
      message: 'Receipt(s) verified successfully',
      verified: true,
      count: receipts.length,
      data: receipts,
    });
  } catch (error) {
    console.error('Error verifying receipt:', error);
    handlePrismaError(res, error);
  }
};
