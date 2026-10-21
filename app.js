/**
 * FPT Quiz Master — Multi-Subject Spaced Repetition Learning Platform
 * Supported Subjects:
 *  - HCM202: Tư tưởng Hồ Chí Minh (7 Đề thi FE/RE + Tổng hợp lọc trùng 280 câu)
 *  - MLN111: Triết học Mác - Lênin (Cửu Âm Chân Kinh 334 câu theo 3 Chương chuẩn FPT)
 * Features:
 *  - Portal View (Trang chọn môn học trước khi vào)
 *  - Course Switcher ("Đổi môn" navigation anytime)
 *  - Spaced Repetition Flashcards & Quick Key List View
 *  - Dark / Light Theme Sync
 *  - Independent LocalStorage Progress Tracking
 */

class QuizletApp {
  constructor() {
    this.initCoursesData();

    // Theme setup
    this.theme = localStorage.getItem('fpt_quiz_theme') || localStorage.getItem('hcm202_theme') || 'dark';

    // Current State
    this.currentView = 'portal'; // 'portal' | 'study'
    this.currentCourse = 'hcm202'; // 'hcm202' | 'mln111'
    this.currentExam = 're';
    this.currentMode = 'quizlet'; // 'quizlet' | 'list'
    this.listFilter = 'all';

    // Learning state for current active exam
    this.queue = [];
    this.repeatQueue = [];
    this.masteredIds = new Set();
    this.currentIndex = 0;
    this.currentCardAnswered = false;
    this.selectedOptions = new Set();
    this.round = 1;

    // Initialize UI
    this.initElements();
    this.applyTheme(this.theme);
    this.initEvents();

    // Route based on URL hash or initial load
    this.handleInitialRouting();
    this.updatePortalProgress();
  }

  /* ================= DATA ENGINE ================= */
  initCoursesData() {
    this.courses = {
      hcm202: {
        id: 'hcm202',
        code: 'HCM202',
        name: 'HCM202 — Tư tưởng Hồ Chí Minh',
        shortName: 'HCM202',
        icon: '🇻🇳',
        badgeText: '🇻🇳 HCM202',
        badgeClass: 'course-badge-hcm',
        subTitle: 'Ôn thi Tư tưởng Hồ Chí Minh (Spaced Repetition & Multi-Exam)',
        selectorHeadingTitle: 'CHỌN BỘ ĐỀ / CHẾ ĐỘ HỌC:',
        selectorHeadingDesc: 'Học riêng từng đề thi hoặc tổng hợp toàn bộ câu hỏi (có lọc trùng)',
        defaultExam: 're',
        totalQuestions: 280,
        exams: window.EXAMS_DATA || {}
      },
      mln111: {
        id: 'mln111',
        code: 'MLN131',
        name: 'MLN131 — Chủ nghĩa xã hội khoa học',
        shortName: 'MLN131',
        icon: '🏛️',
        badgeText: '🏛️ MLN131',
        badgeClass: 'course-badge-mln',
        subTitle: 'Kho Đề Chuẩn FPT University — 10 Đề Thi FE/RE (SP26, SU26, FA25, SU25, SP25 Ca 1 & Ca 2 & Bản Lọc Trùng 414 Câu)',
        selectorHeadingTitle: 'CHỌN ĐỀ / CHẾ ĐỘ HỌC:',
        selectorHeadingDesc: 'Học riêng từng đề thi hoặc bản tổng hợp toàn bộ 414 câu hỏi độc bản (đã lọc trùng)',
        defaultExam: 'combined',
        totalQuestions: 414,
        exams: window.MLN_DATA || {}
      }
    };

    // Aliases for convenient course routing
    this.courses.mln131 = this.courses.mln111;
    this.courses.mln133 = this.courses.mln111;

    // Backward compatibility for external scripts
    window.COURSES_DATA = this.courses;
  }

  /* ================= DOM INITIALIZATION ================= */
  initElements() {
    // Views
    this.portalView = document.getElementById('portalView');
    this.appStudyView = document.getElementById('appStudyView');

    // Portal Elements
    this.btnEnterHCM = document.getElementById('btnEnterHCM');
    this.btnEnterMLN = document.getElementById('btnEnterMLN');
    this.cardSelectHCM = document.getElementById('cardSelectHCM');
    this.cardSelectMLN = document.getElementById('cardSelectMLN');
    this.portalHcmProgressText = document.getElementById('portalHcmProgressText');
    this.portalHcmProgressBar = document.getElementById('portalHcmProgressBar');
    this.portalMlnProgressText = document.getElementById('portalMlnProgressText');
    this.portalMlnProgressBar = document.getElementById('portalMlnProgressBar');

    // Portal Theme Toggle
    this.btnPortalThemeToggle = document.getElementById('btnPortalThemeToggle');
    this.portalThemeIcon = document.getElementById('portalThemeIcon');
    this.portalThemeText = document.getElementById('portalThemeText');

    // Header & Titles in Study View
    this.btnBackToPortal = document.getElementById('btnBackToPortal');
    this.currentCourseBadge = document.getElementById('currentCourseBadge');
    this.appMainTitle = document.getElementById('appMainTitle');
    this.appSubTitle = document.getElementById('appSubTitle');
    this.tabListTitle = document.getElementById('tabListTitle');
    this.activeExamStatsBadge = document.getElementById('activeExamStatsBadge');
    this.selectorHeadingTitle = document.getElementById('selectorHeadingTitle');
    this.selectorHeadingDesc = document.getElementById('selectorHeadingDesc');
    this.examPillsContainer = document.getElementById('examPillsContainer');

    // Study View Theme Toggle
    this.btnThemeToggle = document.getElementById('btnThemeToggle');
    this.themeIcon = document.getElementById('themeIcon');
    this.themeText = document.getElementById('themeText');

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
    this.btnNext = document.getElementById('btnNext');
    this.btnRepeat = document.getElementById('btnRepeat');
    this.btnMastered = document.getElementById('btnMastered');
    this.imgPreviewBox = document.getElementById('imgPreviewBox');
    this.cardImg = document.getElementById('cardImg');
    this.btnToggleImg = document.getElementById('btnToggleImg');
    this.qMultiBadge = document.getElementById('qMultiBadge');
    this.multiSubmitRow = document.getElementById('multiSubmitRow');
    this.btnSubmitMulti = document.getElementById('btnSubmitMulti');

    // List View Elements
    this.quickKeyHeader = document.getElementById('quickKeyHeader');
    this.quickKeyGrid = document.getElementById('quickKeyGrid');
    this.listContainer = document.getElementById('listContainer');
    this.searchInput = document.getElementById('searchInput');
    this.listFilterBar = document.getElementById('listFilterBar');
    this.filterPillsContainer = document.getElementById('filterPillsContainer');
  }

