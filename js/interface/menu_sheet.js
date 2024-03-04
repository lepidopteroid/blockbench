class SheetMenu extends Menu {

    constructor(id, structure, options = {}, parent) {
		super(id, structure, options); 	//Call parent constructor

		parent.menus[id] = this; 		//Append this to the MenuSheet's list of menus

		// Assign all the properties
		this.type = 'sheet_menu';
		this.id = id;
		this.children = [];
		this.condition = options.condition;
        this.name = tl(options.name || `menu.${id}`);
		this.structure = structure;
		this.highlight_action = null;

		// Build container for the menu items
		this.node = Interface.createElement('swiper-slide', {
            class:  'page-content tab',
            id:      id,
        }, [
			Interface.createElement('div', {
                class: 'list inset list-outline-ios list-strong-ios list-dividers-ios',
            }, [
                Interface.createElement('ul'),
            ]),
		]);
		
		// Build tab label link at top of sheet
		this.label = Interface.createElement('a', {
            class:  'tab-link',
            href:   `#${id}`,
        }, this.name);

		// Add this to the sheet if conditions are met
        if (this.conditionMet()) this.initialize(undefined, parent);
    };

    initialize(context, parent) {

		// Add menu tab to swiper
		document.querySelector('#menu_sheet_swiper').append(this.node);

		// Get structure of the menu
        let content_list = typeof this.structure == 'function' ? 
        this.structure(context) : this.structure;

		// Append the entry for each menu item
        content_list.forEach((object) => {  
            let entry = getEntry(object);
			if (entry) $(this.node).find('ul')[0].append(entry);
		});

        function getEntry(object) {
            
			// Get the context of the object if available
			let context = object.context ? object.context : undefined;

            // Ignore menu Separators
            if (object === '_') return;
            if (typeof object == 'string' && object.startsWith('#')) return;
            if (object instanceof MenuSeparator) return;

            // Get the existing item if available
            if (typeof object == 'string' && BarItems[object]) object = BarItems[object];

			// Return if it doesn't meet the condition to be displayed
			if (!Condition(object.condition, context)) return;

            //Default entry
            let entry = Interface.createElement('li', {
                title:      object.description && tl(object.description), 
                menu_item:  object.id,
            }, [
                Interface.createElement('a', {
                    class:  'item-link item-content', 
                    href:   `/menu/${object.id}` // Route to open child list by id
                }, [
                    Interface.createElement('div', {
                        class: 'item-media'
                    }, [
                        Blockbench.getIconNode((icon = typeof object.icon) => {
                            return (icon === 'function') ? object.icon(object.context) : object.icon;
                        },  object.color),
                    ]),
                    Interface.createElement('div', {
                        class: `item-inner ${(object instanceof Action ? 'no-chevron' : '')}` // Hide chevron if no sub-menu
                    }, [
                        Interface.createElement('div', {
                            class: 'item-title'
                        }, tl(object.name)),
                        Interface.createElement('div', {
                            class: 'item-after keybinding_label'
                        }, object.keybind || ''),
                    ]),
                ]),
            ]);

            //Get existing entry of action instead if it exists
            if (object instanceof Action) entry = object.menu_sheet_node;

            //Build child view if necessary
            if ( typeof object.children == 'function' || typeof object.children == 'object') {
                createChildList(object, object.menu_sheet_node);
            };

            // Return the entry
			return entry;
        };

		function createChildList(object, node, list) {

			let childList = { 
                path: `/menu/${object.id}`, // Route to open child list by id
                el: undefined,
			};

			// Get chid list contents
            if (!list) list = (typeof object.children == 'function') ? 
			object.children(context) : object.children;

			// Construct child list page container
            if (list.length) {
				childList.el = 
					Interface.createElement('div', {class: 'page'}, [
						Interface.createElement('div', {class: 'toolbar'}, [
							Interface.createElement('div', {class: 'toolbar-inner'}, [
								Interface.createElement('div', {class: 'left'}, [
									Interface.createElement('a', {class: 'link back'}, [
										Interface.createElement('i', {class: 'icon icon-back'}, []),
										Interface.createElement('span', {class: 'if-not-md'}, ['Back']),
									]),
								]),
							]),
						]),
						Interface.createElement('div', {class: 'page-content'}, [
							Interface.createElement('div', {class: 'list inset list-outline-ios list-strong-ios list-dividers-ios'}, [
								Interface.createElement('ul'),
							]),
						]),
					]);

				list.forEach((childObject) => {  
					let entry = getEntry(childObject);
					if (entry) $(childList.el).find('ul')[0].append(entry);
				});
            };

            //Push child list to router
            parent.app.views.get(document.getElementById('menu_sheet_view')).routes.push(childList);
        };
        

            // let scope_context = object.context ? object.context : context;
            // var entry;
            
            // //ignore menu separators
            // if (
            //     object === '_' ||
            //     typeof object == 'string' && object.startsWith('#') ||
            //     object instanceof MenuSeparator
            // ) return;

            // if (typeof object == 'string' && BarItems[object]) object = BarItems[object];
            // //console.log(scope_context);
            // if (!Condition(object.condition, scope_context)) return;

            // if (object instanceof Action) {
            //     entry = object.menu_sheet_node;
            //     if (
            //         typeof object.children == 'function' || 
            //         typeof object.children == 'object'
            //     ) {
            //         createChildList(object, object.menu_sheet_node);
            //     };
            //     $(this.node).find('ul')[0].append(entry);

            // } else if (typeof object === 'object') {
            //     let child_count;
            //     var icon;

            //     if (typeof object.icon === 'function') {
			// 		icon = Blockbench.getIconNode(
            //             object.icon(scope_context), 
            //             object.color,
            //         );
			// 	} else {
			// 		icon = Blockbench.getIconNode(
            //             object.icon, 
            //             object.color,
            //         );
			// 	};

            //     entry = Interface.createElement('li', {title: object.description && tl(object.description), menu_item: object.id}, [
            //                 Interface.createElement('a', {class: 'item-link item-content', href: `/menu/${object.id}`}, [
            //                     Interface.createElement('div', {class: 'item-media'}, [
            //                         icon.cloneNode(true),
            //                     ]),
            //                     Interface.createElement('div', {class: 'item-inner'}, [
            //                         Interface.createElement('div', {class: 'item-title'}, tl(object.name)),
            //                         Interface.createElement('div', {class: 'item-after keybinding_label'}, object.keybind || ''),
            //                     ]),
            //                 ]),
            //             ]);
                
            //     if (typeof object.click === 'function') {
            //         entry.addEventListener('click', e => {
            //             if (e.target == entry) {
            //                 object.click(scope_context, e);
            //             };
            //         });
            //     };
            //     if (
            //         typeof object.children == 'function' || 
            //         typeof object.children == 'object'
            //     ) {
			// 		child_count = createChildList(object, entry);
			// 	};

			// 	$(this.node).find('ul')[0].append(entry);
            // };
    };
    
    open(position, context) {
		if (this.onOpen) this.onOpen(position, context);

		if (position && position.changedTouches) {
			convertTouchEvent(position);
		}
		let last_context = context;
		var scope = this;
		let ctxmenu = $(this.node)
		if (open_menu) {
			open_menu.hide()
		}
		document.querySelector('#menu_sheet_swiper').append(this.node);

		function createChildList(object, node, list) {
			if (!list && typeof object.children == 'function') {
				list = object.children(context)
			} else if (!list) {
				list = object.children
			}
			node = $(node);
			node.find('ul.contextMenu.sub').detach();
			if (list.length) {
				var childlist = $(Interface.createElement('ul', {class: 'contextMenu sub'}));

				populateList(list, childlist, object.searchable);

				if ((typeof object.click == 'function' || object instanceof Tool) && (object instanceof Action == false || object.side_menu)) {
					if (node.find('> .menu_more_button').length == 0) {
						node.addClass('hybrid_parent');
						let more_button = Interface.createElement('div', {class: 'menu_more_button'}, Blockbench.getIconNode('more_horiz'));
						node.append(more_button);
						more_button.addEventListener('mouseenter', e => {
							scope.hover(node.get(0), e, true);
						})
						more_button.addEventListener('mouseleave', e => {
							if (node.is(':hover') && !childlist.is(':hover')) {
								scope.hover(node.get(0), e);
							}
						})
					}
				} else {
					node.addClass('parent');
				}
				node.append(childlist)
				return childlist.children().length;
			}
			return 0;
		}
		function populateList(list, menu_node, searchable) {
			
			if (searchable) {
				let display_limit = 256;
				let input = Interface.createElement('input', {type: 'text', placeholder: tl('generic.search'), inputmode: 'search'});
				let search_button = Interface.createElement('div', {}, Blockbench.getIconNode('search'));
				let search_bar = Interface.createElement('li', {class: 'menu_search_bar'}, [input, search_button]);
				menu_node.append(search_bar);
				menu_node.append(Interface.createElement('li', {class: 'menu_separator'}));
				
				let object_list = [];
				list.forEach(function(s2, i) {
					let node = getEntry(s2, menu_node);
					if (!node) return;
					object_list.push({
						object: s2,
						node: node,
						id: s2.id,
						name: s2.name,
						description: s2.description,
					})
				})
				search_button.onclick = (e) => {
					input.value = '';
					input.oninput(e);
				}
				input.oninput = (e) => {
					let search_term = input.value.toUpperCase();
					search_button.firstElementChild.replaceWith(Blockbench.getIconNode(search_term ? 'clear' : 'search'));

					object_list.forEach(item => {
						$(item.node).detach();
					})
					let count = 0;
					for (let item of object_list) {
						if (count > display_limit) break;
						if (
							typeof item.object == 'string' ||
							item.object.always_show ||
							(item.id && item.id.toUpperCase().includes(search_term)) ||
							(item.name && item.name.toUpperCase().includes(search_term)) ||
							(item.description && item.description.toUpperCase().includes(search_term))
						) {
							menu_node.append(item.node);
							count++;
						}
					}
				}
				input.oninput(0);
				if (menu_node == ctxmenu) {
					input.focus();
				}

			} else {
				list.forEach((object) => {
					getEntry(object, menu_node);
				})
			}
			let nodes = menu_node.children();
			if (nodes.length && nodes.last().hasClass('menu_separator')) {
				nodes.last().remove();
			}

			// let is_scrollable = !nodes.toArray().find(node => node.classList.contains('parent') || node.classList.contains('hybrid_parent'));
			// menu_node.toggleClass('scrollable', is_scrollable);
		}

		function getEntry(s, parent) {

			if (s.context) {
				last_context = context;
				context = s.context;
			}
			let scope_context = context;
			var entry;
			if (s === '_') {
				s = new MenuSeparator();
			} else if (typeof s == 'string' && s.startsWith('#')) {
				s = new MenuSeparator(s.substring(1));
			}
			if (s instanceof MenuSeparator) {
				entry = s.menu_node;
				var last = parent.children().last()
				if (last.length && !last.hasClass('menu_separator')) {
					parent[0].append(entry)
				}
				return entry;
			}
			if (typeof s == 'string' && BarItems[s]) {
				s = BarItems[s];
			}
			if (!Condition(s.condition, scope_context)) return;

			if (s instanceof Action) {

				entry = s.menu_sheet_node

				//entry.classList.remove('focused');

				//Submenu
				if (typeof s.children == 'function' || typeof s.children == 'object') {
					createChildList(s, entry)
				} else {
					if (s.side_menu instanceof Menu) {
						let content_list = typeof s.side_menu.structure == 'function' ? s.side_menu.structure(scope_context) : s.side_menu.structure;
						createChildList(s, entry, content_list);

					} else if (s.side_menu instanceof Dialog) {
						createChildList(s, entry, [
							{
								name: 'menu.options',
								icon: 'web_asset',
								click() {
									s.side_menu.show();
								}
							}
						]);
					}
				}

				parent.find('ul')[0].append(entry)

			} else if (s instanceof BarSelect) {
				
				if (typeof s.icon === 'function') {
					var icon = Blockbench.getIconNode(s.icon(scope_context), s.color)
				} else {
					var icon = Blockbench.getIconNode(s.icon, s.color)
				}
				entry = Interface.createElement('li', {title: s.description && tl(s.description), menu_item: s.id}, Interface.createElement('span', {}, tl(s.name)));
				entry.prepend(icon)

				//Submenu
				var children = [];
				for (var key in s.options) {

					let val = s.options[key];
					if (val) {
						(function() {
							var save_key = key;
							children.push({
								name: s.getNameFor(key),
								id: key,
								icon: val.icon || ((s.value == save_key) ? 'far.fa-dot-circle' : 'far.fa-circle'),
								condition: val.condition,
								click: (e) => {
									s.set(save_key);
									if (s.onChange) {
										s.onChange(s, e);
									}
								}
							})
						})()
					}
				}

				let child_count = createChildList({children}, entry)

				if (child_count !== 0 || typeof s.click === 'function') {
					parent[0].append(entry)
				}
				entry.addEventListener('mouseenter', function(e) {
					scope.hover(entry, e);
				})

			/*} else if (s instanceof NumSlider) {
				
				let icon = Blockbench.getIconNode(s.icon, s.color);
				let numeric_input = new Interface.CustomElements.NumericInput(s.id, {
					value: s.get(),
					min: s.settings?.min, max: s.settings?.max,
					onChange(value) {
						if (typeof s.onBefore === 'function') {
							s.onBefore()
						}
						s.change(() => value);
						if (typeof s.onAfter === 'function') {
							s.onAfter()
						}
						s.update();
					}
				});
				entry = Interface.createElement('li', {title: s.description && tl(s.description), menu_item: s.id}, [
					Interface.createElement('span', {}, tl(s.name)),
					numeric_input.node
				]);
				entry.prepend(icon);

				parent[0].append(entry);

				$(entry).mouseenter(function(e) {
					scope.hover(this, e)
				})
				*/
			} else if (s instanceof HTMLElement) {
				parent[0].append(s);

			} else if (typeof s === 'object') {
				
				let child_count;
				if (typeof s.icon === 'function') {
					var icon = Blockbench.getIconNode(s.icon(scope_context), s.color)
				} else {
					var icon = Blockbench.getIconNode(s.icon, s.color)
				}
				entry = Interface.createElement('li', {title: s.description && tl(s.description), menu_item: s.id}, Interface.createElement('span', {}, tl(s.name)));
				entry.prepend(icon);
				if (s.keybind) {
					let label = document.createElement('label');
					label.classList.add('keybinding_label')
					label.innerText = s.keybind || '';
					entry.append(label);
				}
				if (typeof s.click === 'function') {
					entry.addEventListener('click', e => {
						if (e.target == entry) {
							s.click(scope_context, e)
						}
					})
				}
				//Submenu
				if (typeof s.children == 'function' || typeof s.children == 'object') {
					child_count = createChildList(s, entry);
				}
				if (child_count !== 0 || typeof s.click === 'function') {
					parent[0].append(entry)
				}
				addEventListeners(entry, 'mouseenter mouseover', (e) => {
					if (e.target.classList.contains('menu_separator')) return;
					scope.hover(entry, e);
				})
			}
			//Highlight
			if (scope.highlight_action == s && entry) {
				let obj = entry;
				while (obj && obj.nodeName == 'LI') {
					obj.classList.add('highlighted');
					obj = obj.parentElement.parentElement;
				}
			}
			if (s.context && last_context != context) context = last_context;
			return entry;
		}

		let content_list = typeof this.structure == 'function' ? this.structure(context) : this.structure;
		populateList(content_list, ctxmenu, this.options.searchable);

		scope.node.onclick = (ev) => {
			if (
				ev.target.classList.contains('parent') ||
				(ev.target.parentNode && ev.target.parentNode.classList.contains('parent')) ||
				ev.target.classList.contains('menu_search_bar') ||
				(ev.target.parentNode && ev.target.parentNode.classList.contains('menu_search_bar'))
			) {} else {
				if (this.options.keep_open) {
					this.hide()
					this.open(position, context);
				} else {
					this.hide()
				}
			}
		}

		if (scope.type === 'bar_menu') {
			MenuSheet.open = scope
			scope.label.classList.add('opened');
		}
		open_menu = scope;
		SheetMenu.open = this;
		return scope;
	};
};

