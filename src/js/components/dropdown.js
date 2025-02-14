'use strict';
const breakpoints = require('../utils/breakpoints');
const BUTTON = '.js-dropdown';
const jsDropdownCollapseModifier = 'js-dropdown--responsive-collapse'; //option: make dropdown behave as the collapse component when on small screens (used by submenus in the header and step-dropdown).
const TARGET = 'data-js-target';
const eventCloseName = 'fds.dropdown.close';
const eventOpenName = 'fds.dropdown.open';

class Dropdown {
  constructor (el){
    this.responsiveListCollapseEnabled = false;

    this.triggerEl = el;
    this.targetEl = null;

    this.init();

    if(this.triggerEl !== null && this.triggerEl !== undefined && this.targetEl !== null && this.targetEl !== undefined){
      let that = this;


      if(this.triggerEl.parentNode.classList.contains('overflow-menu--md-no-responsive') || this.triggerEl.parentNode.classList.contains('overflow-menu--lg-no-responsive')){
        this.responsiveListCollapseEnabled = true;
      }

      //Clicked outside dropdown -> close it
      document.getElementsByTagName('body')[ 0 ].removeEventListener('click', outsideClose);
      document.getElementsByTagName('body')[ 0 ].addEventListener('click', outsideClose);
      //Clicked on dropdown open button --> toggle it
      this.triggerEl.removeEventListener('click', toggleDropdown);
      this.triggerEl.addEventListener('click', toggleDropdown);

      // set aria-hidden correctly for screenreaders (Tringuide responsive)
      if(this.responsiveListCollapseEnabled) {
        let element = this.triggerEl;
        if (window.IntersectionObserver) {
          // trigger event when button changes visibility
          let observer = new IntersectionObserver(function (entries) {
            // button is visible
            if (entries[ 0 ].intersectionRatio) {
              if (element.getAttribute('aria-expanded') === 'false') {
                that.targetEl.setAttribute('aria-hidden', 'true');
              }
            } else {
              // button is not visible
              if (that.targetEl.getAttribute('aria-hidden') === 'true') {
                that.targetEl.setAttribute('aria-hidden', 'false');
              }
            }
          }, {
            root: document.body
          });
          observer.observe(element);
        } else {
          // IE: IntersectionObserver is not supported, so we listen for window resize and grid breakpoint instead
          if (doResponsiveCollapse(that.triggerEl)) {
            // small screen
            if (element.getAttribute('aria-expanded') === 'false') {
              that.targetEl.setAttribute('aria-hidden', 'true');
            } else{
              that.targetEl.setAttribute('aria-hidden', 'false');
            }
          } else {
            // Large screen
            that.targetEl.setAttribute('aria-hidden', 'false');
          }
          window.addEventListener('resize', function () {
            if (doResponsiveCollapse(that.triggerEl)) {
              if (element.getAttribute('aria-expanded') === 'false') {
                that.targetEl.setAttribute('aria-hidden', 'true');
              } else{
                that.targetEl.setAttribute('aria-hidden', 'false');
              }
            } else {
              that.targetEl.setAttribute('aria-hidden', 'false');
            }
          });
        }
      }

      
      document.addEventListener('keyup', function(event){
        var key = event.which || event.keyCode;
        if (key === 27) {
          closeAll(event);
        }
      });
    }
  }

  init (){    
    if(this.triggerEl === null ||this.triggerEl === undefined){
      throw new Error(`Could not find button for Details component.`);
    }
    let targetAttr = this.triggerEl.getAttribute(TARGET);
    if(targetAttr === null || targetAttr === undefined){
      throw new Error('Attribute could not be found on details component: '+TARGET);
    }
    let targetEl = document.getElementById(targetAttr.replace('#', ''));
    if(targetEl === null || targetEl === undefined){
      throw new Error('Panel for Details component could not be found.');
    }
    
    this.targetEl = targetEl;  
  }

  hide(){
    toggle(this.triggerEl);
  }

  show(){
    toggle(this.triggerEl);
  }

}

/**
 * Get an Array of button elements belonging directly to the given
 * accordion element.
 * @param parent accordion element
 * @returns {NodeListOf<SVGElementTagNameMap[[string]]> | NodeListOf<HTMLElementTagNameMap[[string]]> | NodeListOf<Element>}
 */
let getButtons = function (parent) {
  return parent.querySelectorAll(BUTTON);
};

let closeAll = function (event = null){
  let changed = false;

  let eventClose = document.createEvent('Event');
  eventClose.initEvent(eventCloseName, true, true);

  const body = document.querySelector('body');

  let overflowMenuEl = document.getElementsByClassName('overflow-menu');
  for (let oi = 0; oi < overflowMenuEl.length; oi++) {
    let currentOverflowMenuEL = overflowMenuEl[ oi ];
    let triggerEl = currentOverflowMenuEL.querySelector(BUTTON+'[aria-expanded="true"]');
    if(triggerEl !== null){
      changed = true;
      let targetEl = currentOverflowMenuEL.querySelector('#'+triggerEl.getAttribute(TARGET).replace('#', ''));

        if (targetEl !== null && triggerEl !== null) {
          if(doResponsiveCollapse(triggerEl)){
            if(triggerEl.getAttribute('aria-expanded') === true){
              triggerEl.dispatchEvent(eventClose);
            }
            triggerEl.setAttribute('aria-expanded', 'false');
            targetEl.classList.add('collapsed');
            targetEl.setAttribute('aria-hidden', 'true');
          }
        }
    }
  }

  if(changed && event !== null){
    event.stopImmediatePropagation();
  }
};
let offset = function (el) {
  let rect = el.getBoundingClientRect(),
    scrollLeft = window.pageXOffset || document.documentElement.scrollLeft,
    scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  return { top: rect.top + scrollTop, left: rect.left + scrollLeft };
};

