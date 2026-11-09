// ================= CONFIG =================
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxHXofo1e_9Ug3MylHSIER151g3t4BlEPib00ehiAlRPeHds1TIdOgPLQ1UHfb98JbZ/exec';

// ================= ELEMENTS =================
const views = {
    home: document.getElementById('homeView'),
    application: document.getElementById('applicationView'),
    login: document.getElementById('loginView'),
    dashboard: document.getElementById('dashboardView')
};

// ================= VIEW SWITCHER =================
function showView(name) {
    Object.keys(views).forEach(k => views[k].classList.add('hidden'));
    if (views[name]) {
        views[name].classList.remove('hidden');
        window.scrollTo(0, 0);
    }
}

// ================= HEADER BUTTONS =================
document.getElementById('logoBtn').addEventListener('click', () => showView('home'));
document.getElementById('navCareers').addEventListener('click', () => showView('home'));
document.getElementById('navHRLogin').addEventListener('click', () => showView('login'));

// ================= VACANCY APPLY BUTTONS =================
document.querySelectorAll('.apply-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const role = btn.getAttribute('data-role');
        startApplication(role);
    });
});

// ================= START APPLICATION =================
function startApplication(role) {
    document.getElementById('roleInput').value = role;
    document.getElementById('formTitle').innerText = `Apply for ${role}`;
    document.getElementById('roleBadge').innerText = role;

    const langGroup = document.getElementById('languageGroup');
    const langInput = document.getElementById('supportLanguages');

    langGroup.classList.add('hidden');
    langInput.required = false;

    if (role === 'Customer Agent') {
        langGroup.classList.remove('hidden');
        langInput.required = true;
    }

    showView('application');
}

// ================= CANCEL BUTTON =================
document.getElementById('cancelBtn').addEventListener('click', () => {
    document.getElementById('staffForm').reset();
    showView('home');
});

// ================= FORM SUBMIT =================
document.getElementById('staffForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const submitBtn = this.querySelector('.btn-primary');
    const original = submitBtn.innerText;
    submitBtn.innerText = "Submitting...";
    submitBtn.disabled = true;

    const payload = {
        action: "submit",
        role: document.getElementById('roleInput').value,
        robloxUser: document.getElementById('robloxUser').value,
        discordUser: document.getElementById('discordUser').value,
        ageRange: document.getElementById('ageRange').value,
        timeZone: document.getElementById('timeZone').value,
        availability: document.getElementById('availability').value,
        supportLanguages: document.getElementById('supportLanguages').value,
        scenarioAnswer: document.getElementById('scenarioAnswer').value,
        whyHire: document.getElementById('whyHire').value,
        moderationAnswer: ""
    };

    fetch(SCRIPT_URL, { method: 'POST', body: JSON.stringify(payload) })
    .then(r => r.json())
    .then(data => {
        if (data.success) {
            alert("✅ Application submitted successfully!");
            document.getElementById('staffForm').reset();
            showView('home');
        } else {
            alert("Error: " + (data.message || "Unknown error"));
        }
    })
    .catch(() => alert("Connection error. Please try again."))
    .finally(() => {
        submitBtn.innerText = original;
        submitBtn.disabled = false;
    });
});

// ================= LOGIN =================
document.getElementById('loginBtn').addEventListener('click', loginHR);
document.getElementById('backHomeBtn').addEventListener('click', () => showView('home'));

function loginHR() {
    const user = document.getElementById('hrUser').value;
    const pass = document.getElementById('hrPass').value;
    const err = document.getElementById('loginError');
    err.classList.add('hidden');

    const btn = document.getElementById('loginBtn');
    const original = btn.innerText;
    btn.innerText = "Signing in...";
    btn.disabled = true;

    fetch(SCRIPT_URL, {
        method: 'POST',
        body: JSON.stringify({ action: "login", username: user, password: pass })
    })
    .then(r => r.json())
    .then(data => {
        if (data.success) {
            document.getElementById('hrUser').value = '';
            document.getElementById('hrPass').value = '';
            showView('dashboard');
            fetchApplications();
        } else {
            err.innerText = data.message || "Invalid credentials";
            err.classList.remove('hidden');
        }
    })
    .catch(() => {
        err.innerText = "Connection error. Try again.";
        err.classList.remove('hidden');
    })
    .finally(() => {
        btn.innerText = original;
        btn.disabled = false;
    });
}

// ================= DASHBOARD =================
document.getElementById('logoutBtn').addEventListener('click', () => showView('home'));
document.getElementById('viewSiteBtn').addEventListener('click', () => showView('home'));
document.getElementById('dashLogoBtn').addEventListener('click', () => showView('home'));
document.getElementById('hrVacancyFilter').addEventListener('change', fetchApplications);

function fetchApplications() {
    const vacancy = document.getElementById('hrVacancyFilter').value;
    const container = document.getElementById('tableContainer');
    container.innerHTML = '<div class="empty-state"><div class="icon">⏳</div><p>Loading...</p></div>';

    fetch(SCRIPT_URL, {
        method: 'POST',
        body: JSON.stringify({ action: "getApplications", vacancy: vacancy })
    })
    .then(r => r.json())
    .then(data => {
        if (data.success) {
            renderTable(data.headers, data.rows);
            updateStats(data.rows);
        } else {
            container.innerHTML = '<div class="empty-state"><div class="icon">⚠️</div><p>Error loading data.</p></div>';
        }
    })
    .catch(() => {
        container.innerHTML = '<div class="empty-state"><div class="icon">⚠️</div><p>Connection error.</p></div>';
    });
}

function updateStats(rows) {
    const total = rows.length;
    const support = rows.filter(r => r[1] === 'Customer Agent').length;
    document.getElementById('statTotal').innerText = total;
    document.getElementById('statSupport').innerText = support;
}

function renderTable(headers, rows) {
    const container = document.getElementById('tableContainer');
    if (!rows || rows.length === 0) {
        container.innerHTML = '<div class="empty-state"><div class="icon">📭</div><p>No applications found.</p></div>';
        return;
    }
    let html = '<table><thead><tr>';
    headers.forEach(h => html += `<th>${h}</th>`);
    html += '</tr></thead><tbody>';
    rows.forEach(row => {
        html += '<tr>';
        row.forEach(cell => {
            if (cell instanceof Object && cell.toString().includes("GMT")) {
                cell = new Date(cell).toLocaleString();
            }
            html += `<td>${cell}</td>`;
        });
        html += '</tr>';
    });
    html += '</tbody></table>';
    container.innerHTML = html;
}

// ================= INIT =================
showView('home');
