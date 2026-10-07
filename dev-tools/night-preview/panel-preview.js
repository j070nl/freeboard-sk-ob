// Isolated visual preview: existing Angular controls, values and handlers stay intact.
(() => {
  const decorate = () => {
    const graphic = document.querySelector('anchor-watch mat-card-content > div[style*="background"]');
    if (!graphic) return;
    const raised = graphic.style.backgroundImage.includes('raised');
    if (graphic.dataset.raised !== String(raised)) graphic.dataset.raised = String(raised);
    if (graphic.classList.contains('anchor-diagram')) return;
    graphic.classList.add('anchor-diagram');
    graphic.previousElementSibling.textContent = 'Alarm radius';
    const svg = new DOMParser().parseFromString(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 180" aria-hidden="true">
      <g fill="none" stroke="currentColor" stroke-width="1.5">
        <circle class="radius-ring" cx="120" cy="90" r="78"/>
        <path opacity=".16" d="M42 90H198M120 12V168" stroke-dasharray="3 5"/>
        <path d="M120 26V74M116 31L120 26L124 31"/>
        <path class="anchor-rode" d="M145 103L154 131" stroke-dasharray="3 3"/>
      </g>
      <path d="M91 88H112L106 77H128L137 88H151L144 103H98Z M113 80L118 88H132L126 80Z" fill="currentColor" fill-rule="evenodd"/>
      <g class="anchor-symbol" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="154" cy="133" r="3"/><path d="M154 136V151M148 140H160M144 145Q144 151 154 154Q164 151 164 145M144 145L143 149M164 145L165 149"/>
      </g>
    </svg>`, 'image/svg+xml').documentElement;
    graphic.prepend(document.importNode(svg, true));
  };
  const start = () => {
    decorate();
    new MutationObserver(decorate).observe(document.body, {childList:true,subtree:true,attributes:true,attributeFilter:['style']});
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
