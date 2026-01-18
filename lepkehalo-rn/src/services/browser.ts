import { Linking, Platform } from 'react-native';
import InAppBrowser from 'react-native-inappbrowser-reborn';

const BROWSER_OPTIONS = {
  // iOS options
  dismissButtonStyle: 'close' as const,
  preferredBarTintColor: '#007AFF',
  preferredControlTintColor: 'white',
  readerMode: false,
  animated: true,
  modalPresentationStyle: 'fullScreen' as const,
  modalEnabled: true,
  enableBarCollapsing: false,

  // Android options
  showTitle: true,
  toolbarColor: '#007AFF',
  secondaryToolbarColor: 'black',
  navigationBarColor: 'black',
  navigationBarDividerColor: 'white',
  enableUrlBarHiding: true,
  enableDefaultShare: true,
  forceCloseOnRedirection: false,
  animations: {
    startEnter: 'slide_in_right',
    startExit: 'slide_out_left',
    endEnter: 'slide_in_left',
    endExit: 'slide_out_right',
  },
};

/**
 * Open a URL in the in-app browser (Chrome Custom Tabs on Android, Safari View Controller on iOS)
 */
export async function openInAppBrowser(url: string): Promise<void> {
  try {
    const isAvailable = await InAppBrowser.isAvailable();

    if (isAvailable) {
      await InAppBrowser.open(url, BROWSER_OPTIONS);
    } else {
      // Fallback to system browser
      await Linking.openURL(url);
    }
  } catch (error) {
    console.error('Error opening URL:', error);
    // Fallback to system browser
    await Linking.openURL(url);
  }
}

/**
 * Check if the in-app browser is available
 */
export async function isInAppBrowserAvailable(): Promise<boolean> {
  try {
    return await InAppBrowser.isAvailable();
  } catch {
    return false;
  }
}
