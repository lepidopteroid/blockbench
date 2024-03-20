var iconOverwrite = {
  'view3d': 'over-view3d',
  'outliner': 'over-outliner',
  'textures': 'over-node-texture',
  'uv': function () {
    return (Interface.getUIMode() === 'paint') ? 
    'over-image' : 
    'over-uv';
  },
};