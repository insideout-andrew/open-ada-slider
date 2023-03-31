function chunkArray(array, chunkSize){
  const newArray = []
  for (let i = 0; i < array.length; i += chunkSize) {
    const chunk = array.slice(i, i + chunkSize);
    newArray.push(chunk)
  }
  return newArray
}

function findTranslate3DX(element) {
  const transform = window.getComputedStyle(element).getPropertyValue('transform');
  const matrix = new DOMMatrixReadOnly(transform);
  return matrix.m41;
}


function handleSwipe(element, onSwipeLeft, onSwipeRight, onMove, onMouseDown, onMouseUp) {
  let minDrag = 30;
  let touchStartX = 0;
  let touchEndX = 0;
  let mouseStartX = 0;
  let mouseEndX = 0;

  let isMouseDown = false;

  element.addEventListener("touchstart", function(event) {
    touchStartX = event.touches[0].clientX;
    touchEndX = event.touches[0].clientX;
    onMouseDown(touchStartX)
  }, { passive: false });

  element.addEventListener("touchmove", function(event) {
    if(Math.abs(touchEndX - touchStartX) >= minDrag){
      event.preventDefault()
      event.stopPropagation()      
      onMove(touchEndX - touchStartX);
    }
    touchEndX = event.touches[0].clientX;
  }, { passive: false });

  element.addEventListener("touchend", function(event) {
    onMouseUp(touchEndX)
    if (touchEndX < touchStartX) {
      onSwipeLeft();
    } else if (touchEndX > touchStartX) {
      onSwipeRight();
    }
  }, { passive: false });

  element.addEventListener("mousedown", function(event) {
    mouseStartX = event.clientX;
    isMouseDown = true;
    onMouseDown(mouseStartX)
  });

  element.addEventListener("mousemove", function(event) {
    if (isMouseDown) {
      onMove(mouseEndX - mouseStartX);
    }
    mouseEndX = event.clientX;
  });

  element.addEventListener("mouseup", function(event) {
    if (isMouseDown) {
      onMouseUp(mouseEndX)
      if (mouseEndX < mouseStartX) {
        onSwipeLeft();
      } else if (mouseEndX > mouseStartX) {
        onSwipeRight();
      }
      isMouseDown = false;
    }
  });
  
  element.addEventListener("mouseleave", function(event) {
    if (isMouseDown) {
      onMouseUp(mouseEndX)
      isMouseDown = false;
    }
  });
}





/**
 * Gets keyboard-focusable elements within a specified element
 * @param {HTMLElement} [element=document] element
 * @returns {Array}
 */
function toggleFocusableOnChildren(element, allowFocus) {
  const els = [
    ...element.querySelectorAll(
      'a[href], button, input, textarea, select, details,[tabindex]:not([tabindex="-1"])'
    )
  ].filter(
    el => !el.hasAttribute('disabled') && !el.getAttribute('aria-hidden')
  )
  
  if(els){
    els.forEach(e => {
      if(allowFocus){
        e.removeAttribute('tabindex')
      } else {
        e.setAttribute('tabindex', -1)
      }
    })
  }
}

