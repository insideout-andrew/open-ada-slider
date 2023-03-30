class OSliderPage extends HTMLButtonElement {
  constructor() {
    super()

    this._slider = document.getElementById(this.getAttribute('slider'))

    this.addEventListener('click', e => {
      this._slider.shouldFocus = true
      this._slider.isAutoplaying = false      
      this._slider.currentPage = this.index
    })

    this._onParentUpdate()
    this._slider.addEventListener('pageUpdated', e => this._onParentUpdate())
  }

  get index(){
    return parseInt(this.getAttribute('index')) 
  }

  _onParentUpdate(){
    const totalPages = this._slider.totalPages
    const noun = this._slider.slidesPerPage > 1 ? 'group' : 'slide'
    this.setAttribute('aria-current', this._slider.currentPage == this.index)
    this.setAttribute('aria-label', `Go to ${noun} ${this.index + 1}`)
    this.style.display = this.index > totalPages - 1 || totalPages == 1 ? 'none' : ''
  }
}

export { OSliderPage }