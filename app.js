/**
 * HCM202 - SU26 | Multi-Exam Spaced Repetition Study Engine
 * Supports: SU26 - RE, SU26 - C1FE, and Merged/Deduplicated Combined dataset.
 * Features: Dark/Light Mode, Spaced Repetition, Keyboard Shortcuts, Image Previews.
 */

class QuizletApp {
  constructor() {
    this.examsData = window.EXAMS_DATA || {};
    
    // Theme setup
    this.theme = localStorage.getItem('hcm202_theme') || 'dark';

    // Default active exam
    const savedExam = localStorage.getItem('hcm202_active_exam');
    this.currentExam = (savedExam && this.examsData[savedExam]) ? savedExam : 're';
    this.currentMode = 'quizlet'; // 'quizlet' | 'list'
    this.listFilter = 'all'; // 'all' | 'SU26 - RE' | 'SU26 - C1FE'
    
    // Learning state for current exam
    this.queue = [];
    this.repeatQueue = [];
    this.masteredIds = new Set();
    this.currentIndex = 0;
    this.currentCardAnswered = false;
    this.round = 1;

    // DOM Elements
    this.initElements();
    this.applyTheme(this.theme);
    this.initEvents();

    // Load active exam
    this.loadExam(this.currentExam);
  }

  initElements() {
    // Header & Titles
    this.appMainTitle = document.getElementById('appMainTitle');
    this.appSubTitle = document.getElementById('appSubTitle');
    this.tabListTitle = document.getElementById('tabListTitle');
    this.activeExamStatsBadge = document.getElementById('activeExamStatsBadge');

    // Theme Toggle
    this.btnThemeToggle = document.getElementById('btnThemeToggle');
    this.themeIcon = document.getElementById('themeIcon');
    this.themeText = document.getElementById('themeText');

    // Exam Selector buttons
    this.btnExamRE = document.getElementById('btnExamRE');
    this.btnExamC1FE = document.getElementById('btnExamC1FE');
    this.btnExamFA25 = document.getElementById('btnExamFA25');
    this.btnExamSU25 = document.getElementById('btnExamSU25');
    this.btnExamFEKTS = document.getElementById('btnExamFEKTS');
    this.btnExamSP25 = document.getElementById('btnExamSP25');
    this.btnExamCombined = document.getElementById('btnExamCombined');

    // Tabs
    this.tabQuizlet = document.getElementById('tabQuizlet');
    this.tabList = document.getElementById('tabList');
    this.quizletView = document.getElementById('quizletView');
    this.listView = document.getElementById('listView');

    // Stats
    this.statRemain = document.getElementById('statRemain');
    this.statRepeat = document.getElementById('statRepeat');
    this.statMastered = document.getElementById('statMastered');
    this.fillMastered = document.getElementById('fillMastered');
    this.fillRepeat = document.getElementById('fillRepeat');

    // Card Elements
    this.cardContainer = document.getElementById('quizCardContainer');
    this.completedScreen = document.getElementById('completedScreen');
    this.completedTitle = document.getElementById('completedTitle');
    this.completedDesc = document.getElementById('completedDesc');
    this.roundNotice = document.getElementById('roundNotice');
    this.roundNoticeText = document.getElementById('roundNoticeText');

    this.qBadge = document.getElementById('qBadge');
    this.qExamTag = document.getElementById('qExamTag');
    this.qText = document.getElementById('qText');
    this.optionsContainer = document.getElementById('optionsContainer');
    this.feedbackBox = document.getElementById('feedbackBox');
    this.feedbackStatus = document.getElementById('feedbackStatus');
    this.feedbackText = document.getElementById('feedbackText');
    this.decisionToolbar = document.getElementById('decisionToolbar');
    this.btnReveal = document.getElementById('btnReveal');
    this.btnRepeat = document.getElementById('btnRepeat');
    this.btnMastered = document.getElementById('btnMastered');
    this.imgPreviewBox = document.getElementById('imgPreviewBox');
    this.cardImg = document.getElementById('cardImg');
    this.btnToggleImg = document.getElementById('btnToggleImg');

    // List View Elements
    this.quickKeyHeader = document.getElementById('quickKeyHeader');
    this.quickKeyGrid = document.getElementById('quickKeyGrid');
    this.listContainer = document.getElementById('listContainer');
    this.searchInput = document.getElementById('searchInput');
    this.listFilterBar = document.getElementById('listFilterBar');
  }

