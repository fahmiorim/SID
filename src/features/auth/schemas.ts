import { z } from "zod";

/** Skema masuk (username, bukan email). */
export const signInSchema = z.object({
  username: z.string().trim().min(1, "Username wajib diisi.").max(100, "Username terlalu panjang."),
  password: z.string().min(1, "Kata sandi wajib diisi.").max(72, "Kata sandi terlalu panjang."),
});

export type SignInInput = z.infer<typeof signInSchema>;
