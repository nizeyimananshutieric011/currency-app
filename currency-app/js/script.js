// 1. DATA Y'IBICIRO BY'AMAFARANGA (MOCK EXCHANGE RATES)
const exchangeRates = {
    USD: { EUR: 0.92, GBP: 0.78, RWF: 1450, USD: 1 },
    EUR: { USD: 1.09, GBP: 0.85, RWF: 1570, EUR: 1 },
    GBP: { USD: 1.28, EUR: 1.18, RWF: 1850, GBP: 1 },
    RWF: { USD: 0.00069, EUR: 0.00064, GBP: 0.00054, RWF: 1 }
};

// 2. DATA Y'INDIMI (DICTIONARY FOR LANGUAGES)
const translations = {
    en: {
        navHome: "Home", navConverter: "Converter", navDetails: "Details", navHistory: "History", navSettings: "Settings",
        heroTitle: "Fast & Secure Currency Exchange", heroSub: "Real-time rates, history, dark mode and responsive design.", btnConvertNow: "Convert Now",
        cardConverter: "💱 Currency Converter", labelAmount: "Amount", labelFrom: "From", labelTo: "To", btnSwap: "↔️ Swap", btnConvert: "Convert",
        cardDetails: "📈 Currency Details", txtSelected: "Selected Currency: USD", tableDate: "Date", tableRate: "Rate",
        cardHistory: "📜 Conversion History", placeholderFilter: "Filter by currency...", btnClear: "🗑 Clear History",
        tableAmount: "Amount", tableFrom: "From", tableTo: "To", tableResult: "Result",
        cardSettings: "⚙️ Settings", btnTheme: "🌙 Toggle Dark / Light", labelDefaultCurr: "Default Currency", labelLang: "Language",
        alertDefault: "Default currency updated to: ", alertLang: "Ururimi rwahinduwe mu Kinyarwanda! (Refresh to apply complete layout)"
    },
    rw: {
        navHome: "Ahabanza", navConverter: "Converter", navDetails: "Imbonerahamwe", navHistory: "Amateka", navSettings: "Igenamiterere",
        heroTitle: "Guhandura Amafaranga mu Bwihure n'Umutekano", heroSub: "Ibiciro bitunganyije, amateka, umwijima n'isura ijanye n'igihe.", btnConvertNow: "Yandure Ako Kanya",
        cardConverter: "💱 Ububariro bw'Amafaranga", labelAmount: "Umubare", labelFrom: "Kuva kuri", labelTo: "Kujya kuri", btnSwap: "↔️ Hinduranya", btnConvert: "Bara",
        cardDetails: "📈 Amakuru y'Ifaranga", txtSelected: "Ifaranga Ryatowe: USD", tableDate: "Itariki", tableRate: "Igiciro",
        cardHistory: "📜 Amateka y'Ibyabariwe", placeholderFilter: "Shakisha n'ifaranga...", btnClear: "🗑 Siba Amateka",
        tableAmount: "Ayabariwe", tableFrom: "Kuvaho", tableTo: "Kujyaho", tableResult: "Igisubizo",
        cardSettings: "⚙️ Igenamiterere", btnTheme: "🌙 Tegeka Umwijima / Umucyo", labelDefaultCurr: "Ifaranga ry'Ibanze", labelLang: "Ururimi",
        alertDefault: "Ifaranga ry'ibanze ryahindutse riba: ", alertLang: "Language changed to English!"
    }
};

// 3. APPLIYING LANGUAGE TO THE PAGE
function applyLanguage() {
    const lang = localStorage.getItem('language') || 'en';
    const t = translations[lang];

    // Gushyiraho indimi ku bintu byose bifite attribute ya 'data-translate'
    const elements = document.querySelectorAll('[data-translate]');
    elements.forEach(el => {
        const key = el.getAttribute('data-translate');
        if (t[key]) {
            if (el.tagName === 'INPUT' && el.hasAttribute('placeholder')) {
                el.placeholder = t[key];
            } else {
                el.innerText = t[key];
            }
        }
    });

    // Gukora update ku rurimi ruri muri dropdown ya settings.html niba ihari
    const langSelect = document.getElementById('languageSelect');
    if (langSelect) langSelect.value = lang;
}

function changeLanguage() {
    const langSelect = document.getElementById('languageSelect');
    if (!langSelect) return;
    localStorage.setItem('language', langSelect.value);
    applyLanguage();
    window.location.reload(); // Isubiramo kugira ngo page zose zifate ururimi neza
}

