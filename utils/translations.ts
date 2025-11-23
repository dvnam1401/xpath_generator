import { Language } from '../types';

export const getStoredLanguage = (): Language => {
  try {
    const lang = localStorage.getItem('xpath_gen_lang');
    return (lang === 'vi' || lang === 'en') ? lang : 'vi'; // Default to Vietnamese if preferred, or 'en'
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
      subtitle: 'Automated Selenium Locator Strategy',
      generator: 'Generator',
      history: 'History',
      settings: 'Settings'
    },
    input: {
      step: 'Paste HTML',
      clear: 'Clear',
      label: 'OuterHTML (from DevTools)',
      placeholder: '<button id="submit-btn" class="btn primary">Login</button>',
      tip: 'Tip: Inspect element, right click > Copy > Copy outerHTML',
      error_empty: 'Please paste some HTML code first.',
      error_invalid: 'Input does not look like valid HTML tag.',
      error_failed: 'Could not extract any meaningful selectors. Try a different snippet.',
      waiting: 'Waiting for HTML input...'
    },
    results: {
      step: 'Results',
      unsatisfied: 'Not satisfied with these results?',
      chat_tip: 'Open the chat widget to ask for a custom strategy.'
    },
    card: {
      best_choice: 'Best Choice',
      explain_btn: 'Explain with AI',
      analyzing: 'Analyzing...',
      analysis_title: 'Analysis',
      error_ai: 'Could not connect to AI service.',
      copy_tooltip: 'Copy to clipboard',
      copied: 'Copied!'
    },
    settings: {
      title: 'AI Configuration',
      api_key: 'API Key',
      api_key_note: 'Key is stored locally in your browser. Get one from',
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
      title: 'Gemini Assistant',
      welcome: 'Hi! I am your Selenium AI Assistant. Need help with a complex XPath or debugging text?',
      placeholder: 'Ask about Selenium or selectors...',
      error: 'Sorry, I encountered an error connecting to Gemini.'
    },
    generator: {
      id: 'Highest stability. IDs are unique identifiers.',
      text_exact: 'Excellent for buttons and labels. Uses exact text match.',
      text_contains: 'Robust against whitespace changes. Checks if text contains value.',
      attr_base: (attr: string) => `Based on '${attr}' attribute. Usually stable.`,
      class_exact: 'Matches exact class string. Fragile if classes change dynamically.',
      class_contains: (cls: string) => `Matches partial class '${cls}'.`,
      combo: 'High specificity. Requires both Class and Text match.'
    }
  },
  vi: {
    header: {
      title: 'Smart XPath Generator',
      subtitle: 'Tự động tạo XPath cho Selenium',
      generator: 'Công cụ',
      history: 'Lịch sử',
      settings: 'Cài đặt'
    },
    input: {
      step: 'Dán mã HTML',
      clear: 'Xóa',
      label: 'OuterHTML (từ DevTools)',
      placeholder: '<button id="submit-btn" class="btn primary">Đăng nhập</button>',
      tip: 'Mẹo: Inspect phần tử, chuột phải > Copy > Copy outerHTML',
      error_empty: 'Vui lòng dán mã HTML vào trước.',
      error_invalid: 'Dữ liệu nhập vào không giống thẻ HTML hợp lệ.',
      error_failed: 'Không tìm thấy selector nào phù hợp. Hãy thử đoạn mã khác.',
      waiting: 'Đang chờ nhập HTML...'
    },
    results: {
      step: 'Kết quả',
      unsatisfied: 'Chưa hài lòng với kết quả?',
      chat_tip: 'Mở chat để hỏi AI cách xử lý.'
    },
    card: {
      best_choice: 'Tốt nhất',
      explain_btn: 'Giải thích bằng AI',
      analyzing: 'Đang phân tích...',
      analysis_title: 'Phân tích từ',
      error_ai: 'Không thể kết nối đến dịch vụ AI.',
      copy_tooltip: 'Sao chép',
      copied: 'Đã chép!'
    },
    settings: {
      title: 'Cấu hình AI',
      api_key: 'API Key',
      api_key_note: 'Key được lưu trên trình duyệt của bạn. Lấy key tại',
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
      title: 'Trợ lý Gemini',
      welcome: 'Xin chào! Tôi là trợ lý AI về Selenium. Bạn cần giúp đỡ về XPath hay debug lỗi?',
      placeholder: 'Hỏi về Selenium hoặc selectors...',
      error: 'Xin lỗi, tôi gặp lỗi khi kết nối với Gemini.'
    },
    generator: {
      id: 'Độ ổn định cao nhất. ID là định danh duy nhất.',
      text_exact: 'Tuyệt vời cho nút bấm và nhãn. So sánh chính xác nội dung.',
      text_contains: 'Chống lỗi khoảng trắng tốt. Kiểm tra nếu văn bản chứa giá trị này.',
      attr_base: (attr: string) => `Dựa trên thuộc tính '${attr}'. Thường khá ổn định.`,
      class_exact: 'Khớp chính xác chuỗi class. Dễ lỗi nếu class thay đổi động.',
      class_contains: (cls: string) => `Khớp một phần class '${cls}'.`,
      combo: 'Độ đặc hiệu cao. Yêu cầu khớp cả Class và Text.'
    }
  }
};