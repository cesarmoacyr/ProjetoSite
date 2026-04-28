/* =============================================
   Moacyr Barrois Portfolio - script.js
   ============================================= */

// ── Navbar scroll effect ──────────────────────
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 60);
});

// ── Hamburger menu ────────────────────────────
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('nav-links');

hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navLinks.classList.toggle('open');
});

navLinks.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navLinks.classList.remove('open');
    });
});

// ── Reveal on scroll ──────────────────────────
const revealEls = document.querySelectorAll(
    '.servico-card, .resultado-card, .depoimento-card, .sobre-grid > *, .contato-grid > *, .processo-visual, .processo-etapas'
);

revealEls.forEach(el => el.classList.add('reveal'));

const revealObserver = new IntersectionObserver(entries => {
    entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
            setTimeout(() => entry.target.classList.add('visible'), i * 80);
            revealObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.08 });

revealEls.forEach(el => revealObserver.observe(el));

// Observa também qualquer elemento com .reveal já definido no HTML
document.querySelectorAll('.reveal').forEach(el => {
    if (!el.classList.contains('visible')) {
        revealObserver.observe(el);
    }
});

// ── Counter animation ─────────────────────────
function animateCount(el) {
    const target = +el.dataset.target;
    const duration = 1800;
    const start = performance.now();

    function step(now) {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3); // ease out cubic
        el.textContent = Math.round(eased * target);
        if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
}

const counters = document.querySelectorAll('.stat-value, .count');
let counted = false;

const counterObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (entry.isIntersecting && !counted) {
            counted = true;
            counters.forEach(c => animateCount(c));
        }
    });
}, { threshold: 0.3 });

if (counters.length > 0) counterObserver.observe(counters[0]);

// ── Testimonial Slider ────────────────────────
const track = document.getElementById('depoimentos-track');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const dotsEl = document.getElementById('slider-dots');
const cards = track ? track.querySelectorAll('.depoimento-card') : [];
const total = cards.length;
let current = 0;
let autoSlide;

// Build dots
cards.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className = 'dot' + (i === 0 ? ' active' : '');
    dot.setAttribute('aria-label', `Slide ${i + 1}`);
    dot.addEventListener('click', () => goTo(i));
    dotsEl.appendChild(dot);
});

function updateDots() {
    dotsEl.querySelectorAll('.dot').forEach((d, i) =>
        d.classList.toggle('active', i === current)
    );
}

function goTo(index) {
    current = (index + total) % total;
    track.style.transform = `translateX(-${current * 100}%)`;
    updateDots();
}

prevBtn?.addEventListener('click', () => { goTo(current - 1); resetAuto(); });
nextBtn?.addEventListener('click', () => { goTo(current + 1); resetAuto(); });

function startAuto() {
    autoSlide = setInterval(() => goTo(current + 1), 5000);
}

function resetAuto() {
    clearInterval(autoSlide);
    startAuto();
}

startAuto();

// ── Contact Form (Web3Forms) ──────────────────
const form = document.getElementById('contato-form');
const submitBtn = document.getElementById('submit-btn');
const successMsg = document.getElementById('form-success');

// ⚠️ Substitua pela sua chave obtida em https://web3forms.com
const WEB3FORMS_KEY = '05372c84-01c9-48f4-904b-313f5c6c8739';

form?.addEventListener('submit', async e => {
    e.preventDefault();

    const nome = form.nome.value.trim();
    const email = form.email.value.trim();
    const mensagem = form.mensagem.value.trim();

    if (!nome || !email || !mensagem) {
        shakeForm();
        return;
    }

    // Loading state
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';

    const payload = {
        access_key: WEB3FORMS_KEY,
        subject: `Novo contato pelo site - ${nome}`,
        from_name: nome,
        email: email,
        whatsapp: form.whatsapp?.value.trim() || 'Não informado',
        servico: form.servico?.value || 'Não selecionado',
        mensagem: mensagem,
    };

    try {
        const res = await fetch('https://api.web3forms.com/submit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify(payload),
        });
        const data = await res.json();

        if (data.success) {
            submitBtn.style.display = 'none';
            successMsg.classList.add('show');
            form.reset();

            setTimeout(() => {
                submitBtn.style.display = '';
                submitBtn.disabled = false;
                submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Enviar Mensagem';
                successMsg.classList.remove('show');
            }, 6000);
        } else {
            throw new Error(data.message || 'Erro ao enviar');
        }
    } catch (err) {
        console.error('Erro ao enviar formulário:', err);
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-exclamation-circle"></i> Erro! Tente novamente';
        setTimeout(() => {
            submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Enviar Mensagem';
        }, 4000);
    }
});

function shakeForm() {
    const wrapper = document.querySelector('.contato-form-wrapper');
    wrapper.style.animation = 'none';
    wrapper.offsetHeight; // reflow
    wrapper.style.animation = 'shake 0.4s ease';
}

// Inject shake keyframe
const shakeStyle = document.createElement('style');
shakeStyle.textContent = `
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    20%       { transform: translateX(-8px); }
    40%       { transform: translateX(8px); }
    60%       { transform: translateX(-6px); }
    80%       { transform: translateX(6px); }
  }
`;
document.head.appendChild(shakeStyle);

// ── WhatsApp button fade-in ───────────────────
const waBtn = document.getElementById('whatsapp-float');
setTimeout(() => {
    if (waBtn) waBtn.style.opacity = '1';
}, 2000);

// ── Active nav link highlight on scroll ──────
const sections = document.querySelectorAll('section[id]');
const navItems = document.querySelectorAll('.nav-link');

const sectionObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            navItems.forEach(link => {
                link.style.color = '';
                if (link.getAttribute('href') === `#${entry.target.id}`) {
                    link.style.color = 'var(--accent-violet)';
                }
            });
        }
    });
}, { threshold: 0.4 });

sections.forEach(s => sectionObserver.observe(s));
