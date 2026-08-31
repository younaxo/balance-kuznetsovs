import "server-only";
import { hash, verify } from "@node-rs/argon2";

/**
 * Хеширование паролей администратора через Argon2id — победитель
 * Password Hashing Competition, рекомендован OWASP как значение
 * по умолчанию для нового кода. Параметры (память/итерации/параллелизм)
 * соответствуют текущим рекомендациям OWASP Password Storage Cheat Sheet
 * (m=19 MiB не подходит для интерактивного входа с большой нагрузкой,
 * используем чуть более сильный профиль, приемлемый для redkого admin-логина).
 */
const ARGON2_OPTIONS = {
  memoryCost: 65536, // 64 MiB
  timeCost: 3,
  parallelism: 4,
} as const;

export async function hashPassword(plainPassword: string): Promise<string> {
  return hash(plainPassword, ARGON2_OPTIONS);
}

export async function verifyPassword(
  passwordHash: string,
  plainPassword: string,
): Promise<boolean> {
  try {
    return await verify(passwordHash, plainPassword);
  } catch {
    // Некорректный формат хеша и т.п. — считаем пароль неверным,
    // а не роняем запрос с 500-й ошибкой.
    return false;
  }
}
