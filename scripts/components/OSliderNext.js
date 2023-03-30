class OSliderNext extends HTMLButtonElement {
  constructor() {
    super()

    this._slider = document.getElementById(this.getAttribute('slider'))

    this.addEventListener('click', e => {
      this._slider.isAutoplaying = false
      this._slider.currentPage = this._slider.currentPage + 1
    })

    this._maybeHide()
    window.addEventListener('resize', e => this._maybeHide())
  }

  _maybeHide(){
    const totalPages = this._slider.totalPages
    this.style.display = this.index > totalPages - 1 || totalPages == 1 ? 'none' : ''    
  }
}

export { OSliderNext }