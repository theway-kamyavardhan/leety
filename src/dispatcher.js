let renderAllFn = null;
export function setRenderAll(fn) { renderAllFn = fn; }
export function renderAll() { if (renderAllFn) renderAllFn(); }
