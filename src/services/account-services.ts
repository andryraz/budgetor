import { Account } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import { getPrismaClient } from "@/configs";
import { googleClient } from "@/configs";
import { ApiError } from "@/errors";
import { v4 } from "uuid";

export class AccountServices {
  static async singUp(userId: string, account: Account) {
    const accountExistUsername = await getPrismaClient().account.findFirst({ where: { OR: [{ username: account.username }, { email: account.email }] } });

    if (accountExistUsername) {
      const isEmailExisting = account.email === accountExistUsername.email;
      throw new ApiError((isEmailExisting ? "Email" : "Username") + "=" + (isEmailExisting ? account.email : account.username) + " is already used", 400);
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(account.password, salt);
    const parsedAccount: Account = { ...account, id: userId, password: hashedPassword };

    const createdAccount = await getPrismaClient().account.create({
      data: { ...parsedAccount },
    });
    createdAccount.password = undefined;
    return createdAccount;
  }

  static async signIn(email: string, password: string) {
    const account = await getPrismaClient().account.findFirst({ where: { email } });

    if (!account) throw new ApiError(`Account with email=${email} not found`, 404);

    // Compte créé via Google — pas de mot de passe local
    if (!account.password) {
      throw new ApiError("This account uses Google login. Please sign in with Google.", 400);
    }

    const validPassword = await bcrypt.compare(password, account.password);
    if (!validPassword) throw new ApiError(`Bad password`, 400);

    const token = jwt.sign({ id: account.id, username: account.username, email: account.email }, process.env.JWT_SECRET, { expiresIn: "10h" });
    account.password = undefined;
    return { token, account };
  }

  static async signInWithGoogle(idToken: string) {
    // 1 — Vérifier le token auprès de Google
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload) throw new ApiError("Invalid Google token", 400);

    const { sub: googleId, email, name } = payload;
    if (!email) throw new ApiError("Google account has no email", 400);

    // 2 — Compte Google déjà connu → connexion directe
    let account = await getPrismaClient().account.findFirst({ where: { googleId } });

    // 3 — Email connu mais pas encore lié à Google → on lie le googleId
    if (!account) {
      account = await getPrismaClient().account.findFirst({ where: { email } });
      if (account) {
        account = await getPrismaClient().account.update({
          data: { googleId },
          where: { id: account.id },
        });
      }
    }

    // 4 — Nouveau compte → création automatique sans mot de passe
    if (!account) {
      // Suffixe UUID pour garantir l'unicité du username
      const baseUsername = (name || email.split("@")[0]).replace(/\s+/g, "_");
      const username = `${baseUsername}_${v4().slice(0, 8)}`;

      account = await getPrismaClient().account.create({
        data: {
          id: v4(),
          email,
          username,
          googleId,
          password: null,
        },
      });
    }

    // 5 — Générer le même JWT que le flow classique
    const token = jwt.sign({ id: account.id, username: account.username, email: account.email }, process.env.JWT_SECRET, { expiresIn: "10h" });
    account.password = undefined;
    return { token, account };
  }

  static async getOneById(accountId: string) {
    return await getPrismaClient().account.findUnique({ where: { id: accountId } });
  }
}