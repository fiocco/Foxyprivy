window.addEventListener("load", initPage, false);
window.addEventListener("close", closeFF, false);


/**
Fonction d'initialisation lancé au chargement de l'overlay
**/
function initPage()
{
  // W2K
  if(getOS()=="WINNT")
  {
    if (!existSSH())
    {
      setupPutty(); 
      setPref("pathsshpass","string","not_needed_on_W2K");
    }		
  }
  // Linux & Mac
  else
  {
    if (getPref("pathssh","string")=="") 	{ setPref("pathssh","string","/usr/bin/ssh"); }
    if (getPref("pathsshpass","string")=="") 	{ setPref("pathsshpass","string","/usr/bin/sshpass"); }
    if (getPref("pathterm","string")=="") 	
    {
      if (getOS()=="Darwin") { setPref("pathterm","string","/Applications/Utilities/Terminal.app/Contents/MacOS/Terminal"); }
      else { setPref("pathterm","string","/usr/bin/xterm"); }
    }
  }
  initSSH();
  initServerList(); 
  initReloadXUListener();
}


/**
 * Fonction qui fait le ménage à la fermeture de FF !
 **/
function closeFF()
{
  killSSH();
  resetProxy();
}


function stateImgFP(state)
{
  var img=document.getElementById("foxyprivy-button") ;
  if (state=="ready") { img.setAttribute("image","chrome://foxyprivy/skin/FP.png") ; }
  else if (state=="noready") { img.setAttribute("image","chrome://foxyprivy/skin/FPnb.png") ; }
  else if (state=="runWithProxy") { img.setAttribute("image","chrome://foxyprivy/skin/FP_lunettes_soleil.png") ; }
  else if (state=="runWithoutProxy") { img.setAttribute("image","chrome://foxyprivy/skin/FP_lunettes_vue.png") ; }
}


/**
Fonction qui lit la liste des serveurs et qui complete le menupopup
**/
function initServerList()
{
  var mp=document.getElementById("foxyprivy-list");
  // Purge de la liste...
  if (mp)  { _removeAllChildren(mp); }
  if (foxyprivyIsReady())
  {
    //document.getElementById("foxyprivy-button").setAttribute("image","chrome://foxyprivy/skin/FP.png") ;
    stateImgFP("ready");
    // Ajouts des boutons items statiques
    var stop = document.createElement("menuitem");
      stop.setAttribute("value","STOP");
      stop.setAttribute("label","STOP");
      stop.setAttribute("oncommand","resetProxy(); killSSH();");
      stop.setAttribute("class","menuitem-iconic");
      stop.setAttribute("style","color : #333 ; font-weight:bold ;");
      stop.setAttribute("image","chrome://foxyprivy/skin/stop16.png");
    var config = document.createElement("menuitem");
      config.setAttribute("value","Config");
      config.setAttribute("label","Configuration");
      config.setAttribute("oncommand","openConfig();");
      config.setAttribute("class","menuitem-iconic");
      config.setAttribute("style","color : #333 ; font-weight:bold ;");
      config.setAttribute("image","chrome://foxyprivy/skin/molette16.png");
    var separateur = document.createElement("menuseparator");
    if (mp) { mp.appendChild(stop) ; mp.appendChild(config) ; mp.appendChild(separateur) ; }
    // Ajout des items dynamiques (serveurs)
    var prefs = init_foxyprivy_prefs("extensions.foxyprivy.serveur.") ;
    for(i=0;i<nb_prefs();i++)
    {
      args_tmp = null;
      args_tmp = ["-ssh", prefs.getCharPref(i+".dns"), "-l", prefs.getCharPref(i+".login"), "-pw", getMdp("serveur_"+i)];
      var tmp = document.createElement("menuitem");
      var passw="";
      if (existMdp("serveur_"+i)) { passw=getMdp("serveur_"+i) ; } 
      tmp.setAttribute("value", prefs.getCharPref(i+".nom"));
      tmp.setAttribute("label", prefs.getCharPref(i+".nom"));
      tmp.setAttribute("name", "elem_foxyprivy-list");
      tmp.setAttribute("oncommand", "callSSH(\"" + prefs.getCharPref(i+".dns") + "\",\"" + prefs.getIntPref(i+".port") + "\", \"" + prefs.getCharPref(i+".login")+ "\", \"" + passw + "\" )");
      tmp.style.color=prefs.getCharPref(i+".couleur") ;
      if (mp) mp.appendChild(tmp) ; 
    }
  }
  else
  {
    //document.getElementById("foxyprivy-button").setAttribute("image","chrome://foxyprivy/skin/FPnb.png") ;
    stateImgFP("noready");
    var config = document.createElement("menuitem");
      config.setAttribute("value","Config");
      config.setAttribute("label","Configuration");
      config.setAttribute("oncommand","openConfig();");
      config.setAttribute("class","menuitem-iconic");
      config.setAttribute("style","color : #333 ; font-weight:bold ;");
      config.setAttribute("image","chrome://foxyprivy/skin/molette16.png");
    if (mp) mp.appendChild(config) ; 
  }
}

/**
Fonction purge le menupopup de l'overlay
**/
function _removeAllChildren(e)
{
  if (e)
  {
    var child = e.lastChild;
    while (child)
    {
      var tmp = child.previousSibling;
      e.removeChild(child);
      child = tmp;
    }
  }
}

/**
Fonction qui initialise le listener de la pref de modification
**/
function initReloadXUListener()
{
	var myPrefObserver = 
	{
	  register: function() {
		// First we'll need the preference services to look for preferences.
		var prefService = Components.classes["@mozilla.org/preferences-service;1"]
									.getService(Components.interfaces.nsIPrefService);
	 
		// For this._branch we ask that the preferences for extensions.myextension. and children
		this._branch = prefService.getBranch("extensions.foxyprivy.");
	 
		// Now we queue the interface called nsIPrefBranch2. This interface is described as: 
		// "nsIPrefBranch2 allows clients to observe changes to pref values."
		this._branch.QueryInterface(Components.interfaces.nsIPrefBranch2);
	 
		// Finally add the observer.
		this._branch.addObserver("", this, false);
	  },
	 
	  unregister: function() {
		if (!this._branch) return;
		this._branch.removeObserver("", this);
	  },
	 
	  observe: function(aSubject, aTopic, aData) {
		if(aTopic != "nsPref:changed") return;
		// aSubject is the nsIPrefBranch we're observing (after appropriate QI)
		// aData is the name of the pref that's been changed (relative to aSubject)
		switch (aData) {
			case "reloadlist":
				initServerList();
				//initServersListener();
			break;
		}
	  }
	}
	myPrefObserver.register();
}