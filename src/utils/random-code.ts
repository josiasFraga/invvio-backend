import { randomInt } from 'crypto';
export const generate6DigitCode = () => randomInt(100000, 1000000).toString();