  /* ================= ROUTING & VIEW NAVIGATION ================= */
  handleInitialRouting() {
    const hash = window.location.hash.toLowerCase();
    if (hash === '#hcm202' || hash.startsWith('#hcm202')) {
      this.selectCourse('hcm202', false);
    } else if (hash === '#mln131' || hash.startsWith('#mln131') || hash === '#mln133' || hash.startsWith('#mln133') || hash === '#mln111' || hash.startsWith('#mln111') || hash.startsWith('#mln')) {
      this.selectCourse('mln111', false);
    } else {
      // By default, display the Portal View for user to select course
      this.showPortal(false);
    }
  }

  showPortal(updateHash = true) {
    this.currentView = 'portal';
    if (this.portalView) this.portalView.style.display = 'flex';
    if (this.appStudyView) this.appStudyView.style.display = 'none';
    if (updateHash) {
      window.location.hash = '#portal';
    }
    this.updatePortalProgress();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  selectCourse(courseKey, updateHash = true) {
    if (!this.courses[courseKey]) {
      courseKey = 'hcm202';
    }
    this.currentCourse = courseKey;
    this.currentView = 'study';
    localStorage.setItem('fpt_last_course', courseKey);

    if (this.portalView) this.portalView.style.display = 'none';
    if (this.appStudyView) this.appStudyView.style.display = 'block';

    const courseData = this.courses[courseKey];

    // Update Header Brand
    if (this.currentCourseBadge) {
      this.currentCourseBadge.textContent = courseData.badgeText;
      this.currentCourseBadge.className = `current-course-badge ${courseData.badgeClass}`;
    }
    if (this.appSubTitle) {
      this.appSubTitle.textContent = courseData.subTitle;
    }
    if (this.selectorHeadingTitle) {
      this.selectorHeadingTitle.textContent = courseData.selectorHeadingTitle;
    }
    if (this.selectorHeadingDesc) {
      this.selectorHeadingDesc.textContent = courseData.selectorHeadingDesc;
    }

    // Render Exam Selector pills for this course
    this.renderExamPills();

    // Load active exam for this course
    const savedExam = localStorage.getItem(`fpt_active_exam_${courseKey}`);
    const activeExam = (savedExam && courseData.exams[savedExam]) ? savedExam : courseData.defaultExam;
    this.loadExam(activeExam);

    if (updateHash) {
      window.location.hash = `#${courseKey}`;
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /* ================= EXAM PILLS GENERATOR ================= */
  renderExamPills() {
    if (!this.examPillsContainer) return;
    const courseData = this.courses[this.currentCourse];
    const exams = courseData.exams;

    this.examPillsContainer.innerHTML = '';

    const examEntries = Object.entries(exams);
    if (examEntries.length === 0) {
      const emptyNote = document.createElement('div');
      emptyNote.style.cssText = 'color: var(--text-muted); font-size: 0.9rem; padding: 0.5rem 0; font-style: italic;';
      emptyNote.textContent = '⏳ Hiện chưa có đề thi nào cho môn này. Đang chờ cung cấp đề thi để tải câu hỏi.';
      this.examPillsContainer.appendChild(emptyNote);
      return;
    }

    examEntries.forEach(([key, examInfo]) => {
      const btn = document.createElement('button');
      btn.className = 'exam-pill-btn';
      btn.dataset.exam = key;
      btn.id = `btnExam_${key}`;

      // Pick chip class
      let chipClass = 'chip-re';
      if (this.currentCourse === 'mln111') {
        if (key === 'combined') chipClass = 'chip-combined';
        else if (key === 'mln131_fa25_re') chipClass = 'chip-fa25';
        else if (key === 'mln131_sp26') chipClass = 'chip-sp25';
        else if (key === 'mln131_su26_c1re') chipClass = 'chip-re';
        else if (key === 'mln131_su26_c2re') chipClass = 'chip-c1fe';
        else if (key === 'mln131_su26_c1fe') chipClass = 'chip-c1fe';
        else if (key === 'mln131_su25_b5_re' || key === 'mln131_su25_b5_1') chipClass = 'chip-su25';
        else if (key === 'mln131_su25_fekts') chipClass = 'chip-fekts';
        else if (key === 'mln131_sp25_fe' || key === 'mln131_sp25_fe_2') chipClass = 'chip-sp25';
      } else {
        if (key === 'c1fe') chipClass = 'chip-c1fe';
        else if (key === 'fa25_half1') chipClass = 'chip-fa25';
        else if (key === 'su25_b5') chipClass = 'chip-su25';
        else if (key === 'fekts') chipClass = 'chip-fekts';
        else if (key === 'sp25_fe') chipClass = 'chip-sp25';
        else if (key === 'fa24_re') chipClass = 'chip-fa24-re';
        else if (key === 'combined') chipClass = 'chip-combined';
      }

      btn.innerHTML = `
        <span class="pill-chip ${chipClass}">${examInfo.badge || examInfo.shortName}</span>
        <span class="pill-name">${examInfo.name}</span>
        <span class="pill-meta">${examInfo.total} câu</span>
      `;

      btn.addEventListener('click', () => this.loadExam(key));
      this.examPillsContainer.appendChild(btn);
    });
  }

  /* ================= EXAM ENGINE ================= */
  loadExam(examKey) {
    const courseData = this.courses[this.currentCourse];
    const examKeys = Object.keys(courseData.exams);

    if (examKeys.length === 0) {
      this.currentExam = '';
      this.allQuestions = [];
      if (this.appMainTitle) this.appMainTitle.textContent = courseData.name;
      if (this.tabListTitle) this.tabListTitle.textContent = '📋 Danh sách 0 câu';
      if (this.activeExamStatsBadge) {
        this.activeExamStatsBadge.textContent = '0 câu';
      }

      this.loadProgress();
      if (this.currentMode === 'quizlet') {
        this.render();
      } else {
        this.renderListView();
      }
      return;
    }

    if (!courseData.exams[examKey]) {
      examKey = courseData.defaultExam && courseData.exams[courseData.defaultExam] ? courseData.defaultExam : examKeys[0];
    }

    this.currentExam = examKey;
    localStorage.setItem(`fpt_active_exam_${this.currentCourse}`, examKey);

    const examInfo = courseData.exams[examKey];
    this.allQuestions = (examInfo.questions || []).map((q, idx) => {
      const questionText = q.question || q.q || '';
      let optionsObj = {};
      if (Array.isArray(q.options)) {
        const letters = ['A', 'B', 'C', 'D'];
        q.options.forEach((opt, oIdx) => {
          optionsObj[letters[oIdx] || `${oIdx}`] = opt.replace(/^[A-D]\.\s*/, '').trim();
        });
      } else {
        optionsObj = q.options || {};
      }
      let answerStr = typeof q.answer === 'string' ? q.answer : (typeof q.answer === 'number' ? (['A', 'B', 'C', 'D'][q.answer] || 'A') : `${q.answer || 'A'}`);
      return {
        ...q,
        q_num: q.q_num || (idx + 1),
        question: questionText,
        options: optionsObj,
        answer: answerStr,
        explanation: q.explanation || ''
      };
    });

    // Update active pill UI
    if (this.examPillsContainer) {
      this.examPillsContainer.querySelectorAll('.exam-pill-btn').forEach(btn => {
        const isActive = btn.dataset.exam === examKey;
        btn.classList.toggle('active', isActive);
        if (isActive && window.innerWidth <= 768) {
          try {
            btn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
          } catch (e) {}
        }
      });
    }

    // Update headers
    if (this.appMainTitle) this.appMainTitle.textContent = examInfo.name;
    if (this.tabListTitle) this.tabListTitle.textContent = `📋 Danh sách ${examInfo.total} câu`;
    if (this.activeExamStatsBadge) {
      this.activeExamStatsBadge.textContent = `${examInfo.shortName}: ${examInfo.total} câu`;
    }

    // Configure filter bar for list view
    this.configureListFilterBar(examKey);

    // Load saved progress for this exam
    this.loadProgress();

    // Render active mode
    if (this.currentMode === 'quizlet') {
      this.render();
    } else {
      this.renderListView();
    }
  }

  configureListFilterBar(examKey) {
    if (!this.listFilterBar || !this.filterPillsContainer) return;

    const isCombined = examKey === 'combined' || examKey === 'cuu_am_combined';
    this.listFilterBar.style.display = isCombined ? 'flex' : 'none';
    this.listFilter = 'all';

    if (!isCombined) return;

    this.filterPillsContainer.innerHTML = '';

    let filterOptions = [];
    if (this.currentCourse === 'hcm202') {
      filterOptions = [
        { label: 'Tất cả', val: 'all' },
        { label: 'Đề RE', val: 'SU26 - RE' },
        { label: 'Đề C1FE', val: 'SU26 - C1FE' },
        { label: 'Đề FA25', val: 'FA25 - Half1' },
        { label: 'Đề SU25 B5', val: 'SU25 - B5' },
        { label: 'Đề FEKTS', val: 'SU25 - FEKTS' },
        { label: 'Đề SP25', val: 'SP25 - FE' },
        { label: 'Đề FA24 RE', val: 'FA24 - RE' }
      ];
    } else {
      filterOptions = [
        { label: 'Tất cả (414c)', val: 'all' },
        { label: 'Đề SP26', val: 'SP26' },
        { label: 'Đề C1FE', val: 'C1FE' },
        { label: 'Đề C1RE', val: 'C1RE' },
        { label: 'Đề C2RE', val: 'C2RE' },
        { label: 'Đề FA25 RE', val: 'FA25 - RE' },
        { label: 'Đề SU25 B5 RE', val: 'SU25 - B5 RE' },
        { label: 'Đề SU25 B5 (1)', val: 'SU25 - B5 (1)' },
        { label: 'Đề SU25 FEKTS', val: 'SU25 - FEKTS' },
        { label: 'Đề SP25 FE', val: 'SP25 - FE' },
        { label: 'Đề SP25 FE (2)', val: 'SP25 - FE (2)' }
      ];
    }

    filterOptions.forEach(opt => {
      const btn = document.createElement('button');
      btn.className = `filter-pill-btn ${opt.val === 'all' ? 'active' : ''}`;
      btn.dataset.filter = opt.val;
      btn.textContent = opt.label;
      btn.addEventListener('click', () => {
        this.filterPillsContainer.querySelectorAll('.filter-pill-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.listFilter = opt.val;
        this.filterList(this.searchInput.value);
      });
      this.filterPillsContainer.appendChild(btn);
    });
  }

  /* ================= PROGRESS & STORAGE ENGINE ================= */
  getProgressStorageKey() {
    return `fpt_progress_${this.currentCourse}_${this.currentExam}`;
  }

  loadProgress() {
    const key = this.getProgressStorageKey();
    let saved = localStorage.getItem(key);

    // Backward compatibility for old HCM202 progress keys
    if (!saved && this.currentCourse === 'hcm202') {
      saved = localStorage.getItem(`hcm202_progress_${this.currentExam}`);
    }

    try {
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
    const key = this.getProgressStorageKey();
    try {
      localStorage.setItem(key, JSON.stringify({
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
    const courseData = this.courses[this.currentCourse];
    const examInfo = courseData.exams[this.currentExam] || { name: courseData.name };
    if (confirm(`Bạn có chắc muốn đặt lại tiến độ học cho "${examInfo.name}" và bắt đầu lại từ đầu?`)) {
      localStorage.removeItem(this.getProgressStorageKey());
      if (this.currentCourse === 'hcm202') {
        localStorage.removeItem(`hcm202_progress_${this.currentExam}`);
      }
      this.masteredIds.clear();
      this.queue = [...this.allQuestions];
      this.repeatQueue = [];
      this.currentIndex = 0;
      this.round = 1;
      this.render();
    }
  }

  updatePortalProgress() {
    // 1. Calculate HCM202 progress
    let hcmMastered = 0;
    const hcmTotal = this.courses.hcm202.totalQuestions || 280;
    try {
      const hcmSaved = localStorage.getItem('fpt_progress_hcm202_combined') || localStorage.getItem('hcm202_progress_combined');
      if (hcmSaved) {
        const parsed = JSON.parse(hcmSaved);
        hcmMastered = (parsed.masteredIds || []).length;
      }
    } catch (e) {}

    const hcmPct = Math.min(100, Math.round((hcmMastered / hcmTotal) * 100));
    if (this.portalHcmProgressText) {
      this.portalHcmProgressText.textContent = `${hcmMastered} / ${hcmTotal} câu (${hcmPct}%)`;
    }
    if (this.portalHcmProgressBar) {
      this.portalHcmProgressBar.style.width = `${hcmPct}%`;
    }

    // 2. Calculate MLN progress
    let mlnMastered = 0;
    const mlnTotal = this.courses.mln111.totalQuestions || 0;
    try {
      const mlnSaved = localStorage.getItem('fpt_progress_mln111_combined') || localStorage.getItem('fpt_progress_mln111_mln131_su26_c1re');
      if (mlnSaved) {
        const parsed = JSON.parse(mlnSaved);
        mlnMastered = (parsed.masteredIds || []).length;
      }
    } catch (e) {}

    const mlnPct = mlnTotal > 0 ? Math.min(100, Math.round((mlnMastered / mlnTotal) * 100)) : 0;
    if (this.portalMlnProgressText) {
      if (mlnTotal > 0) {
        this.portalMlnProgressText.textContent = `${mlnMastered} / ${mlnTotal} câu (${mlnPct}%)`;
      } else {
        this.portalMlnProgressText.textContent = `0 câu (Chờ cung cấp đề)`;
      }
    }
    if (this.portalMlnProgressBar) {
      this.portalMlnProgressBar.style.width = `${mlnPct}%`;
    }
  }

  /* ================= THEME ENGINE ================= */
  toggleTheme() {
    this.theme = this.theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('fpt_quiz_theme', this.theme);
    localStorage.setItem('hcm202_theme', this.theme);
    this.applyTheme(this.theme);
  }

  applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    const icon = theme === 'light' ? '☀️' : '🌙';
    const text = theme === 'light' ? 'Sáng' : 'Tối';

    if (this.themeIcon) this.themeIcon.textContent = icon;
    if (this.themeText) this.themeText.textContent = text;
    if (this.portalThemeIcon) this.portalThemeIcon.textContent = icon;
    if (this.portalThemeText) this.portalThemeText.textContent = text;
  }

  /* ================= EVENTS ENGINE ================= */
  initEvents() {
    // Theme toggles
    if (this.btnThemeToggle) {
      this.btnThemeToggle.addEventListener('click', () => this.toggleTheme());
    }
    if (this.btnPortalThemeToggle) {
      this.btnPortalThemeToggle.addEventListener('click', () => this.toggleTheme());
    }

    // Portal course selection
    if (this.btnEnterHCM) this.btnEnterHCM.addEventListener('click', () => this.selectCourse('hcm202'));
    if (this.btnEnterMLN) this.btnEnterMLN.addEventListener('click', () => this.selectCourse('mln111'));
    if (this.cardSelectHCM) this.cardSelectHCM.addEventListener('click', () => this.selectCourse('hcm202'));
    if (this.cardSelectMLN) this.cardSelectMLN.addEventListener('click', () => this.selectCourse('mln111'));

    // Switch Course (back to Portal)
    if (this.btnBackToPortal) {
      this.btnBackToPortal.addEventListener('click', () => this.showPortal());
    }

    // Mode Switcher
    if (this.tabQuizlet) this.tabQuizlet.addEventListener('click', () => this.switchMode('quizlet'));
    if (this.tabList) this.tabList.addEventListener('click', () => this.switchMode('list'));

    // Card buttons
    if (this.btnReveal) this.btnReveal.addEventListener('click', () => this.revealAnswer());
    if (this.btnNext) this.btnNext.addEventListener('click', () => this.nextQuestion());
    if (this.btnRepeat) this.btnRepeat.addEventListener('click', () => {
      this.recordDecision(false);
      this.nextQuestion();
    });
    if (this.btnMastered) this.btnMastered.addEventListener('click', () => {
      this.recordDecision(true);
      this.nextQuestion();
    });
    if (this.btnToggleImg) this.btnToggleImg.addEventListener('click', () => this.toggleImage());
    if (this.btnSubmitMulti) this.btnSubmitMulti.addEventListener('click', () => this.submitMultiAnswer());

    const btnReset = document.getElementById('btnReset');
    if (btnReset) btnReset.addEventListener('click', () => this.resetProgress());

    const btnRestartQuiz = document.getElementById('btnRestartQuiz');
    if (btnRestartQuiz) btnRestartQuiz.addEventListener('click', () => this.resetProgress());

    const btnShuffle = document.getElementById('btnShuffle');
    if (btnShuffle) btnShuffle.addEventListener('click', () => this.shuffleQueue());

    // Exam selector card toggle on mobile/desktop
    const btnToggleExamList = document.getElementById('btnToggleExamList');
    const examSelectorCard = document.getElementById('examSelectorCard');
    const toggleExamIcon = document.getElementById('toggleExamIcon');
    if (btnToggleExamList && examSelectorCard) {
      btnToggleExamList.addEventListener('click', () => {
        const isCollapsed = examSelectorCard.classList.toggle('collapsed');
        if (toggleExamIcon) {
          toggleExamIcon.textContent = isCollapsed ? '▾' : '▴';
        }
      });
    }

    // Initialize smart header scroll (auto-hide on scroll down for mobile)
    this.initSmartHeaderScroll();

    // Search input
    if (this.searchInput) {
      this.searchInput.addEventListener('input', (e) => this.filterList(e.target.value));
    }

    // URL Hash listener
    window.addEventListener('hashchange', () => {
      const hash = window.location.hash.toLowerCase();
      if (hash === '#portal' || hash === '') {
        if (this.currentView !== 'portal') this.showPortal(false);
      } else if (hash.includes('hcm202')) {
        if (this.currentCourse !== 'hcm202' || this.currentView !== 'study') this.selectCourse('hcm202', false);
      } else if (hash.includes('mln111')) {
        if (this.currentCourse !== 'mln111' || this.currentView !== 'study') this.selectCourse('mln111', false);
      }
    });

    // Keyboard shortcuts
    window.addEventListener('keydown', (e) => {
      if (document.activeElement === this.searchInput) return;

      const key = e.key.toUpperCase();

      // Theme toggle shortcut (T)
      if (key === 'T') {
        e.preventDefault();
        this.toggleTheme();
        return;
      }

      // Portal View shortcuts
      if (this.currentView === 'portal') {
        if (key === '1' || key === 'H') {
          e.preventDefault();
          this.selectCourse('hcm202');
          return;
        }
        if (key === '2' || key === 'M') {
          e.preventDefault();
          this.selectCourse('mln111');
          return;
        }
        return;
      }

      // Study View shortcuts: Return to Portal (ESC or P)
      if (key === 'ESCAPE' || key === 'P') {
        e.preventDefault();
        this.showPortal();
        return;
      }

      if (this.currentMode !== 'quizlet') return;

      // Options select (1, 2, 3, 4 or A, B, C, D)
      if (!this.currentCardAnswered) {
        const q = this.getCurrentQuestion();
        const correctAnswers = q ? `${q.answer || 'A'}`.split(',').map(s => s.trim()) : [];
        const isMulti = correctAnswers.length > 1;

        if (isMulti) {
          if (key === '1' || key === 'A') { e.preventDefault(); this.toggleOption('A'); }
          else if (key === '2' || key === 'B') { e.preventDefault(); this.toggleOption('B'); }
          else if (key === '3' || key === 'C') { e.preventDefault(); this.toggleOption('C'); }
          else if (key === '4' || key === 'D') { e.preventDefault(); this.toggleOption('D'); }
          else if (key === 'ENTER') {
            e.preventDefault();
            if (this.selectedOptions.size > 0) this.submitMultiAnswer();
            else this.revealAnswer();
          } else if (key === ' ') {
            e.preventDefault();
            this.revealAnswer();
          }
        } else {
          if (key === '1' || key === 'A') this.selectOption('A');
          else if (key === '2' || key === 'B') this.selectOption('B');
          else if (key === '3' || key === 'C') this.selectOption('C');
          else if (key === '4' || key === 'D') this.selectOption('D');
          else if (key === ' ' || key === 'ENTER') {
            e.preventDefault();
            this.revealAnswer();
          }
        }
      } else {
        // After card answered / revealed:
        if (key === '1' || key === 'L' || key === 'ARROWLEFT') {
          e.preventDefault();
          this.recordDecision(false);
          this.nextQuestion();
        } else if (key === '2') {
          e.preventDefault();
          this.recordDecision(true);
          this.nextQuestion();
        } else if (key === 'ENTER' || key === ' ' || key === 'ARROWRIGHT' || key === 'R') {
          e.preventDefault();
          this.nextQuestion();
        }
      }
    });
  }

  switchMode(mode) {
    this.currentMode = mode;
    const header = document.getElementById('appHeader');
    if (header) header.classList.remove('header--hidden');

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

  /* ================= QUIZLET CARD ENGINE ================= */
  render() {
    this.updateStats();

    if (this.allQuestions.length === 0) {
      this.showEmptyScreen();
      return;
    }

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
    this.selectedOptions.clear();
    this.imgPreviewBox.style.display = 'none';
    this.feedbackBox.style.display = 'none';
    this.btnReveal.style.display = 'inline-flex';
    this.decisionToolbar.style.display = 'none';

    // Badge details
    const totalQ = this.allQuestions.length;
    const qNumber = q.combined_id || q.q_num || q.id;
    this.qBadge.textContent = `CÂU ${qNumber} / ${totalQ} • VÒNG ${this.round}`;

    const correctAnswers = `${q.answer || 'A'}`.split(',').map(s => s.trim());
    const isMultiChoice = correctAnswers.length > 1;

    // Multi-choice Badge
    if (this.qMultiBadge) {
      if (isMultiChoice) {
        this.qMultiBadge.style.display = 'inline-flex';
        this.qMultiBadge.textContent = `✨ Chọn ${correctAnswers.length} đáp án`;
      } else {
        this.qMultiBadge.style.display = 'none';
      }
    }

    // Exam tag rendering
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
      else if (src.exam.includes('FA24')) tagClass = 'tag-fa24-re';
      this.qExamTag.className = `q-exam-tag ${tagClass}`;
      this.qExamTag.textContent = `Đề ${src.exam} #${src.q_num}`;
    } else {
      const code = q.exam_code || '';
      let tagClass = 'tag-re';
      if (code.includes('Chương 1')) tagClass = 'tag-chuong1';
      else if (code.includes('Chương 2')) tagClass = 'tag-chuong2';
      else if (code.includes('Chương 3')) tagClass = 'tag-chuong3';
      else if (code.includes('Tổng Hợp') || code.includes('Cửu Âm')) tagClass = 'tag-cuu-am';
      else if (code.includes('C1FE')) tagClass = 'tag-c1fe';
      else if (code.includes('FA25')) tagClass = 'tag-fa25';
      else if (code.includes('FEKTS')) tagClass = 'tag-fekts';
      else if (code.includes('SP25')) tagClass = 'tag-sp25';
      else if (code.includes('SU25')) tagClass = 'tag-su25';
      else if (code.includes('FA24')) tagClass = 'tag-fa24-re';
      this.qExamTag.className = `q-exam-tag ${tagClass}`;
      this.qExamTag.textContent = q.exam_code || `Đề ${this.currentExam.toUpperCase()}`;
    }

    // Question content
    this.qText.textContent = q.question;

    // Toggle Image button: Only show if an image exists
    const hasImage = Boolean(q.image);
    if (this.btnToggleImg) {
      this.btnToggleImg.style.display = hasImage ? 'inline-flex' : 'none';
      if (hasImage) {
        this.cardImg.src = q.image;
      }
    }

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
      btn.addEventListener('click', () => {
        if (isMultiChoice) this.toggleOption(key);
        else this.selectOption(key);
      });
      this.optionsContainer.appendChild(btn);
    });

    // Multi-choice submit row setup
    if (this.multiSubmitRow) {
      if (isMultiChoice) {
        this.multiSubmitRow.style.display = 'block';
        if (this.btnSubmitMulti) {
          this.btnSubmitMulti.innerHTML = `<span>🚀 Xác Nhận Đáp Án (Đã chọn 0/${correctAnswers.length})</span> <span class="kbd-hint" style="background:rgba(255,255,255,0.25); color:#fff; border:none;">Enter</span>`;
        }
      } else {
        this.multiSubmitRow.style.display = 'none';
      }
    }
  }

  toggleOption(key) {
    if (this.currentCardAnswered) return;
    const q = this.getCurrentQuestion();
    if (!q) return;
    const correctAnswers = `${q.answer || 'A'}`.split(',').map(s => s.trim());

    if (this.selectedOptions.has(key)) {
      this.selectedOptions.delete(key);
    } else {
      this.selectedOptions.add(key);
    }

    const buttons = this.optionsContainer.querySelectorAll('.quiz-option-btn');
    buttons.forEach(btn => {
      btn.classList.toggle('is-selected', this.selectedOptions.has(btn.dataset.key));
    });

    if (this.btnSubmitMulti) {
      const count = this.selectedOptions.size;
      const target = correctAnswers.length;
      this.btnSubmitMulti.innerHTML = `<span>🚀 Xác Nhận Đáp Án (Đã chọn ${count}/${target})</span> <span class="kbd-hint" style="background:rgba(255,255,255,0.25); color:#fff; border:none;">Enter</span>`;
    }
  }

  submitMultiAnswer() {
    if (this.currentCardAnswered) return;
    const q = this.getCurrentQuestion();
    if (!q) return;

    const correctAnswers = `${q.answer || 'A'}`.split(',').map(s => s.trim());
    if (this.selectedOptions.size === 0) {
      if (this.btnSubmitMulti) {
        this.btnSubmitMulti.style.transform = 'scale(0.97)';
        setTimeout(() => { if (this.btnSubmitMulti) this.btnSubmitMulti.style.transform = ''; }, 150);
      }
      return;
    }

    this.currentCardAnswered = true;

    const isFullyCorrect = correctAnswers.length === this.selectedOptions.size &&
                           correctAnswers.every(k => this.selectedOptions.has(k));

    const buttons = this.optionsContainer.querySelectorAll('.quiz-option-btn');
    buttons.forEach(btn => {
      btn.disabled = true;
      const key = btn.dataset.key;
      btn.classList.remove('is-selected');

      if (this.selectedOptions.has(key)) {
        btn.classList.add(correctAnswers.includes(key) ? 'selected-correct' : 'selected-wrong');
      }
      if (correctAnswers.includes(key) && !this.selectedOptions.has(key)) {
        btn.classList.add('revealed-correct');
      }
    });

    if (this.multiSubmitRow) this.multiSubmitRow.style.display = 'none';
    this.recordDecision(isFullyCorrect);
    this.showFeedback(isFullyCorrect, q);
  }

  selectOption(selectedKey) {
    if (this.currentCardAnswered) return;
    this.currentCardAnswered = true;

    const q = this.getCurrentQuestion();
    const correctAnswers = `${q.answer || 'A'}`.split(',').map(s => s.trim());
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

    this.recordDecision(isCorrect);
    this.showFeedback(isCorrect, q);
  }

  revealAnswer() {
    if (this.currentCardAnswered) return;
    this.currentCardAnswered = true;

    const q = this.getCurrentQuestion();
    const correctAnswers = `${q.answer || 'A'}`.split(',').map(s => s.trim());

    const buttons = this.optionsContainer.querySelectorAll('.quiz-option-btn');
    buttons.forEach(btn => {
      btn.disabled = true;
      btn.classList.remove('is-selected');
      if (correctAnswers.includes(btn.dataset.key)) {
        btn.classList.add('revealed-correct');
      }
    });

    if (this.multiSubmitRow) this.multiSubmitRow.style.display = 'none';
    this.recordDecision(false);
    this.showFeedback(null, q);
  }

  showFeedback(isCorrect, q) {
    this.feedbackBox.style.display = 'block';
    const correctAnswers = `${q.answer || 'A'}`.split(',').map(s => s.trim());
    const isMulti = correctAnswers.length > 1;

    if (isCorrect === true) {
      this.feedbackStatus.className = 'feedback-status correct';
      const label = isMulti ? `✓ Chính xác tuyệt đối! (Đáp án: ${q.answer}) • Đã thuộc ✅` : `✓ Chính xác! (Đáp án: ${q.answer}) • Đã thuộc ✅`;
      this.feedbackStatus.innerHTML = `<span>${label}</span>`;
    } else if (isCorrect === false) {
      this.feedbackStatus.className = 'feedback-status wrong';
      const label = isMulti ? `✕ Chưa chính xác! (Đáp án đúng: ${q.answer}) • Chưa thuộc 🔄` : `✕ Chưa đúng! (Đáp án đúng: ${q.answer}) • Chưa thuộc 🔄`;
      this.feedbackStatus.innerHTML = `<span>${label}</span>`;
    } else {
      this.feedbackStatus.className = 'feedback-status';
      this.feedbackStatus.innerHTML = `<span style="color:var(--primary);">💡 Đáp án chính xác: ${q.answer} • Chưa thuộc 🔄</span>`;
    }

    let extraHtml = '';
    if (q.variant_note) {
      extraHtml += `<div style="background:rgba(245,158,11,0.12); border:1px solid rgba(245,158,11,0.3); border-radius:8px; padding:8px 12px; margin-bottom:8px; font-size:0.83rem; color:var(--warning);">⚠️ <strong>Đối chiếu đề thi:</strong> ${q.variant_note}</div>`;
    }

    let votesStr = '';
    if (q.votes && Object.keys(q.votes).length > 0) {
      const voteEntries = Object.entries(q.votes).filter(([_, v]) => v > 0);
      if (voteEntries.length > 0) {
        votesStr = `<div style="font-size:0.82rem; color:var(--text-muted); margin-top:4px;">✓ Bình chọn đáp án: ${voteEntries.map(([k, v]) => `${k}: ${v}`).join(' | ')}</div>`;
      }
    }

    this.feedbackText.innerHTML = `
      ${extraHtml}
      <div style="margin-bottom:6px;"><strong>Giải thích:</strong> ${q.explanation || 'Xem nội dung bài giảng và tài liệu môn học.'}</div>
      ${votesStr}
    `;

    this.btnReveal.style.display = 'none';
    this.decisionToolbar.style.display = 'flex';
  }

  recordDecision(isMastered) {
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
    this.updateStats();
    this.updatePortalProgress();
    this.updateDecisionButtonsState(isMastered);
  }

  updateDecisionButtonsState(isMastered) {
    if (this.btnMastered) {
      this.btnMastered.classList.toggle('active', Boolean(isMastered));
    }
    if (this.btnRepeat) {
      this.btnRepeat.classList.toggle('active', !isMastered);
    }
  }

  nextQuestion() {
    this.currentIndex++;
    this.render();
  }

  handleDecision(isMastered) {
    this.recordDecision(isMastered);
    this.nextQuestion();
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

  showEmptyScreen() {
    this.cardContainer.style.display = 'none';
    this.completedScreen.style.display = 'block';
    const courseData = this.courses[this.currentCourse];
    this.completedTitle.textContent = `⏳ Đang Chờ Cung Cấp Đề Thi (${courseData.shortName})`;
    this.completedDesc.textContent = `Hiện tại chưa có câu hỏi nào cho môn ${courseData.name}. Hệ thống đang chờ nhận bộ đề thi mới để trích xuất câu hỏi!`;
    const actionsBox = this.completedScreen.querySelector('.completed-actions');
    if (actionsBox) {
      actionsBox.innerHTML = `
        <button class="btn btn-primary" onclick="window.quizApp.showPortal()">
          <span>🏠 Quay Lại Chọn Môn</span>
        </button>
      `;
    }
    this.updateStats();
  }

  showCompletedScreen() {
    this.cardContainer.style.display = 'none';
    this.completedScreen.style.display = 'block';
    const courseData = this.courses[this.currentCourse];
    const examInfo = courseData.exams[this.currentExam] || { name: courseData.name, total: this.allQuestions.length };
    this.completedTitle.textContent = `🎉 Chúc Mừng! Bạn Đã Thuộc Toàn Bộ ${examInfo.total} Câu!`;
    this.completedDesc.textContent = `Bạn đã hoàn thành toàn bộ câu hỏi trong "${examInfo.name}" và không còn câu nào trong danh sách cần lặp lại.`;
    const actionsBox = this.completedScreen.querySelector('.completed-actions');
    if (actionsBox) {
      actionsBox.innerHTML = `
        <button class="btn btn-secondary" id="btnRestartQuiz">
          <span>🔄 Học Lại Từ Đầu</span>
        </button>
        <button class="btn btn-primary" id="btnViewListMode">
          <span>📋 Xem Bảng Đáp Án</span>
        </button>
      `;
      const btnRestart = document.getElementById('btnRestartQuiz');
      const btnViewList = document.getElementById('btnViewListMode');
      if (btnRestart) btnRestart.onclick = () => this.resetProgress();
      if (btnViewList) btnViewList.onclick = () => this.switchMode('list');
    }
    this.updateStats();
  }

  /* ================= LIST VIEW LOGIC ================= */
  renderListView() {
    const courseData = this.courses[this.currentCourse];
    const examInfo = courseData.exams[this.currentExam] || { shortName: courseData.shortName, name: courseData.name, total: 0 };
    if (this.quickKeyHeader) {
      this.quickKeyHeader.textContent = `⚡ Bảng tra đáp án nhanh — ${examInfo.shortName} (${this.allQuestions.length} câu)`;
    }

    if (this.allQuestions.length === 0) {
      if (this.quickKeyGrid) this.quickKeyGrid.innerHTML = '';
      if (this.listContainer) {
        this.listContainer.innerHTML = `
          <div style="text-align: center; padding: 3rem 1rem; color: var(--text-muted);">
            <div style="font-size: 2.5rem; margin-bottom: 0.5rem;">🏛️</div>
            <p style="font-weight: 600; font-size: 1.1rem; color: var(--text-color);">Chưa có câu hỏi nào</p>
            <p style="font-size: 0.9rem;">Đang chờ người dùng cung cấp đề thi để tải câu hỏi.</p>
            <button class="btn btn-secondary" style="margin-top: 1rem;" onclick="window.quizApp.showPortal()">⬅️ Quay lại chọn môn</button>
          </div>
        `;
      }
      return;
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
      // 1. Exam source or chapter filter
      if (filter !== 'all') {
        const matchesExam = (q.sources || []).some(s => s.exam.includes(filter)) || 
                            (q.exam_code || '').includes(filter) ||
                            (q.chapter || '').includes(filter);
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
      const correctAnswers = `${q.answer || 'A'}`.split(',').map(s => s.trim());
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
        else if (s.exam.includes('FA24')) tagClass = 'tag-fa24-re';
        sourceTagHtml = `<span class="q-exam-tag ${tagClass}">Đề ${s.exam} #${s.q_num}</span>`;
      } else {
        const code = q.exam_code || '';
        let tagClass = 'tag-re';
        if (code.includes('Chương 1')) tagClass = 'tag-chuong1';
        else if (code.includes('Chương 2')) tagClass = 'tag-chuong2';
        else if (code.includes('Chương 3')) tagClass = 'tag-chuong3';
        else if (code.includes('Tổng Hợp') || code.includes('Cửu Âm')) tagClass = 'tag-cuu-am';
        else if (code.includes('C1FE')) tagClass = 'tag-c1fe';
        else if (code.includes('FA25')) tagClass = 'tag-fa25';
        else if (code.includes('FEKTS')) tagClass = 'tag-fekts';
        else if (code.includes('SP25')) tagClass = 'tag-sp25';
        else if (code.includes('SU25')) tagClass = 'tag-su25';
        else if (code.includes('FA24')) tagClass = 'tag-fa24-re';
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
            <strong style="color:var(--primary)">Đáp án: ${q.answer}</strong> — ${q.explanation || 'Xem tài liệu và giáo trình môn học.'}
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

  /* ================= SMART MOBILE HEADER SCROLL ================= */
  initSmartHeaderScroll() {
    const header = document.getElementById('appHeader') || document.querySelector('header');
    if (!header) return;

    let lastScrollY = window.scrollY;
    let ticking = false;

    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;
          if (window.innerWidth <= 768) {
            // Only hide header when user scrolls down noticeably past top zone
            if (currentScrollY > 70 && currentScrollY > lastScrollY + 8) {
              header.classList.add('header--hidden');
            } else if (currentScrollY < lastScrollY - 6 || currentScrollY <= 20) {
              header.classList.remove('header--hidden');
            }
          } else {
            header.classList.remove('header--hidden');
          }
          lastScrollY = Math.max(0, currentScrollY);
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  }
}

// Instantiate on load
document.addEventListener('DOMContentLoaded', () => {
  window.app = new QuizletApp();
});