class MenuSheet {

    constructor() {
        this.app      = undefined;
        this.sheet    = undefined;
        this.open     = undefined;
        this.menus    = {};
        this.template = `
            <div id="menu_sheet" class="sheet-modal menu-sheet" style="height:90vh">
                <div id="menu_sheet_inner" class="sheet-modal-inner">
                    <div id="menu_sheet_view" class="view sheet-view">
                        <div id="menu_sheet_main_page" class="page">
                            <div id="menu_sheet_toolbar" class="toolbar tabbar tabbar-scrollable no-outline">
                                <div id="menu_sheet_toolbar_inner" class="toolbar-inner">
                                    <!-- Links Here -->
                                </div>
                            </div>
                            <swiper-container id="menu_sheet_swiper" class="tabs">
                                <!-- Swiper-Slides Here -->
                            </swiper-container>
                        </div>
                    </div>
                </div>
            </div>
        `;
    };

    setup(app) {
        this.app = app;
        app.$(this.template).appendTo('#app');
        
        this.sheet = app.sheet.create({
            closeByOutsideClick: true,
            swipeToClose: true,
			breakpoints: [0.5],
            el: app.$('#menu_sheet'),
        });

        app.views.create(app.$('#menu_sheet_view'), {
            url: '/',
            routes: [

            ],
        });

        app.swiper.get(app.$('#menu_sheet_swiper')).on('slideChange', function() {
            console.log('slideChange');
            app.$(`#menu_sheet_view a[href$="#${ app.$(this.slides).eq(this.activeIndex)[0].id }"]`)[0].scrollIntoView({ behavior: "smooth"});
        });

		this.initMenus();
		this.update();

        app.$('#menu_sheet_toolbar_inner').children('a').eq(0).addClass('tab-link-active');
        app.$('#menu_sheet_swiper').children('swiper-slide').eq(0).addClass('tab-active');
	};

