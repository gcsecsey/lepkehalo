import * as WebBrowser from 'expo-web-browser';

/**
 * Open a URL in the in-app browser (SFSafariViewController on iOS, Chrome Custom Tabs on Android)
 */
export async function openInAppBrowser(url: string): Promise<void> {
  await WebBrowser.openBrowserAsync(url, {
    controlsColor: '#007AFF',
    presentationStyle: WebBrowser.WebBrowserPresentationStyle.FULL_SCREEN,
  });
}