class OSlider extends HTMLElement {
  constructor() {
    super()

    this.allowEmptySpaces = false //should this always be false?
    this.shouldFocus = false //turn this true when a button is clicked or the screen is swiped - otherwise animations fire everytime there is an update

    //public variables
    this.slideSpeed = this.hasAttribute('slide-speed') ? parseInt(this.getAttribute('slide-speed')) : 1000
    this.swipeThreshold = this.hasAttribute('swipe-threshold') ? parseInt(this.getAttribute('swipe-threshold')) : 100
    this.autoplay = this.hasAttribute('autoplay') ? this.getAttribute('autoplay') == "true" : false
    this.autoplaySpeed = this.hasAttribute('autoplay-speed') ? parseInt(this.getAttribute('autoplay-speed')) : 12000
    


    const shadow = this.attachShadow({ mode: 'open' });
    const template = document.createElement('template');
    template.innerHTML = `
      <style>
        :host {
          overflow: hidden;
          display: block;
        }

        .viewport {
          display: flex;
          white-space: nowrap;
          transition-duration: ${this.slideSpeed}ms;
          transition-timing-function: cubic-bezier(0.42, 0, 0.58, 1.0);
          position: relative;
          will-change: transform;
        }
        .viewport.animations-disabled {
          transition: none;
        }

        ::slotted(*) {
          flex-shrink: 0;
        }
      </style>
      <div class='viewport animations-disabled'>
        <slot></slot>
      </div>
    `;
    shadow.appendChild(template.content.cloneNode(true))

    //private variables
    this._viewport = shadow.querySelector('.viewport')
    this._isAnimating = false
    this._originalChildren = Array.from(this.children)
    this._pages = chunkArray(Array.from(this.children), this.slidesPerPage)
    this.currentPage = 0
    this._isAutoplaying = this.autoplay
    this.isAutoplaying = this._isAutoplaying
    this._autoplayInterval

    //init
    this._originalmouseDown
    this._mouseDownTransformX = 0
    this._mouseDownReal = 0


    handleSwipe(this._viewport, () => {}, () => {}, amount => {
      //touch move
      if(this.slidesPerPage >= this._originalChildren.length){
        return
      }
      if(this._isAnimating){
        return false
      }
      let left = findTranslate3DX(this._viewport)
      left = this._mouseDownTransformX + amount
      this._viewport.classList.add('animations-disabled')
      this._viewport.style.transform = `translate3D(${left}px, 0, 0)`
      this.isAutoplaying = false
    }, down => {     
      //down
      if(this._isAnimating){
        return false
      }
      let posAtMouseDown = findTranslate3DX(this._viewport)
      this._mouseDownTransformX = posAtMouseDown
      this._mouseDownReal = down
    }, lastPos => {
      //up
      if(this._isAnimating){
        return false
      }      
      if(this.slidesPerPage >= this._originalChildren.length){
        return
      }      
      if(lastPos - this._mouseDownReal >= this.swipeThreshold){
        this.shouldFocus = true
        this.currentPage -= 1
      } else if(this._mouseDownReal - lastPos >= this.swipeThreshold){
        this.shouldFocus = true
        this.currentPage += 1
      } else {
        this._viewport.style.transform = `translate3D(${this._mouseDownTransformX}px, 0, 0)`
      }
    })


    let lastWidth = window.innerWidth
    window.addEventListener('resize', e => {
      const currentWidth = window.innerWidth;
      if (currentWidth !== lastWidth) {
        lastWidth = currentWidth;
        this._handleScreenResize()
      }
    })
    this._handleScreenResize()
    this._warnIfMissingElements()
    this.currentPage = this._currentPage
  }

  get slidesPerPage(){
    let count = this.hasAttribute('slides-per-page') ? parseInt(this.getAttribute('slides-per-page')) : 1

    this._collectResponsiveBreakpoints().forEach(b => {
      if(b.width >= window.innerWidth){
        count = b.count
      }
    })
    return count
  }

  set currentPage(val){
    if(this._isAnimating || parseInt(val) == this._currentPage){
      return;
    }

    this._currentPage = parseInt(val)

    this.dispatchEvent(new Event("pageUpdated"))

    let leftPx = this._currentPage * this.offsetWidth * -1

    if(!this.allowEmptySpaces && this._currentPageWouldShowEmptySpace()){
      const lastValidIndex = this._originalChildren.length - this.slidesPerPage
      leftPx = lastValidIndex * this.slideWidth * -1
    }

    if(!this.allowEmptySpaces && this.slidesPerPage > 1 && (this._currentPage == -1 || this._currentPage == this.totalPages)){
      if(this._currentPage == this.totalPages){
        leftPx = -1 * this._originalChildren.length * this.slideWidth
      }

      if(this._currentPage == -1){
        leftPx = this.slidesPerPage * this.slideWidth
      }
    }

    this._viewport.style.transform = `translate3D(${leftPx}px, 0, 0)`
    this._isAnimating = true
    
    //handle swapping from last to first or first to last
    this._viewport.classList.remove('animations-disabled')
    setTimeout(() => this._animationFinished(), this.slideSpeed + 1)
  }

  get slideWidth(){
    return this.offsetWidth / this.slidesPerPage
  }

  get currentPage() {
    let wrappedPage = this._currentPage
    if(this._currentPage == -1){
      wrappedPage = this.totalPages - 1
    } else if(this._currentPage == this.totalPages){
      wrappedPage = 0
    }
    return wrappedPage
  }

  get totalPages(){
    return this._pages.length
  }

  set isAutoplaying(val){
    this._isAutoplaying = val
    if(val){
      this._autoplayInterval = setInterval(() => {
        if(window.innerWidth <= 768){
          console.warn("Skipping autoplay on mobile.")
          this.isAutoplaying = false
          return
        }
        this.currentPage += 1
      }, this.autoplaySpeed)
    } else {
      clearInterval(this._autoplayInterval)
    }
    this.dispatchEvent(new Event("autoplayStateChanged"))
  }

  get isAutoplaying(){
    return this._isAutoplaying
  }

