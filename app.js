// Enable only after inbox delivery and the privacy arrangements have been verified.
const ONLINE_INTAKE_ENABLED = false;
const LEAD_EMAIL = 'hello@nurviant.com';
let kind = 'nurse';
const form = document.getElementById('intake');
const status = document.getElementById('status');
function setType(value) {
  kind = value;
  const hospital = value === 'hospital';
  for (const type of ['nurse', 'hospital']) {
    const tab = document.getElementById(type + 'Tab');
    tab.classList.toggle('active', type === value);
    tab.setAttribute('aria-pressed', String(type === value));
  }
  document.getElementById('orgLabel').hidden = !hospital;
  form.elements.organization.disabled = !hospital;
  form.elements.organization.required = hospital;
  document.getElementById('hospitalFields').hidden = !hospital;
  for (const field of ['headcount', 'timing']) form.elements[field].disabled = !hospital;
  document.getElementById('experienceLabel').hidden = hospital;
  form.elements.experience.disabled = hospital;
  document.querySelectorAll('.nurse-only').forEach(label => {
    label.hidden = hospital;
    label.querySelector('select').disabled = hospital;
  });
  document.getElementById('locationLabel').textContent = hospital ? 'Hospital city / state' : 'Preferred U.S. city / state';
  document.getElementById('submit').textContent = (ONLINE_INTAKE_ENABLED ? 'Send ' : 'Prepare ') + (hospital ? 'staffing inquiry ↗' : 'nurse inquiry ↗');
  status.textContent = '';
}
const menu = document.querySelector('.menu-toggle');
menu.onclick = () => {
  const expanded = menu.getAttribute('aria-expanded') !== 'true';
  menu.setAttribute('aria-expanded', String(expanded));
  document.getElementById('navigation').classList.toggle('open', expanded);
};
document.getElementById('navigation').addEventListener('click', event => {
  if (event.target.closest('a')) {
    menu.setAttribute('aria-expanded', 'false');
    document.getElementById('navigation').classList.remove('open');
  }
});
const roles=[['Critical care','Intensive Care Nurse','Care for patients with complex needs in an ICU team.'],['Emergency','Emergency Department Nurse','Bring calm, clinical judgment, and care to urgent situations.'],['Medical-surgical','Medical-Surgical Nurse','Support recovery through attentive, coordinated bedside care.']];function render(){const q=document.getElementById('search').value.toLowerCase(),s=document.getElementById('specialty').value;const found=roles.filter(r=>(!s||r[0]===s)&&r.join(' ').toLowerCase().includes(q));document.getElementById('cards').innerHTML=found.map(r=>'<article class="card"><span class="tag">'+r[0]+'</span><span class="tag">Example role</span><h3>'+r[1]+'</h3><p class="muted">'+r[2]+'</p><p class="muted">Location and terms depend on future vacancies.</p><button data-specialty="'+r[0]+'" onclick="choose(this.dataset.specialty)">Register interest ↗</button></article>').join('');document.getElementById('empty').hidden=found.length>0}function choose(s){setType('nurse');document.querySelector('[name=specialty]').value=s;document.getElementById('join').scrollIntoView()}document.getElementById('search').oninput=render;document.getElementById('specialty').onchange=render;render();
function inquiryData() {
  const data = Object.fromEntries(new FormData(form));
  delete data.website;
  delete data.consent;
  return {kind, ...data};
}
function downloadInquiry() {
  if (!form.reportValidity()) return;
  const url = URL.createObjectURL(new Blob([JSON.stringify(inquiryData(), null, 2)], {type: 'application/json'}));
  const a = document.createElement('a');
  a.href = url;
  a.download = 'nurviant-inquiry.json';
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  status.textContent = 'Your download was prepared. This does not send an inquiry to Nurviant.';
}
document.getElementById('download').onclick = downloadInquiry;
form.onsubmit = async event => {
  event.preventDefault();
  if (!form.reportValidity()) return;
  if (form.elements.website.value) { status.textContent = 'Submission blocked.'; return; }
  const data = inquiryData();
  if (!ONLINE_INTAKE_ENABLED) {
    const body = Object.entries(data).map(([key, value]) => key + ': ' + value).join('\n');
    location.href = 'mailto:' + LEAD_EMAIL + '?subject=' + encodeURIComponent('Nurviant ' + kind + ' inquiry') + '&body=' + encodeURIComponent(body);
    status.textContent = 'Your email app was requested. Review the inquiry and press Send there. If no app opens, download your inquiry and email it to ' + LEAD_EMAIL + '. Nothing has been sent by this page.';
    return;
  }
  const button = document.getElementById('submit');
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  data.reference = 'NVT-' + Date.now().toString(36).toUpperCase();
  button.disabled = true;
  status.textContent = 'Sending inquiry…';
  try {
    const response = await fetch('https://formsubmit.co/ajax/' + encodeURIComponent(LEAD_EMAIL), {
      method: 'POST', headers: {'Content-Type': 'application/json', Accept: 'application/json'},
      body: JSON.stringify({...data, _subject: 'Nurviant inquiry ' + data.reference, _template: 'table'}),
      signal: controller.signal
    });
    const result = await response.json();
    if (!response.ok || !(result.success === true || result.success === 'true')) throw new Error('delivery');
    status.textContent = 'The delivery service accepted your inquiry. Reference: ' + data.reference + '. This is not a placement confirmation.';
    form.reset();
    setType(kind);
    status.textContent = 'The delivery service accepted your inquiry. Reference: ' + data.reference + '. This is not a placement confirmation.';
  } catch (error) {
    status.textContent = 'Delivery could not be confirmed. Your entries are still here. Download a copy or email ' + LEAD_EMAIL + '. If the request timed out, it may have arrived; check before sending again.';
  } finally {
    clearTimeout(timeout);
    button.disabled = false;
  }
};
setType('nurse');
