function updateClock(){
 const now = new Date();
 document.getElementById("clock").textContent =
   now.toLocaleTimeString("de-DE",{hour:"2-digit",minute:"2-digit"});
}
setInterval(updateClock,1000);
updateClock();

function updateGreeting(){
 const h = new Date().getHours();
 let g = "Guten Abend";
 if(h<12) g="Guten Morgen";
 else if(h<18) g="Guten Tag";
 document.getElementById("greeting").textContent=g;
}
updateGreeting();
