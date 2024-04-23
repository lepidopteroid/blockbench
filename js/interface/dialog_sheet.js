let oldDialog = window.Dialog;
window.Dialog = class DialogSheet extends oldDialog {
	
  constructor(id, options) {
    super(id, options);

    this.path = `/dialog/${this.id}`;
    this.page = { 
      // Route to open dialog by id
      path: this.path,
      el: document.createElement('div'),
    };
    this.page.el.classList.add('page');
    menuSheet.routes.push(this.page);
    menuSheet.update();

    console.log(`Dialog '${this.id}' Created`);
	};

  build() {
    this.page.el.append();
  };

  show() {
    console.log(`Show Menu: ${this.path}`);

    let showOptions = {
      animate: true,
      history: true,
      clearPreviousHistory: false,
    };

    if (!menuSheet.sheet.opened) {
      showOptions.animate = false;
    };
    menuSheet.view.router.navigate(
      this.path,
      showOptions,
    );
    menuSheet.sheet.open();
  };
};