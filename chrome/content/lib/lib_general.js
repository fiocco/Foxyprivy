/* Creating stringbundle from locale file */
var gfoxyprivyBundle = Components.classes["@mozilla.org/intl/stringbundle;1"].getService(Components.interfaces.nsIStringBundleService);
var _bundle = gfoxyprivyBundle.createBundle("chrome://foxyprivy/locale/lib_general.properties");


/**
Fonction qui initialise l'object XPCOM pour la manipulation des prefs.
	Retourne la branche contenants les extensions FP
**/
function init_foxyprivy_prefs(branche)
{
	var prefs = Components.classes["@mozilla.org/preferences-service;1"]
						.getService(Components.interfaces.nsIPrefService);

	return prefs.getBranch(branche);
}


/**
Fonction retourne le nombre de serveurs déja présent dans la liste des prefs
**/
function nb_prefs()
{
  var prefs = init_foxyprivy_prefs("extensions.foxyprivy.serveur.") ;
  var tab = new Array();
  tab=prefs.getChildList("");
  if (tab.length>=5) 	return tab.length/5 ;
  else				 	return 0 ;
}


/**
Fonction retourne la valeur de la pref foxyprivy "nom_pref"
type = string || boolean || integer
**/
function getPref(nom_pref,type)
{
	var pref = init_foxyprivy_prefs("extensions.foxyprivy.") ;
	if (type=="string")			return pref.getCharPref(nom_pref) ;
	else if (type=="boolean")		return pref.getBoolPref(nom_pref) ;
	else if (type=="integer")		return pref.getIntPref(nom_pref) ;
}


/**
Fonction modifie la pref foxyprivy "nom_pref"
type = string || boolean || integer
**/
function setPref(nom_pref,type,val)
{
	var pref = init_foxyprivy_prefs("extensions.foxyprivy.") ;
	if (type=="string")		pref.setCharPref(nom_pref,val) ;
	else if (type=="boolean")       pref.setBoolPref(nom_pref,val) ;  
	else if (type=="integer")	pref.setIntPref(nom_pref,val) ;
}


/**
Fonction qui configure un proxy SOCKS dans FF pour tunneliser le surf
**/
function setProxy(port_forward,remotedns)
{
	var prefs = init_foxyprivy_prefs("network.proxy.") ;
	prefs.setCharPref("socks", "localhost");
	prefs.setIntPref("socks_port", port_forward);
	if (remotedns) prefs.setBoolPref("socks_remote_dns", true);
	prefs.setIntPref("type", 1);
}

/**
Fonction qui reset les proxy SOCKS de FF
**/
function resetProxy()
{
	var prefs = init_foxyprivy_prefs("network.proxy.") ;
	if (prefs.prefHasUserValue("socks")) { prefs.clearUserPref("socks"); }
	if (prefs.prefHasUserValue("socks_port")) { prefs.clearUserPref("socks_port"); }
	if (prefs.prefHasUserValue("socks_remote_dns")) { prefs.clearUserPref("socks_remote_dns"); }
	if (prefs.prefHasUserValue("type")) { prefs.clearUserPref("type"); }
}


/**
Fonction qui va changer la pref extensions.foxyprivy.reloadlist pour que la liste des serveurs de la barre d'outil se recharge
**/
function reloalXUL()
{
  if (getPref("reloadlist","boolean")) setPref("reloadlist","boolean",false) ;
  else setPref("reloadlist","boolean",true) ;
}


/**
 * Fonction qui retourne un string qui contient l'OS de la machine qui fait tourner FF
 * "WINNT"	 --> W2K
 * "Linux"   	 --> Tous les distros linux
 * "Darwin"	 --> MAC OS
**/
function getOS()
{
  var osString = Components.classes["@mozilla.org/xre/app-info;1"]
                 .getService(Components.interfaces.nsIXULRuntime).OS;
  return osString;
}

/**
 * Fonction qui ouvre la fenetre de config
**/
function openConfig()
{
  gBrowser.selectedTab = gBrowser.addTab("chrome://foxyprivy/content/config.xul");
}


/**
 * Fonction qui renvoit true si les outils nécessaires au fonctionnement de l'extension
 * sont détectés, false sinon.
**/
function foxyprivyIsReady()
{
  var isReady=false;
  if (getOS()=="WINNT")
  {
    if (existSSH()) { isReady=true ; } 
  }
  else
  {
    if ( existSSH() && existTerm() ) { isReady=true ; }
  }
  return isReady;
}



function test()
{
  if (window.confirm(_bundle.GetStringFromName("wantToSeeMyMoodRing"))) alert("suppression");
  else alert(_bundle.GetStringFromName("relief")); 
}
