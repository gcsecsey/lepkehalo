describe('Test Setup', () => {
  it('should run tests', () => {
    expect(true).toBe(true);
  });

  it('should support async tests', async () => {
    const result = await Promise.resolve(42);
    expect(result).toBe(42);
  });
});
