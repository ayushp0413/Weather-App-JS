const userTab = document.querySelector("[user-dataWeather]");
const searchTab = document.querySelector("[search-dataWeather]");
const grantAccessButton = document.querySelector("[data-grantAccess]");
const grantAccessContainer = document.querySelector(".grant-access-container");
const userContainer = document.querySelector(".main-content-container");
const searchForm = document.querySelector("[data-searchForm]");
const loadingScreen = document.querySelector(".loading-container");
const userInfoContainer = document.querySelector(".weather-info-container");
const apiErrorContainer = document.querySelector(".api-error-container");
const apiErrorImg = document.querySelector("[data-notFoundImg]");
const apiErrorMessage = document.querySelector("[data-apiErrorText]");
const apiErrorBtn = document.querySelector("[data-apiErrorBtn]");



// initially 
    const API_KEY = "3c0b4e4837b4d82efc8fb7a68d62f0dd";
let currentTab=userTab;
currentTab.classList.add("current-tab"); // bg 
getfromSessionStorage(); // coordinates ho bhi skte hai nahi bhi ho skte hai


function switchTab(userWantedTab) {

    // check cuurent tab and user clilcked tab are diffrent 
    if(userWantedTab!=currentTab) {

        currentTab.classList.remove("current-tab");
        currentTab=userWantedTab;
        currentTab.classList.add("current-tab");

        // aab show kro agr naye tab pr click hua hai to
        if(!searchForm.classList.contains("active")) {

            // search box is invisible , usko visible krdo
            userInfoContainer.classList.remove("active");
            grantAccessContainer.classList.remove("active");
            searchForm.classList.add("active");
        }
        else {
            // phle aerch tab tha ab your weather pr aana hai 
            searchForm.classList.remove("active");
            userInfoContainer.classList.remove("active"); // BUG
            // ab your weather tab me aa gaye hai , lekin ho skta hai location nahi ho
            getfromSessionStorage();
        }
    }
}

userTab.addEventListener('click',()=>{
    // call the function and pass on click tab , that user want to go
    switchTab(userTab);
})

searchTab.addEventListener('click',()=>{
    switchTab(searchTab);  // user want to go on serach tab
})

function getfromSessionStorage()  {
    const localCoordinates = sessionStorage.getItem("user-coordinates");
    // corrdinates mil bhi skte hai nahi bhi mil skte hai...

    if(!localCoordinates) {
        // coordinates not found
        grantAccessContainer.classList.add("active");
    }
    else {
        const coordinates = JSON.parse(localCoordinates); // vo seesion me se JSON form me se aayga
        fetchUserWeatherInfo(coordinates);
    }
}


// fetch the weather info of user's current Location
async function fetchUserWeatherInfo(coordinates) {

    const {lat, lon} = coordinates; // object aaya hai

    
    // now we will be sending request to server , so we need to show Loading GIF and make 
    // grant Access Container invisible 
    grantAccessContainer.classList.remove("active");
    loadingScreen.classList.add("active");

    //  API CALL

    try 
    {
        // const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`);
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
          );
        const data = await response.json();
        // means data is fetched , so make loading GIF invisible and show response
        loadingScreen.classList.remove("active");
        userInfoContainer.classList.add("active");
        // ok container is added but we need to set response values into the UI
        renderWeatherInfo(data);

    }catch(e){

        loadingScreen.classList.remove("active");
        apiErrorContainer.classList.add("active");
        apiErrorImg.style.display = "none";
        apiErrorMessage.innerText = `Error: ${error?.message}`;
        apiErrorBtn.addEventListener("click", fetchUserWeatherInfo);
        
    }
}

function renderWeatherInfo(data) {
    // get all the dynamic tag from HTML
    const cityName = document.querySelector("[data-cityName]");
    const countryFlag = document.querySelector("[data-countryFlag]");
    const desc = document.querySelector("[data-weatherDescription]");
    const weatherIcon = document.querySelector("[data-weatherImage]");
    const temp = document.querySelector("[data-temp]");
    const windspeed = document.querySelector("[data-windSpeed]");
    const humidity = document.querySelector("[data-humidity]");
    const clouds = document.querySelector("[data-clouds]");
    
    // data me se nikaal nikaal kr values set kedo
    cityName.innerText = data?.name;
    countryFlag.src =  `https://flagcdn.com/144x108/${data?.sys?.country.toLowerCase()}.png`;
    desc.innerText = data?.weather?.[0]?.description;
    weatherIcon.src = `http://openweathermap.org/img/w/${data?.weather?.[0]?.icon}.png`;
    temp.innerText = data?.main?.temp+" °C"; 
    windspeed.innerText = data?.wind?.speed+"m/s";
    humidity.innerText = data?.main?.humidity+"%";
    clouds.innerText = data?.clouds?.all+"%";
}


// for users current location , this will execute when user click on GRant Access button

function getLocation() {
    if(navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition);
    }
    else {
        //HW - show an alert for no gelolocation support available
    }
}

function showPosition(position) {

    const userCoordinates = {
        lat: position.coords.latitude,
        lon: position.coords.longitude,
    }

    sessionStorage.setItem("user-coordinates", JSON.stringify(userCoordinates));
    fetchUserWeatherInfo(userCoordinates);

}

// when user want your weather location fo rthe first time
grantAccessButton.addEventListener("click",getLocation);

const searchInput = document.querySelector("[data-searchInput]");
// ispr jo bhi city/state/country ka name hoga uske liye API call jayegi

// const btn = document.querySelector(".btn");


searchForm.addEventListener("submit",(e)=>{

    e.preventDefault(); 
    let cityName = searchInput.value;

    if(cityName === "") return ;
    else {
        fetchSearchWeatherInfo(cityName);
    }
});


async function fetchSearchWeatherInfo(city) {

    

    loadingScreen.classList.add("active");
    userInfoContainer.classList.remove("active");
    grantAccessContainer.classList.remove("active");

    try 
    {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`);
        const data = await response.json();
        if(data?.cod==='404') 
        {
            throw "Error 404";
        }
        // data is fetched
        loadingScreen.classList.remove("active");
        userInfoContainer.classList.add("active");
        // is container pr render bhi to krwaaoo
        renderWeatherInfo(data);
    }catch(e)
    {
        loadingScreen.classList.remove("active");
        apiErrorContainer.classList.add("active");
        apiErrorImg.style.display = "none";
        apiErrorMessage.innerText = `Error: ${error?.message}`;
        apiErrorBtn.addEventListener("click", fetchUserWeatherInfo);
        
    }
}
