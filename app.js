/* skimama marketing docs — shared behavior
   1) スクロール出現（.fx → .in）
   2) 統計数値のカウントアップ（.cnt[data-count]）
   3) デスクトップでは目次を開いておく
   prefers-reduced-motion: reduce ではモーションを一切行わない
   （出現系の隠し状態はCSS側も no-preference 内にのみ定義してある） */
(function () {
  'use strict';
  /* .js クラスはこのファイル自身が付ける：
     app.js が読めない環境では付かない＝出現系の隠し状態も発動しない（フェイルセーフ） */
  document.documentElement.classList.add('js');
  var reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  function countUp(el) {
    var target = parseFloat(el.getAttribute('data-count'));
    var dec = parseInt(el.getAttribute('data-dec') || '0', 10);
    if (isNaN(target)) return;
    var dur = 1400, t0 = null;
    function fmt(v) {
      return v.toLocaleString('ja-JP', { minimumFractionDigits: dec, maximumFractionDigits: dec });
    }
    function frame(t) {
      if (t0 === null) t0 = t;
      var p = Math.min(1, (t - t0) / dur);
      p = 1 - Math.pow(1 - p, 3); /* ease-out cubic */
      el.textContent = fmt(target * p);
      if (p < 1) requestAnimationFrame(frame); else el.textContent = fmt(target);
    }
    requestAnimationFrame(frame);
  }

  addEventListener('DOMContentLoaded', function () {
    var fx = document.querySelectorAll('.fx');
    var cnt = document.querySelectorAll('.cnt[data-count]');

    if (!reduced && 'IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (!e.isIntersecting) return;
          e.target.classList.add('in');
          e.target.querySelectorAll('.cnt[data-count]').forEach(countUp);
          io.unobserve(e.target);
        });
      }, { rootMargin: '0px 0px -8% 0px' });
      fx.forEach(function (el) { io.observe(el); });

      /* .fxの外にあるカウンタ（ヒーロー内など）は単独で監視 */
      var ioC = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (!e.isIntersecting) return;
          countUp(e.target);
          ioC.unobserve(e.target);
        });
      }, { rootMargin: '0px 0px -5% 0px' });
      cnt.forEach(function (el) { if (!el.closest('.fx')) ioC.observe(el); });
    } else {
      /* reduce環境・非対応環境：最初から完成形（マークアップの静的数値のまま） */
      fx.forEach(function (el) { el.classList.add('in'); });
    }

    var toc = document.querySelector('.toc-box');
    if (toc && matchMedia('(min-width:1024px)').matches) { toc.open = true; }
  });
})();
