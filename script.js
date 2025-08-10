/**
 * Elegant Dual Lists - Interactive Component (Fixed Version)
 */

class DualListsComponent {
  constructor() {
    this.items = [];
    this.isDarkTheme = false;
    this.init();
  }

  init() {
    this.cacheElements();
    this.bindEvents();
    this.initializeItems();
    this.setupKeyboardNavigation();
    this.initializeTheme();
    console.log('Dual Lists Component initialized successfully');
  }

  cacheElements() {
    this.themeSwitch = document.getElementById('theme-switch');
    this.exportBtn = document.getElementById('export-btn');
    this.listItems = document.querySelectorAll('.list-item');
    this.actionBtns = document.querySelectorAll('.action-btn');
    this.body = document.body;
  }

  bindEvents() {
    if (this.themeSwitch) {
      this.themeSwitch.addEventListener('change', () => this.toggleTheme());
    }
    if (this.exportBtn) {
      this.exportBtn.addEventListener('click', () => this.exportLists());
    }
    this.actionBtns.forEach((btn) => {
      btn.addEventListener('click', (e) => this.toggleItem(e, btn));
      btn.addEventListener('keydown', (e) => this.handleKeydown(e, btn));
    });
    document.querySelectorAll('.item-content').forEach((content) => {
      content.addEventListener('click', (e) => {
        if (e.target.closest('.action-btn')) return;
        const actionBtn = content.querySelector('.action-btn');
        this.toggleItem(e, actionBtn);
      });
    });
  }

  initializeItems() {
    this.listItems.forEach((item, index) => {
      const title = item.querySelector('.item-title')?.textContent || '';
      const subtitle = item.querySelector('.item-subtitle')?.textContent || '';
      const details = item.querySelector('.item-details p')?.textContent || '';
      this.items.push({
        id: `item-${index + 1}`,
        title,
        subtitle,
        details,
        expanded: false
      });
    });
  }

  toggleItem(event, button) {
    event.preventDefault();
    event.stopPropagation();
    const listItem = button.closest('.list-item');
    const details = listItem.querySelector('.item-details');
    const isExpanded = button.getAttribute('aria-expanded') === 'true';
    const newState = !isExpanded;
    button.setAttribute('aria-expanded', newState);
    details.setAttribute('aria-hidden', !newState);
    if (newState) {
      listItem.classList.add('expanded');
      this.animateExpand(details);
    } else {
      listItem.classList.remove('expanded');
      this.animateCollapse(details);
    }
    const itemIndex = Array.from(this.listItems).indexOf(listItem);
    if (this.items[itemIndex]) {
      this.items[itemIndex].expanded = newState;
    }
    this.announceStateChange(newState, listItem.querySelector('.item-title').textContent);
  }

  animateExpand(element) {
    const naturalHeight = element.scrollHeight;
    element.style.maxHeight = naturalHeight + 'px';
    setTimeout(() => {
      element.style.transform = 'scale(1.01)';
      setTimeout(() => {
        element.style.transform = 'scale(1)';
      }, 150);
    }, 200);
  }

  animateCollapse(element) {
    element.style.maxHeight = '0px';
    element.style.transform = 'scale(1)';
  }

  toggleTheme() {
    this.isDarkTheme = !this.isDarkTheme;
    if (this.isDarkTheme) {
      this.body.classList.add('dark-theme');
      localStorage.setItem('theme', 'dark');
    } else {
      this.body.classList.remove('dark-theme');
      localStorage.setItem('theme', 'light');
    }
    this.body.style.transition = 'all 0.3s ease';
    setTimeout(() => {
      this.body.style.transition = '';
    }, 300);
  }

