/**
 * Login E2E untuk kredensial apa pun.
 *
 * Formulir `/masuk` mewajibkan captcha aritmetika (OS-WGA-001), jadi mengisi
 * username + kata sandi saja tidak akan pernah masuk. Helper ini menghitung
 * jawaban dari label captcha yang sedang tampil.
 */
export interface LoginScreen {
  getByLabel(label: string): { fill(value: string): Promise<void> };
  getByRole(role: "button", options: { name: string }): { tap(): Promise<void> };
}

export interface LoginBrowser {
  locator(selector: string): {
    textContent(): Promise<string | null>;
    fill(value: string): Promise<void>;
  };
}

export async function masukDenganKredensial(
  screen: LoginScreen,
  browser: LoginBrowser,
  username: string,
  password: string,
): Promise<void> {
  await screen.getByLabel("Username atau NIK").fill(username);
  await screen.getByLabel("Kata sandi / PIN").fill(password);

  const labelCaptcha = await browser.locator('label[for="jawaban"]').textContent();
  const cocok = labelCaptcha?.match(/(\d+)\s*([+\u2212-])\s*(\d+)/);
  if (!cocok) throw new Error(`Label captcha tidak dikenali: ${labelCaptcha}`);
  const kiri = Number(cocok[1]);
  const kanan = Number(cocok[3]);
  const jawaban = cocok[2] === "+" ? kiri + kanan : kiri - kanan;
  await browser.locator('input[name="jawaban"]').fill(String(jawaban));

  await screen.getByRole("button", { name: "Masuk" }).tap();
}
