// ==========================================
// HANNAH VSTEP - Form Submission + QR Payment
// ==========================================

// Backend API URL
const API_BASE_URL = 'https://landing-pages-backend-hzud.vercel.app'; // Production
// const API_BASE_URL = 'http://localhost:3000'; // Local testing

const form = document.querySelector('#lead-form');
const statusNode = document.querySelector('#form-status');

form.addEventListener('submit', async (event) => {
  event.preventDefault();

  if (!form.checkValidity()) {
    form.reportValidity();
    statusNode.textContent = 'Bạn vui lòng điền đủ thông tin, số điện thoại hợp lệ và xác nhận đồng ý liên hệ nhé.';
    statusNode.style.color = '#721c24';
    return;
  }

  const submitBtn = form.querySelector('button[type="submit"]');
  const originalBtnText = submitBtn.textContent;

  try {
    // Show loading
    submitBtn.disabled = true;
    submitBtn.textContent = 'Đang xử lý...';
    statusNode.textContent = '';
    statusNode.style.color = '#004085';

    // Get form data
    const formData = Object.fromEntries(new FormData(form).entries());

    // Map form fields to API schema
    const apiPayload = {
      name: formData.name,
      phone: formData.phone,
      email: '',
      industry: 'Giáo dục',
      goal: formData.goal
    };

    // Submit to backend
    const response = await fetch(`${API_BASE_URL}/api/submit-form`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(apiPayload)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || 'Lỗi khi gửi form');
    }

    // Success: Get QR code
    const qrResponse = await fetch(
      `${API_BASE_URL}/api/qr?name=${encodeURIComponent(formData.name)}&phone=${formData.phone}`
    );

    if (!qrResponse.ok) {
      throw new Error('Lỗi khi tạo QR code');
    }

    const qrData = await qrResponse.json();

    // Show success message
    statusNode.textContent = '✅ Cảm ơn bạn! Vui lòng quét mã QR bên dưới để hoàn tất thanh toán tư vấn.';
    statusNode.style.color = '#155724';

    // Hide form and show QR
    form.style.display = 'none';
    showQRCode(qrData, formData.name);

    // Fallback: Also store in localStorage for admin to view
    storeLeadLocally(apiPayload);

  } catch (error) {
    console.error('Form submission error:', error);

    statusNode.textContent = `❌ Lỗi: ${error.message}. Vui lòng thử lại hoặc liên hệ hỗ trợ.`;
    statusNode.style.color = '#721c24';

    submitBtn.disabled = false;
    submitBtn.textContent = originalBtnText;
  }
});

// ==========================================
// QR CODE DISPLAY
// ==========================================

function showQRCode(qrData, name) {
  // Create QR container if not exists
  let qrContainer = document.getElementById('qr-payment-section');

  if (!qrContainer) {
    qrContainer = document.createElement('div');
    qrContainer.id = 'qr-payment-section';
    qrContainer.style.cssText = `
      margin-top: 30px;
      padding-top: 30px;
      border-top: 2px solid #e0d4c7;
      text-align: center;
    `;
    form.parentNode.insertBefore(qrContainer, form.nextSibling);
  }

  qrContainer.innerHTML = `
    <h3 style="font-family: Playfair Display, serif; color: #a3252b; font-size: 20px; margin-top: 0;">🎟️ Mã QR Thanh Toán</h3>
    <p style="color: #6b605a; margin-bottom: 20px;">Quét mã QR bên dưới để hoàn tất thanh toán tư vấn chọn lớp</p>

    <div style="
      background: #f9f9f9;
      padding: 30px;
      border-radius: 12px;
      margin-bottom: 20px;
    ">
      <img
        src="${qrData.qrUrl}"
        alt="QR Code thanh toán"
        style="
          max-width: 300px;
          width: 100%;
          height: auto;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        "
      />
    </div>

    <div style="
      background: #fffcf8;
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 20px;
      text-align: left;
    ">
      <div style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e0d4c7; font-size: 14px;">
        <strong>🏦 Ngân hàng:</strong>
        <span>Vietcombank</span>
      </div>
      <div style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e0d4c7; font-size: 14px;">
        <strong>💳 Số tài khoản:</strong>
        <code style="font-weight: 600;">9378637269</code>
      </div>
      <div style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e0d4c7; font-size: 14px;">
        <strong>💰 Số tiền:</strong>
        <span style="font-weight: 600;">100,000 VND</span>
      </div>
      <div style="display: flex; justify-content: space-between; padding: 10px 0; font-size: 14px;">
        <strong>📝 Nội dung:</strong>
        <code style="font-weight: 600;">${qrData.description}</code>
      </div>
    </div>

    <button
      onclick="location.reload()"
      class="button"
      style="margin-top: 10px;"
    >
      ← Điền lại thông tin
    </button>
  `;

  qrContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ==========================================
// FALLBACK: Local Storage for Demo/Admin
// ==========================================

function storeLeadLocally(data) {
  try {
    const leads = JSON.parse(localStorage.getItem('hannah-vstep-leads') || '[]');
    leads.push({ ...data, submittedAt: new Date().toISOString() });
    localStorage.setItem('hannah-vstep-leads', JSON.stringify(leads));
    console.log('Lead stored locally (backup)');
  } catch (error) {
    console.warn('Could not store lead locally:', error);
  }
}