    initMenus() {
        new SheetMenu('file', [
			new MenuSeparator('file_options'),
			'project_window',
			new MenuSeparator('open'),
			{name: 'menu.file.new', id: 'new', icon: 'insert_drive_file',
				children: function() {
					let arr = [];
					let redact = settings.streamer_mode.value;
					for (let key in Formats) {
						let format = Formats[key];
						if (!format.show_in_new_list) continue;
						arr.push({
							id: format.id,
							name: (redact && format.confidential) ? `[${tl('generic.redacted')}]` : format.name,
							icon: format.icon,
							description: format.description,
							click: (e) => {
								format.new()
							}
						})
					}
					arr.push(new MenuSeparator('loaders'));
					for (let key in ModelLoader.loaders) {
						let loader = ModelLoader.loaders[key];
						arr.push({
							id: loader.id,
							name: (redact && loader.confidential) ? `[${tl('generic.redacted')}]` : loader.name,
							icon: loader.icon,
							description: loader.description,
							click: (e) => {
								loader.new()
							}
						})
					}
					return arr;
				}
			},
			{name: 'menu.file.recent', id: 'recent', icon: 'history',
				condition() {return isApp && recent_projects.length},
				searchable: true,
				children() {
					var arr = []
					let redact = settings.streamer_mode.value;
					for (let p of recent_projects) {
						if (arr.length > 12) break;
						arr.push({
							name: redact ? `[${tl('generic.redacted')}]` : p.name,
							path: p.path,
							description: redact ? '' : p.path,
							icon: p.icon,
							click(c, event) {
								Blockbench.read([p.path], {}, files => {
									loadModelFile(files[0]);
								})
							}
						})
					}
					if (recent_projects.length > 12) {
						arr.push('_', {
							name: 'menu.file.recent.more',
							icon: 'read_more',
							always_show: true,
							click(c, event) {
								ActionControl.select('recent: ');
							}
						})
					}
					if (arr.length) {
						arr.push('_', {
							name: 'menu.file.recent.clear',
							icon: 'clear',
							always_show: true,
							click(c, event) {
								recent_projects.empty();
								updateRecentProjects();
							}
						})
					}
					return arr
				}
			},
			'open_model',
			'open_from_link',
			'new_window',
			new MenuSeparator('project'),
			'save_project',
			'save_project_as',
			'convert_project',
			'close_project',
			new MenuSeparator('import_export'),
			{name: 'menu.file.import', id: 'import', icon: 'insert_drive_file', condition: () => Format && !Format.pose_mode, children: [
				{
					id: 'import_open_project',
					name: 'menu.file.import.import_open_project',
					icon: 'input',
					condition: () => Project && ModelProject.all.length > 1,
					children() {
						let projects = [];
						ModelProject.all.forEach(project => {
							if (project == Project) return;
							projects.push({
								name: project.getDisplayName(),
								icon: project.format.icon,
								description: project.path,
								click() {
									let current_project = Project;
									project.select();
									let bbmodel = Codecs.project.compile();
									current_project.select();
									Codecs.project.merge(JSON.parse(bbmodel));
								}
							})
						})
						return projects;
					}
				},
				'import_project',
				'import_java_block_model',
				'import_optifine_part',
				'import_obj',
				'extrude_texture'
			]},
			{name: 'generic.export', id: 'export', icon: 'insert_drive_file', condition: () => Project, children: [
				'export_blockmodel',
				'export_bedrock',
				'export_entity',
				'export_class_entity',
				'export_optifine_full',
				'export_optifine_part',
				'export_minecraft_skin',
				'export_gltf',
				'export_obj',
				'export_fbx',
				'export_collada',
				'export_modded_animations',
				'upload_sketchfab',
				'share_model',
			]},
			'export_over',
			'export_asset_archive',
			new MenuSeparator('options'),
			{name: 'menu.file.preferences', id: 'preferences', icon: 'tune', children: [
				'settings_window',
				'keybindings_window',
				'theme_window',
				{
					id: 'profiles',
					name: 'data.settings_profile',
					icon: 'manage_accounts',
					condition: () => SettingsProfile.all.findIndex(p => p.condition.type == 'selectable') != -1,
					children: () => {
						let list = [
							{
								name: 'generic.none',
								icon: SettingsProfile.selected ? 'far.fa-circle' : 'far.fa-dot-circle',
								click: () => {
									SettingsProfile.unselect();
								}
							},
							'_'
						];
						SettingsProfile.all.forEach(profile => {
							if (profile.condition.type != 'selectable') return;
							list.push({
								name: profile.name,
								icon: profile.selected ? 'far.fa-dot-circle' : 'far.fa-circle',
								color: markerColors[profile.color].standard,
								click: () => {
									profile.select();
								}
							})
						})
						return list;
					}
				}
			]},
			'plugins_window',
			'edit_session'
		], {
            
        }, this);

		new SheetMenu('edit', [
			new MenuSeparator('undo'),
			'undo',
			'redo',
			'edit_history',
			new MenuSeparator('add_element'),
			'add_cube',
			'add_mesh',
			'add_group',
			'add_locator',
			'add_null_object',
			'add_texture_mesh',
			new MenuSeparator('modify_elements'),
			'duplicate',
			'rename',
			'find_replace',
			'unlock_everything',
			'delete',
			new MenuSeparator('mesh_specific'),
			{name: 'data.mesh', id: 'mesh', icon: 'fa-gem', children: [
				'extrude_mesh_selection',
				'inset_mesh_selection',
				'loop_cut',
				'create_face',
				'invert_face',
				'switch_face_crease',
				'merge_vertices',
				'dissolve_edges',
				'apply_mesh_rotation',
				'split_mesh',
				'merge_meshes',
			]},
			new MenuSeparator('editing_mode'),
			'proportional_editing',
			'mirror_modeling',
			new MenuSeparator('selection'),
			'select_window',
			'select_all',
			'unselect_all',
			'invert_selection'
		], {
            
        }, this);

		new SheetMenu('transform', [
			'scale',
			{name: 'menu.transform.rotate', id: 'rotate', icon: 'rotate_90_degrees_ccw', children: [
				'rotate_x_cw',
				'rotate_x_ccw',
				'rotate_y_cw',
				'rotate_y_ccw',
				'rotate_z_cw',
				'rotate_z_ccw'
			]},
			{name: 'menu.transform.flip', id: 'flip', icon: 'flip', children: [
				'flip_x',
				'flip_y',
				'flip_z'
			]},
			{name: 'menu.transform.center', id: 'center', icon: 'filter_center_focus', children: [
				'center_x',
				'center_y',
				'center_z',
				'center_lateral'
			]},
			{name: 'menu.transform.properties', id: 'properties', icon: 'navigate_next', children: [
				'toggle_visibility',
				'toggle_locked',
				'toggle_export',
				'toggle_autouv',
				'toggle_shade',
				'toggle_mirror_uv'
			]}

		], {
			condition: {
                modes: ['edit'],
            },
		}, this);

		new SheetMenu('uv', UVEditor.menu.structure, {
			condition: {
                modes: ['edit'],
            },
			onOpen() {
                setActivePanel('uv');
            },
		}, this);

		new SheetMenu('image', [
			new MenuSeparator('adjustment'),
			'adjust_brightness_contrast',
			'adjust_saturation_hue',
			'adjust_opacity',
			'invert_colors',
			'adjust_curves',
			new MenuSeparator('filters'),
			'limit_to_palette',
			'clear_unused_texture_space',
			new MenuSeparator('transform'),
			'flip_texture_x',
			'flip_texture_y',
			'rotate_texture_cw',
			'rotate_texture_ccw',
			'resize_texture',
			'crop_texture_to_selection'
		], {
			condition: {
                modes: ['paint'],
            },
		}, this);

		new SheetMenu('animation', [
			new MenuSeparator('edit_options'),
			'animation_onion_skin',
			'animation_onion_skin_selective',
			'lock_motion_trail',
			new MenuSeparator('edit'),
			'add_marker',
			'select_effect_animator',
			'flip_animation',
			'bake_ik_animation',
			'bake_animation_into_model',
			new MenuSeparator('file'),
			'load_animation_file',
			'save_all_animations',
			'export_animation_file'
		], {
			condition: {
                modes: ['animate'],
            },
		}, this);

		new SheetMenu('keyframe', [
			new MenuSeparator('copypaste'),
			'copy',
			'paste',
			new MenuSeparator('edit'),
			'add_keyframe',
			'keyframe_column_create',
			'select_all',
			'keyframe_column_select',
			'reverse_keyframes',
			{name: 'menu.animation.flip_keyframes', id: 'flip_keyframes', condition: () => Timeline.selected.length, icon: 'flip', children: [
				'flip_x',
				'flip_y',
				'flip_z'
			]},
			'keyframe_uniform',
			'reset_keyframe',
			'resolve_keyframe_expressions',
			'delete',
		], {
			condition: {
                modes: ['animate'],
            },
		}, this);

		new SheetMenu('timeline', Timeline.menu.structure, {
			name: 'panel.timeline',
			condition: {
                modes: ['animate'], 
                method: () => !AnimationController.selected,
            },
			onOpen() {
				setActivePanel('timeline');
			},
		}, this);

		new SheetMenu('display', [
			new MenuSeparator('copypaste'),
			'copy',
			'paste',
			new MenuSeparator('presets'),
			'add_display_preset',
			'apply_display_preset'
		], {
			condition: {
                modes: ['display'],
            },
		}, this);
		
		new SheetMenu('tools', [
			new MenuSeparator('overview'),
			{id: 'main_tools', icon: 'construction', name: 'Toolbox', condition: () => Project, children() {
				let tools = Toolbox.children.filter(tool => tool instanceof Tool && tool.condition !== false);
				tools.forEach(tool => {
					let old_condition = tool.condition;
					tool.condition = () => {
						tool.condition = old_condition;
						return true;
					}
				})
				let modes = Object.keys(Modes.options);
				tools.sort((a, b) => modes.indexOf(a.modes[0]) - modes.indexOf(b.modes[0]))
				let mode = tools[0].modes[0];
				for (let i = 0; i < tools.length; i++) {
					if (tools[i].modes[0] !== mode) {
						mode = tools[i].modes[0];
						tools.splice(i, 0, '_');
						i++;
					}
				}
				return tools;
			}},
			'swap_tools',
			'action_control',
			new MenuSeparator('tools'),
			'predicate_overrides',
			'convert_to_mesh',
			'auto_set_cullfaces',
			'remove_blank_faces',
		], {

        }, this);
        // MenuBar.menus.filter = MenuBar.menus.tools;

		new SheetMenu('view', [
			new MenuSeparator('viewport'),
			'fullscreen',
			new MenuSeparator('viewport'),
			'view_mode',
			'toggle_shading',
			'toggle_motion_trails',
			'toggle_all_grids',
			'toggle_ground_plane',
			'preview_checkerboard',
			'painting_grid',
			new MenuSeparator('references'),
			'preview_scene',
			'edit_reference_images',
			new MenuSeparator('interface'),
			'toggle_sidebars',
			'split_screen',
			new MenuSeparator('model'),
			'hide_everything_except_selection',
			'focus_on_selection',
			{name: 'menu.view.screenshot', id: 'screenshot', icon: 'camera_alt', children: []},
			new MenuSeparator('media'),
			'screenshot_model',
			'screenshot_app',
			'advanced_screenshot',
			'record_model_gif',
			'timelapse',
		], {

        }, this);

		new SheetMenu('help', [
			new MenuSeparator('search'),
			{name: 'menu.help.search_action', description: BarItems.action_control.description, keybind: BarItems.action_control.keybind, id: 'search_action', icon: 'search', click: ActionControl.select},
			new MenuSeparator('links'),
			{name: 'menu.help.quickstart', id: 'quickstart', icon: 'fas.fa-directions', click: () => {
				Blockbench.openLink('https://blockbench.net/quickstart/');
			}},
			{name: 'menu.help.discord', id: 'discord', icon: 'fab.fa-discord', click: () => {
				Blockbench.openLink('http://discord.blockbench.net');
			}},
			{name: 'menu.help.wiki', id: 'wiki', icon: 'menu_book', click: () => {
				Blockbench.openLink('https://blockbench.net/wiki/');
			}},
			{name: 'menu.help.report_issue', id: 'report_issue', icon: 'bug_report', click: () => {
				Blockbench.openLink('https://github.com/JannisX11/blockbench/issues');
			}},
			new MenuSeparator('backups'),
			'view_backups',
			new MenuSeparator('about'),
			{name: 'menu.help.developer', id: 'developer', icon: 'fas.fa-wrench', children: [
				'reload_plugins',
				{name: 'menu.help.plugin_documentation', id: 'plugin_documentation', icon: 'fa-book', click: () => {
					Blockbench.openLink('https://www.blockbench.net/wiki/docs/plugin');
				}},
				'open_dev_tools',
				{name: 'Error Log', condition: () => window.ErrorLog.length, icon: 'error', color: 'red', keybind: {toString: () => window.ErrorLog.length.toString()}, click() {
					let lines = window.ErrorLog.slice(0, 64).map((error) => {
						return Interface.createElement('p', {style: 'word-break: break-word;'}, `${error.message}\n - In .${error.file.split(location.origin).join('')} : ${error.line}`);
					})
					new Dialog({
						id: 'error_log',
						title: 'Error Log',
						lines,
						singleButton: true
					}).show();
				}},
				'reset_layout',
				{name: 'menu.help.developer.reset_storage', icon: 'fas.fa-hdd', click: () => {
					if (confirm(tl('menu.help.developer.reset_storage.confirm'))) {
						localStorage.clear()
						Blockbench.addFlag('no_localstorage_saving')
						console.log('Cleared Local Storage')
						window.location.reload(true)
					}
				}},
				{name: 'menu.help.developer.unlock_projects', id: 'unlock_projects', icon: 'vpn_key', condition: () => ModelProject.all.find(project => project.locked), click() {
					ModelProject.all.forEach(project => project.locked = false);
				}},
				{name: 'menu.help.developer.cache_reload', id: 'cache_reload', icon: 'cached', condition: !isApp, click: () => {
					if('caches' in window){
						caches.keys().then((names) => {
							names.forEach(async (name) => {
								await caches.delete(name)
							})
						})
					}
					window.location.reload(true)
				}},
				'reload',
			]},
			'about_window'
		], {

        }, this);
    };

