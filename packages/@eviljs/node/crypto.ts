import Bcrypt from 'bcryptjs'
import Crypto from 'crypto'

export function createToken(): string {
    const buffer = Crypto.randomBytes(16) // 16 bytes.
    const string = buffer.toString('hex') // 32 characters, 2 characters for every byte.

    return string.toLowerCase()
}

export async function hashWithSalt(input: string): Promise<string> {
    return Bcrypt.hash(input, 10)
}

export async function compareWithSaltedHash(input: string, hash: string): Promise<boolean> {
    return Bcrypt.compare(input, hash)
}
