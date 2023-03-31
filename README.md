# Open ADA Slider

> A no-CSS-required slider component designed to comply with the accessibility standards set forth by the ADA. This slider is fully customizable, lightweight, and easy to integrate into any web application or framework.

## Example
[Run Demo](https://codepen.io/vickera/pen/LYJoPzo)

## Usage

In your Javascript file:
``` javascript
import {
  OSlider,
  OSliderNext,
  OSliderPrev,
  OSliderPage,
  OSliderAutoplayControls,
  OSliderPaginationText
} from "open-ada-slider"

customElements.define('o-slider', OSlider)
customElements.define('o-slider-next', OSliderNext, { extends: 'button' })
customElements.define('o-slider-prev', OSliderPrev, { extends: 'button' })
customElements.define('o-slider-page', OSliderPage, { extends: 'button' })
customElements.define('o-slider-autoplay-controls', OSliderAutoplayControls)
customElements.define('o-slider-pagination-text', OSliderPaginationText)
```

In your HTML:
``` html
<o-slider id="example-1">
  <div class="slide">Slide 1</div>
  <div class="slide">Slide 2</div>
  <div class="slide">Slide 3</div>
</o-slider>
<button is="o-slider-prev" slider="example-1">Prev</button>
<button is="o-slider-page" slider="example-1" index="0">1</button>
<button is="o-slider-page" slider="example-1" index="1">2</button>
<button is="o-slider-page" slider="example-1" index="2">3</button>
<button is="o-slider-next" slider="example-1">Next</button>
<o-slider-pagination-text slider="example-1"></o-slider-pagination-text>  
```

## API

### `slide-speed`

Description: The speed, in milliseconds, of the slide transition animation.

Type: Int

Default value: `1000`

Example: `<o-slider id="example" slide-speed="350">`

### `slides-per-page`

Description: Determines how many slides per page the slider should display by default

Type: Int

Default value: `1`

Example: `<o-slider id="example" slides-per-page="3">`

### `slides-per-page-*`

Description: A responsive property that controls the number of slides displayed per page based on the screen size. The `*` should be replaced with a specific number representing the screen size range in pixels.

Type: Int

Default value: `null`

Example: `<o-slider id="example" slides-per-page="2" slides-per-page-768="1">`

### `autoplay`

Description: Sets the slider to auto advance without user interaction. Setting this to true is discouraged.

Type: Bool

Default value: `false`

Example: `<o-slider id="example" autoplay="true">`

### `autoplay-speed`

Description: The speed, in milliseconds, of the slide transition animation.

Type: Bool

Default value: `12000`

Example: `<o-slider id="example" autoplay="true" autoplay-speed="12000">`

### `pageUpdated`

Description: An event that the slider fires anytime a page is updated

Type: Event

Example: `document.querySelector('o-slider#example').addEventListener('pageUpdated', () => console.log('page updated'))`

## Build Setup

``` bash
# install dependencies
npm install

# serve with hot reload at localhost:1234
npm run serve

# lint code
npm run lint

# build for production with minification
npm run build
```

## Build Documentation
* [Bulma](https://bulma.io/)
* [ParcelJS](https://parceljs.org/)
* [Eslint - Airbnb](https://github.com/airbnb/javascript)
* [PostHTML-include](https://github.com/posthtml/posthtml-include)
