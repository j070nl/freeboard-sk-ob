/* Preview-only canvas experiment. Loaded before Angular/OpenLayers in the isolated map. */
(() => {
  const original = CanvasRenderingContext2D.prototype.fillText;
  const stroke = CanvasRenderingContext2D.prototype.strokeText;
  let enabled = true;
  const neutral = new Set(['#000000', '#333333', '#ffff00']);
  window.__labelPreview = { enhancedDraws: 0, skippedColoredDraws: 0 };
  window.addEventListener('message', event => {
    if (event.origin !== location.origin || event.source !== window.parent ||
        event.data?.type !== 'freeboard:label-preview') return;
    enabled = event.data.enabled === true;
  });
  CanvasRenderingContext2D.prototype.fillText = function (...args) {
    const layer = this.canvas.closest?.('.ol-layer');
    if (!enabled || !layer || layer.className !== 'ol-layer') {
      return original.apply(this, args);
    }
    if (!neutral.has(this.fillStyle)) {
      window.__labelPreview.skippedColoredDraws++;
      return original.apply(this, args);
    }
    const theme = document.documentElement.dataset.obcTheme;
    const dark = theme === 'night' || theme === 'dusk';
    this.save();
    this.fillStyle = theme === 'night' ? '#e0c99f' : dark ? '#d0d8df' : '#25323b';
    this.strokeStyle = dark ? '#151b20' : '#edf1f4';
    this.lineWidth = 3;
    this.lineJoin = 'round';
    this.setLineDash([]);
    stroke.apply(this, args);
    original.apply(this, args);
    this.restore();
    window.__labelPreview.enhancedDraws++;
  };
})();
