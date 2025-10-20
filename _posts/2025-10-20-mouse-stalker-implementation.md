---
title: 'Mouse Stalker'
date: 2025-10-20
permalink: /tech/mouse-stalker/
tags:
  - technology
---
# アロナが可愛い。

[ブルーアーカイブ5周年記念サイト](https://5th-anniversary.bluearchive.jp/)でマウスを追いかけるアロナがあまりにも可愛い――そう思って、このブログにも「マウスストーカー」を導入しました。
ここでは、実際に実装した内容を備忘録としてまとめます。
実装の骨格は [株式会社オーツーさんの解説記事](https://www.otwo.jp/blog/mouse-stalker/) を参考にさせていただきました。

## 実装の流れ
- 追従させる空の要素 `<div id="stkr"></div>` をレイアウトの共通部分に仕込む
- CSS で丸いカーソルとアニメーションを定義する
- JavaScript でポインタの位置を監視し、慣性を付けて追従させる

## HTML に追従要素を置く
`_layouts/default.html` など共通レイアウトの最後に追従用の要素を 1 つ置きます。
スクリーンリーダーには不要な情報なので `aria-hidden="true"` を付けておくと安心です。

```html
<div id="stkr" aria-hidden="true"></div>
```

## CSS でベースの見た目を整える
固定配置で常に画面上に置き、ほんのり透けた円がふわっと遅れて動くようにします。

```css
#stkr {
  position: fixed;
  top: 0;
  left: 0;
  width: 25px;
  height: 25px;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 50%;
  pointer-events: none;
  z-index: 9999;
  transition: transform 0.12s ease-out;
}
```

`pointer-events: none` にしておけば、本来クリックしたいリンクやボタンを邪魔しません。
色やサイズ、ぼかしを足すなどのカスタマイズはテーマに合わせて調整します。

## JavaScript で追従とホバー演出を制御する
ポインタの動きには `pointermove` を使い、`requestAnimationFrame` で慣性っぽい動きを作ります。
リンクや `.stkr-target` クラスを持つ要素に乗せたときだけふんわりと拡大させる仕掛けも加えました。

```javascript
(() => {
  const stkr = document.getElementById('stkr');
  if (!stkr) return;

  const size = stkr.offsetWidth || 25; // 基準サイズ
  let targetX = 0, targetY = 0, curX = 0, curY = 0, scale = 1;
  const hoverSelector = '.stkr-target, a[href]';

  const disable =
    window.matchMedia('(pointer: coarse)').matches ||
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (disable) {
    stkr.style.display = 'none';
    return;
  }

  document.addEventListener('pointermove', (e) => {
    targetX = e.clientX - size / 2;
    targetY = e.clientY - size / 2;
  }, { passive: true });

  document.addEventListener('pointerover', (e) => {
    if (e.target.closest(hoverSelector)) scale = 2;
  });
  document.addEventListener('pointerout', (e) => {
    if (e.target.closest(hoverSelector)) scale = 1;
  });

  (function raf() {
    const ease = 0.18;
    curX += (targetX - curX) * ease;
    curY += (targetY - curY) * ease;
    stkr.style.transform = `translate3d(${curX}px, ${curY}px, 0) scale(${scale})`;
    requestAnimationFrame(raf);
  })();
})();
```

タッチ端末 (`pointer: coarse`) や「視覚効果を減らす」設定の環境では、この機能が邪魔になりやすいので最初に検出して無効化しています。

## 画像を追従させたい場合
丸いカーソルの代わりにキャラクター画像などを使う場合は、CSS を以下のように入れ替えると雰囲気が出ます。

```css
#stkr {
  position: fixed;
  top: 0;
  left: 0;
  width: 80px;
  height: 80px;
  background: url('/images/hogehoge.png') no-repeat center / contain;
  pointer-events: none;
  transform-origin: center center;
  z-index: 9999;
  transition: transform 0.12s ease-out;
}
```

画像のサイズは余白ごと一度調整しておくと、拡大縮小しても自然な動きになります。
また、通常のカーソル自体を非表示にしたい場合は `body { cursor: none; }` を併用しますが、操作感が大きく変わるので必要なページだけに限定するのがおすすめです。

おっと、このままだと画像がカーソルと重なってしまい、リンクなどがわかりづらいですね...
という時は、画像の位置をカーソルと完全一致にせずに、少しずらしてあげましょう。
`offsetX` / `offsetY` の係数を調整するだけで変えられます。
アイコンのサイズに応じて比率を変えると、カーソルと重ならない自然な位置に配置できます。

```javascript
・・・
const offsetX = size * 0.35; // 右方向に少しずらす
const offsetY = size * 0.45; // 下方向に少しずらす
・・・
document.addEventListener('pointermove', (e) => {
  targetX = e.clientX - size / 2 + offsetX;
  targetY = e.clientY - size / 2 + offsetY;
}, { passive: true });
・・・
```

## おわりに
これで「カーソルの後ろをちょっと遅れて追いかける」演出が完成です。ホバー対象のセレクタを変えたり、拡大倍率を調整したりするだけで印象が大きく変わります。テーマに合わせてチューニングし、ほどよい没入感を演出してみてください。
