#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const componentName = process.argv[2];
const componentType = process.argv[3] || 'functional';

if (!componentName) {
  console.log('❌ 請提供組件名稱');
  console.log('用法: node scripts/generate-component.js <ComponentName> [functional|class]');
  process.exit(1);
}

const pascalCase = componentName.charAt(0).toUpperCase() + componentName.slice(1);
const kebabCase = componentName.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase();

// 創建組件目錄
const componentDir = path.join(__dirname, '..', 'src', 'components', kebabCase);
if (!fs.existsSync(componentDir)) {
  fs.mkdirSync(componentDir, { recursive: true });
}

// 生成組件模板
const generateFunctionalComponent = () => `import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface ${pascalCase}Props {
  // 添加你的 props 類型
}

export const ${pascalCase}: React.FC<${pascalCase}Props> = (props) => {
  return (
    <View style={styles.container}>
      <Text>${pascalCase} Component</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    // 添加你的樣式
  },
});
`;

const generateClassComponent = () => `import React, { Component } from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface ${pascalCase}Props {
  // 添加你的 props 類型
}

interface ${pascalCase}State {
  // 添加你的 state 類型
}

export class ${pascalCase} extends Component<${pascalCase}Props, ${pascalCase}State> {
  constructor(props: ${pascalCase}Props) {
    super(props);
    this.state = {
      // 初始化 state
    };
  }

  render() {
    return (
      <View style={styles.container}>
        <Text>${pascalCase} Component</Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    // 添加你的樣式
  },
});
`;

// 生成測試文件模板
const generateTestFile = () => `import React from 'react';
import { render } from '@testing-library/react-native';
import { ${pascalCase} } from './${pascalCase}';

describe('${pascalCase}', () => {
  it('應該正確渲染', () => {
    const { getByText } = render(<${pascalCase} />);
    expect(getByText('${pascalCase} Component')).toBeTruthy();
  });

  // 添加更多測試
});
`;

// 生成索引文件模板
const generateIndexFile = () => `export { ${pascalCase} } from './${pascalCase}';
`;

// 生成組件文件
const componentContent = componentType === 'class' ? generateClassComponent() : generateFunctionalComponent();
fs.writeFileSync(path.join(componentDir, `${pascalCase}.tsx`), componentContent);

// 生成測試文件
fs.writeFileSync(path.join(componentDir, `${pascalCase}.test.tsx`), generateTestFile());

// 生成索引文件
fs.writeFileSync(path.join(componentDir, 'index.ts'), generateIndexFile());

console.log(`✅ 組件 ${pascalCase} 已生成在 ${componentDir}`);
console.log(`📁 文件結構:`);
console.log(`  - ${pascalCase}.tsx (組件文件)`);
console.log(`  - ${pascalCase}.test.tsx (測試文件)`);
console.log(`  - index.ts (導出文件)`);
console.log('');
console.log('🔧 下一步:');
console.log(`  1. 編輯 ${pascalCase}.tsx 添加你的組件邏輯`);
console.log(`  2. 編輯 ${pascalCase}.test.tsx 添加測試用例`);
console.log(`  3. 在需要的地方導入: import { ${pascalCase} } from '@/components/${kebabCase}'`);
