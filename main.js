// main.js

// アプリケーションの初期化
window.onload = () => {
  // 最初の画面としてメニューを表示
  showScreen('menu');

  // 問題数選択のドロップダウンを生成
  const questionCountSelect = document.getElementById('question-count-select');
  questionCountSelect.innerHTML = ''; 
  for (let i = 1; i <= 60; i++) {
    const option = document.createElement('option');
    option.value = i;
    option.textContent = `${i}問`;
    questionCountSelect.appendChild(option);
  }
};

// 各画面からのメニューに戻る関数
function backToMenuFromQuiz() {
  if (confirm('クイズを中断してメニューに戻りますか？')) {
    clearInterval(timerId); // quiz.jsのtimerIdを停止
    showScreen('menu'); // utils.jsのshowScreenを使用
  }
}

function backToMenuFromResult() {
  showScreen('menu'); // utils.jsのshowScreenを使用
}

function backToMenuFromPastResults() {
  showScreen('menu'); // utils.jsのshowScreenを使用
}

function backToMenuFromQuestionList() {
  // questionList.jsのcurrentBreadcrumbをクリア
  if (typeof currentBreadcrumb !== 'undefined') {
    currentBreadcrumb = [];
    updateBreadcrumb(); // questionList.jsのupdateBreadcrumbを呼び出し
  }
  showScreen('menu'); // utils.jsのshowScreenを使用
}

// 追加: 教科書機能からメニューに戻る関数
let currentTextbookBreadcrumb = []; // 教科書機能用のパンくずリスト変数

function backToMenuFromTextbook() {
  currentTextbookBreadcrumb = []; // パンくずリストをクリア
  updateTextbookBreadcrumb(); // 教科書機能のパンくずリストを更新
  showScreen('menu'); // utils.jsのshowScreenを使用
}


/**
 * 教科書機能の画面を表示する
 */
function showTextbook() {
  showScreen('textbook-container');
  currentTextbookBreadcrumb = []; // 教科書機能に遷移する際にパンくずリストをリセット
  updateTextbookBreadcrumb();
  renderTextbookChapterList(); // 章リストの表示を開始
}

/**
 * 教科書機能のパンくずリストを更新する
 */
function updateTextbookBreadcrumb() {
  const breadcrumbDiv = document.getElementById('textbook-breadcrumb');
  breadcrumbDiv.innerHTML = '';

  const homeSpan = document.createElement('span');
  homeSpan.textContent = 'メニュー';
  homeSpan.classList.add('home');
  homeSpan.onclick = () => {
    backToMenuFromTextbook();
  };
  breadcrumbDiv.appendChild(homeSpan);

  currentTextbookBreadcrumb.forEach((item, index) => {
    const separator = document.createElement('span');
    separator.textContent = ' > ';
    separator.classList.add('separator');
    breadcrumbDiv.appendChild(separator);

    const itemSpan = document.createElement('span');
    itemSpan.textContent = item.name;
    
    if (index === currentTextbookBreadcrumb.length - 1) {
      itemSpan.classList.add('current');
    } else {
      itemSpan.classList.add('clickable');
      // 各階層に戻るためのクリックイベントを設定
      if (item.type === 'chapter') {
        itemSpan.onclick = () => backToTextbookChapterList();
      } else if (item.type === 'section') {
        itemSpan.onclick = () => backToTextbookSectionList();
      } else if (item.type === 'learningItem') {
        itemSpan.onclick = () => backToTextbookLearningItemList();
      }
    }
    breadcrumbDiv.appendChild(itemSpan);
  });
}


/**
 * 教科書機能: 全てのリストコンテナを非表示にするヘルパー関数
 */
function hideAllTextbookLists() {
  document.getElementById('textbook-chapter-list').style.display = 'none';
  document.getElementById('textbook-section-list').style.display = 'none';
  document.getElementById('textbook-learning-item-list').style.display = 'none';
  document.getElementById('textbook-content-display').style.display = 'none';
}

/**
 * 教科書機能: 章リストを表示する
 */
function renderTextbookChapterList() {
  hideAllTextbookLists();
  const chapterListDiv = document.getElementById('textbook-chapter-list');
  const buttonGrid = chapterListDiv.querySelector('.button-grid');
  buttonGrid.innerHTML = ''; // クリア

  for (const chapterKey in textbookContent) {
    const chapter = textbookContent[chapterKey];
    const button = document.createElement('button');
    button.classList.add('list-button');
    button.textContent = chapter.name;
    button.onclick = () => {
      currentTextbookBreadcrumb.push({ name: chapter.name, type: 'chapter', key: chapterKey });
      updateTextbookBreadcrumb();
      renderTextbookSectionList(chapterKey);
    };
    buttonGrid.appendChild(button);
  }
  chapterListDiv.style.display = 'block';
}

/**
 * 教科書機能: 指定された章の中項目（セクション）リストを表示する
 * @param {string} chapterKey - 選択された章のキー
 */
