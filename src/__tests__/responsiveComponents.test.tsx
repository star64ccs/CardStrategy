// Response式ComponentTest

import { configureStore } from '@reduxjs/toolkit';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { Provider } from 'react-redux';

import { DesignSystemProvider } from '../components/providers/DesignSystemProvider';
import { ResponsiveProvider } from '../components/providers/ResponsiveProvider';
import {
  ResponsiveCard,
  ResponsiveForm,
  ResponsiveFormItem,
  ResponsiveImage,
  ResponsiveNavigation,
  ResponsiveTable,
  ResponsiveTestTool,
} from '../components/ui';
import { responsiveComponentService } from '../services/responsiveComponentService';
import { designSystemSlice } from '../store/slices/designSystemSlice';
import { layoutSlice } from '../store/slices/layoutSlice';

// CreateTest用的 Redux store
const _createTestStore = () => {
  return configureStore({
    reducer: {
      designSystem: designSystemSlice.reducer,
      layout: layoutSlice.reducer,
    },
  });
};

// TestPackage裝器
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const _store = createTestStore();

  return (
    <Provider store={store}>
      <DesignSystemProvider>
        <ResponsiveProvider>{children}</ResponsiveProvider>
      </DesignSystemProvider>
    </Provider>
  );
};

// TestData
const _mockTableData = [
  { id: 1, name: '項目1', status: '活躍', date: '2024-01-01' },
  { id: 2, name: '項目2', status: '暫停', date: '2024-01-02' },
  { id: 3, name: '項目3', status: '完成', date: '2024-01-03' },
];

const _mockTableColumns = [
  { key: 'id', title: 'ID', dataIndex: 'id' },
  { key: 'name', title: '名稱', dataIndex: 'name' },
  { key: 'status', title: '狀態', dataIndex: 'status' },
  { key: 'date', title: '日期', dataIndex: 'date' },
];

const _mockNavigationItems = [
  { key: 'home', label: '首頁', icon: '🏠' },
  { key: 'about', label: '關於', icon: 'ℹ️' },
  { key: 'contact', label: '聯繫', icon: '📞' },
];

