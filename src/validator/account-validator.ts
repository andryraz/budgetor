import { z } from "zod";

import { ApiError } from "@/errors";

const signUp = z.object({
  password: z.string().min(8),
  username: z.string().min(4),
  email: z.email(),
});

const signIn = z.object({
  password: z.string().min(8),
  email: z.string().min(4),
});

const signInWithGoogle = z.object({
  idToken: z.string().min(1, "idToken is required"),
});

type SignUp = z.infer<typeof signUp>;
type SignIn = z.infer<typeof signIn>;
type SignInWithGoogle = z.infer<typeof signInWithGoogle>;

export class AccountValidator {
  public static signUp(account: SignUp) {
    const result = signUp.safeParse(account);
    if (!result.success) throw new ApiError(z.prettifyError(result.error), 400);
  }
  public static signIn(account: SignIn) {
    const result = signIn.safeParse(account);
    if (!result.success) throw new ApiError(z.prettifyError(result.error), 400);
  }
  public static signInWithGoogle(body: SignInWithGoogle) {
    const result = signInWithGoogle.safeParse(body);
    if (!result.success) throw new ApiError(z.prettifyError(result.error), 400);
  }
}