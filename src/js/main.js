// Smooth scroll transition
function scrollAnimate(ele) {
    window.scrollTo({
        top: document.querySelector(ele).offsetTop,
        behavior: 'smooth'
    });
}

// Dynamic button ripple
var parent, ink, d, x, y;
$('.titlescroll').click(function (e) {
    e.preventDefault();

    parent = $(this);

    if (parent.find('.ink').length === 0)
        $('<span class="ink"></span>').appendTo($(this));

    ink = parent.find('.ink');
    ink.removeClass('animate');

    if (!ink.height() && !ink.width()) {
        d = Math.max(parent.outerWidth(), parent.outerHeight());
        ink.css({
            height: d,
            width: d
        });
    }

    x = e.pageX - parent.offset().left - ink.width() / 2;
    y = e.pageY - parent.offset().top - ink.height() / 2;

    ink.css({
        top: y + 'px',
        left: x + 'px'
    }).addClass('animate');

    setTimeout(function () {
        scrollAnimate('#projects');
    }, 300);
});