function renderTextbookSectionList(chapterKey) {
  hideAllTextbookLists();
  const sectionListDiv = document.getElementById('textbook-section-list');
  const buttonGrid = sectionListDiv.querySelector('.button-grid');
  buttonGrid.innerHTML = ''; // クリア

  const chapter = textbookContent[chapterKey];
  for (const sectionKey in chapter.sections) {
    const section = chapter.sections[sectionKey];
    const button = document.createElement('button');
    button.classList.add('list-button');
    button.textContent = section.name;
    button.onclick = () => {
      currentTextbookBreadcrumb.push({ name: section.name, type: 'section', chapterKey: chapterKey, sectionKey: sectionKey });
      updateTextbookBreadcrumb();
      renderTextbookLearningItemList(chapterKey, sectionKey);
    };
    buttonGrid.appendChild(button);
  }
  sectionListDiv.style.display = 'block';
}

/**
 * 教科書機能: 指定された章とセクションの学習項目リストを表示する
 * @param {string} chapterKey - 選択された章のキー
 * @param {string} sectionKey - 選択されたセクションのキー
 */
function renderTextbookLearningItemList(chapterKey, sectionKey) {
  hideAllTextbookLists();
  const learningItemListDiv = document.getElementById('textbook-learning-item-list');
  const buttonGrid = learningItemListDiv.querySelector('.button-grid');
  buttonGrid.innerHTML = ''; // クリア

  const section = textbookContent[chapterKey].sections[sectionKey];
  section.learningItems.forEach((item, index) => {
    const button = document.createElement('button');
    button.classList.add('list-button');
    button.textContent = item.title;
    button.onclick = () => {
      currentTextbookBreadcrumb.push({ name: item.title, type: 'learningItem', chapterKey: chapterKey, sectionKey: sectionKey, itemIndex: index });
      updateTextbookBreadcrumb();
      renderTextbookContent(chapterKey, sectionKey, index);
    };
    buttonGrid.appendChild(button);
  });
  learningItemListDiv.style.display = 'block';
}

/**
 * 教科書機能: 個別の学習項目の本文を表示する
 * @param {string} chapterKey - 章のキー
 * @param {string} sectionKey - セクションのキー
 * @param {number} itemIndex - 学習項目のインデックス
 */
function renderTextbookContent(chapterKey, sectionKey, itemIndex) {
  hideAllTextbookLists();
  const contentDisplayDiv = document.getElementById('textbook-content-display');
  const contentArea = document.getElementById('textbook-content-area');
  contentArea.innerHTML = ''; // クリア

  const learningItem = textbookContent[chapterKey].sections[sectionKey].learningItems[itemIndex];

  const titleElem = document.createElement('h3');
  titleElem.textContent = learningItem.title;
  contentArea.appendChild(titleElem);

  learningItem.paragraphs.forEach(pText => {
    const pElem = document.createElement('p');
    pElem.innerHTML = pText; // HTMLタグ（例: <strong>）を解釈させるためinnerHTMLを使用
    contentArea.appendChild(pElem);
  });

  contentDisplayDiv.style.display = 'block';
}

// 教科書機能のパンくずリストからの戻る処理 (各階層)
function backToTextbookChapterList() {
  currentTextbookBreadcrumb = []; 
  updateTextbookBreadcrumb();
  renderTextbookChapterList();
}

function backToTextbookSectionList() {
  // セクションのパンくずまで戻すために、現在の学習項目を削除
  while(currentTextbookBreadcrumb.length > 1 && currentTextbookBreadcrumb[currentTextbookBreadcrumb.length - 1].type !== 'chapter') {
    currentTextbookBreadcrumb.pop();
  }
  updateTextbookBreadcrumb();
  const lastCrumb = currentTextbookBreadcrumb[currentTextbookBreadcrumb.length - 1];
  renderTextbookSectionList(lastCrumb.key);
}

function backToTextbookLearningItemList() {
  // 学習項目のパンくずまで戻すために、現在の学習項目コンテンツを削除
  while(currentTextbookBreadcrumb.length > 2 && currentTextbookBreadcrumb[currentTextbookBreadcrumb.length - 1].type !== 'section') {
    currentTextbookBreadcrumb.pop();
  }
  updateTextbookBreadcrumb();
  const lastCrumb = currentTextbookBreadcrumb[currentTextbookBreadcrumb.length - 1];
  renderTextbookLearningItemList(lastCrumb.chapterKey, lastCrumb.sectionKey);
}

// utils.jsのshowScreen関数も更新が必要になります。
// `utils.js` の `showScreen` 関数を以下のように変更してください。
// `question-list` と同様に `textbook-container` を追加します。

/**
 * 指定されたIDの画面を表示し、他の画面を非表示にする
 * @param {string} screenId - 表示する画面のID
 */
function showScreen(screenId) {
  const screens = ['menu', 'quiz-container', 'results', 'past-results', 'question-list', 'textbook-container']; // 'textbook-container' を追加
  screens.forEach(id => {
    document.getElementById(id).style.display = id === screenId ? 'block' : 'none';
  });
}