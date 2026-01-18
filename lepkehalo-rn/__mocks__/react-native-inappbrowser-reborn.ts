// Mock for react-native-inappbrowser-reborn
// Used for opening books on moly.hu in Chrome Custom Tabs / Safari View Controller

interface InAppBrowserOptions {
  toolbarColor?: string;
  secondaryToolbarColor?: string;
  enableUrlBarHiding?: boolean;
  showTitle?: boolean;
  enableDefaultShare?: boolean;
  forceCloseOnRedirection?: boolean;
  animations?: {
    startEnter?: string;
    startExit?: string;
    endEnter?: string;
    endExit?: string;
  };
}

interface BrowserResult {
  type: 'cancel' | 'dismiss';
}

// Track opened URLs for testing
let _openedUrls: string[] = [];

const InAppBrowser = {
  open: jest.fn(async (url: string, _options?: InAppBrowserOptions): Promise<BrowserResult> => {
    _openedUrls.push(url);
    return { type: 'dismiss' };
  }),

  close: jest.fn(async () => {
    // No-op
  }),

  isAvailable: jest.fn(async () => {
    return true;
  }),

  openAuth: jest.fn(async (url: string, _redirectUrl: string, _options?: InAppBrowserOptions) => {
    _openedUrls.push(url);
    return { type: 'dismiss', url };
  }),

  closeAuth: jest.fn(async () => {
    // No-op
  }),

  warmup: jest.fn(async () => {
    return true;
  }),

  mayLaunchUrl: jest.fn(async (_url: string, _urls?: string[]) => {
    // No-op
  }),
};

// Test helpers
export const getOpenedUrls = () => [..._openedUrls];
export const clearOpenedUrls = () => {
  _openedUrls = [];
};

export default InAppBrowser;
