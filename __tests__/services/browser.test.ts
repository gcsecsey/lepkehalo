import { openInAppBrowser } from '@/services/browser';
import * as WebBrowser from 'expo-web-browser';

vi.mock('expo-web-browser', () => ({
  openBrowserAsync: vi.fn(),
  WebBrowserPresentationStyle: {
    FULL_SCREEN: 'fullScreen',
  },
}));

describe('openInAppBrowser', () => {
  beforeEach(() => {
    (WebBrowser.openBrowserAsync as any).mockClear();
  });

  it('should call WebBrowser.openBrowserAsync with the URL', async () => {
    await openInAppBrowser('https://moly.hu/konyvek/12345');

    expect(WebBrowser.openBrowserAsync).toHaveBeenCalledWith(
      'https://moly.hu/konyvek/12345',
      expect.objectContaining({
        controlsColor: '#007AFF',
      })
    );
  });

  it('should not throw when WebBrowser fails', async () => {
    (WebBrowser.openBrowserAsync as any).mockRejectedValue(
      new Error('Browser unavailable')
    );

    await expect(
      openInAppBrowser('https://moly.hu/konyvek/12345')
    ).rejects.toThrow('Browser unavailable');
  });
});
