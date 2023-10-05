class OSliderAutoplayControls extends HTMLElement {
  get originalConstructorName(){
    return "OSliderAutoplayControls"
  }

  constructor() {
    super()

    const shadow = this.attachShadow({ mode: 'open' });
    const template = document.createElement('template');
    template.innerHTML = `
      <slot name="play" style="display:none"></slot>
      <slot name="pause"></slot>
    `;
    shadow.appendChild(template.content.cloneNode(true))

    const playSlot = shadow.querySelector(`slot[name="play"]`)
    const playButton = playSlot.assignedElements()[0]
    const pauseSlot = shadow.querySelector(`slot[name="pause"]`)
    const pauseButton = pauseSlot.assignedElements()[0]
    const slider = document.getElementById(this.getAttribute('slider'))

    playButton.addEventListener('click', e => {
      slider.currentPage += 1
      slider.isAutoplaying = true
      playSlot.style.display = 'none'
      pauseSlot.style.display = ''      
    })

    pauseButton.addEventListener('click', e => {
      slider.isAutoplaying = false
      playSlot.style.display = ''
      pauseSlot.style.display = 'none'      
    })

    slider.addEventListener('autoplayStateChanged', e => {
      if(slider.isAutoplaying){
        playSlot.style.display = 'none'
        pauseSlot.style.display = ''   
      } else {
        playSlot.style.display = ''
        pauseSlot.style.display = 'none'            
      }
    })

    if(slider.autoplay){
      playSlot.style.display = 'none'
      pauseSlot.style.display = ''      
    }

    this._maybeHide()
    window.addEventListener('resize', e => this._maybeHide())
  }

  _maybeHide(){
    const slider = document.getElementById(this.getAttribute('slider'))
    const totalPages = slider.totalPages
    this.style.display = this.index > totalPages - 1 || totalPages == 1 ? 'none' : ''    
  }  
}

export { OSliderAutoplayControls }