const form = document.querySelector('#lead-form');
const statusNode = document.querySelector('#form-status');
const STORAGE_KEY = 'hannah-vstep-leads';

form.addEventListener('submit', (event) => {
  event.preventDefault();

  if (!form.checkValidity()) {
    form.reportValidity();
    statusNode.textContent = 'Bạn vui lòng điền đủ thông tin, số điện thoại hợp lệ và xác nhận đồng ý liên hệ nhé.';
    return;
  }

  const data = Object.fromEntries(new FormData(form).entries());

  // Bản demo: lưu lead trên trình duyệt. Thay bằng endpoint CRM/webhook trước khi xuất bản.
  try {
    const leads = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    leads.push({ ...data, createdAt: new Date().toISOString() });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(leads));
  } catch (error) {
    console.warn('Không lưu được lead demo:', error);
  }

  form.reset();
  statusNode.textContent = 'Cảm ơn bạn! Bản demo đã ghi nhận đăng ký trên trình duyệt này.';
});
