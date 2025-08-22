// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
const fs = require('fs');

// 簡單的日誌函數
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
const log = (message, data = '') => {
  if (process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line no-console
    // logger.info(message, data);
  }
};

// 主題映射
const themeMappings = {
  'theme.colors.background.light': 'theme.colors.backgroundLight',
  'theme.colors.background.dark': 'theme.colors.backgroundDark',
  'theme.colors.background.paper': 'theme.colors.backgroundPaper',
  'theme.colors.background.paperDark': 'theme.colors.backgroundPaperDark',
  'theme.colors.text.primary': 'theme.colors.textPrimary',
  'theme.colors.text.secondary': 'theme.colors.textSecondary',
  'theme.colors.text.disabled': 'theme.colors.textDisabled',
  'theme.colors.text.inverse': 'theme.colors.textInverse',
  'theme.colors.text.link': 'theme.colors.textLink',
  'theme.colors.border.light': 'theme.colors.borderLight',
  'theme.colors.border.dark': 'theme.colors.borderDark',
  'theme.colors.border.focus': 'theme.colors.borderFocus',
  'theme.colors.border.error': 'theme.colors.borderError',
  'theme.colors.shadow.light': 'theme.colors.shadowLight',
  'theme.colors.shadow.medium': 'theme.colors.shadowMedium',
  'theme.colors.shadow.dark': 'theme.colors.shadowDark',
  'theme.colors.primary.500': 'theme.colors.primary',
  'theme.colors.secondary.500': 'theme.colors.secondary',
  'theme.colors.accent.500': 'theme.colors.accent',
  'theme.colors.neutral.500': 'theme.colors.neutral',
  'theme.colors.gray.500': 'theme.colors.gray',
  'theme.colors.status.success.500': 'theme.colors.success',
  'theme.colors.status.warning.500': 'theme.colors.warning',
  'theme.colors.status.error.500': 'theme.colors.error',
  'theme.colors.status.info.500': 'theme.colors.info',
};

// 需要修復的文件
const filesToFix = [
  'App.tsx',
  'src/components/cards/CardItem.tsx',
  'src/components/common/Input.tsx',
  'src/screens/AIChatScreen.tsx',
  'src/screens/CardDetailScreen.tsx',
  'src/screens/CardScannerScreen.tsx',
  'src/screens/CardsScreen.tsx',
  'src/screens/CollectionsScreen.tsx',
  'src/screens/HomeScreen.tsx',
  'src/screens/InvestmentsScreen.tsx',
  'src/screens/LoginScreen.tsx',
  'src/screens/MarketAnalysisScreen.tsx',
  'src/screens/ProfileScreen.tsx',
  'src/screens/RegisterScreen.tsx',
];

function fixThemeUsage(filePath) {
  if (!fs.existsSync(filePath)) {
    log(`File not found: ${filePath}`);
    return;
  }

// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // 應用映射
  for (const [oldPattern, newPattern] of Object.entries(themeMappings)) {
    if (content.includes(oldPattern)) {
      content = content.replace(
        new RegExp(oldPattern.replace(/\./g, '\\.'), 'g'),
        newPattern
      );
      modified = true;
      log(`Fixed ${oldPattern} -> ${newPattern} in ${filePath}`);
    }
  }

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    log(`Updated ${filePath}`);
  }
}

// 執行修復
log('Starting theme usage fixes...');
filesToFix.forEach((file) => fixThemeUsage(file));
log('Theme usage fixes completed!');