let toggleDropdown = function (event, forceClose = false) {
  event.stopPropagation();
  event.preventDefault();

  toggle(this, forceClose);

};

let toggle = function(button, forceClose = false){
  
  let eventClose = document.createEvent('Event');
  eventClose.initEvent(eventCloseName, true, true);

  let eventOpen = document.createEvent('Event');
  eventOpen.initEvent(eventOpenName, true, true);
  let triggerEl = button;
  let targetEl = null;
  if(triggerEl !== null && triggerEl !== undefined){
    let targetAttr = triggerEl.getAttribute(TARGET);
    if(targetAttr !== null && targetAttr !== undefined){
      targetEl = document.getElementById(targetAttr.replace('#', ''));
    }
  }
  if(triggerEl !== null && triggerEl !== undefined && targetEl !== null && targetEl !== undefined){
    //change state

    targetEl.style.left = null;
    targetEl.style.right = null;

    if(triggerEl.getAttribute('aria-expanded') === 'true' || forceClose){
      //close
      triggerEl.setAttribute('aria-expanded', 'false');
      targetEl.classList.add('collapsed');
      targetEl.setAttribute('aria-hidden', 'true');
      triggerEl.dispatchEvent(eventClose);
    }else{
      closeAll();
      //open
      triggerEl.setAttribute('aria-expanded', 'true');
      targetEl.classList.remove('collapsed');
      targetEl.setAttribute('aria-hidden', 'false');
      triggerEl.dispatchEvent(eventOpen);
      let targetOffset = offset(targetEl);

      if(targetOffset.left < 0){
        targetEl.style.left = '0px';
        targetEl.style.right = 'auto';
      }
      let right = targetOffset.left + targetEl.offsetWidth;
      if(right > window.innerWidth){
        targetEl.style.left = 'auto';
        targetEl.style.right = '0px';
      }

      let offsetAgain = offset(targetEl);

      if(offsetAgain.left < 0){

        targetEl.style.left = '0px';
        targetEl.style.right = 'auto';
      }
      right = offsetAgain.left + targetEl.offsetWidth;
      if(right > window.innerWidth){

        targetEl.style.left = 'auto';
        targetEl.style.right = '0px';
      }
    }

  }
}

let hasParent = function (child, parentTagName){
  if(child.parentNode.tagName === parentTagName){
    return true;
  } else if(parentTagName !== 'BODY' && child.parentNode.tagName !== 'BODY'){
    return hasParent(child.parentNode, parentTagName);
  }else{
    return false;
  }
};

let outsideClose = function (evt){
  if(document.querySelector('body.mobile_nav-active') === null) {
    let openDropdowns = document.querySelectorAll('.js-dropdown[aria-expanded=true]');
    for (let i = 0; i < openDropdowns.length; i++) {
      let triggerEl = openDropdowns[i];
      let targetEl = null;
      let targetAttr = triggerEl.getAttribute(TARGET);
      if (targetAttr !== null && targetAttr !== undefined) {
        if(targetAttr.indexOf('#') !== -1){
          targetAttr = targetAttr.replace('#', '');
        }
        targetEl = document.getElementById(targetAttr);
      }
      if (doResponsiveCollapse(triggerEl) || (hasParent(triggerEl, 'HEADER') && !evt.target.classList.contains('overlay'))) {
        //closes dropdown when clicked outside
        if (evt.target !== triggerEl) {
          //clicked outside trigger, force close
          triggerEl.setAttribute('aria-expanded', 'false');
          targetEl.classList.add('collapsed');
          targetEl.setAttribute('aria-hidden', 'true');

          let eventClose = document.createEvent('Event');
          eventClose.initEvent(eventCloseName, true, true);
          triggerEl.dispatchEvent(eventClose);
        }
      }
    }
  }
};

let doResponsiveCollapse = function (triggerEl){
  if(!triggerEl.classList.contains(jsDropdownCollapseModifier)){
    // not nav overflow menu
    if(triggerEl.parentNode.classList.contains('overflow-menu--md-no-responsive') || triggerEl.parentNode.classList.contains('overflow-menu--lg-no-responsive')) {
      // trinindikator overflow menu
      if (window.innerWidth <= getTringuideBreakpoint(triggerEl)) {
        // overflow menu på responsiv tringuide aktiveret
        return true;
      }
    } else{
      // normal overflow menu
      return true;
    }
  }

  return false;
};

let getTringuideBreakpoint = function (button){
  if(button.parentNode.classList.contains('overflow-menu--md-no-responsive')){
    return breakpoints.md;
  }
  if(button.parentNode.classList.contains('overflow-menu--lg-no-responsive')){
    return breakpoints.lg;
  }
};

module.exports = Dropdown;