  _animationFinished(){
    this._isAnimating = false
    if(this._currentPage == -1){
      this._viewport.classList.add('animations-disabled')
      let leftPx = (this._pages.length - 1) * this.offsetWidth * -1

      if(!this.allowEmptySpaces && this._currentPageWouldShowEmptySpace()){
        const lastValidIndex = this._originalChildren.length - this.slidesPerPage
        leftPx = lastValidIndex * this.slideWidth * -1
      } 


      setTimeout(() => this._viewport.style.transform = `translate3D(${leftPx}px, 0, 0)`)
      this._currentPage = this._pages.length - 1
    } else if(this._currentPage == this.totalPages){
      this._viewport.classList.add('animations-disabled')
      setTimeout(() => this._viewport.style.transform = `translate3D(0, 0, 0)`, 10)
      this._currentPage = 0
    }

    this._updateSlideAriaAndFocus()

    if(!this.isAutoplaying && this.shouldFocus){
      this.shouldFocus = false
      this._pages[this._currentPage][0].focus({preventScroll: true})
    }
  }

  // if(this.autoplay){
  //   this._warnIfNoControlsFound()
  // }
  _getCustomElementByClassName(className){
    let found = []
    const customElements = document.getElementsByTagName('*');
    for (let i = 0; i < customElements.length; i++) {
      const element = customElements[i];
      if (element.constructor.name == className && element.getAttribute('slider') == this.id) {
        found.push(element)
      }
    }
    return found
  }

  _warnIfMissingElements(){
    setTimeout(() => {      
      const hasAutoplayControls = this.autoplay ? this._getCustomElementByClassName('OSliderAutoplayControls').length : true
      if(!hasAutoplayControls){
        console.warn("Autoplay slider is missing OSliderAutoplayControls:", this)
      }
      if(!this._getCustomElementByClassName('OSliderPaginationText').length){
        console.warn("Slider is missing OSliderPaginationText:", this)
      }
      if(!this._getCustomElementByClassName('OSliderPrev').length){
        console.warn("Slider is missing OSliderPrev:", this)
      }
      if(!this._getCustomElementByClassName('OSliderNext').length){
        console.warn("Slider is missing OSliderNext:", this)
      }
      if(this._getCustomElementByClassName('OSliderPage').length < this._originalChildren.length){
        console.warn("Slider must have at least on OSliderPage per slide:", this)
      }
    })
  }

  _updateSlideAriaAndFocus(){
    this._pages.forEach((slides, index) => {
      slides.forEach(slide => {
        const isVisible = index == this.currentPage
        slide.setAttribute('aria-hidden', !isVisible)
        slide.setAttribute('tabindex', -1)
        toggleFocusableOnChildren(slide, isVisible)
        slide.style.width = `${this.slideWidth}px`
      })
    })
  }

  // clones the first and last X children 
  // we do this to make animations wrap easier
  _cloneSlides(){

    const allCreatedEls = this.querySelectorAll(".multi-pagination-placeholder, .prepend-clone, .append-clone")
    if(allCreatedEls.length){
      allCreatedEls.forEach(e => e.remove())
    }

    this._pages = chunkArray(Array.from(this.children), this.slidesPerPage)

    if(this.allowEmptySpaces){
      while(this.children.length % this.slidesPerPage != 0){
        const emptySlide = document.createElement('div')
        emptySlide.classList.add('multi-pagination-placeholder')
        emptySlide.style.width = `${this.slideWidth}px`
        this.append(emptySlide)
      }
    }

    const prependContainer = document.createElement('div')
    prependContainer.classList.add('prepend-clone')
    prependContainer.setAttribute('aria-hidden', true)
    prependContainer.style.cssText = `
      display: flex;
      white-space: nowrap;          
      position: absolute;
      top: 0;
      left: 0;
      transform: translateX(-100%);
      height: 100%;
    `
    Array.from(this.children).forEach(page => {
      var clone = page.cloneNode(true)
      toggleFocusableOnChildren(clone, false)
      prependContainer.append(clone)
    })

    const appendContainer = document.createElement('div')
    appendContainer.classList.add('append-clone')
    appendContainer.setAttribute('aria-hidden', true)
    appendContainer.style.cssText = `
      display: flex;
      white-space: nowrap;
    `    
    Array.from(this.children).forEach(page => {
      var clone = page.cloneNode(true)
      toggleFocusableOnChildren(clone, false)      
      appendContainer.append(clone)
    })

    this.prepend(prependContainer)
    this.append(appendContainer)
  }  

  _handleScreenResize(){

    this._updateSlideAriaAndFocus()

    this._cloneSlides()

    this._viewport.classList.add('animations-disabled')
    this.currentPage = 0

    this.dispatchEvent(new Event("pageUpdated")) 
  }

  _collectResponsiveBreakpoints(){
    return Array.from(this.attributes).filter(a => a.name.indexOf("slides-per-page-") !== -1).map(a => {
      const width = parseInt(a.name.replace("slides-per-page-", ""))
      const count = parseInt(a.value)
      return { width, count }
    })
  }

  _currentPageWouldShowEmptySpace(){
    return this._pages[this.currentPage] && this._pages[this.currentPage].length != this.slidesPerPage
  }
}

export { OSlider }