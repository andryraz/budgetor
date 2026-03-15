import { CreationWallet, UpdateWallet, WalletAutomaticIncome, WalletTypeEnum } from "@clients";
import z from "zod";

import { ApiError } from "@/errors";

const walletTypes = ["CASH", "MOBILE_MONEY", "BANK", "DEBT"];

const createWalletSchema = z.object({
  name: z.string().min(1),
  description: z.string().nullable(),
  type: z.string().refine((value) => walletTypes.includes(value as any), 'Type should be one of Cash: "CASH","MOBILE_MONEY","BANK","DEBT"'),
});

const updateWalletSchema = z.object({
  name: z.string().min(1),
  description: z.string().nullable(),
  type: z.string().refine((value) => walletTypes.includes(value as any), 'Type should be one of Cash: "CASH","MOBILE_MONEY","BANK","DEBT"'),
  isActive: z.boolean(),
});

const updateAutomaticIncomeSchema = z
  .object({
    type: z.string().refine((type) => ["NOT_SPECIFIED", "MENSUAL"].includes(type), `Type should be one of NOT_SPECIFIED, MENSUAL`),
    amount: z.number().min(0).optional(),
    paymentDay: z.number().min(1).max(31).optional(),
  })
  .refine(
    (data) => {
      if (data.type === "MENSUAL") {
        return data.amount !== undefined && data.paymentDay !== undefined;
      }
      return true;
    },
    { message: "amount and paymentDay are required when type is MENSUAL" },
  );

export class WalletValidator {
  public static create(createWallet: CreationWallet) {
    const result = createWalletSchema.safeParse(createWallet);
    if (!result.success) throw new ApiError(z.prettifyError(result.error), 400);
  }

  public static update(accountId: string, createWallet: UpdateWallet) {
    if (createWallet.accountId !== accountId) throw new ApiError("Your account is not able to make change on this element", 403);
    const result = updateWalletSchema.safeParse(createWallet);

    if (!result.success) throw new ApiError(z.prettifyError(result.error), 400);
  }
  public static updateAutomaticIncome(automaticIncome: WalletAutomaticIncome) {
    const result = updateAutomaticIncomeSchema.safeParse(automaticIncome);
    if (!result.success) throw new ApiError(z.prettifyError(result.error), 400);
  }
}