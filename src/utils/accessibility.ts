import { AccessibilityInfo } from 'react-native';

export const announceForAccessibility = (announcement: string) => {
  AccessibilityInfo.announceForAccessibility(announcement);
};

export const setAccessibilityFocus = (reactTag: number) => {
  AccessibilityInfo.setAccessibilityFocus(reactTag);
};

export const isScreenReaderEnabled = async (): Promise<boolean> => {
  return await AccessibilityInfo.isScreenReaderEnabled();
};

export const addEventListener = (
  eventName: string,
  handler: (enabled: boolean) => void
) => {
  return AccessibilityInfo.addEventListener(eventName, handler);
};

export const getAccessibilityRole = (componentType: string): string => {
  const roleMap: { [key: string]: string } = {
    button: 'button',
    link: 'link',
    image: 'image',
    text: 'text',
    header: 'header',
    list: 'list',
    listitem: 'listitem',
    tab: 'tab',
    tablist: 'tablist',
    search: 'search',
    textbox: 'textbox',
    checkbox: 'checkbox',
    radio: 'radio',
    switch: 'switch',
    slider: 'slider',
    progressbar: 'progressbar',
    spinbutton: 'spinbutton',
    combobox: 'combobox',
    menu: 'menu',
    menuitem: 'menuitem',
    toolbar: 'toolbar',
    tooltip: 'tooltip',
    tree: 'tree',
    treeitem: 'treeitem',
    grid: 'grid',
    row: 'row',
    columnheader: 'columnheader',
    rowheader: 'rowheader',
    cell: 'cell',
    article: 'article',
    banner: 'banner',
    complementary: 'complementary',
    contentinfo: 'contentinfo',
    form: 'form',
    main: 'main',
    navigation: 'navigation',
    region: 'region',
    section: 'section',
    sectionhead: 'sectionhead',
    separator: 'separator',
    status: 'status',
  };

  return roleMap[componentType] || 'none';
};

export const generateAccessibilityLabel = (
  text: string,
  context?: string
): string => {
  if (context) {
    return `${text}, ${context}`;
  }
  return text;
};
