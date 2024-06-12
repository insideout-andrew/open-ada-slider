class OSliderPaginationText extends HTMLElement {
  get originalConstructorName(){
    return "OSliderPaginationText"
  }

  constructor(){
    super()
    this.loaded = false
  }

  connectedCallback() {
    if(this.loaded){
      return false
    } else {
      this.loaded = true
    }

    this.setAttribute('aria-live', 'polite')
    this.setAttribute('aria-atomic', 'true')
    this._slider = document.getElementById(this.getAttribute('slider'))
    this._slider.addEventListener('pageUpdated', e => this._init())
    
    this._init()
  }
  
  _init(){
    const activePage = parseInt(this._slider.currentPage) + 1
    const totalPages = this._slider.totalPages
    if(this.hasAttribute('format')){
      let format = this.getAttribute('format').replace("{{x}}", activePage).replace("{{y}}", totalPages)
      this.textContent = totalPages > 1 ? format : ``
    } else {
      this.textContent = totalPages > 1 ? `Page ${activePage} of ${totalPages}` : ``
    }
  }
}

export {
  OSliderPaginationText 
}