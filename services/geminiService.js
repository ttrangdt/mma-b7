/**
 * Dịch vụ tích hợp Gemini AI cho Expo App
 * Tuân theo kiến trúc Service Pattern trong Slide 7 & Slide 9
 */

// Model Gemini ưu tiên (nhanh, nhẹ và mạnh mẽ về xử lý đa phương thức / Vision)
const PRIMARY_MODEL = 'gemini-1.5-flash';
const FALLBACK_MODEL = 'gemini-2.0-flash';

/**
 * Gửi ảnh base64 đến Google Gemini AI để sinh mô tả tự động
 * @param {string} base64Data - Chuỗi base64 của bức ảnh (không kèm tiền tố data:image...)
 * @param {string} apiKey - Khóa Google Gemini API
 * @param {string} mimeType - Định dạng ảnh (mặc định image/jpeg)
 * @returns {Promise<string>} - Chuỗi mô tả do AI sinh ra
 */
export const generateImageDescription = async (base64Data, apiKey, mimeType = 'image/jpeg') => {
  if (!apiKey || apiKey.trim() === '') {
    throw new Error('Chưa cấu hình Gemini API Key. Vui lòng bấm vào icon Cài đặt (bánh răng) để nhập API Key của bạn.');
  }

  if (!base64Data) {
    throw new Error('Dữ liệu ảnh không hợp lệ để phân tích.');
  }

  // Làm sạch chuỗi base64 nếu có tiền tố data:image/xxx;base64,
  let cleanBase64 = base64Data;
  if (cleanBase64.includes(',')) {
    cleanBase64 = cleanBase64.split(',')[1];
  }

  const promptText = 
    'Bạn là trợ lý AI chuyên về nhiếp ảnh và lưu giữ kỷ niệm. ' +
    'Hãy phân tích bức ảnh này và viết một đoạn mô tả ngắn gọn, sinh động và đầy cảm xúc bằng tiếng Việt (khoảng 2-3 câu). ' +
    'Nêu rõ chủ thể chính, bối cảnh không gian, màu sắc và cảm nhận chung.';

  const requestBody = {
    contents: [
      {
        parts: [
          { text: promptText },
          {
            inline_data: {
              mime_type: mimeType,
              data: cleanBase64,
            },
          },
        ],
      },
    ],
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 300,
    },
  };

  // 1. Kiểm tra tính hợp lệ của API Key bằng ListModels để chẩn đoán chính xác
  try {
    const checkRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey.trim()}`);
    const checkData = await checkRes.json();

    if (checkData?.error) {
      const errCode = checkData.error.code;
      const errMsg = checkData.error.message || '';
      if (errCode === 400 || errCode === 401 || errMsg.includes('API key not valid')) {
        throw new Error('API Key không hợp lệ. Vui lòng vào aistudio.google.com/app/apikey và tạo API Key mới dạng AIzaSy...');
      }
      if (errCode === 403 || errMsg.includes('PERMISSION_DENIED')) {
        throw new Error('API Key này chưa có quyền Generative Language. Vui lòng vào aistudio.google.com/app/apikey và chọn "Create API key in new project".');
      }
      throw new Error(`Lỗi xác thực API Key (${errCode}): ${errMsg}`);
    }

    // Nếu ListModels thành công, lấy model khả dụng có hỗ trợ generateContent
    if (checkData?.models && Array.isArray(checkData.models)) {
      const supported = checkData.models.filter(m => m.supportedGenerationMethods?.includes('generateContent'));
      const chosen = supported.find(m => m.name.includes('flash')) || supported.find(m => m.name.includes('pro')) || supported[0];
      if (chosen) {
        const cleanName = chosen.name.replace('models/', '');
        const directUrl = `https://generativelanguage.googleapis.com/v1beta/models/${cleanName}:generateContent?key=${apiKey.trim()}`;
        const directRes = await fetch(directUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody),
        });
        const directData = await directRes.json();
        const text = directData?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          return text.trim();
        }
      }
    }
  } catch (checkErr) {
    if (checkErr.message.includes('API Key') || checkErr.message.includes('aistudio.google.com')) {
      throw checkErr;
    }
    console.warn('Không thể kiểm tra ListModels, chuyển sang thử danh sách tĩnh:', checkErr);
  }

  // 2. Thử lần lượt các endpoint tĩnh nếu bước trên chưa trả về
  const CANDIDATES = [
    { version: 'v1beta', model: 'gemini-1.5-flash' },
    { version: 'v1', model: 'gemini-1.5-flash' },
    { version: 'v1beta', model: 'gemini-2.0-flash' },
    { version: 'v1beta', model: 'gemini-2.5-flash' },
    { version: 'v1', model: 'gemini-1.5-pro' },
  ];

  let lastError = null;

  for (const item of CANDIDATES) {
    try {
      const url = `https://generativelanguage.googleapis.com/${item.version}/models/${item.model}:generateContent?key=${apiKey.trim()}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMsg = data?.error?.message || `Lỗi từ Gemini API (${response.status})`;
        lastError = new Error(errorMsg);
        continue;
      }

      const candidate = data.candidates?.[0];
      const text = candidate?.content?.parts?.[0]?.text;

      if (text) {
        return text.trim();
      }
    } catch (err) {
      lastError = err;
    }
  }

  throw lastError || new Error('Không thể kết nối với các model của Gemini API.');
};
