// Email deobfuscator
$('.email').click(function (e) {
    e.preventDefault();
    var emailp = $('.email').attr('data-uri');
    if (emailp.substring(0,7) == 'mailto:') {
        window.open('mailto:' + emailactive, '_blank');
    } else {
        emailp = emailp.replace('the', 'uint').replace('please', 'core').replace('address', 'dev').replace('email', '&#46;').replace('reveal', '&#64;');
        $('.email').html('Launch email client');
        $('.emailmsg').html(emailp);
        $('.emailcontainer').removeClass('hide');
        emailp = emailp.replace('&#64;', '@').replace('&#46;', '.');
        emailactive = emailp;
        $('.email').attr('data-uri', 'mailto:' + emailactive);
    }
});

// Smooth scroll transition
function scrollto(reqblk) {
    $('html,body').animate({
        scrollTop: $(reqblk).offset().top
    }, 350);
}

// Dynamic button ripple
var parent, ink, d, x, y;
$('.titlescroll').click(function (e) {
    e.preventDefault();

    parent = $(this);

    if (parent.find('.ink').length == 0)
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
        scrollto('#projects');
    }, 300);
});

/*
window.onhashchange = function() {
    if (location.href != '') {
        scrollto(location.hash);
    }
}
*/
