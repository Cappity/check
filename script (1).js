document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const passwordInput = document.getElementById('password');
    const togglePassword = document.getElementById('togglePassword');
    const strengthBar = document.getElementById('strength-bar');
    const strengthText = document.getElementById('strength-text');
    const scoreEl = document.getElementById('score');
    const crackTimeEl = document.getElementById('crack-time');
    const entropyEl = document.getElementById('entropy');
    const criteriaList = document.getElementById('criteria-list').getElementsByTagName('li');
    const generateBtn = document.getElementById('generate-password');
    const copyBtn = document.getElementById('copy-password');
    const historySelect = document.getElementById('password-history');
    const badgeEl = document.getElementById('badge');
    const themeToggle = document.getElementById('theme-toggle-checkbox');

    let passwordHistory = [];

    // --- Event Listeners ---
    togglePassword.addEventListener('click', () => {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        togglePassword.classList.toggle('fa-eye-slash');
    });

    passwordInput.addEventListener('input', () => {
        const password = passwordInput.value;
        const analysis = analyzePassword(password);
        updateUI(analysis);
    });

    generateBtn.addEventListener('click', () => {
        const newPassword = generateSecurePassword();
        if (passwordInput.value) {
            addToHistory(passwordInput.value);
        }
        passwordInput.value = newPassword;
        const analysis = analyzePassword(newPassword);
        updateUI(analysis);
    });

    copyBtn.addEventListener('click', showCopyToast);
    
    historySelect.addEventListener('change', (e) => {
        passwordInput.value = e.target.value;
        const analysis = analyzePassword(e.target.value);
        updateUI(analysis);
    });

    themeToggle.addEventListener('change', () => {
        document.body.classList.toggle('dark-mode');
        document.body.classList.toggle('light-mode');
    });

    // --- Core Functions ---
    function analyzePassword(password) {
        let score = 0;
        let charPool = 0;

        const checks = {
            length: password.length >= 12,
            lowercase: /[a-z]/.test(password),
            uppercase: /[A-Z]/.test(password),
            number: /[0-9]/.test(password),
            special: /[^a-zA-Z0-9]/.test(password),
        };

        if (checks.length) score += 25;
        if (checks.lowercase) { score += 15; charPool += 26; }
        if (checks.uppercase) { score += 15; charPool += 26; }
        if (checks.number) { score += 15; charPool += 10; }
        if (checks.special) { score += 30; charPool += 32; }
        
        score = Math.min(score, 100);

        const entropy = password.length > 0 ? Math.round(Math.log2(Math.pow(charPool, password.length))) : 0;
        const crackTime = estimateCrackTime(entropy);
        
        return { password, score, entropy, crackTime, checks };
    }

    function updateUI(analysis) {
        // Update Score & Strength Bar
        scoreEl.textContent = analysis.score;
        strengthBar.style.width = `${analysis.score}%`;
        
        let strengthLabel = 'Very Weak';
        let barColor = 'var(--weak-red)';
        if (analysis.score >= 90) {
            strengthLabel = 'Unbreakable';
            barColor = 'var(--primary-green)';
        } else if (analysis.score >= 75) {
            strengthLabel = 'Very Strong';
            barColor = 'var(--strong-green)';
        } else if (analysis.score >= 50) {
            strengthLabel = 'Strong';
            barColor = 'var(--secondary-green)';
        } else if (analysis.score >= 25) {
            strengthLabel = 'Moderate';
            barColor = 'var(--medium-orange)';
        }
        strengthText.textContent = strengthLabel;
        strengthBar.style.backgroundColor = barColor;

        // Update Details
        crackTimeEl.textContent = analysis.crackTime;
        entropyEl.textContent = `${analysis.entropy < 1000 ? analysis.entropy : '>1000'} bits`;

        // Update Criteria Checklist
        for (const key in analysis.checks) {
            const li = document.getElementById(key);
            const icon = li.querySelector('i');
            if (analysis.checks[key]) {
                li.classList.add('met');
                icon.className = 'fas fa-check-circle';
            } else {
                li.classList.remove('met');
                icon.className = 'fas fa-times-circle';
            }
        }

        // Update Gamification Badge
        updateBadge(analysis.score);
    }

    function generateSecurePassword() {
        const length = 16;
        const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+~`|}{[]:;?><,./-=';
        let password = '';
        for (let i = 0, n = charset.length; i < length; ++i) {
            password += charset.charAt(Math.floor(Math.random() * n));
        }
        return password;
    }

    function estimateCrackTime(entropy) {
        if (entropy === 0) return 'instant';
        const calculationsPerSecond = 1e10; // 10 billion
        const seconds = Math.pow(2, entropy) / calculationsPerSecond;

        if (seconds < 60) return `${Math.round(seconds)} seconds`;
        const minutes = seconds / 60;
        if (minutes < 60) return `${Math.round(minutes)} minutes`;
        const hours = minutes / 60;
        if (hours < 24) return `${Math.round(hours)} hours`;
        const days = hours / 24;
        if (days < 365) return `${Math.round(days)} days`;
        const years = days / 365;
        if (years < 1e3) return `${Math.round(years)} years`;
        if (years < 1e6) return `${(years / 1e3).toPrecision(3)} thousand years`;
        if (years < 1e9) return `${(years / 1e6).toPrecision(3)} million years`;
        return 'trillions of years';
    }
    
    // --- Helper & UX Functions ---
    function addToHistory(password) {
        if (password && !passwordHistory.includes(password)) {
            passwordHistory.unshift(password);
            if (passwordHistory.length > 5) {
                passwordHistory.pop();
            }
            // Update dropdown
            historySelect.innerHTML = '';
            passwordHistory.forEach(p => {
                const option = document.createElement('option');
                option.value = p;
                option.textContent = p;
                historySelect.appendChild(option);
            });
        }
    }
    
    function showCopyToast() {
        if (!passwordInput.value) return;
        passwordInput.select();
        document.execCommand('copy');
        const toast = document.getElementById('toast');
        toast.className = "toast show";
        setTimeout(() => { toast.className = toast.className.replace("show", ""); }, 3000);
    }

    function updateBadge(score) {
        let text = '';
        let bgColor = 'transparent';
        let textColor = '#888';
        if (score >= 100) {
            text = 'Password Pro';
            bgColor = 'var(--primary-green)';
            textColor = '#000';
        } else if (score >= 75) {
            text = 'Cyber Sentinel';
            bgColor = 'var(--secondary-green)';
            textColor = '#fff';
        } else if (score >= 50) {
            text = 'Digital Locksmith';
            bgColor = 'var(--medium-orange)';
            textColor = '#000';
        } else {
            text = 'Novice';
        }
        badgeEl.textContent = text;
        badgeEl.style.backgroundColor = bgColor;
        badgeEl.style.color = textColor;
    }

    // Initial state
    document.body.classList.add('dark-mode');
    updateUI(analyzePassword(''));
});