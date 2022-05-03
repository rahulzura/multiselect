class Multiselect {
  constructor(selector, mountElSelector, options={}) {
    this.selector = selector;
    this.el = document.querySelector(selector);
    this.id = Math.random().toString(16).slice(2,6);
    this.selected = new Set();
    this.checkboxesByIndex = {};
    this.noneSelectedText = options && options.noneSelectedText ? options.noneSelectedText : 'None selected';
    if (!this.el) return;

    this.options = [];
    for (const optionEl of this.el.options) {
      const optionData = {value: optionEl.value, index: optionEl.index, innerText: optionEl.innerText, selected: optionEl.selected};
      this.options.push(optionData);
    }

    const checkboxUl = document.createElement('ul');
    checkboxUl.classList.add('multiselect-ul');
    checkboxUl.classList.add('dropdown-menu');
    this.options.forEach(optionData => {
      const li = document.createElement('li');
      const checkboxLabel = Multiselect.createCheckbox(optionData, this.id);
      checkboxLabel.setAttribute('class', 'dropdown-item');
      const checkbox = checkboxLabel.children[0];
      checkbox.checked = optionData.selected;
      this.checkboxesByIndex[optionData.index] = checkbox;
      li.appendChild(checkboxLabel);
      checkboxUl.appendChild(li);
    });
    this.checkboxUl = checkboxUl;

    // display text div
    const displayDiv = document.createElement('div');
    displayDiv.setAttribute('class', 'multiselect-text btn btn-secondary dropdown-toggle');
    displayDiv.setAttribute('data-bs-toggle', 'dropdown')
    displayDiv.setAttribute('data-bs-auto-close', 'outside');
    displayDiv.innerHTML = this.getDisplayText();
    this.displayDiv = displayDiv;

    // multiselect
    const div = document.createElement('div');
    div.appendChild(this.displayDiv);
    div.appendChild(this.checkboxUl);
    div.setAttribute('class', 'multiselect-wrapper');
    this.multiselect = div;

    const mountEl = document.querySelector(mountElSelector);
    mountEl.innerHTML = '';
    mountEl.appendChild(this.multiselect);

    this.checkboxUl.addEventListener('click', (e) => {
      if (e.target.tagName !== 'INPUT') return;

      this.updateOriginalInput();
    })

    // this.displayDiv.addEventListener('click', (e) => {
    //   console.log("clicked", "style", this.checkboxUl.style.display)
    //   if (!this.checkboxUl.style.display || this.checkboxUl.style.display === "none") this.checkboxUl.style.display = "block";
    //   else this.checkboxUl.style.display = "none";
    // })

    // Hide the original input
    this.el.style.display = "none";
  }

  static createCheckbox(optionData, uniqueStr) {
    const id = String(uniqueStr+optionData.index);
    const checkbox = document.createElement('input');
    checkbox.setAttribute('type', 'checkbox');
    checkbox.setAttribute('value', optionData.value);
    checkbox.setAttribute('id', id);

    // Gets the style from bootstrap
    checkbox.setAttribute('class', 'form-check-input');

    const label = document.createElement('label');
    const text = document.createTextNode(optionData.innerText);
    label.appendChild(checkbox);
    label.appendChild(text);
    label.setAttribute('for', id)

    return label;
  }

  getDisplayText() {
    const texts = this.getTexts(true);
    return texts.length ? texts.join(', ') : this.noneSelectedText;
  }

  updateOriginalInput() {
    for (const index in this.checkboxesByIndex) {
      const checkbox = this.checkboxesByIndex[index];
      this.el.children[+index].selected = checkbox.checked;
    }
    this.displayDiv.innerHTML = this.getDisplayText();
  }

  getCheckboxData() {
    const checkboxData = Array.from(this.checkboxUl.children).map(li => {
      const label = li.children[0];
      console.log("label", label.innerText)
      return {value: label.children[0].value, text: label.innerText, checked: label.children[0].checked};
    })
    return checkboxData;
  }

  getTexts(onlySelected=false) {
    const data = this.getCheckboxData();
    if (onlySelected) return data.filter(d => d.checked).map(d => d.text);
    else return data.map(d => d.text);
  }

  getValues(onlySelected) {
    const data = this.getCheckboxData();
    if (onlySelected) return data.filter(d => d.checked).map(d => d.value);
    else return data.map(d => d.value);
  }

  setSelected(values) {
    const set = new Set(values);
    const map = new Map();

    Array.from(this.checkboxUl.children).forEach(li => {
      const label = li.children[0];
      const checkbox = label.children[0];
      if (set.has(checkbox.value)) checkbox.checked = true;
      else checkbox.checked = false;
    })

    this.updateOriginalInput();
  }
}
