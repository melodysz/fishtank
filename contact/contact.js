/* ============================================================
   CONTACT FORM
   Sends through FormSubmit (formsubmit.co), a free service that
   emails form entries to Melody — no server needed for a static site.
   If "receipt" is ticked, FormSubmit also emails the sender a copy
   of their message (its "autoresponse" feature).
   ============================================================ */
(function () {
  const TO = 'melodyserenazhang@gmail.com';
  const ENDPOINT = 'https://formsubmit.co/ajax/' + TO;

  const form      = document.getElementById('contactForm');
  const statusEl  = document.getElementById('formStatus');
  const sendBtn   = document.getElementById('sendBtn');
  const receipt   = document.getElementById('contactReceipt');
  const againBtn  = document.getElementById('againBtn');
  if (!form) return;

  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function setStatus(html, isError) {
    statusEl.innerHTML = html;
    statusEl.classList.toggle('is-error', !!isError);
  }

  // Marks empty / badly-typed required fields in red. Returns true if all good.
  function validate() {
    let firstBad = null;
    form.querySelectorAll('[required]').forEach((input) => {
      const value = input.value.trim();
      const bad = !value || (input.type === 'email' && !EMAIL_RE.test(value));
      input.closest('.field').classList.toggle('is-invalid', bad);
      if (bad && !firstBad) firstBad = input;
    });
    if (firstBad) {
      firstBad.focus();
      const emailBad = firstBad.type === 'email' && firstBad.value.trim();
      setStatus(emailBad ? 'That email doesn’t look quite right.' : 'Please fill in the highlighted fields.', true);
      return false;
    }
    return true;
  }

  // clear the red as soon as they start fixing a field
  form.addEventListener('input', (e) => {
    const field = e.target.closest('.field');
    if (field) field.classList.remove('is-invalid');
    if (statusEl.classList.contains('is-error')) setStatus('', false);
  });

  // a plain email link with their message filled in — the backup if sending fails
  function mailtoLink(d) {
    const body = `${d.message}\n\n— ${d.name}${d.company ? ', ' + d.company : ''}\n${d.email}`;
    return `mailto:${TO}?subject=${encodeURIComponent(d.subject)}&body=${encodeURIComponent(body)}`;
  }

  function showReceipt(d) {
    const now = new Date();
    document.getElementById('receiptTime').textContent =
      now.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) + ' · ' +
      now.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
    document.getElementById('rFrom').textContent = d.name + (d.company ? ` (${d.company})` : '');
    document.getElementById('rSubject').textContent = d.subject;
    document.getElementById('rMessage').textContent = d.message;
    document.getElementById('receiptFoot').textContent = d.wantsReceipt
      ? `a copy is on its way to ${d.email}`
      : 'thanks for writing! talk soon ✶';
    form.hidden = true;
    receipt.hidden = false;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const fd = new FormData(form);
    const d = {
      name: fd.get('name').trim(),
      email: fd.get('email').trim(),
      company: fd.get('company').trim(),
      subject: fd.get('subject').trim(),
      message: fd.get('message').trim(),
      wantsReceipt: fd.get('wants_receipt') === 'on',
    };

    // bots fill every field, including the invisible one — pretend it worked
    if (fd.get('_honey')) { showReceipt(d); return; }

    const payload = {
      name: d.name,
      email: d.email,               // FormSubmit sends the receipt to this address
      company: d.company || '—',
      subject: d.subject,
      message: d.message,
      _subject: `✶ portfolio: ${d.subject}`,
      _replyto: d.email,            // hitting "reply" in Gmail answers them directly
      _template: 'table',
      _captcha: 'false',
    };
    if (d.wantsReceipt) {
      payload._autoresponse =
        `Hi ${d.name}! Thanks for reaching out — your message landed safely in Melody's inbox, ` +
        `and she'll get back to you soon. Here's a copy of what you sent, for your records. ✶`;
    }

    sendBtn.disabled = true;
    sendBtn.textContent = 'sending…';
    setStatus('', false);

    try {
      const res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || String(json.success) !== 'true') throw new Error(json.message || res.status);
      showReceipt(d);
    } catch (err) {
      console.warn('Contact form failed:', err);
      setStatus(`Hmm, that didn’t go through. Try again, or <a href="${mailtoLink(d)}" class="interactable">send it by email instead</a>.`, true);
    } finally {
      sendBtn.disabled = false;
      sendBtn.textContent = 'send it!';
    }
  });

  // back to a fresh form
  againBtn.addEventListener('click', () => {
    form.reset();
    receipt.hidden = true;
    form.hidden = false;
    setStatus('', false);
    form.querySelector('input[name="name"]').focus();
  });
})();