  /* ================= THEME ENGINE ================= */
  toggleTheme() {
    this.theme = this.theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('hcm202_theme', this.theme);
    this.applyTheme(this.theme);
  }

  applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    if (this.themeIcon) {
      this.themeIcon.textContent = theme === 'light' ? '☀️' : '🌙';
    }
    if (this.themeText) {
      this.themeText.textContent = theme === 'light' ? 'Sáng' : 'Tối';
    }
  }

  /* ================= EXAM ENGINE ================= */
  loadExam(examKey) {
    if (!this.examsData[examKey]) {
      examKey = 're';
    }
    this.currentExam = examKey;
    localStorage.setItem('hcm202_active_exam', examKey);

    const examInfo = this.examsData[examKey];
    this.allQuestions = examInfo.questions || [];

    // Update active pill UI
    [this.btnExamRE, this.btnExamC1FE, this.btnExamFA25, this.btnExamSU25, this.btnExamFEKTS, this.btnExamSP25, this.btnExamCombined].forEach(btn => {
      if (btn) btn.classList.remove('active');
    });
    if (examKey === 're' && this.btnExamRE) this.btnExamRE.classList.add('active');
    if (examKey === 'c1fe' && this.btnExamC1FE) this.btnExamC1FE.classList.add('active');
    if (examKey === 'fa25_half1' && this.btnExamFA25) this.btnExamFA25.classList.add('active');
    if (examKey === 'su25_b5' && this.btnExamSU25) this.btnExamSU25.classList.add('active');
    if (examKey === 'fekts' && this.btnExamFEKTS) this.btnExamFEKTS.classList.add('active');
    if (examKey === 'sp25_fe' && this.btnExamSP25) this.btnExamSP25.classList.add('active');
    if (examKey === 'combined' && this.btnExamCombined) this.btnExamCombined.classList.add('active');

    // Update headers
    if (this.appMainTitle) this.appMainTitle.textContent = examInfo.name;
    if (this.tabListTitle) this.tabListTitle.textContent = `📋 Danh sách ${examInfo.total} câu`;
    if (this.activeExamStatsBadge) {
      this.activeExamStatsBadge.textContent = `${examInfo.shortName}: ${examInfo.total} câu`;
    }

    // Toggle filter bar in list view
    if (this.listFilterBar) {
      this.listFilterBar.style.display = examKey === 'combined' ? 'flex' : 'none';
    }

    // Load saved progress for this exam
    this.loadProgress();

    // Render active mode
    if (this.currentMode === 'quizlet') {
      this.render();
    } else {
      this.renderListView();
    }
  }

  loadProgress() {
    const storageKey = `hcm202_progress_${this.currentExam}`;
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        this.masteredIds = new Set(parsed.masteredIds || []);
        this.round = parsed.round || 1;
      } else {
        this.masteredIds = new Set();
        this.round = 1;
      }
    } catch (e) {
      console.warn("Could not load progress", e);
      this.masteredIds = new Set();
      this.round = 1;
    }

    const unmastered = this.allQuestions.filter(q => !this.masteredIds.has(this.getQuestionUniqueKey(q)));
    this.queue = unmastered.length > 0 ? [...unmastered] : [];
    this.repeatQueue = [];
    this.currentIndex = 0;
  }

  saveProgress() {
    const storageKey = `hcm202_progress_${this.currentExam}`;
    try {
      localStorage.setItem(storageKey, JSON.stringify({
        masteredIds: Array.from(this.masteredIds),
        round: this.round
      }));
    } catch (e) {
      console.warn("Could not save progress", e);
    }
  }

  getQuestionUniqueKey(q) {
    return q.combined_id || q.uid || q.id;
  }

  resetProgress() {
    const examInfo = this.examsData[this.currentExam];
    if (confirm(`Bạn có chắc muốn đặt lại tiến độ học cho "${examInfo.name}" và bắt đầu lại từ đầu?`)) {
      const storageKey = `hcm202_progress_${this.currentExam}`;
      localStorage.removeItem(storageKey);
      this.masteredIds.clear();
      this.queue = [...this.allQuestions];
      this.repeatQueue = [];
      this.currentIndex = 0;
      this.round = 1;
      this.render();
    }
  }

  initEvents() {
    // Theme toggle
    if (this.btnThemeToggle) {
      this.btnThemeToggle.addEventListener('click', () => this.toggleTheme());
    }

    // Exam pills
    if (this.btnExamRE) this.btnExamRE.addEventListener('click', () => this.loadExam('re'));
    if (this.btnExamC1FE) this.btnExamC1FE.addEventListener('click', () => this.loadExam('c1fe'));
    if (this.btnExamFA25) this.btnExamFA25.addEventListener('click', () => this.loadExam('fa25_half1'));
    if (this.btnExamSU25) this.btnExamSU25.addEventListener('click', () => this.loadExam('su25_b5'));
    if (this.btnExamFEKTS) this.btnExamFEKTS.addEventListener('click', () => this.loadExam('fekts'));
    if (this.btnExamSP25) this.btnExamSP25.addEventListener('click', () => this.loadExam('sp25_fe'));
    if (this.btnExamCombined) this.btnExamCombined.addEventListener('click', () => this.loadExam('combined'));

    // Mode Switcher
    this.tabQuizlet.addEventListener('click', () => this.switchMode('quizlet'));
    this.tabList.addEventListener('click', () => this.switchMode('list'));

    // Card buttons
    this.btnReveal.addEventListener('click', () => this.revealAnswer());
    this.btnRepeat.addEventListener('click', () => this.handleDecision(false));
    this.btnMastered.addEventListener('click', () => this.handleDecision(true));
    this.btnToggleImg.addEventListener('click', () => this.toggleImage());
    
    document.getElementById('btnReset').addEventListener('click', () => this.resetProgress());
    document.getElementById('btnRestartQuiz').addEventListener('click', () => this.resetProgress());
    document.getElementById('btnShuffle').addEventListener('click', () => this.shuffleQueue());

    // Search input
    this.searchInput.addEventListener('input', (e) => this.filterList(e.target.value));

    // List filter buttons
    if (this.listFilterBar) {
      this.listFilterBar.querySelectorAll('.filter-pill-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          this.listFilterBar.querySelectorAll('.filter-pill-btn').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          this.listFilter = btn.dataset.filter;
          this.filterList(this.searchInput.value);
        });
      });
    }

    // Keyboard shortcuts
    window.addEventListener('keydown', (e) => {
      // Don't trigger if user is typing in search
      if (document.activeElement === this.searchInput) return;

      const key = e.key.toUpperCase();

      // Theme toggle shortcut (T)
      if (key === 'T') {
        e.preventDefault();
        this.toggleTheme();
        return;
      }

      if (this.currentMode !== 'quizlet') return;

      // Options select (1, 2, 3, 4 or A, B, C, D)
      if (!this.currentCardAnswered) {
        if (key === '1' || key === 'A') this.selectOption('A');
        else if (key === '2' || key === 'B') this.selectOption('B');
        else if (key === '3' || key === 'C') this.selectOption('C');
        else if (key === '4' || key === 'D') this.selectOption('D');
        else if (key === ' ' || key === 'ENTER') {
          e.preventDefault();
          this.revealAnswer();
        }
      } else {
        // After card answered / revealed: Decision
        if (key === '1' || key === 'L' || key === 'ARROWLEFT') {
          e.preventDefault();
          this.handleDecision(false); // Chưa nhớ
        } else if (key === '2' || key === 'R' || key === 'ARROWRIGHT' || key === 'ENTER' || key === ' ') {
          e.preventDefault();
          this.handleDecision(true); // Đã nhớ
        }
      }
    });
  }

  switchMode(mode) {
    this.currentMode = mode;
    if (mode === 'quizlet') {
      this.tabQuizlet.classList.add('active');
      this.tabList.classList.remove('active');
      this.quizletView.style.display = 'flex';
      this.listView.style.display = 'none';
      this.render();
    } else {
      this.tabList.classList.add('active');
      this.tabQuizlet.classList.remove('active');
      this.quizletView.style.display = 'none';
      this.listView.style.display = 'flex';
      this.renderListView();
    }
  }

  shuffleQueue() {
    for (let i = this.queue.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.queue[i], this.queue[j]] = [this.queue[j], this.queue[i]];
    }
    this.currentIndex = 0;
    this.render();
  }

  getCurrentQuestion() {
    if (this.queue.length === 0 || this.currentIndex >= this.queue.length) return null;
    return this.queue[this.currentIndex];
  }

  render() {
    this.updateStats();

    const q = this.getCurrentQuestion();
    if (!q) {
      // Repeat round check
      if (this.repeatQueue.length > 0) {
        this.round++;
        this.queue = [...this.repeatQueue];
        this.repeatQueue = [];
        this.currentIndex = 0;
        this.showRoundNotice(`🎯 Bắt đầu Vòng ${this.round}: Lặp lại ${this.queue.length} câu bạn chưa nhớ!`);
        this.render();
        return;
      }

      // Completion check
      if (this.masteredIds.size >= this.allQuestions.length && this.allQuestions.length > 0) {
        this.showCompletedScreen();
        return;
      }

      return;
    }

    // Hide completion screen
    this.completedScreen.style.display = 'none';
    this.cardContainer.style.display = 'block';

    // Reset card state
    this.currentCardAnswered = false;
    this.imgPreviewBox.style.display = 'none';
    this.feedbackBox.style.display = 'none';
    this.btnReveal.style.display = 'inline-flex';
    this.decisionToolbar.style.display = 'none';

    // Badge details
    const totalQ = this.allQuestions.length;
    const qNumber = q.combined_id || q.q_num || q.id;
    this.qBadge.textContent = `CÂU ${qNumber} / ${totalQ} • VÒNG ${this.round}`;

    // Exam tag
    if (q.sources && q.sources.length > 1) {
      this.qExamTag.className = 'q-exam-tag tag-combined';
      this.qExamTag.textContent = `Xuất hiện ở ${q.sources.length} đề (${q.sources.map(s => s.exam).join(', ')})`;
    } else if (q.sources && q.sources.length === 1) {
      const src = q.sources[0];
      let tagClass = 'tag-re';
      if (src.exam.includes('C1FE')) tagClass = 'tag-c1fe';
      else if (src.exam.includes('FA25') || src.exam.includes('Half1')) tagClass = 'tag-fa25';
      else if (src.exam.includes('FEKTS')) tagClass = 'tag-fekts';
      else if (src.exam.includes('SP25')) tagClass = 'tag-sp25';
      else if (src.exam.includes('SU25') || src.exam.includes('B5')) tagClass = 'tag-su25';
      this.qExamTag.className = `q-exam-tag ${tagClass}`;
      this.qExamTag.textContent = `Đề ${src.exam} #${src.q_num}`;
    } else {
      const isRe = (q.exam_code || '').includes('RE');
      const isC1 = (q.exam_code || '').includes('C1FE');
      const isFEKTS = (q.exam_code || '').includes('FEKTS');
      const isSP25 = (q.exam_code || '').includes('SP25');
      const isB5 = (q.exam_code || '').includes('SU25') || (q.exam_code || '').includes('B5');
      let tagClass = 'tag-fa25';
      if (isRe) tagClass = 'tag-re';
      else if (isC1) tagClass = 'tag-c1fe';
      else if (isFEKTS) tagClass = 'tag-fekts';
      else if (isSP25) tagClass = 'tag-sp25';
      else if (isB5) tagClass = 'tag-su25';
      this.qExamTag.className = `q-exam-tag ${tagClass}`;
      this.qExamTag.textContent = q.exam_code || `Đề ${this.currentExam.toUpperCase()}`;
    }

    // Question content
    this.qText.textContent = q.question;

    // Set image src
    this.cardImg.src = q.image || `images/q${q.id}.webp`;

    // Render options
    this.optionsContainer.innerHTML = '';
    const optionKeys = ['A', 'B', 'C', 'D'];
    optionKeys.forEach((key, idx) => {
      if (!q.options[key]) return;
      const btn = document.createElement('button');
      btn.className = 'quiz-option-btn';
      btn.dataset.key = key;
      btn.innerHTML = `
        <span class="opt-prefix">${key}</span>
        <span class="opt-content">${q.options[key]}</span>
        <span class="kbd-hint">${idx + 1}</span>
      `;
      btn.addEventListener('click', () => this.selectOption(key));
      this.optionsContainer.appendChild(btn);
    });
  }

  selectOption(selectedKey) {
    if (this.currentCardAnswered) return;
    this.currentCardAnswered = true;

    const q = this.getCurrentQuestion();
    const correctAnswers = q.answer.split(',').map(s => s.trim());
    const isCorrect = correctAnswers.includes(selectedKey);

    const buttons = this.optionsContainer.querySelectorAll('.quiz-option-btn');
    buttons.forEach(btn => {
      btn.disabled = true;
      const key = btn.dataset.key;
      if (key === selectedKey) {
        btn.classList.add(isCorrect ? 'selected-correct' : 'selected-wrong');
      }
      if (correctAnswers.includes(key)) {
        btn.classList.add('revealed-correct');
      }
    });

    this.showFeedback(isCorrect, q);
  }

  revealAnswer() {
    if (this.currentCardAnswered) return;
    this.currentCardAnswered = true;

    const q = this.getCurrentQuestion();
    const correctAnswers = q.answer.split(',').map(s => s.trim());

    const buttons = this.optionsContainer.querySelectorAll('.quiz-option-btn');
    buttons.forEach(btn => {
      btn.disabled = true;
      if (correctAnswers.includes(btn.dataset.key)) {
        btn.classList.add('revealed-correct');
      }
    });

    this.showFeedback(null, q);
  }

  showFeedback(isCorrect, q) {
    this.feedbackBox.style.display = 'block';
    if (isCorrect === true) {
      this.feedbackStatus.className = 'feedback-status correct';
      this.feedbackStatus.innerHTML = `<span>✓ Chính xác! (Đáp án: ${q.answer})</span>`;
    } else if (isCorrect === false) {
      this.feedbackStatus.className = 'feedback-status wrong';
      this.feedbackStatus.innerHTML = `<span>✕ Chưa đúng! (Đáp án đúng là: ${q.answer})</span>`;
    } else {
      this.feedbackStatus.className = 'feedback-status';
      this.feedbackStatus.innerHTML = `<span style="color:var(--primary);">💡 Đáp án chính xác: ${q.answer}</span>`;
    }

    let extraHtml = '';
    if (q.variant_note) {
      extraHtml += `<div style="background:rgba(245,158,11,0.12); border:1px solid rgba(245,158,11,0.3); border-radius:8px; padding:8px 12px; margin-bottom:8px; font-size:0.83rem; color:var(--warning);">⚠️ <strong>Đối chiếu đề thi:</strong> ${q.variant_note}</div>`;
    }

    let votesStr = '';
    if (q.votes && Object.keys(q.votes).length > 0) {
      votesStr = `<div style="font-size:0.82rem; color:var(--text-muted); margin-top:4px;">✓ Bình chọn cộng đồng: ${JSON.stringify(q.votes).replace(/[{"}]/g, '').replace(/:/g, ': ').replace(/,/g, ' | ')}</div>`;
    }

    this.feedbackText.innerHTML = `
      ${extraHtml}
      <div style="margin-bottom:6px;"><strong>Giải thích:</strong> ${q.explanation || 'Xem nội dung bài giảng và tài liệu HCM202.'}</div>
      ${votesStr}
    `;

    this.btnReveal.style.display = 'none';
    this.decisionToolbar.style.display = 'flex';
  }

  handleDecision(isMastered) {
    const q = this.getCurrentQuestion();
    if (!q) return;

    const key = this.getQuestionUniqueKey(q);

    if (isMastered) {
      this.masteredIds.add(key);
      this.repeatQueue = this.repeatQueue.filter(item => this.getQuestionUniqueKey(item) !== key);
    } else {
      if (!this.repeatQueue.some(item => this.getQuestionUniqueKey(item) === key)) {
        this.repeatQueue.push(q);
      }
      this.masteredIds.delete(key);
    }

    this.saveProgress();

    this.currentIndex++;
    this.render();
  }

  updateStats() {
    const total = this.allQuestions.length;
    const mastered = this.masteredIds.size;
    const unmastered = Math.max(0, total - mastered);
    const inRepeat = this.repeatQueue.length;

    this.statRemain.textContent = `${unmastered} câu`;
    this.statRepeat.textContent = `${inRepeat} câu`;
    this.statMastered.textContent = `${mastered}/${total} câu`;

    const masteredPct = total > 0 ? (mastered / total) * 100 : 0;
    const repeatPct = total > 0 ? (inRepeat / total) * 100 : 0;

    this.fillMastered.style.width = `${masteredPct}%`;
    this.fillRepeat.style.width = `${repeatPct}%`;
  }

  toggleImage() {
    const isVisible = this.imgPreviewBox.style.display === 'block';
    this.imgPreviewBox.style.display = isVisible ? 'none' : 'block';
  }

  showRoundNotice(msg) {
    this.roundNoticeText.textContent = msg;
    this.roundNotice.style.display = 'block';
    setTimeout(() => {
      this.roundNotice.style.display = 'none';
    }, 3500);
  }

  showCompletedScreen() {
    this.cardContainer.style.display = 'none';
    this.completedScreen.style.display = 'block';
    const examInfo = this.examsData[this.currentExam];
    this.completedTitle.textContent = `🎉 Chúc Mừng! Bạn Đã Thuộc Toàn Bộ ${examInfo.total} Câu!`;
    this.completedDesc.textContent = `Bạn đã hoàn thành toàn bộ câu hỏi trong "${examInfo.name}" và không còn câu nào trong danh sách cần lặp lại.`;
    this.updateStats();
  }

  /* ================= LIST VIEW LOGIC ================= */
  renderListView() {
    const examInfo = this.examsData[this.currentExam];
    if (this.quickKeyHeader) {
      this.quickKeyHeader.textContent = `⚡ Bảng tra đáp án nhanh — ${examInfo.shortName} (${this.allQuestions.length} câu)`;
    }

    // Quick Key Grid
    this.quickKeyGrid.innerHTML = this.allQuestions.map(q => {
      const qNum = q.combined_id || q.q_num || q.id;
      return `
        <div class="key-item" onclick="app.scrollToListQ('${this.getQuestionUniqueKey(q)}')">
          <span class="key-q">Câu ${qNum}</span>
          <span class="key-ans">${q.answer}</span>
        </div>
      `;
    }).join('');

    this.filterList(this.searchInput.value);
  }

  filterList(term) {
    term = (term || '').toLowerCase().trim();
    const filter = this.listFilter;

    const filtered = this.allQuestions.filter(q => {
      // 1. Exam source filter if combined
      if (filter !== 'all') {
        const matchesExam = (q.sources || []).some(s => s.exam.includes(filter)) || (q.exam_code || '').includes(filter);
        if (!matchesExam) return false;
      }

      // 2. Search term filter
      if (!term) return true;
      const qNum = `${q.combined_id || q.q_num || q.id}`;
      const matchText = q.question.toLowerCase().includes(term);
      const matchOpts = Object.values(q.options).some(o => o.toLowerCase().includes(term));
      const matchExp = (q.explanation || '').toLowerCase().includes(term);
      const matchId = `câu ${qNum}`.includes(term) || qNum === term;
      const matchSource = (q.sources || []).some(s => s.exam.toLowerCase().includes(term));
      return matchText || matchOpts || matchExp || matchId || matchSource;
    });

    if (filtered.length === 0) {
      this.listContainer.innerHTML = '<div style="text-align:center; padding: 40px; color: var(--text-muted); background:var(--surface); border-radius:12px;">Không tìm thấy câu hỏi phù hợp với điều kiện tìm kiếm/lọc.</div>';
      return;
    }

    this.listContainer.innerHTML = filtered.map(q => {
      const qKey = this.getQuestionUniqueKey(q);
      const qNum = q.combined_id || q.q_num || q.id;
      const correctAnswers = q.answer.split(',').map(s => s.trim());
      const isMastered = this.masteredIds.has(qKey);

      // Source Tag
      let sourceTagHtml = '';
      if (q.sources && q.sources.length > 1) {
        sourceTagHtml = `<span class="q-exam-tag tag-combined">${q.sources.length} Đề: ${q.sources.map(s => `${s.exam} #${s.q_num}`).join(', ')}</span>`;
      } else if (q.sources && q.sources.length === 1) {
        const s = q.sources[0];
        let tagClass = 'tag-re';
        if (s.exam.includes('C1FE')) tagClass = 'tag-c1fe';
        else if (s.exam.includes('FA25') || s.exam.includes('Half1')) tagClass = 'tag-fa25';
        else if (s.exam.includes('FEKTS')) tagClass = 'tag-fekts';
        else if (s.exam.includes('SP25')) tagClass = 'tag-sp25';
        else if (s.exam.includes('SU25') || s.exam.includes('B5')) tagClass = 'tag-su25';
        sourceTagHtml = `<span class="q-exam-tag ${tagClass}">Đề ${s.exam} #${s.q_num}</span>`;
      } else {
        const isRe = (q.exam_code || '').includes('RE');
        const isC1 = (q.exam_code || '').includes('C1FE');
        const isFEKTS = (q.exam_code || '').includes('FEKTS');
        const isSP25 = (q.exam_code || '').includes('SP25');
        const isB5 = (q.exam_code || '').includes('SU25') || (q.exam_code || '').includes('B5');
        let tagClass = 'tag-fa25';
        if (isRe) tagClass = 'tag-re';
        else if (isC1) tagClass = 'tag-c1fe';
        else if (isFEKTS) tagClass = 'tag-fekts';
        else if (isSP25) tagClass = 'tag-sp25';
        else if (isB5) tagClass = 'tag-su25';
        sourceTagHtml = `<span class="q-exam-tag ${tagClass}">${q.exam_code || ''}</span>`;
      }

      const optsHtml = Object.entries(q.options).map(([k, v]) => {
        const isCorrect = correctAnswers.includes(k);
        return `
          <div class="list-opt-box ${isCorrect ? 'is-correct' : ''}">
            <strong class="opt-letter">${k}.</strong>
            <span class="opt-txt">${v}</span>
          </div>
        `;
      }).join('');

      let variantHtml = '';
      if (q.variant_note) {
        variantHtml = `<div style="background:rgba(245,158,11,0.1); border:1px solid rgba(245,158,11,0.25); border-radius:6px; padding:6px 10px; margin-bottom:10px; font-size:0.8rem; color:var(--warning);">⚠️ <strong>Lưu ý:</strong> ${q.variant_note}</div>`;
      }

      return `
        <article class="list-q-card" id="list-q-${qKey}">
          <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px; margin-bottom:12px;">
            <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
              <span class="q-badge">CÂU ${qNum}</span>
              ${sourceTagHtml}
            </div>
            <span style="font-size:0.8rem; font-weight:600; color:${isMastered ? 'var(--success)' : 'var(--text-muted)'}">
              ${isMastered ? '✓ Đã thuộc' : '○ Đang học'}
            </span>
          </div>
          
          ${variantHtml}

          <div style="font-size:1.05rem; font-weight:700; margin-bottom:14px; color:var(--text-main);">${q.question}</div>
          <div>${optsHtml}</div>
          
          <div class="list-exp-box">
            <strong style="color:var(--primary)">Đáp án: ${q.answer}</strong> — ${q.explanation || 'Xem tài liệu và giáo trình HCM202.'}
          </div>
        </article>
      `;
    }).join('');
  }

  scrollToListQ(key) {
    const el = document.getElementById(`list-q-${key}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.style.borderColor = 'var(--primary)';
      setTimeout(() => { el.style.borderColor = ''; }, 1500);
    }
  }
}

// Instantiate on load
document.addEventListener('DOMContentLoaded', () => {
  window.app = new QuizletApp();
});
