import { submitContribution } from '../api.js';
import { backButton } from '../components/nav.js';
import { logoSVG } from '../components/logo.js';

// innerHTML: backButton() and logoSVG() only -- hardcoded trusted static SVG.
// All user input handled via form elements, sent as JSON. Never rendered as HTML.

export async function renderContribute(container) {
    const params = new URLSearchParams(location.hash.split('?')[1] || '');

    const page = document.createElement('div');
    page.className = 'page';
    const cont = document.createElement('div');
    cont.className = 'container contribute-form';

    const navEl = document.createElement('div');
    navEl.innerHTML = backButton('Home', '#/');
    cont.appendChild(navEl);

    const hero = document.createElement('div');
    hero.className = 'hero';
    hero.innerHTML = logoSVG(48);
    const h1 = document.createElement('h1');
    h1.className = 'title';
    h1.textContent = 'Share Camera URL';
    const sub = document.createElement('p');
    sub.className = 'subtitle';
    sub.textContent = 'Help us grow the database. Your submission will be reviewed and added.';
    hero.appendChild(h1);
    hero.appendChild(sub);
    cont.appendChild(hero);

    const form = document.createElement('form');
    form.id = 'contribute-form';

    form.appendChild(formGroup('Brand', 'text', 'contrib-brand', params.get('brand') || '', 'Camera brand name', true));
    form.appendChild(formGroup('Model', 'text', 'contrib-model', params.get('model') || '', 'Camera model (optional)', false));
    form.appendChild(formGroup('URL', 'text', 'contrib-url', params.get('url') || '', '/live or /Streaming/Channels/101', true));

    const row = document.createElement('div');
    row.className = 'form-row';

    const protoGroup = document.createElement('div');
    protoGroup.className = 'form-group';
    const protoLabel = document.createElement('label');
    protoLabel.className = 'label';
    protoLabel.textContent = 'Protocol ';
    const protoReq = document.createElement('span');
    protoReq.className = 'required';
    protoReq.textContent = '*';
    protoLabel.appendChild(protoReq);
    protoGroup.appendChild(protoLabel);
    const protoSelect = document.createElement('select');
    protoSelect.className = 'input';
    protoSelect.id = 'contrib-protocol';
    ['rtsp', 'http', 'https', 'rtsps', 'rtmp', 'mms', 'bubble', 'rtp'].forEach(p => {
        const opt = document.createElement('option');
        opt.value = p;
        opt.textContent = p;
        if (p === (params.get('protocol') || 'rtsp')) opt.selected = true;
        protoSelect.appendChild(opt);
    });
    protoGroup.appendChild(protoSelect);
    row.appendChild(protoGroup);

    row.appendChild(formGroup('Port', 'number', 'contrib-port', params.get('port') || '554', '554', true));
    form.appendChild(row);

    form.appendChild(formGroup('Comment', 'textarea', 'contrib-comment', '', 'Any additional info (firmware version, etc.)', false));

    const submitBtn = document.createElement('button');
    submitBtn.type = 'submit';
    submitBtn.className = 'btn btn-primary btn-large';
    submitBtn.textContent = 'Submit';
    form.appendChild(submitBtn);

    const info = document.createElement('p');
    info.className = 'contribute-info';
    info.textContent = 'Your data is sent to StrixCamDB as a GitHub issue. A maintainer will review and add it to the database.';
    form.appendChild(info);

    cont.appendChild(form);

    const successEl = document.createElement('div');
    successEl.className = 'contribute-success';
    successEl.style.display = 'none';
    successEl.id = 'contribute-success';
    cont.appendChild(successEl);

    page.appendChild(cont);
    container.textContent = '';
    container.appendChild(page);

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        submitBtn.disabled = true;
        submitBtn.textContent = 'Submitting...';

        const data = {
            brand: document.getElementById('contrib-brand').value.trim(),
            url: document.getElementById('contrib-url').value.trim(),
            protocol: document.getElementById('contrib-protocol').value,
            port: parseInt(document.getElementById('contrib-port').value, 10) || 0,
        };

        const model = document.getElementById('contrib-model').value.trim();
        if (model) data.model = model;

        const comment = document.getElementById('contrib-comment').value.trim();
        if (comment) data.comment = comment;

        try {
            const result = await submitContribution(data);
            if (result.ok) {
                form.style.display = 'none';
                showSuccess(successEl, result.issue_url);
            } else {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Submit';
                alert(result.error || 'Submission failed');
            }
        } catch {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Submit';
            alert('Network error. Try again.');
        }
    });
}

function formGroup(label, type, id, value, placeholder, required) {
    const group = document.createElement('div');
    group.className = 'form-group';

    const labelEl = document.createElement('label');
    labelEl.className = 'label';
    labelEl.textContent = label + ' ';
    if (required) {
        const req = document.createElement('span');
        req.className = 'required';
        req.textContent = '*';
        labelEl.appendChild(req);
    }
    group.appendChild(labelEl);

    let input;
    if (type === 'textarea') {
        input = document.createElement('textarea');
        input.className = 'input';
        input.rows = 3;
    } else {
        input = document.createElement('input');
        input.className = 'input';
        input.type = type;
    }
    input.id = id;
    input.placeholder = placeholder;
    if (value) input.value = value;
    if (required) input.required = true;
    group.appendChild(input);

    return group;
}

function showSuccess(el, issueUrl) {
    el.style.display = 'block';

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', '48');
    svg.setAttribute('height', '48');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('fill', 'none');
    svg.style.color = 'var(--success)';
    svg.style.marginBottom = 'var(--space-4)';
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', '12');
    circle.setAttribute('cy', '12');
    circle.setAttribute('r', '10');
    circle.setAttribute('stroke', 'currentColor');
    circle.setAttribute('stroke-width', '2');
    const check = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    check.setAttribute('d', 'M8 12l2.5 2.5L16 9');
    check.setAttribute('stroke', 'currentColor');
    check.setAttribute('stroke-width', '2');
    check.setAttribute('stroke-linecap', 'round');
    svg.appendChild(circle);
    svg.appendChild(check);
    el.appendChild(svg);

    const h2 = document.createElement('h2');
    h2.textContent = 'Submitted';
    el.appendChild(h2);

    const p = document.createElement('p');
    p.textContent = 'Your contribution has been received and will be reviewed.';
    el.appendChild(p);

    if (issueUrl) {
        const link = document.createElement('a');
        link.href = issueUrl;
        link.target = '_blank';
        link.rel = 'noopener';
        link.textContent = 'View on GitHub';
        el.appendChild(link);
    }

    const backBtn = document.createElement('a');
    backBtn.href = '#/';
    backBtn.className = 'btn btn-secondary';
    backBtn.textContent = 'Back to Home';
    backBtn.style.marginTop = 'var(--space-4)';
    backBtn.style.display = 'inline-flex';
    el.appendChild(backBtn);
}
