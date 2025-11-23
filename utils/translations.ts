import { Language } from '../types';

export const getStoredLanguage = (): Language => {
  try {
    const lang = localStorage.getItem('xpath_gen_lang');
    return (lang === 'vi' || lang === 'en') ? lang : 'vi'; 
  } catch {
    return 'en';
  }
};

export const saveLanguage = (lang: Language) => {
  try {
    localStorage.setItem('xpath_gen_lang', lang);
  } catch (e) {
    console.warn(e);
  }
};

export const translations = {
  en: {
    header: {
      title: 'Smart XPath Generator',
      subtitle: 'Selenium Locator Expert',
      generator: 'Generator',
      history: 'History',
      settings: 'Settings'
    },
    input: {
      step: 'Paste HTML',
      clear: 'Clear',
      label: 'OuterHTML (from DevTools)',
      placeholder: '<button id="btn-login" name="login" class="btn primary">Sign In</button>',
      tip: 'Tip: Inspect element, right click > Copy > Copy outerHTML',
      error_empty: 'Please paste some HTML code first.',
      error_invalid: 'Input does not look like valid HTML tag.',
      error_failed: 'Could not extract any meaningful selectors. Try a different snippet.',
      waiting: 'Waiting for HTML input...'
    },
    results: {
      step: 'Results',
      unsatisfied: 'Not satisfied? Ask AI',
      chat_tip: 'Open chat to refine this strategy.'
    },
    card: {
      best_choice: 'Best Choice',
      explain_btn: 'Explain',
      analyzing: 'Analyzing...',
      analysis_title: 'AI Analysis',
      error_ai: 'Could not connect to AI service.',
      copy_tooltip: 'Copy Code',
      copied: 'Copied!',
      stability_high: 'Stable',
      stability_med: 'Medium',
      stability_low: 'Unstable'
    },
    settings: {
      title: 'AI Configuration',
      api_key: 'API Key',
      api_key_note: 'Key is stored locally in your browser.',
      model: 'Model',
      save: 'Save Settings',
      saved: 'Saved!'
    },
    history: {
      title: 'Recent Activity',
      empty: 'No history found.',
      empty_tip: 'History is automatically cleared after 15 minutes of inactivity.',
      load: 'Load',
      auto_expire: 'Auto-expires after 15m inactivity',
      clear_btn: 'Clear History',
      results_count: 'Results'
    },
    chat: {
      title: 'AI Assistant',
      welcome: 'Hi! I am your Selenium AI Assistant. Need help with a complex XPath or debugging text?',
      placeholder: 'Ask about Selenium or selectors...',
      error: 'Sorry, I encountered an error connecting to AI.'
    },
    generator: {
      id_robust: 'Fastest & most stable. Preferred by Selenium best practices.',
      id_dynamic: 'Warning: ID looks dynamic (random numbers). May break on next run.',
      name: 'Very fast. Second best option for Form elements.',
      link_text: 'Best for <a> tags. Matches exact link text.',
      css_id: 'High performance CSS selector using ID.',
      css_class: 'Good if class names are meaningful and unique.',
      css_class_multi: 'More specific combination of classes.',
      css_attr: (attr: string) => `Targeting '${attr}'. Good alternative if ID is missing.`,
      xpath_text: 'Robust. Uses normalize-space() to ignore newlines/whitespace.',
      xpath_text_exact: 'Exact match. Simple and effective for clean text.',
      xpath_contains: 'Flexible. Matches partial text content.',
      xpath_attr: 'Fallback attribute selection.',
      xpath_label: 'Robust Form Strategy. Locates input relative to its Label text.'
    }
  },
  vi: {
    header: {
      title: 'Smart XPath Generator',
      subtitle: 'Chuyên gia Selenium Locator',
      generator: 'Công cụ',
      history: 'Lịch sử',
      settings: 'Cài đặt'
    },
    input: {
      step: 'Dán mã HTML',
      clear: 'Xóa',
      label: 'OuterHTML (từ DevTools)',
      placeholder: '<button id="btn-login" name="login" class="btn primary">Đăng nhập</button>',
      tip: 'Mẹo: Inspect phần tử, chuột phải > Copy > Copy outerHTML',
      error_empty: 'Vui lòng dán mã HTML vào trước.',
      error_invalid: 'Dữ liệu nhập vào không giống thẻ HTML hợp lệ.',
      error_failed: 'Không tìm thấy selector nào phù hợp. Hãy thử đoạn mã khác.',
      waiting: 'Đang chờ nhập HTML...'
    },
    results: {
      step: 'Kết quả',
      unsatisfied: 'Chưa hài lòng?',
      chat_tip: 'Hỏi AI để tối ưu thêm.'
    },
    card: {
      best_choice: 'Khuyên dùng',
      explain_btn: 'Giải thích',
      analyzing: 'Đang phân tích...',
      analysis_title: 'Phân tích AI',
      error_ai: 'Không thể kết nối đến dịch vụ AI.',
      copy_tooltip: 'Sao chép Code',
      copied: 'Đã chép!',
      stability_high: 'Ổn định',
      stability_med: 'Trung bình',
      stability_low: 'Không ổn định'
    },
    settings: {
      title: 'Cấu hình AI',
      api_key: 'API Key',
      api_key_note: 'Key được lưu trên trình duyệt của bạn.',
      model: 'Mô hình',
      save: 'Lưu cài đặt',
      saved: 'Đã lưu!'
    },
    history: {
      title: 'Hoạt động gần đây',
      empty: 'Chưa có lịch sử.',
      empty_tip: 'Lịch sử tự động xóa sau 15 phút không hoạt động.',
      load: 'Mở lại',
      auto_expire: 'Tự xóa sau 15p',
      clear_btn: 'Xóa lịch sử',
      results_count: 'Kết quả'
    },
    chat: {
      title: 'Trợ lý AI',
      welcome: 'Xin chào! Tôi là trợ lý AI về Selenium. Bạn cần giúp đỡ về XPath hay debug lỗi?',
      placeholder: 'Hỏi về Selenium hoặc selectors...',
      error: 'Xin lỗi, tôi gặp lỗi khi kết nối với AI.'
    },
    generator: {
      id_robust: 'Nhanh & ổn định nhất. Ưu tiên số 1 trong Selenium.',
      id_dynamic: 'Cảnh báo: ID có vẻ là động (số ngẫu nhiên). Dễ gây lỗi script.',
      name: 'Rất nhanh. Ưu tiên số 2 cho các phần tử Form.',
      link_text: 'Tốt nhất cho thẻ <a>. Tìm theo nội dung link.',
      css_id: 'Hiệu năng cao. CSS Selector dựa trên ID.',
      css_class: 'Tốt nếu tên class có ý nghĩa và duy nhất.',
      css_class_multi: 'Kết hợp nhiều class để tăng độ chính xác.',
      css_attr: (attr: string) => `Dùng thuộc tính '${attr}'. Giải pháp thay thế tốt.`,
      xpath_text: 'Mạnh mẽ. Dùng normalize-space() để xử lý khoảng trắng/xuống dòng.',
      xpath_text_exact: 'Chính xác tuyệt đối. Ngắn gọn, hiệu quả khi văn bản sạch.',
      xpath_contains: 'Linh hoạt. Khớp một phần nội dung văn bản.',
      xpath_attr: 'Dùng XPath với thuộc tính (Fallback).',
      xpath_label: 'Chiến lược Form ổn định. Tìm Input dựa theo nhãn (Label) của nó.'
    }
  }
};