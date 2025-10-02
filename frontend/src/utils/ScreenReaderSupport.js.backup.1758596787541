// 屏幕閱讀器支持工具
class ScreenReaderSupport {
  constructor() {
    this.announcements = [];
    this.isEnabled = this.checkScreenReaderSupport();
  }

  // 檢查屏幕閱讀器支持
  checkScreenReaderSupport() {
    return (
      'speechSynthesis' in window ||
      'speechRecognition' in window ||
      document.querySelector('[aria-live]') !== null
    );
  }

  // 創建 ARIA Live 區域
  createLiveRegion(level = 'polite') {
    const existing = document.getElementById('aria-live-region');
    if (existing) return existing;

    const liveRegion = document.createElement('div');
    liveRegion.id = 'aria-live-region';
    liveRegion.setAttribute('aria-live', level);
    liveRegion.setAttribute('aria-atomic', 'true');
    liveRegion.className = 'sr-only';
    liveRegion.style.cssText = `
      position: absolute;
      left: -10000px;
      width: 1px;
      height: 1px;
      overflow: hidden;
    `;

    document.body.appendChild(liveRegion);
    return liveRegion;
  }

  // 播報消息
  announce(message, priority = 'polite') {
    if (!this.isEnabled) return;

    const liveRegion = this.createLiveRegion(priority);
    
    // 清除現有內容
    liveRegion.textContent = '';
    
    // 設置新內容
    setTimeout(() => {
      liveRegion.textContent = message;
    }, 100);

    // 記錄播報
    this.announcements.push({
      message,
      priority,
      timestamp: Date.now()
    });

    // 限制記錄數量
    if (this.announcements.length > 50) {
      this.announcements.shift();
    }
  }

  // 語音合成播報
  speak(text, options = {}) {
    if (!('speechSynthesis' in window)) return;

    const {
      rate = 1,
      pitch = 1,
      volume = 1,
      voice = null
    } = options;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = rate;
    utterance.pitch = pitch;
    utterance.volume = volume;

    if (voice) {
      utterance.voice = voice;
    }

    speechSynthesis.speak(utterance);
  }

  // 獲取可用語音
  getAvailableVoices() {
    if (!('speechSynthesis' in window)) return [];

    return speechSynthesis.getVoices().filter(voice => 
      voice.lang.startsWith('zh') || voice.lang.startsWith('en')
    );
  }

  // 創建屏幕閱讀器友好的表格
  createAccessibleTable(data, options = {}) {
    const {
      caption,
      summary,
      headers = []
    } = options;

    const table = document.createElement('table');
    
    if (caption) {
      const captionEl = document.createElement('caption');
      captionEl.textContent = caption;
      table.appendChild(captionEl);
    }

    if (summary) {
      table.setAttribute('aria-label', summary);
    }

    // 表頭
    if (headers.length > 0) {
      const thead = document.createElement('thead');
      const headerRow = document.createElement('tr');
      
      headers.forEach((header, index) => {
        const th = document.createElement('th');
        th.textContent = header;
        th.setAttribute('scope', 'col');
        th.setAttribute('aria-sort', 'none');
        headerRow.appendChild(th);
      });
      
      thead.appendChild(headerRow);
      table.appendChild(thead);
    }

    // 表體
    const tbody = document.createElement('tbody');
    data.forEach((row, rowIndex) => {
      const tr = document.createElement('tr');
      tr.setAttribute('aria-rowindex', rowIndex + 1);
      
      Object.values(row).forEach((cell, cellIndex) => {
        const td = document.createElement('td');
        td.textContent = cell;
        td.setAttribute('aria-colindex', cellIndex + 1);
        tr.appendChild(td);
      });
      
      tbody.appendChild(tr);
    });
    
    table.appendChild(tbody);
    return table;
  }

  // 創建無障礙表單
  createAccessibleForm(fields, options = {}) {
    const {
      onSubmit,
      onReset,
      ariaLabel,
      ariaDescribedBy
    } = options;

    const form = document.createElement('form');
    
    if (ariaLabel) {
      form.setAttribute('aria-label', ariaLabel);
    }
    
    if (ariaDescribedBy) {
      form.setAttribute('aria-describedby', ariaDescribedBy);
    }

    fields.forEach((field, index) => {
      const fieldset = document.createElement('fieldset');
      const legend = document.createElement('legend');
      legend.textContent = field.label;
      fieldset.appendChild(legend);

      const input = document.createElement('input');
      input.type = field.type || 'text';
      input.id = field.id || `field-${index}`;
      input.name = field.name || field.id;
      input.required = field.required || false;
      input.setAttribute('aria-describedby', `${input.id}-help`);

      if (field.placeholder) {
        input.placeholder = field.placeholder;
      }

      if (field.value) {
        input.value = field.value;
      }

      fieldset.appendChild(input);

      if (field.helpText) {
        const helpText = document.createElement('div');
        helpText.id = `${input.id}-help`;
        helpText.className = 'help-text';
        helpText.textContent = field.helpText;
        fieldset.appendChild(helpText);
      }

      form.appendChild(fieldset);
    });

    if (onSubmit) {
      form.addEventListener('submit', onSubmit);
    }

    if (onReset) {
      form.addEventListener('reset', onReset);
    }

    return form;
  }

  // 獲取播報歷史
  getAnnouncementHistory() {
    return this.announcements;
  }

  // 清除播報歷史
  clearAnnouncementHistory() {
    this.announcements = [];
  }
}

export default ScreenReaderSupport;
