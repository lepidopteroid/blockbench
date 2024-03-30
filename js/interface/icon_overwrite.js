// action id: icon
var iconOverwrite = {
  'view3d': 'over-view3d',
  'outliner': 'over-outliner',
  'textures': 'over-node-texture',
  'uv': function () {
    return (Interface.getUIMode() === 'paint') ? 
    'over-image' : 
    'over-group-uvs';
  },
  'color': 'over-color',
  'variable_placeholders': 'over-rna',
  'animations': 'over-anim-data',
  'timeline': 'over-action',
  'mirror_modeling': 'over-mod-mirror',
  'toggle_shading': 'over-light-sun',
  'add_mesh': 'over-mesh-data',
  'add_cube': 'over-cube',
  'add_group': 'over-group-bone',
  'add_null_object': 'over-empty-axis',
  'add_locator': 'over-anchor',
  'outliner_toggle': 'over-preset',
  'edit_history': 'over-recover-last',
  'undo': 'over-loop-back',
  'redo': 'over-loop-forwards',
  // 'search_outliner': 'over-zoom-in',
};