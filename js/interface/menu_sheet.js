class SheetMenu extends Menu {

  constructor(id, structure, options = {}, parent) {
    //Call parent constructor
    super(id, structure, options);

    //Append this to the MenuSheet's list of menus
    parent.menus[id] = this;

    // Assign all the properties
    this.type = 'sheet_menu';
    this.id = id;
    this.children = [];
    this.condition = options.condition;
    this.name = tl(options.name || `menu.${id}`);
    this.structure = structure;
    this.highlight_action = null;

    // Build container for the menu items
    this.node = document.querySelector(
      '#template_menu_sheet_tab'
    ).content.cloneNode(true);
    
    this.node.querySelector(
      '.tab'
    ).setAttribute('id', this.id);
    
    // Build tab label link at top of sheet
    this.label = document.querySelector(
      '#template_menu_sheet_tab_link'
    ).content.cloneNode(true);

    ((e) => {
      e.setAttribute('href', `#${id}`);
      e.setAttribute('name', this.name);
      e.textContent = this.name;
    })(this.label.querySelector('.tab-link'));

    // Add this to the sheet if conditions are met
    if (this.conditionMet()) {
      this.initialize(undefined, parent);
    }; 
  };

  initialize(context, parent) {

    // Get structure of the menu
    let content_list = 
    (typeof this.structure == 'function') ? 
    this.structure(context) : 
    this.structure;

    // Append the entry for each menu item
    content_list.forEach((object) => {  
      let entry = getEntry(object);
      if (entry) {
        this.node.querySelector('ul').append(entry);
      };
    });

    // Add menu tab to swiper
    document.querySelector(
      '#menu_sheet_swiper'
    ).append(this.node);

    function getEntry(object) {
            
      // Get the context of the object if available
      let context = object.context ? 
      object.context : 
      undefined;

      // Ignore menu Separators
      if (object === '_') return;
    
      if (
        typeof object == 'string' && 
        object.startsWith('#')
      ) {
        return;
      };

      if (object instanceof MenuSeparator) return;
    
      // Get the existing item if available
      if (
        typeof object == 'string' && 
        BarItems[object]
      ) {
        object = BarItems[object];
      };

      // Return if it doesn't meet display condition
      if (!Condition(object.condition, context)) {
        return;
      }; 

      // Build default entry
      let entry = document.querySelector(
        '#template_menu_sheet_item'
      ).content.cloneNode(true);

      // Add title and item id
      ((e) => {
        e.setAttribute('title', 
          `${
            object.description && 
            tl(object.description)
          }`
        );
        e.setAttribute('menu-item', object.id);
      })(entry.querySelector('li'));
      
      // Remove chevron if no sub-menus
      if (
        object instanceof Action || 
        object.type == 'format'
      ) {
        entry.querySelector('a').classList.add(
          'no-chevron'
        );
      } else {
        entry.querySelector('a').setAttribute(
          'href', 
          `/menu/${object.id}`
        );
      };

      // Add item icon
      entry.querySelector('.item-media').append(
        Blockbench.getIconNode(
          (icon = typeof object.icon) => { 
            return (icon === 'function') ? 
            object.icon(object.context) : 
            object.icon
          }, object.color
        )
      );
      
      // Add item name
      entry.querySelector(
        '.item-title'
      ).textContent = tl(object.name);

      // Add keybinding label
      entry.querySelector(
        '.item-after'
      ).textContent = object.keybind || '';

      // Get existing entry of action if exists
      if (object instanceof Action) {
        entry = object.menu_sheet_node;
      }; 

      // Add event on click
      if (typeof object.click === 'function') {
        let entryLink = entry.querySelector('a');
        $(entryLink).on('click', e => {
          object.click(context, e);
        });
      };

      // Build child view if necessary
      let childList;
      if ( 
        typeof object.children == 'function' || 
        typeof object.children == 'object'
      ) {
        childList = createChildList(
          object, 
          object.menu_sheet_node
        );
      };

      // Return the entry
      if ( childList == 0) {
        return;
      };
      return entry;
    };

    function createChildList(object, node, list) {

      let childList = { 
        // Route to open child list by id
        path: `/menu/${object.id}`,
        el: undefined,
      };

      // Get chid list contents
      if (!list) {
        list = (
          (typeof object.children == 'function') ? 
          object.children(context) : 
          object.children
        );
      }; 

      // Construct child list page container
      if (list.length) {
        childList.el = document.querySelector(
          '#template_menu_sheet_child_list'
        ).content.cloneNode(true);

        list.forEach((childObject) => {  
          let entry = getEntry(childObject);
          if (entry) {
            childList.el.querySelector(
              'ul'
            ).append(entry);
          };
        });

        childList.el = childList.el.querySelector(
          '.page'
        );
      };

      //Push child list to router
      parent.routes.push(childList);
      return list.length;
    };
  };
    
  open(position, context) {
    if (this.onOpen) this.onOpen(position, context);
  };
};