describe('響應式組件測試', () => {
  beforeEach(() => {
    // ResetResponse式ComponentService
    jest.clearAllMocks();
  });

  describe('ResponsiveImage 組件', () => {
    it('應該正確渲染響應式圖片', () => {
      render(
        <TestWrapper>
          <ResponsiveImage
            src='test-image.jpg'
            alt='測試圖片'
            data-testid='responsive-image'
          />
        </TestWrapper>
      );

      const _image = screen.getByTestId('responsive-image');
      expect(image).toBeInTheDocument();
    });

    it('應該支持響應式尺寸', () => {
      render(
        <TestWrapper>
          <ResponsiveImage
            src='test-image.jpg'
            alt='測試圖片'
            width={{ xs: 100, sm: 200, md: 300 }}
            height={{ xs: 100, sm: 200, md: 300 }}
            data-testid='responsive-image'
          />
        </TestWrapper>
      );

      const _image = screen.getByTestId('responsive-image');
      expect(image).toBeInTheDocument();
    });

    it('應該支持懶加載', () => {
      render(
        <TestWrapper>
          <ResponsiveImage
            src='test-image.jpg'
            alt='測試圖片'
            lazy={true}
            data-testid='responsive-image'
          />
        </TestWrapper>
      );

      const _image = screen.getByTestId('responsive-image');
      expect(image).toBeInTheDocument();
    });
  });

  describe('ResponsiveTable 組件', () => {
    it('應該正確渲染響應式表格', () => {
      render(
        <TestWrapper>
          <ResponsiveTable
            data={mockTableData}
            columns={mockTableColumns}
            data-testid='responsive-table'
          />
        </TestWrapper>
      );

      const _table = screen.getByTestId('responsive-table');
      expect(table).toBeInTheDocument();
    });

    it('應該支持排序功能', () => {
      render(
        <TestWrapper>
          <ResponsiveTable
            data={mockTableData}
            columns={mockTableColumns}
            sortable={true}
            data-testid='responsive-table'
          />
        </TestWrapper>
      );

      const _table = screen.getByTestId('responsive-table');
      expect(table).toBeInTheDocument();
    });

    it('應該支持搜索功能', () => {
      render(
        <TestWrapper>
          <ResponsiveTable
            data={mockTableData}
            columns={mockTableColumns}
            searchable={true}
            data-testid='responsive-table'
          />
        </TestWrapper>
      );

      const _table = screen.getByTestId('responsive-table');
      expect(table).toBeInTheDocument();
    });

    it('應該支持分頁功能', () => {
      render(
        <TestWrapper>
          <ResponsiveTable
            data={mockTableData}
            columns={mockTableColumns}
            pagination={{
              current: 1,
              pageSize: 10,
              total: mockTableData.length,
            }}
            data-testid='responsive-table'
          />
        </TestWrapper>
      );

      const _table = screen.getByTestId('responsive-table');
      expect(table).toBeInTheDocument();
    });
  });

  describe('ResponsiveForm 組件', () => {
    it('應該正確渲染響應式表單', () => {
      render(
        <TestWrapper>
          <ResponsiveForm data-testid='responsive-form'>
            <ResponsiveFormItem label='測試字段' name='test'>
              <input type='text' />
            </ResponsiveFormItem>
          </ResponsiveForm>
        </TestWrapper>
      );

      const _form = screen.getByTestId('responsive-form');
      expect(form).toBeInTheDocument();
    });

    it('應該支持響應式佈局', () => {
      render(
        <TestWrapper>
          <ResponsiveForm
            layout={{ xs: 'vertical', md: 'horizontal' }}
            data-testid='responsive-form'
          >
            <ResponsiveFormItem label='測試字段' name='test'>
              <input type='text' />
            </ResponsiveFormItem>
          </ResponsiveForm>
        </TestWrapper>
      );

      const _form = screen.getByTestId('responsive-form');
      expect(form).toBeInTheDocument();
    });

    it('應該支持表單驗證', () => {
      const _mockSubmit = jest.fn();

      render(
        <TestWrapper>
          <ResponsiveForm onSubmit={mockSubmit} data-testid='responsive-form'>
            <ResponsiveFormItem
              label='測試字段'
              name='test'
              rules={[{ required: true, message: '此字段為必填項' }]}
            >
              <input type='text' />
            </ResponsiveFormItem>
          </ResponsiveForm>
        </TestWrapper>
      );

      const _form = screen.getByTestId('responsive-form');
      expect(form).toBeInTheDocument();
    });
  });

  describe('ResponsiveNavigation 組件', () => {
    it('應該正確渲染響應式導航', () => {
      render(
        <TestWrapper>
          <ResponsiveNavigation
            items={mockNavigationItems}
            data-testid='responsive-navigation'
          />
        </TestWrapper>
      );

      const _navigation = screen.getByTestId('responsive-navigation');
      expect(navigation).toBeInTheDocument();
    });

    it('應該支持響應式模式', () => {
      render(
        <TestWrapper>
          <ResponsiveNavigation
            items={mockNavigationItems}
            mode={{ xs: 'vertical', md: 'horizontal' }}
            data-testid='responsive-navigation'
          />
        </TestWrapper>
      );

      const _navigation = screen.getByTestId('responsive-navigation');
      expect(navigation).toBeInTheDocument();
    });

    it('應該支持折疊功能', () => {
      render(
        <TestWrapper>
          <ResponsiveNavigation
            items={mockNavigationItems}
            mode='vertical'
            collapsed={false}
            data-testid='responsive-navigation'
          />
        </TestWrapper>
      );

      const _navigation = screen.getByTestId('responsive-navigation');
      expect(navigation).toBeInTheDocument();
    });
  });

  describe('ResponsiveCard 組件', () => {
    it('應該正確渲染響應式卡片', () => {
      render(
        <TestWrapper>
          <ResponsiveCard title='測試卡片' data-testid='responsive-card'>
            <p>卡片內容</p>
          </ResponsiveCard>
        </TestWrapper>
      );

      const _card = screen.getByTestId('responsive-card');
      expect(card).toBeInTheDocument();
    });

    it('應該支持響應式佈局', () => {
      render(
        <TestWrapper>
          <ResponsiveCard
            title='測試卡片'
            layout={{ xs: 'vertical', md: 'horizontal' }}
            data-testid='responsive-card'
          >
            <p>卡片內容</p>
          </ResponsiveCard>
        </TestWrapper>
      );

      const _card = screen.getByTestId('responsive-card');
      expect(card).toBeInTheDocument();
    });

    it('應該支持響應式顯示控制', () => {
      render(
        <TestWrapper>
          <ResponsiveCard
            title='測試卡片'
            showHeader={{ xs: false, md: true }}
            showImage={{ xs: false, md: true }}
            data-testid='responsive-card'
          >
            <p>卡片內容</p>
          </ResponsiveCard>
        </TestWrapper>
      );

      const _card = screen.getByTestId('responsive-card');
      expect(card).toBeInTheDocument();
    });

    it('應該支持內容折疊', () => {
      render(
        <TestWrapper>
          <ResponsiveCard
            title='測試卡片'
            contentCollapse={true}
            showExpandButton={true}
            data-testid='responsive-card'
          >
            <p>很長的卡片內容...</p>
            <p>更多內容...</p>
            <p>更多內容...</p>
          </ResponsiveCard>
        </TestWrapper>
      );

      const _card = screen.getByTestId('responsive-card');
      expect(card).toBeInTheDocument();
    });
  });

  describe('ResponsiveTestTool 組件', () => {
    it('應該正確渲染測試工具', () => {
      render(
        <TestWrapper>
          <ResponsiveTestTool
            componentName='TestComponent'
            component={<div>測試組件</div>}
            data-testid='responsive-test-tool'
          />
        </TestWrapper>
      );

      const _testTool = screen.getByTestId('responsive-test-tool');
      expect(testTool).toBeInTheDocument();
    });

    it('應該支持設備選擇', () => {
      render(
        <TestWrapper>
          <ResponsiveTestTool
            componentName='TestComponent'
            component={<div>測試組件</div>}
            data-testid='responsive-test-tool'
          />
        </TestWrapper>
      );

      const _testTool = screen.getByTestId('responsive-test-tool');
      expect(testTool).toBeInTheDocument();

      // Check設備Select按鈕
      expect(screen.getByText('iPhone SE')).toBeInTheDocument();
      expect(screen.getByText('iPhone 12')).toBeInTheDocument();
      expect(screen.getByText('iPad')).toBeInTheDocument();
      expect(screen.getByText('Desktop')).toBeInTheDocument();
    });

    it('應該支持方向選擇', () => {
      render(
        <TestWrapper>
          <ResponsiveTestTool
            componentName='TestComponent'
            component={<div>測試組件</div>}
            data-testid='responsive-test-tool'
          />
        </TestWrapper>
      );

      const _testTool = screen.getByTestId('responsive-test-tool');
      expect(testTool).toBeInTheDocument();

      // Check方向Select按鈕
      expect(screen.getByText('豎屏')).toBeInTheDocument();
      expect(screen.getByText('橫屏')).toBeInTheDocument();
    });

    it('應該支持運行測試', async () => {
      const _mockOnTestComplete = jest.fn();

      render(
        <TestWrapper>
          <ResponsiveTestTool
            componentName='TestComponent'
            component={<div>測試組件</div>}
            onTestComplete={mockOnTestComplete}
            data-testid='responsive-test-tool'
          />
        </TestWrapper>
      );

      const _testTool = screen.getByTestId('responsive-test-tool');
      expect(testTool).toBeInTheDocument();

      // 點擊運RowTest按鈕
      const _runTestButton = screen.getByText('運行測試');
      fireEvent.click(runTestButton);

      // AwaitTestComplete
      await waitFor(() => {
        expect(screen.getByText('測試結果')).toBeInTheDocument();
      });
    });
  });

  describe('響應式組件Service', () => {
    it('應該正確註冊組件', () => {
      const _component = {
        name: 'TestComponent',
        category: 'other' as const,
        responsive: true,
        breakpoints: ['xs', 'sm', 'md', 'lg', 'xl', 'xxl'],
        props: {},
        accessible: true,
      };

      responsiveComponentService.registerComponent(component);
      const _registeredComponent =
        responsiveComponentService.getComponent('TestComponent');

      expect(registeredComponent).toEqual(component);
    });

    it('應該返回所有註冊的組件', () => {
      const _component1 = {
        name: 'TestComponent1',
        category: 'other' as const,
        responsive: true,
        breakpoints: ['xs', 'sm'],
        props: {},
        accessible: true,
      };

      const _component2 = {
        name: 'TestComponent2',
        category: 'other' as const,
        responsive: true,
        breakpoints: ['md', 'lg'],
        props: {},
        accessible: true,
      };

      responsiveComponentService.registerComponent(component1);
      responsiveComponentService.registerComponent(component2);

      const _allComponents = responsiveComponentService.getAllComponents();
      expect(allComponents).toHaveLength(2);
    });

    it('應該生成測試報告', () => {
      const _mockResults = [
        {
          component: 'TestComponent',
          device: 'iPhone SE',
          breakpoint: 'xs' as const,
          orientation: 'portrait',
          passed: true,
          issues: [],
          performance: {
            renderTime: 50,
            memoryUsage: 10,
            interactionTime: 20,
          },
        },
      ];

      const _report =
        responsiveComponentService.generateTestReport(mockResults);
      expect(report).toContain('響應式組件測試報告');
      expect(report).toContain('總測試數: 1');
      expect(report).toContain('通過測試: 1');
    });
  });
});
