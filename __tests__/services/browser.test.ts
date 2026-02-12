import { openInAppBrowser } from '@/services/browser';
import * as WebBrowser from 'expo-web-browser';

jest.mock('expo-web-browser', () => ({
  openBrowserAsync: jest.fn(),
  WebBrowserPresentationStyle: {
    FULL_SCREEN: 'fullScreen',
  },
}));

describe('openInAppBrowser', () => {
  beforeEach(() => {
    (WebBrowser.openBrowserAsync as jest.Mock).mockClear();
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
    (WebBrowser.openBrowserAsync as jest.Mock).mockRejectedValue(
      new Error('Browser unavailable')
    );

    await expect(
      openInAppBrowser('https://moly.hu/konyvek/12345')
    ).rejects.toThrow('Browser unavailable');
  });
});