    update() {
		var bar = $('#menu_sheet_toolbar_inner');
		bar.children().detach();
		this.keys = [];
		for (var menu in this.menus) {
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

const menuSheet = new MenuSheet();

// {
//     sheet: undefined,
// 	menus: {},
// 	open: undefined,
//     template: `
//     <div id="menu_sheet" class="sheet-modal menu-sheet" style="height:80vh">
//         <div id="menu_sheet_inner" class="sheet-modal-inner">
//             <div id="menu_sheet_view" class="view sheet-view">
//                 <div id="menu_sheet_main_page" class="page">
//                     <div id="menu_sheet_toolbar" class="toolbar tabbar tabbar-scrollable no-outline">
//                         <div id="menu_sheet_toolbar_inner" class="toolbar-inner">
//                             <!-- Links Here -->
//                         </div>
//                     </div>
//                     <swiper-container id="menu_sheet_swiper" class="tabs">
//                         <!-- Swiper-Slides Here -->
//                     </swiper-container>
//                 </div>
//             </div>
//         </div>
//     </div>
//     `,

// 	setup(app) {
        
//         app.$(this.template).appendTo('#app');
        
//         this.sheet = app.sheet.create({
//             closeByOutsideClick: true,
//             swipeToClose: true,
//             el: app.$('#menu_sheet'),
//         });

//         app.views.create(app.$('#menu_sheet_view'), {
//             url: '/',
//             routes: [],
//         });

//         app.swiper.get(app.$('#menu_sheet_swiper')).on('slideChange', function() {
//             console.log('slideChange');
//             app.$(`#menu_sheet_view a[href$="#${ app.$(this.slides).eq(this.activeIndex)[0].id }"]`)[0].scrollIntoView({ behavior: "smooth"});
//         });

// 		this.initMenus();
// 		this.update();
// 	},

//     initMenus() {
//         new SheetMenu('edit', [
// 			new MenuSeparator('undo'),
// 			'undo',
// 			'redo',
// 			'edit_history',
// 			new MenuSeparator('add_element'),
// 			'add_cube',
// 			'add_mesh',
// 			'add_group',
// 			'add_locator',
// 			'add_null_object',
// 			'add_texture_mesh',
// 			new MenuSeparator('modify_elements'),
// 			'duplicate',
// 			'rename',
// 			'find_replace',
// 			'unlock_everything',
// 			'delete',
// 			new MenuSeparator('mesh_specific'),
// 			{name: 'data.mesh', id: 'mesh', icon: 'fa-gem', children: [
// 				'extrude_mesh_selection',
// 				'inset_mesh_selection',
// 				'loop_cut',
// 				'create_face',
// 				'invert_face',
// 				'switch_face_crease',
// 				'merge_vertices',
// 				'dissolve_edges',
// 				'apply_mesh_rotation',
// 				'split_mesh',
// 				'merge_meshes',
// 			]},
// 			new MenuSeparator('editing_mode'),
// 			'proportional_editing',
// 			'mirror_modeling',
// 			new MenuSeparator('selection'),
// 			'select_window',
// 			'select_all',
// 			'unselect_all',
// 			'invert_selection'
// 		], {}, this);

//         new SheetMenu('view', [
// 			new MenuSeparator('viewport'),
// 			'fullscreen',
// 			new MenuSeparator('viewport'),
// 			'view_mode',
// 			'toggle_shading',
// 			'toggle_motion_trails',
// 			'toggle_all_grids',
// 			'toggle_ground_plane',
// 			'preview_checkerboard',
// 			'painting_grid',
// 			new MenuSeparator('references'),
// 			'preview_scene',
// 			'edit_reference_images',
// 			new MenuSeparator('interface'),
// 			'toggle_sidebars',
// 			'split_screen',
// 			new MenuSeparator('model'),
// 			'hide_everything_except_selection',
// 			'focus_on_selection',
// 			{name: 'menu.view.screenshot', id: 'screenshot', icon: 'camera_alt', children: []},
// 			new MenuSeparator('media'),
// 			'screenshot_model',
// 			'screenshot_app',
// 			'advanced_screenshot',
// 			'record_model_gif',
// 			'timelapse',
// 		], {}, this);
//     },

// 	update() {
// 		var bar = $('#menu_sheet_toolbar_inner');
// 		bar.children().detach();
// 		this.keys = [];
// 		for (var menu in this.menus) {
// 			if (this.menus.hasOwnProperty(menu)) {
// 				if (this.menus[menu].conditionMet()) {
// 					bar.append(this.menus[menu].label);
// 					this.keys.push(menu);
// 				};
// 			};
// 		};
// 	},

// 	addAction(action, path) {
// 		if (path) {
// 			path = path.split('.');
// 			var menu = this.menus[path.splice(0, 1)[0]];
// 			if (menu) {
// 				menu.addAction(action, path.join('.'));
// 			};
// 		};
// 	},

// 	removeAction(path) {
// 		if (path) {
// 			path = path.split('.');
// 			var menu = this.menus[path.splice(0, 1)[0]];
// 			if (menu) {
// 				menu.removeAction(path.join('.'));
// 			};
// 		};
// 	},
// };