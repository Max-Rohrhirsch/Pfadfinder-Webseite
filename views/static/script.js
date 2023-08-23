               // scrolling
function customScroll(id) {
    if (id && id !== "id0") {
        const element = document.getElementById(id).getBoundingClientRect().top;
        const body = document.body.getBoundingClientRect().top;
        window.scroll(0, (element - body - 42));
    }
    else window.scroll(0, 0);
}

function onHomeClick(id) {
    const filename = window.location.pathname.split("/").pop();
    if (filename === "Pfadfinder")    //when you are on the main page, it just scrolls to the right position
        customScroll(id);
    else
        window.location.replace("/Pfadfinder?id=" + id);  //Opens the new page and adds the parameter to where it should scroll
}

window.onload = function() {
    updateDarkMode();
    updateAccCookies();

    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get("id");
    if (id) {
        const url = document.location.href.split("?").shift();  //Deletes the url-scroll-location
        window.history.pushState("", document.title, url);
    }
    customScroll(id); //Scrolls to the id
}



               // image modal
function onImgClick(target) {
    const divModal = document.getElementById("divModal");
    const imgModal = document.getElementById("imgModal");
    imgModal.src = target.src;
    divModal.style.display = "flex"; //Makes the modal visible
}

function onCloseClick() {
    const divModal = document.getElementById("divModal");
    divModal.style.display = "none"; //Makes the modal invisible
}

            //Modal accept cookies

function accCookies(){
  localStorage.setItem("accCookie", "true");
  updateAccCookies();
}


function updateAccCookies(){
  const accCookie = localStorage.getItem("accCookie");
  const accCookiesDiv = document.getElementById("accCookiesDiv");

  accCookiesDiv.style.display = (accCookie && accCookie === "true" ? "none" : "flex");
}


            // dark mode
function toggleDarkMode() {      //It changes the darkmode / Creates the Cookie
    const oldVal = localStorage.getItem("darkmode");

    if (oldVal) {
        localStorage.setItem("darkmode", (oldVal === "true" ? "false" : "true"));
    }
    else {
        localStorage.setItem("darkmode", "true");   //Falls es den cookie nicht gibt, wird er erstellt
    }

    updateDarkMode();
}

function updateDarkMode() {    //It reads the darkmode and changes the style to the right mode
    const root = document.documentElement.style;
    const isDarkMode = localStorage.getItem("darkmode");

    if (!isDarkMode) return;

    const values =
    {           //Here it declares which mode is which color
        "--textColor":             {"true": "white",                                 "false": "rgb(60, 60, 60)"},
        "--backgroundColor":       {"true": "rgb(60, 60, 60)",                       "false": "white"},
        "--backgroundTransparent": {"true": "rgba(60, 60, 60, 0.75)",                "false": "rgba(255, 255, 255, 0.75)"},
        "--mediumColor":           {"true": "rgb(30, 30, 30)",                       "false": "white"},
        "--lilieFilter":           {"true": "invert(76.5%)",                         "false": "none"},
        "--calendarFilter":        {"true": "invert(85%) hue-rotate(180deg)",        "false": "none"},
        "--h2Color":               {"true": "orange",                                "false": "rgb(60,60,60)"},
        "--bColor":                {"true": "rgb(20,100,150)",                       "false": "rgb(60,60,60)"},
        "--iconFilter":            {"true": "invert()",                              "false": "none"},
        "--orangeNav":             {"true": "none",                                  "false": "brightness(0)"}
    };

    Object.entries(values).forEach(([key, val]) => root.setProperty(key, val[isDarkMode]));   //Reads the color above and changes it in each variable

    const darkmodeIcon = document.getElementById("darkmodeIcon");
    if (darkmodeIcon) darkmodeIcon.src = "/bilder/" + (isDarkMode === "true" ? "sun" : "moon") + ".png";
}
updateDarkMode();   //updates the theme-color before the page gets generated
