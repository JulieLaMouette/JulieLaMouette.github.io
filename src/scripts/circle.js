
const sectionOffset = 200;
const sectionRange = 130;
const globalOffsetAjustement = 100;

const titleLargeX = -60;
const titleLargeY = 100;
const titleSmallX = -150;
const titleSmallY = -80;
const titleLargeSize = 1.1;
const titleSmallSize = 0.6;
const speed = 6.0;

let circle = null;
let mainTitle = null;
let sections = [];
let sectionContents = [];
let sectionTops = [];
let offsets = [];

let lastTime = performance.now();
let currentScroll = 0.0;
let smoothScroll = 0.0;
let smoothGlobalOffset = 0.0;
let circleOriginSize;

InitializeCircle();
InitializeSections();
OnScroll();
Loop();


function InitializeCircle()
{
    //Load circle border
    circle = document.getElementById('circle');
    const img = new Image();
    img.alt = 'Circle Image';
    circleOriginSize = parseFloat(circle.style.width);

    // //Load local image (from same directory, or use path if nested)
    // img.src = 'main/media/logo-border-sword.png';

    // //Append image once loaded
    // img.onload = () => {
    // circle.appendChild(img);
    // };

    //Load main title
    mainTitle = document.getElementById('main-title');

    //Add scroll callback
    window.addEventListener('scroll', OnScroll);
}

function InitializeSections()
{
    sections = Array.from(document.querySelectorAll(".section"));

    offsets = new Array(sections.length + 1);
    sectionTops = new Array(sections.length + 1);
    sectionContents = new Array(sections.length);

    for (let i = 0; i < sections.length; i++)
    {
        offsets[i] = 0.0;
        sectionTops[i] = parseFloat(sections[i].style.top);
        sectionContents[i] = sections[i].querySelector(".section-content");
    }
}

function Lerp(a, b, t)
{
    return (a * (1.0 - t)) + (b * t);
}

function InverseLerp(a, b, t)
{
    return (t - a) / (b - a);
}

function Clamp(min, max, t)
{
    return Math.min(Math.max(t, min), max);
}

function Saturate(t)
{
    return Clamp(0.0, 1.0, t);
}

function Abs(t)
{
    return Math.abs(t);
}

function SmoothStep(a, b, t)
{
    t = Saturate(t);
    t = t * t * (3.0 - 2.0 * t); 
    return a + (b - a) * t;
}

function SCurve(t)
{
    return SmoothStep(0, 1, SmoothStep(0, 1, t));
}

function MoveToward(a, target, maxStep)
{
    let offset = target - a;
    offset = Clamp(-maxStep, maxStep, offset);
    return a + offset;
}

function OnScroll()
{
    //Scroll value
    const scrollY = window.scrollY;

    currentScroll = scrollY;
}

function Loop()
{
    //Loop stuff
    const now = performance.now();
    const deltaTime = (now - lastTime) / 1000.0;
    lastTime = now;

    //Circle
    let circleSize = Math.max(offsets[sections.length - 1], 0) * 0.5;
    circleSize = 1.0 - circleSize;
    circle.style.width = (circleOriginSize * circleSize) + "px";
    circle.style.height = (circleOriginSize * circleSize) + "px";
    circle.style.borderWidth = Math.min(15, circleOriginSize * circleSize) + "px";

    if (circleSize < 0.01)
        circle.style.display = "none";
    else
        circle.style.display = "flex";

    //Main title
    let mtPosX = Lerp(titleSmallX, titleLargeX, circleSize);
    let mtPosY = Lerp(titleSmallY, titleLargeY, circleSize);
    mainTitle.style.translate = mtPosX + "px " + mtPosY + "px";
    mainTitle.style.scale = Lerp(titleSmallSize, titleLargeSize, circleSize);


    //Find best section
    let nearestSection = 0;
    let nearestDistance = 10000;
    for (let i = 0; i < sections.length; i++)
    {
        let distance = Abs((sectionTops[i] - sectionOffset) - (currentScroll));
        if (distance < nearestDistance)
        {
            nearestDistance = distance;
            nearestSection = i;
        }
    }


    //Smooth targeting
    let targetScroll = sectionTops[nearestSection] - sectionOffset;
    smoothScroll = Lerp(smoothScroll, targetScroll, deltaTime * 3.0);

    let globalOffset = (smoothScroll - currentScroll) - globalOffsetAjustement;
    smoothGlobalOffset = Lerp(smoothGlobalOffset, globalOffset, deltaTime * 3.0);

    sectionTops[sections.length] = -350 - 15;
    offsets[sections.length] = 0;

    //Adapt sections position
    for (let i = 0; i < sections.length; i++)
    {
        //The banner (last section) has a custom expand
        let bannerOffset = (i == (sections.length - 1)) ? 1 : 0;

        if (i < nearestSection)
            offsets[i] = Lerp(offsets[i], 0.0 + bannerOffset, deltaTime * speed);
        else if (i > nearestSection)
            offsets[i] = Lerp(offsets[i], 1.0 + bannerOffset, deltaTime * speed);
        else
            offsets[i] = Lerp(offsets[i], -1.0 + bannerOffset, deltaTime * speed);


        let currentTop = sectionTops[i] - offsets[i] * sectionRange;
        let nextTop = sectionTops[i + 1] - offsets[i + 1] * sectionRange;

        //Position
        let element = sections[i];
        element.style.top = currentTop + "px";

        //Content size
        let content = sectionContents[i];
        let size = (currentTop - nextTop) - 30;
        content.style.height = size + "px";
    }


    requestAnimationFrame(Loop);
}