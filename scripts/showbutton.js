function ShowButton(){

var x = document.getElementById("rightdiv");
var hidden = x.getAttribute("hidden");
if (hidden) {
    x.removeAttribute(hidden);
} else {
    element.setAttribute("hidden", "hidden");
}

  var right=document.getElementById('rightdiv').style.height;
  var left=document.getElementById('leftdiv').style.height;
  if(left>right)
  {
    document.getElementById('rightdiv').style.height=left;
  }
  else
  {
    document.getElementById('leftdiv').style.height=right;
  }
}