import { getGeminiApiKey } from './storageService';

// Danh sách các model Gemini theo thứ tự ưu tiên thử nghiệm
const MODEL_CANDIDATES = [
  'gemini-2.5-flash',
  'gemini-flash-latest',
  'gemini-3.5-flash-lite',
  'gemini-3.5-flash',
  'gemini-2.0-flash',
  'gemini-1.5-flash',
];

/**
 * Sinh mô tả thông minh dự phòng khi API Gemini bị hết hạn mức hoặc mất mạng
 */
export const generateFallbackDescription = (locationAddress, timestamp) => {
  const dateStr = timestamp
    ? new Date(timestamp).toLocaleDateString('vi-VN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'khoảnh khắc vừa qua';

  const placeStr = locationAddress
    ? `tại ${locationAddress}`
    : 'trong hành trình khám phá';

  return `Bức ảnh kỷ niệm được ghi lại ${placeStr} (${dateStr}). Bức ảnh lưu giữ không gian chân thực với ánh sáng tự nhiên và cảm xúc đáng nhớ.`;
};

/**
 * Gửi ảnh tới Gemini AI để sinh mô tả tiếng Việt
 * @param {string} base64Data Chuỗi base64 của ảnh
 * @param {string} mimeType Loại ảnh (mặc định image/jpeg)
 * @param {object} contextInfo Thông tin phụ trợ (địa chỉ, thời gian)
 * @returns {Promise<{text: string, isFallback: boolean, error?: string}>}
 */
export const generateImageDescription = async (
  base64Data,
  mimeType = 'image/jpeg',
  contextInfo = {}
) => {
  const apiKey = await getGeminiApiKey();

  if (!apiKey || apiKey.trim().length === 0) {
    return {
      text: generateFallbackDescription(contextInfo.address, contextInfo.timestamp),
      isFallback: true,
      error: 'Chưa cấu hình Gemini API Key. Đang sử dụng mô tả mẫu.',
    };
  }

  // Chuẩn hóa base64: loại bỏ data URI prefix nếu có
  let cleanBase64 = base64Data;
  if (cleanBase64.includes('base64,')) {
    cleanBase64 = cleanBase64.split('base64,')[1];
  }
  cleanBase64 = cleanBase64.trim();

  const promptText =
    'Bạn là trợ lý AI chuyên phân tích ảnh du lịch và kỷ niệm. ' +
    'Hãy miêu tả bức ảnh này bằng tiếng Việt ngắn gọn, hấp dẫn trong khoảng 2-3 câu: ' +
    'nêu bật các đối tượng chính, không gian, màu sắc và cảm xúc của bức ảnh. ' +
    'Không cần thêm lời mở đầu hay kết bài, chỉ trả về nội dung miêu tả.';

  let lastErrorMessage = '';

  // Thử lần lượt các model phổ biến
  for (const model of MODEL_CANDIDATES) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: promptText },
                {
                  inlineData: {
                    mimeType: mimeType || 'image/jpeg',
                    data: cleanBase64,
                  },
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 250,
          },
        }),
      });

      const data = await response.json();

      if (response.ok && data?.candidates?.[0]?.content?.parts?.[0]?.text) {
        const generatedText = data.candidates[0].content.parts[0].text.trim();
        return {
          text: generatedText,
          isFallback: false,
          modelUsed: model,
        };
      }

      if (data?.error) {
        lastErrorMessage = data.error.message || `Lỗi API mã ${data.error.code}`;
        // Nếu lỗi 402 hoặc 429 (hết tiền/hết quota), không cần thử tiếp các model khác vì key chung quota
        if (data.error.code === 402 || data.error.code === 429) {
          lastErrorMessage =
            'API Key của bạn đã dùng hết hạn mức tín dụng miễn phí (Prepayment credits depleted). Bạn có thể đổi API key trong Cài đặt hoặc dùng mô tả dự phòng.';
          break;
        }
      }
    } catch (netErr) {
      lastErrorMessage = netErr.message || 'Lỗi kết nối mạng đến Google AI';
    }
  }

  // Nếu tất cả model đều lỗi hoặc quota cạn kiệt, trả về mô tả thông minh dự phòng
  console.warn('Gemini AI failed, using fallback:', lastErrorMessage);
  return {
    text: generateFallbackDescription(contextInfo.address, contextInfo.timestamp),
    isFallback: true,
    error: lastErrorMessage,
  };
};
