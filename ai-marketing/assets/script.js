const form = document.querySelector('#lead-form');
const statusEl = document.querySelector('#form-status');

form.addEventListener('submit', (event) => {
  event.preventDefault();
  statusEl.classList.remove('error');

  if (!form.checkValidity()) {
    statusEl.textContent = 'Vui lòng điền đủ các trường bắt buộc.';
    statusEl.classList.add('error');
    form.reportValidity();
    return;
  }

  statusEl.textContent = 'Đã ghi nhận bản đăng ký thử nghiệm. Cảm ơn bạn!';
  form.reset();
});