  initializeTheme() {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const shouldUseDark = savedTheme === 'dark' || (!savedTheme && prefersDark);
    if (shouldUseDark) {
      this.isDarkTheme = true;
      this.body.classList.add('dark-theme');
      if (this.themeSwitch) {
        this.themeSwitch.checked = true;
      }
    }
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (!localStorage.getItem('theme')) {
        if (e.matches && !this.isDarkTheme) {
          this.themeSwitch.checked = true;
          this.toggleTheme();
        } else if (!e.matches && this.isDarkTheme) {
          this.themeSwitch.checked = false;
          this.toggleTheme();
        }
      }
    });
  }

  setupKeyboardNavigation() {
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.collapseAllItems();
      }
      if (e.key === 'Enter' || e.key === ' ') {
        const activeElement = document.activeElement;
        if (activeElement.classList.contains('action-btn')) {
          e.preventDefault();
          this.toggleItem(e, activeElement);
        }
      }
    });
    this.actionBtns.forEach((btn) => {
      btn.addEventListener('focus', () => {
        btn.closest('.list-item').classList.add('focused');
      });
      btn.addEventListener('blur', () => {
        btn.closest('.list-item').classList.remove('focused');
      });
    });
  }

  handleKeydown(event, button) {
    switch (event.key) {
      case 'Enter':
      case ' ':
        event.preventDefault();
        this.toggleItem(event, button);
        break;
      case 'ArrowDown':
        event.preventDefault();
        this.focusNextItem(button);
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.focusPreviousItem(button);
        break;
    }
  }

  focusNextItem(currentButton) {
    const currentIndex = Array.from(this.actionBtns).indexOf(currentButton);
    const nextIndex = (currentIndex + 1) % this.actionBtns.length;
    this.actionBtns[nextIndex].focus();
  }

  focusPreviousItem(currentButton) {
    const currentIndex = Array.from(this.actionBtns).indexOf(currentButton);
    const prevIndex = currentIndex === 0 ? this.actionBtns.length - 1 : currentIndex - 1;
    this.actionBtns[prevIndex].focus();
  }

  collapseAllItems() {
    this.actionBtns.forEach(btn => {
      if (btn.getAttribute('aria-expanded') === 'true') {
        this.toggleItem({ preventDefault: () => {}, stopPropagation: () => {} }, btn);
      }
    });
  }

  exportLists() {
    const exportData = {
      timestamp: new Date().toISOString(),
      theme: this.isDarkTheme ? 'dark' : 'light',
      lists: {
        favorites: this.extractListData(0),
        discoveries: this.extractListData(1)
      }
    };
    navigator.clipboard.writeText(JSON.stringify(exportData, null, 2))
      .then(() => this.showExportFeedback())
      .catch(() => this.fallbackCopyToClipboard(JSON.stringify(exportData, null, 2)));
  }

  extractListData(panelIndex) {
    const panels = document.querySelectorAll('.list-panel');
    if (!panels[panelIndex]) return [];
    const items = panels[panelIndex].querySelectorAll('.list-item');
    return Array.from(items).map(item => ({
      title: item.querySelector('.item-title')?.textContent || '',
      subtitle: item.querySelector('.item-subtitle')?.textContent || '',
      details: item.querySelector('.item-details p')?.textContent || '',
      expanded: item.classList.contains('expanded')
    }));
  }

  showExportFeedback() {
    const originalText = this.exportBtn.innerHTML;
    this.exportBtn.innerHTML = `✅ Copied!`;
    this.exportBtn.style.background = '#4CAF50';
    setTimeout(() => {
      this.exportBtn.innerHTML = originalText;
      this.exportBtn.style.background = '';
    }, 2000);
  }

  fallbackCopyToClipboard(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.opacity = '0';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand('copy');
      this.showExportFeedback();
    } catch (err) {
      console.error('Could not copy text: ', err);
      this.showExportError();
    }
    document.body.removeChild(textArea);
  }

  showExportError() {
    const originalText = this.exportBtn.innerHTML;
    this.exportBtn.innerHTML = `❌ Error`;
    this.exportBtn.style.background = '#f44336';
    setTimeout(() => {
      this.exportBtn.innerHTML = originalText;
      this.exportBtn.style.background = '';
    }, 2000);
  }

  announceStateChange(isExpanded, itemTitle) {
    let announcer = document.getElementById('live-announcer');
    if (!announcer) {
      announcer = document.createElement('div');
      announcer.id = 'live-announcer';
      announcer.setAttribute('aria-live', 'polite');
      announcer.setAttribute('aria-atomic', 'true');
      announcer.style.position = 'absolute';
      announcer.style.left = '-10000px';
      announcer.style.width = '1px';
      announcer.style.height = '1px';
      announcer.style.overflow = 'hidden';
      document.body.appendChild(announcer);
    }
    announcer.textContent = `${itemTitle} ${isExpanded ? 'expanded' : 'collapsed'}`;
  }

  expandAll() {
    this.actionBtns.forEach(btn => {
      if (btn.getAttribute('aria-expanded') === 'false') {
        this.toggleItem({ preventDefault: () => {}, stopPropagation: () => {} }, btn);
      }
    });
  }

  collapseAll() {
    this.collapseAllItems();
  }

  getListData() {
    return {
      favorites: this.extractListData(0),
      discoveries: this.extractListData(1)
    };
  }
}

class TodoListComponent {
  constructor() {
    this.todoInput = document.getElementById('todo-input');
    this.addBtn = document.getElementById('add-todo-btn');
    this.todoItemsContainer = document.getElementById('todo-items');
    this.todos = [];
    this.bindEvents();
  }

  bindEvents() {
    this.addBtn.addEventListener('click', () => this.addTodo());
    this.todoInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') this.addTodo();
    });
  }

  addTodo() {
    const text = this.todoInput.value.trim();
    if (text === '') return;
    this.todos.push({ text, done: false });
    this.todoInput.value = '';
    this.render();
  }

  toggleDone(index) {
    this.todos[index].done = !this.todos[index].done;
    this.render();
  }

  removeTodo(index) {
    this.todos.splice(index, 1);
    this.render();
  }

  render() {
    this.todoItemsContainer.innerHTML = '';
    this.todos.forEach((todo, i) => {
      const li = document.createElement('li');

      // متن جدا
      const span = document.createElement('span');
      span.textContent = todo.text;
      span.style.textDecoration = todo.done ? 'line-through' : 'none';
      span.addEventListener('click', () => this.toggleDone(i));

      // دکمه × جدا
      const removeBtn = document.createElement('button');
      removeBtn.textContent = '×';
      removeBtn.style.marginLeft = '10px';
      removeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.removeTodo(i);
      });

      li.appendChild(span);
      li.appendChild(removeBtn);
      this.todoItemsContainer.appendChild(li);
    });
  }
}

// ✅ فقط یکبار اجرا
document.addEventListener('DOMContentLoaded', () => {
  window.DualLists = new DualListsComponent();
  window.TodoList = new TodoListComponent();
});

/* 📌 CSS پیشنهادی برای درست شدن نمایش متن */
const style = document.createElement('style');
style.textContent = `
  .item-details {
    overflow: hidden;
    max-height: 0;
    transition: max-height 0.3s ease, transform 0.2s ease;
  }
  .list-item.expanded .item-details {
    max-height: 500px;
  }
`;
document.head.appendChild(style);
