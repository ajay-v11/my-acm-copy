import {CreateReceiptSchema} from '../../types/receipt';
import {Request, Response} from 'express';
import {handlePrismaError} from '../../utils/helpers';
import {updateReceiptWithAnalytics} from '../../services/receipts/updateReceiptService';

export const updateReceiptController = async (req: Request, res: Response) => {
  const parseResult = CreateReceiptSchema.safeParse(req.body);

  if (!parseResult.success) {
    return res.status(400).json({
      message: 'Invalid input',
      errors: parseResult.error.flatten(),
    });
  }
  const {receiptId} = req.params;

  const userId = req.user?.id;
  const committeeId = req.user?.committee.id;

  if (!userId || !committeeId) {
    return res.status(400).json({
      message: 'Not authorized to edit',
    });
  }

  try {
    await updateReceiptWithAnalytics(
      receiptId,
      parseResult.data,
      userId,
      committeeId
    );
    return res.status(200).json({
      message: 'Successfully Updated the receipt along with analytics',
    });
  } catch (error) {
    return handlePrismaError(res, error);
  }
};
