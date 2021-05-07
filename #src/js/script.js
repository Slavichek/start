$(document).ready(function () {
	$(window).scroll(function () {
        var scroll = $(window).scrollTop();
        if (scroll <= 10) {
			console.log('dddd');
            $(".header").removeClass("header--scroll");
        } else {
            $(".header").addClass("header--scroll");
			console.log('dddd');
        }
    });
    const menuBtn = document.querySelector(".menu-btn");
    let menuOpen = false;
    menuBtn.addEventListener("click", () => {
        if (!menuOpen) {
            menuBtn.classList.add("open");
            menuOpen = true;
        } else {
            menuBtn.classList.remove("open");
            menuOpen = false;
        }
    });
});
