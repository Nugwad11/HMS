import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";

const KEY_LENGTH = 64;

function derive(
  secret: string,
  salt: Buffer,
  cost: number,
  blockSize: number,
  parallelisation: number
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scrypt(
      secret,
      salt,
      KEY_LENGTH,
      {
        N: cost,
        r: blockSize,
        p: parallelisation,
        maxmem: Math.max(64 * 1024 * 1024, cost * blockSize * 256),
      },
      (error, key) => (error ? reject(error) : resolve(key))
    );
  });
}

export async function hashSecret(secret: string): Promise<string> {
  const salt = randomBytes(16);
  const key = await derive(secret, salt, 16384, 8, 1);
  return `scrypt$16384$8$1$${salt.toString("base64url")}$${key.toString("base64url")}`;
}

export async function verifySecret(secret: string, stored: string): Promise<boolean> {
  const parts = stored.split("$");
  if (parts.length !== 6 || parts[0] !== "scrypt") return false;

  const [cost, blockSize, parallelisation] = parts.slice(1, 4).map(Number);
  if (
    !Number.isInteger(cost) ||
    !Number.isInteger(blockSize) ||
    !Number.isInteger(parallelisation) ||
    cost < 4096 ||
    cost > 65536 ||
    cost % 2 !== 0 ||
    blockSize < 1 ||
    blockSize > 32 ||
    parallelisation < 1 ||
    parallelisation > 16
  ) {
    return false;
  }

  const salt = Buffer.from(parts[4], "base64url");
  const expected = Buffer.from(parts[5], "base64url");
  if (salt.length < 8 || expected.length !== KEY_LENGTH) return false;

  const actual = await derive(secret, salt, cost, blockSize, parallelisation);
  return timingSafeEqual(actual, expected);
}
