let oldDialog = window.Dialog;
window.Dialog = class DialogSheet extends oldDialog {
  
  constructor(id, options) {
    super(id, options);
  };

  close(button, event) {
    if (
      button == this.confirmIndex && 
      typeof this.onConfirm == 'function'
    ) {
      let formResult = this.getFormResult();
      let result = this.onConfirm(formResult, event);
      if (result === false) return;
    };
    if (
      button == this.cancelIndex && 
      typeof this.onCancel == 'function'
    ) {
      let result = this.onCancel(event);
      if (result === false) return;
    };
    if (
      typeof this.onButton == 'function'
    ) {
      let result = this.onButton(button, event);
      if (result === false) return;
    };
    this.hide();
  };

  build() {
    this.object = document.createElement('div');
    this.object.classList.add('page');

    let pageContent = document.querySelector(
      '#template_dialog'
    ).content.cloneNode(true);

    this.object.append(pageContent);

    this.path = `/dialog/${this.id}`;
    this.page = { 
      // Route to open dialog by id
      path: this.path,
      el: this.object,
    };

    menuSheet.routes.push(this.page);
    menuSheet.update();

    this.part_order.forEach(part => {
      if (part == 'form' && this.form) { 
        buildForm(this); 
      };
      if (part == 'lines' && this.lines) {
        buildLines(this);
      }; 
      if (part == 'component' && this.component) {
        buildComponent(this);
      }; 
    });

    if (this.buttons.length) {
      let buttons = [];
      this.buttons.forEach((b, i) => {
        let btn = Interface.createElement(
          'button', 
          {type: 'button'}, 
          tl(b)
        );
        buttons.push(btn);
        btn.addEventListener('click', (event) => {
          this.close(i, event);
        });
      });
      buttons[this.confirmIndex] && 
        buttons[this.confirmIndex].classList.add(
          'confirm_btn'
        );
      buttons[this.cancelIndex] && 
        buttons[this.cancelIndex].classList.add(
          'cancel_btn'
        );
      let button_bar = $(
        '<div class="dialog_bar button_bar"></div>'
      );

      buttons.forEach((button, i) => {
        button_bar.append(button)
      });

      this.object.querySelector(
        '.dialog_wrapper'
      ).append(button_bar[0]);
    };

    return this;
  };

  show() {
    if (!this.object) this.build();

    console.log(`Show dialog: ${this.path}`);

    let showOptions = {
      animate: true,
      history: true,
      clearPreviousHistory: false,
    };

    // jump immediately to page if sheet is closed
    if (!menuSheet.sheet.opened) {
      showOptions.animate = false;
    };
    
    menuSheet.view.router.navigate(
      this.path,
      showOptions,
    );

    menuSheet.sheet.once('closed', (sheet) => {
      menuSheet.view.router.back({
        animate: false,
      });
    });

    menuSheet.sheet.open();

    if (typeof this.onOpen == 'function') {
      this.onOpen();
    };

    return this;
  };

  hide() {
    $('#blackout').hide().toggleClass(
      'darken', 
      true
    );
    open_dialog = false;
    open_interface = false;
    Dialog.open = null;
    Dialog.stack.remove(this);
    Prop.active_panel = Prop._previous_active_panel;

    menuSheet.sheet.close();
    
    return this;
  };
};