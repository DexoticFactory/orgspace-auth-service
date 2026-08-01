import { Injectable } from '@nestjs/common';
import * as argon2 from 'argon2';

const PARAMS = {
  type: argon2.argon2id,
  memoryCost: 65536,
  timeCost: 3,
  parallelism: 4,
} as const;

@Injectable()
export class Argon2Service {
  hash(plain: string): Promise<string> {
    return argon2.hash(plain, PARAMS);
  }

  verify(hash: string, plain: string): Promise<boolean> {
    return argon2.verify(hash, plain);
  }

  needsRehash(hash: string): Promise<boolean> {
    return Promise.resolve(argon2.needsRehash(hash, PARAMS));
  }
}
