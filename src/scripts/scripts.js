const wrapper = document.querySelector('.background-wrapper');
const parallaxItems = document.querySelectorAll('.parallax');

function UpdateParallaxWidths()
{
  const baseWidth = wrapper.offsetWidth;

  parallaxItems.forEach(el =>
  {
    const ratio = parseFloat(el.dataset.width) || 1.0;
    el.style.width = `${baseWidth * ratio}px`;
  });
}

function UpdateParallaxScroll()
{
  const scrollY = window.scrollY;

  document.querySelectorAll('.parallax-back').forEach(el =>
  {
    el.style.transform = `translateX(-50%) translateY(${scrollY * 0.3}px)`;
  });

  document.querySelectorAll('.parallax-front').forEach(el =>
  {
    el.style.transform = `translateX(-50%) translateY(${scrollY * 0.6}px)`;
  });
}

window.addEventListener('resize', UpdateParallaxWidths);
window.addEventListener('scroll', UpdateParallaxScroll);

UpdateParallaxWidths();