import { generatePin } from '../src/modules/auth/auth.service';

describe('Auth utils', () => {
  it('PIN es numérico de 4 dígitos', async () => {
    const pin = await generatePin();
    expect(pin).toHaveLength(4);
    expect(/^\d+$/.test(pin)).toBe(true);
  });
});
