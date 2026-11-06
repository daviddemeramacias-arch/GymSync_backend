import { generatePin } from '../src/modules/auth/auth.service';

describe('generatePin', () => {
  it('genera pin de 4 digitos', async () => {
    const pin = await generatePin();
    expect(pin).toMatch(/^\d{4}$/);
  });
});
