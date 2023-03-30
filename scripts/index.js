import '../scss/main.scss'

import { OSlider } from './components/OSlider'
import { OSliderNext } from './components/OSliderNext'
import { OSliderPrev } from './components/OSliderPrev'
import { OSliderPage } from './components/OSliderPage'
import { OSliderAutoplayControls } from './components/OSliderAutoplayControls'
import { OSliderPaginationText } from './components/OSliderPaginationText'

customElements.define('o-slider', OSlider)
customElements.define('o-slider-next', OSliderNext, { extends: 'button' })
customElements.define('o-slider-prev', OSliderPrev, { extends: 'button' })
customElements.define('o-slider-page', OSliderPage, { extends: 'button' })
customElements.define('o-slider-autoplay-controls', OSliderAutoplayControls)
customElements.define('o-slider-pagination-text', OSliderPaginationText)