class MenuSheet {

  constructor() {
    this.app = undefined;
    this.sheet = undefined;
    this.open = undefined;
    this.barMenus = {};
    this.menus = {};
    this.routes = [];
    this.template = document.querySelector(
      '#template_menu_sheet'
    ).content.cloneNode(true);
  };

  setup(app) {
    this.app = app;

    document.getElementById('app').append(
      this.template
    );
    
    this.sheet = this.app.sheet.create({
      closeByOutsideClick: true,
      swipeToClose: true,
      el: this.app.$('#menu_sheet'),
    });

    this.app.views.create(this.app.$(
      '#menu_sheet_view'
    ), {
      url: '/',
      routes: [],
    });

    this.app.swiper.get(
      this.app.$('#menu_sheet_swiper')
    ).on('slideChange', {
      app: this.app
    }, function(event) {
      console.log('slideChange');
      event.data.app.$(`#menu_sheet_view a[href$="#${ 
        event.data.app.$(
          this.slides
        ).eq(this.activeIndex)[0].id 
      }"]`)[0].scrollIntoView({ behavior: "smooth"});
    });

    this.initMenus();
    this.update();

    for (let route in this.routes) {
      this.app.views.get(
        document.getElementById('menu_sheet_view')
      ).routes.push(this.routes[route]);
    };

    this.app.$(
      '#menu_sheet_toolbar_inner'
    ).children('a').eq(0).addClass(
      'tab-link-active'
    );

    this.app.$(
      '#menu_sheet_swiper'
    ).children('swiper-slide').eq(0).addClass(
        'tab-active'
    );
  };

  initMenus() {
    for (let menu in this.barMenus) {
      new SheetMenu(
        this.barMenus[menu].id,
        this.barMenus[menu].structure,
        this.barMenus[menu].options,
        this
      );
    };
  };

  update() {
    let bar = document.querySelector(
      '#menu_sheet_toolbar_inner'
    );
    $(bar).children().detach();
    this.keys = [];
    for (let menu in this.menus) {
      if (this.menus.hasOwnProperty(menu)) {
        if (this.menus[menu].conditionMet()) {
          bar.append(this.menus[menu].label);
          this.keys.push(menu);
        };
      };
    };
  };

  addAction(action, path) {
    if (path) {
      path = path.split('.');
      var menu = this.menus[path.splice(0, 1)[0]];
      if (menu) {
        menu.addAction(action, path.join('.'));
      };
    };
  };

  removeAction(path) {
    if (path) {
      path = path.split('.');
      var menu = this.menus[path.splice(0, 1)[0]];
      if (menu) {
        menu.removeAction(path.join('.'));
      };
    };
  };
};

var menuSheet = new MenuSheet;

MenuBar.update = (function (_super) {
  return function() {
    for (let menu in MenuBar.menus) {
      if (menuSheet.barMenus[menu]) {
        return;
      } else {
        menuSheet.barMenus[menu] = {};
      }; 
      menuSheet.barMenus[menu].id = 
        MenuBar.menus[menu].id; 
      menuSheet.barMenus[menu].structure =
        MenuBar.menus[menu].structure;
      menuSheet.barMenus[menu].options =
        MenuBar.menus[menu].options;
    };

    delete menuSheet.barMenus.filter;
    
    return _super.apply(this, arguments);
  }
})(MenuBar.update);