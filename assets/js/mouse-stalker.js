(() => {
  const stkr = document.getElementById('stkr');
  if (!stkr) return;

  const size = stkr.offsetWidth || 25; // 25px
  const offsetX = size * 0.35; // ほんの少し右へずらす
  const offsetY = size * 0.45; // ほんの少し下へずらす
  let targetX = 0, targetY = 0, curX = 0, curY = 0, scale = 1;

  // どの要素で拡大するか（リンク全体＋.stkr-target）
  const hoverSelector = '.stkr-target, a[href]';

  // タッチや「動き軽減」では無効化
  const disable =
    window.matchMedia('(pointer: coarse)').matches ||
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (disable) { stkr.style.display = 'none'; return; }

  // 追従：pointermove を使う（パフォーマンス良＆ペン対応）
  document.addEventListener('pointermove', (e) => {
    targetX = e.clientX - size / 2 + offsetX;
    targetY = e.clientY - size / 2 + offsetY;
  }, { passive: true });

  // 拡大の出し入れ（イベント委譲）
  document.addEventListener('pointerover', (e) => {
    if (e.target.closest(hoverSelector)) scale = 2;
  });
  document.addEventListener('pointerout', (e) => {
    if (e.target.closest(hoverSelector)) scale = 1;
  });

  // スムーズに追従（慣性）
  (function raf() {
    const ease = 0.18;
    curX += (targetX - curX) * ease;
    curY += (targetY - curY) * ease;
    stkr.style.transform = `translate3d(${curX}px, ${curY}px, 0) scale(${scale})`;
    requestAnimationFrame(raf);
  })();
})();