// 4. CONVERSION LOGIC
function convert() {
    const amountInput = document.getElementById('amount');
    const fromSelect = document.getElementById('from');
    const toSelect = document.getElementById('to');

    if (!amountInput || !fromSelect || !toSelect) return;

    const amount = parseFloat(amountInput.value);
    if (isNaN(amount) || amount <= 0) {
        alert(localStorage.getItem('language') === 'rw' ? "Nyamuneka shyiramo umubare muzima!" : "Please enter a valid amount!");
        return;
    }

    const fromCurr = fromSelect.value;
    const toCurr = toSelect.value;
    
    const rate = exchangeRates[fromCurr][toCurr];
    const result = amount * rate;
    const now = new Date();
    const timeString = `${now.toLocaleDateString()} - ${now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`;

    document.getElementById('result').innerText = `${amount.toLocaleString()} ${fromCurr} = ${result.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} ${toCurr}`;
    document.getElementById('rate').innerText = `Rate: 1 ${fromCurr} = ${rate} ${toCurr}`;
    document.getElementById('time').innerText = `Updated: ${timeString}`;

    saveToHistory(amount, fromCurr, toCurr, result.toLocaleString(undefined, {minimumFractionDigits: 2}), timeString);
}

function swapCurrencies() {
    const fromSelect = document.getElementById('from');
    const toSelect = document.getElementById('to');
    if (fromSelect && toSelect) {
        const temp = fromSelect.value;
        fromSelect.value = toSelect.value;
        toSelect.value = temp;
    }
}

// 5. HISTORY MANAGEMENT
function saveToHistory(amount, from, to, result, date) {
    let history = JSON.parse(localStorage.getItem('currencyHistory')) || [];
    history.push({ amount, from, to, result, date });
    localStorage.setItem('currencyHistory', JSON.stringify(history));
}

function renderHistory() {
    const historyBody = document.getElementById('historyBody');
    if (!historyBody) return;

    let history = JSON.parse(localStorage.getItem('currencyHistory')) || [];
    const filterInput = document.getElementById('filter');
    const filterValue = filterInput ? filterInput.value.toUpperCase() : '';

    historyBody.innerHTML = '';

    const filteredHistory = history.filter(item => 
        item.from.toUpperCase().includes(filterValue) || item.to.toUpperCase().includes(filterValue)
    );

    if (filteredHistory.length === 0) {
        const isRw = localStorage.getItem('language') === 'rw';
        historyBody.innerHTML = `<tr><td colspan="5" style="text-align:center;">${isRw ? 'Nta mateka yabonetse.' : 'No history found.'}</td></tr>`;
        return;
    }

    filteredHistory.reverse().forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${item.amount.toLocaleString()}</td>
            <td><strong>${item.from}</strong></td>
            <td><strong>${item.to}</strong></td>
            <td>${item.result}</td>
            <td><small>${item.date}</small></td>
        `;
        historyBody.appendChild(row);
    });
}

function clearHistory() {
    const isRw = localStorage.getItem('language') === 'rw';
    const msg = isRw ? "Ese urashaka gusiba amateka yose gushiraho?" : "Do you really want to clear all history?";
    if (confirm(msg)) {
        localStorage.removeItem('currencyHistory');
        renderHistory();
    }
}

// 6. SETTINGS MANAGEMENT
function toggleTheme() {
    let currentTheme = document.documentElement.getAttribute('data-theme');
    let targetTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', targetTheme);
    localStorage.setItem('theme', targetTheme);
}

function saveDefaultCurrency() {
    const defaultCurr = document.getElementById('defaultCurrency').value;
    localStorage.setItem('defaultCurrency', defaultCurr);
    const isRw = localStorage.getItem('language') === 'rw';
    alert(`${translations[isRw ? 'rw' : 'en'].alertDefault} ${defaultCurr}`);
}

// 7. WINDOW INITIALIZATION
window.addEventListener('DOMContentLoaded', () => {
    // Theme setup
    if (localStorage.getItem('theme') === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
    }

    // Default Currency setup
    const defaultCurr = localStorage.getItem('defaultCurrency');
    const fromSelect = document.getElementById('from');
    if (defaultCurr && fromSelect) {
        fromSelect.value = defaultCurr;
    }
    const defCurrSelect = document.getElementById('defaultCurrency');
    if (defaultCurr && defCurrSelect) {
        defCurrSelect.value = defaultCurr;
    }

    // Apply Language UI
    applyLanguage();

    // Render History table if on history page
    renderHistory();
});