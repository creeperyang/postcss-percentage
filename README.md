# PostCSS Percentage [![Build Status][ci-img]][ci]

> [PostCSS] plugin to support `percentage()` function.

This plugin will transform all `percentage(expression)` functions to correct percentage.
It's almost the same as [sass function percentage](http://sass-lang.com/documentation/Sass/Script/Functions.html#percentage-instance_method),
except for the support for the unit (`percentage(50px / 50px)`).

[PostCSS]: https://github.com/postcss/postcss
[ci-img]:  https://travis-ci.org/creeperyang/postcss-percentage.svg
[ci]:      https://travis-ci.org/creeperyang/postcss-percentage

## Installation

```bash
npm i --save postcss-percentage
```

## Usage

```js
postcss([ require('postcss-percentage')(opts) ])
```

If the input is

```css
.box {
    width: percentage(1 / 24);
    margin: percentage(- 1 / 24) percentage(0.01 * 5);
}
```

Then you will get

```css
.box {
    width: 4.166667%;
    margin: -4.166667% 5%;
}
```

See [PostCSS] docs for examples for your environment.
