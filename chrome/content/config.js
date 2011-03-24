window.addEventListener("load", initUI, false);

function initUI()
{
  // Affiche certains onglets en fonction de l'OS
  if (getOS()=="WINNT")  showElem("_onglet_putty") ;   
  else                   showElem("_onglet_ssh") ;
  
  // Si les prérequis au fonctionnement de FP ne sont pas satisfaits, on force l'affichage
  // de l'onglet SSH
  if (!foxyprivyIsReady())
  {
    if (getOS()=="WINNT")
    {
      document.getElementById("_onglet_serveurs").setAttribute("selected",false) ;
      document.getElementById("_onglet_putty").setAttribute("selected",true) ;
      document.getElementById("_onglet_raz").setAttribute("selected",false) ;
      document.getElementById("config_tabpanels").setAttribute("selectedIndex",1) ;
    }
    else
    {
      document.getElementById("_onglet_serveurs").setAttribute("selected",false) ;
      document.getElementById("_onglet_ssh").setAttribute("selected",true) ;
      document.getElementById("_onglet_raz").setAttribute("selected",false) ;
      document.getElementById("config_tabpanels").setAttribute("selectedIndex",2) ;
    }
  }
  statePasswordInput() ;
}