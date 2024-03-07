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
      let entry = document.createElement('li');

      entry.append(document.querySelector(
        '#template_menu_sheet_item'
      ).content.cloneNode(true));

      // Add title and item id
      ((e) => {
        e.setAttribute('title', 
          `${
            object.description || ''
          }`
        );
        e.setAttribute('menu-item', object.id);
      })(entry);

      // Remove chevron if no sub-menus
      if (
        object instanceof Action ||
        Formats[object.id]
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

      // If action is toggle add toggle GUI
      if (object instanceof Toggle) {
        let toggleNode = 
          document.createElement('div');
        toggleNode.classList.add('toggle');
        
        toggleNode.append(document.querySelector(
          '#template_toggle_node'
        ).content.cloneNode(true));

        entry.querySelector(
          '.item-after'
        ).replaceChildren(toggleNode);

        parent.app.toggle.create({
          el: entry.querySelector('.toggle'),
          on: {
            change: function(entry, parent) {
              let toggleState = 
              parent.app.toggle.get(
                entry.querySelector('.toggle')
              ).checked;

              if (toggleState != this.value) {
                this.click();
              };
            }.bind(object, entry, parent)
          }
        }).checked = object.value;
      };

      // Add event on click
      let entryLink = entry.querySelector('a');
      
      if (object instanceof Toggle) {
        $(entryLink).on('click', e => {
          parent.app.toggle.get(
            entry.querySelector('.toggle')
          ).toggle();
        });
      } else if (
        typeof object.click === 'function'
      ) {
        $(entryLink).on('click', e => {
          object.click(context, e);
          parent.sheet.close();
        });
      } else if (!object.children) {
        $(entryLink).on('click', e => {
          object.trigger(e);
          parent.sheet.close();
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
          entry
        );
      };

      // Return the entry
      if ( childList <= 0) {
        return;
      };
      return entry;
    };

    function createChildList(object, node, list) {

      let childList = { 
        // Route to open child list by id
        path: `/menu/${object.id}`,
        el: document.createElement('div'),
      };

      childList.el.classList.add('page');

      let childCount = 0;
      let childDocFragment;

      // Get chid list contents
      if (!list) {
        if (typeof object.children == 'function') {
          list = object.children(context);
        } else {
          list = object.children;
        };
      }; 

      // Construct child list page container
      if (list.length) {
        childDocFragment = document.querySelector(
          '#template_menu_sheet_child_list'
        ).content.cloneNode(true);

        childList.el.append(childDocFragment);

        list.forEach((childObject) => {  
          let entry = getEntry(childObject);
          if (entry) {
            childList.el.querySelector(
              'ul'
            ).append(entry);
          };
        });

        // Store number of list items added
        childCount = childList.el.querySelector(
          'ul'
        ).childElementCount;

        //Push child list to router
        parent.routes.push(childList);
      };

      return childCount;
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
    this.view = undefined;
    this.swiper = undefined;
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

    this.view = this.app.views.create(this.app.$(
      '#menu_sheet_view'
    ), {
      url: '/',
      routes: [],
    });

    this.swiper = this.app.swiper.get(
      this.app.$('#menu_sheet_swiper')
    );
    
    this.swiper.on('slideChange', () => {
      let activeTab = this.app.$(
        this.swiper.slides
      ).eq(this.swiper.activeIndex)[0].id;

      this.app.$(
        `#menu_sheet_view a[href$="#${activeTab}"]`
      )[0].scrollIntoView(
        { behavior: "smooth" }
      );
    });

    this.update();
  };

  update() {
    // Do nothing if F7 isn't initialized
    if (!this.app) return;

    let swiper = document.querySelector(
      '#menu_sheet_swiper'
    );

    let bar = document.querySelector(
      '#menu_sheet_toolbar_inner'
    );

    let view = document.getElementById(
      'menu_sheet_view'
    );

    // Update swiper tabs
    if (swiper) {
      this.app.$(swiper).children().detach();

      for (let menu in this.barMenus) {
        new SheetMenu(
          this.barMenus[menu].id,
          this.barMenus[menu].structure,
          this.barMenus[menu].options,
          this
        );
      };

      this.app.$(
        '#menu_sheet_swiper'
      ).children('swiper-slide').eq(0).addClass(
          'tab-active'
      );
    };

    // Update tab bar
    if (bar) {
      this.app.$(bar).children().detach();

      this.keys = [];

      for (let menu in this.menus) {
        if (this.menus.hasOwnProperty(menu)) {
          if (this.menus[menu].conditionMet()) {
            bar.append(this.menus[menu].label);
            this.keys.push(menu);
          };
        };
      };

      if ($(
        '#menu_sheet_toolbar_inner .tab-link-active'
      ).length <= 0) {
        this.app.$(
          '#menu_sheet_toolbar_inner'
        ).children('a').eq(0).addClass(
          'tab-link-active'
        );
      };
    };

    // Update routes
    if (this.view) {
      // Clear previous
      this.view.routes.length = 0;

      // Add new
      for (let route in this.routes) {
        this.view.routes.push(
          this.routes[route]
        );
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

// Extend MenuBar update function to populate sheet
MenuBar.update = (function (_super) {
  return function() {
    for (let menu in MenuBar.menus) {
      // If menu doesn't exist yet create it
      if (!menuSheet.barMenus[menu]) {
        menuSheet.barMenus[menu] = {};
      }; 
      // Copy menu params
      menuSheet.barMenus[menu].id = 
        MenuBar.menus[menu].id; 
      menuSheet.barMenus[menu].structure =
        MenuBar.menus[menu].structure;
      menuSheet.barMenus[menu].options =
        MenuBar.menus[menu].options;
    };

    // Filter menu is redundant/obsolete
    delete menuSheet.barMenus.filter;

    //Update our menu sheet
    menuSheet.update();
    
    // Call original MenuBar.update
    return _super.apply(this, arguments);
  }
})(MenuBar.update);