/* Creating stringbundle from locale file */
var gfoxyprivyBundle = Components.classes["@mozilla.org/intl/stringbundle;1"].getService(Components.interfaces.nsIStringBundleService);
var _bundle = gfoxyprivyBundle.createBundle("chrome://foxyprivy/locale/lib_config.properties");


var tab_elem = ["liste_serveurs","actions_serveurs"] ;
var numero_serveur=-1 ;

/**
 * Fonction qui affiche un élement en passant a false son attribut hidden
 **/
function showElem(idElem)
{
  var elem=document.getElementById(idElem);
  elem.setAttribute("hidden",false);
}


/**
 * Fonction qui affiche un élement en passant a false son attribut hidden
 **/
function hideElem(idElem)
{
  var elem=document.getElementById(idElem);
  elem.setAttribute("hidden",true);
}

/**
 * Fonction masque tous les div du tableau tab_elem
 **/
function hideAllElem()
{
  for(i=0;i<tab_elem.length;i++)
    hideElem(tab_elem[i]);
}


function readConfig()
{
  var suffix = "" ;
  // Code spécifique W2K
  if(getOS()=="WINNT")
  {
    suffix="_putty" ;
    document.getElementById("path_putty").value=getPref("pathssh","string") ;
  }
  // Code spécifique Linux et Mac
  else
  {
    suffix="_ssh" ;
    document.getElementById("path_ssh").value=getPref("pathssh","string") ;
    document.getElementById("path_sshpass").value=getPref("pathsshpass","string") ;
    document.getElementById("path_term").value=getPref("pathterm","string") ;
    if(!existSSHpass())
    {
      document.getElementById("param_sshpass").setAttribute("checked","false") ;
      document.getElementById("param_sshpass").setAttribute("disabled","true") ;
    }
    else
    {
      document.getElementById("param_sshpass").setAttribute("disabled","false") ; 
      if (getPref("usesshpass","boolean")) { document.getElementById("param_sshpass").setAttribute("checked","true") ; }
      else { document.getElementById("param_sshpass").setAttribute("checked","false") ; }
    }
    if (document.getElementById("label_term").value=="")
    {
      if (getOS()=="Darwin") { document.getElementById("label_term").value=_bundle.GetStringFromName("cheminTerm"); }
      else { document.getElementById("label_term").value=_bundle.GetStringFromName("cheminXterm"); }
    }
    statePasswordInput();
  }
  // Code communs aux OS
  if (getPref("remotedns","boolean")) 		{ document.getElementById("param_dns"+suffix).setAttribute("checked","true") ; }
  else 						{ document.getElementById("param_dns"+suffix).setAttribute("checked","false") ; }
  if (getPref("manageproxy","boolean")) 	{ document.getElementById("param_proxy"+suffix).setAttribute("checked","true") ; }
  else 						{ document.getElementById("param_proxy"+suffix).setAttribute("checked","false") ; }
  if (getPref("noterminal","boolean")) 		{ document.getElementById("param_noterminal"+suffix).setAttribute("checked","true") ; }
  else 						{ document.getElementById("param_noterminal"+suffix).setAttribute("checked","false") ; }
  if (getPref("compression","boolean")) 	{ document.getElementById("param_compression"+suffix).setAttribute("checked","true") ; }
  else						{ document.getElementById("param_compression"+suffix).setAttribute("checked","false") ; }
  document.getElementById("param_portforward"+suffix).value=getPref("portforward","integer") ;
}

/**
Fonction qui enregistre les nouveaux paramètres 
**/
function editConfig()
{
  var suffix = "" ;
  var tmp ;
  if(getOS()=="WINNT")
  {
    suffix="_putty" ;
    setPref("pathssh","string",document.getElementById("path_putty").value);
  }
  else
  {
    suffix="_ssh" ;
    setPref("pathssh","string",document.getElementById("path_ssh").value);
    setPref("pathsshpass","string",document.getElementById("path_sshpass").value);
    setPref("pathterm","string",document.getElementById("path_term").value);
    tmp=false;
    if (document.getElementById("param_sshpass").getAttribute("checked")=="true") tmp=true ;  
    setPref("usesshpass","boolean",tmp);
  }
  tmp=false;
  if (document.getElementById("param_dns"+suffix).getAttribute("checked")=="true") { tmp=true ; }  
  setPref("remotedns","boolean",tmp);
  tmp=false;
  if (document.getElementById("param_proxy"+suffix).getAttribute("checked")=="true") { tmp=true ; }
  setPref("manageproxy","boolean",tmp);  
  tmp=false;
  if (document.getElementById("param_noterminal"+suffix).getAttribute("checked")=="true") tmp=true ;  
  setPref("noterminal","boolean",tmp);
  tmp=false;
  if (document.getElementById("param_compression"+suffix).getAttribute("checked")=="true") tmp=true ;
  setPref("compression","boolean",tmp);
  setPref("portforward","integer",document.getElementById("param_portforward"+suffix).value);
  // Recharge des parametres 
  if(getOS()!="WINNT")
  {
    if (!existSSHpass())
    {
      setPref("usesshpass","boolean",false);
    }
  }
  stateSSHs();
  reloalXUL();
  readConfig();
}




/**
 * Fonction qui verifie la présence des logiciels ssh(s) et change les images de status en fonction...
**/
function stateSSHs()
{
  // W2K
  if (getOS()=="WINNT")
  {
    if (existSSH()) 	document.getElementById("state_putty").setAttribute("src","chrome://foxyprivy/skin/green.png") ;
    else 		document.getElementById("state_putty").setAttribute("src","chrome://foxyprivy/skin/red.png") ;
  }
  // Linux et Mac 
  else
  {
    if (existSSH()) 	document.getElementById("state_ssh").setAttribute("src","chrome://foxyprivy/skin/green.png") ;
    else 		document.getElementById("state_ssh").setAttribute("src","chrome://foxyprivy/skin/red.png") ;
    if (existSSHpass())	document.getElementById("state_sshpass").setAttribute("src","chrome://foxyprivy/skin/green.png") ;
    else  		document.getElementById("state_sshpass").setAttribute("src","chrome://foxyprivy/skin/yellow.png") ;
    if (existTerm())	document.getElementById("state_term").setAttribute("src","chrome://foxyprivy/skin/green.png") ;
    else  		document.getElementById("state_term").setAttribute("src","chrome://foxyprivy/skin/red.png") ;
  }
}



/**
Fonction qui lit les prefs des serveurs et complete le ListBox id serverListBox
**/
function readServerList()
{
    var prefs = init_foxyprivy_prefs("extensions.foxyprivy.serveur.") ;
    var tab = new Array();
    tab=prefs.getChildList("");
    var LBox=document.getElementById("serverListBox");

    // Purge de la liste
    var tmp=LBox.getRowCount();
    for(i=0;i<tmp;i++) LBox.removeItemAt() ;
    
    // Replissage de la liste
    for(i=0;i<nb_prefs();i++)
    {
      // Création des labels de la future ligne
      var couleurLabel  = document.createElement("label");
      var nomLabel      = document.createElement("label");
      var dnsLabel      = document.createElement("label");
      var portLabel     = document.createElement("label");
      var loginLabel    = document.createElement("label");
      var passwordLabel = document.createElement("label");
      
      // Remplissage des labels
      couleurLabel.style.backgroundColor=prefs.getCharPref(i+".couleur");
      couleurLabel.style.borderStyle="solid";
      couleurLabel.style.borderWidth="1px";
      couleurLabel.style.borderColor="black";
      nomLabel.setAttribute("value", prefs.getCharPref(i+".nom"));
      dnsLabel.setAttribute("value", prefs.getCharPref(i+".dns"));
      portLabel.setAttribute("value", prefs.getIntPref(i+".port"));
      loginLabel.setAttribute("value", prefs.getCharPref(i+".login"));
      if(existMdp("serveur_"+i)) { passwordLabel.setAttribute("value", "******"); }
      else { passwordLabel.setAttribute("value", ""); }

      // Creation d'un nouveau listItem et ajout de ses nouveaux enfants
      var LItem = document.createElement("listitem");
      LItem.appendChild(couleurLabel);
      LItem.appendChild(nomLabel);
      LItem.appendChild(dnsLabel);
      LItem.appendChild(portLabel);
      LItem.appendChild(loginLabel);
      LItem.appendChild(passwordLabel);
      
      // Ajout du ListItem au ListBox principal
      LBox.appendChild(LItem);
    }
}


/**
 * Fonction supprime toute la liste de serveurs de l'extension.
**/
function resetServerList()
{
  if (window.confirm(_bundle.GetStringFromName("allServerDeletionConfirm")))
  {
	var prefs = init_foxyprivy_prefs("extensions.foxyprivy.serveur.") ;
	var tab = new Array();
	tab=prefs.getChildList("");
	for(i=0;i<tab.length;i++)
	{ 
	  if (prefs.prefHasUserValue(i+".nom"))      { prefs.clearUserPref(i+".nom"); 		}
	  if (prefs.prefHasUserValue(i+".dns"))      { prefs.clearUserPref(i+".dns"); 		}
	  if (prefs.prefHasUserValue(i+".port"))     { prefs.clearUserPref(i+".port"); 		}
	  if (prefs.prefHasUserValue(i+".login"))    { prefs.clearUserPref(i+".login"); 	}
	  if (prefs.prefHasUserValue(i+".couleur"))  { prefs.clearUserPref(i+".couleur"); 	}
	  if (existMdp("serveur_"+i)) 		     { delMdp("serveur_"+i) 				}
	}
	readServerList() ;
	reloalXUL();
	return true ;
  }
  else { return false ; }
}

/**
Fonction qui vide tous les champs input de type action_*** communs a l'ajout et la modififaction
d'un serveur.
**/
function resetActionInput()
{
  document.getElementById("action_nomInput").value="";
  document.getElementById("action_dnsInput").value="";
  document.getElementById("action_portInput").value="";
  document.getElementById("action_loginInput").value="";
  document.getElementById("action_passwordInput").value="";
  document.getElementById("action_couleurInput").value="";
}

/**
Fonction qui ajoute un serveur a la liste des prefs.
  (true si ok sinon false)
**/
function addServer()
{
    // Recupération des valeurs des éléments
    const nomInput      = document.getElementById("action_nomInput");
    const dnsInput      = document.getElementById("action_dnsInput");
    const portInput     = document.getElementById("action_portInput");
    const loginInput    = document.getElementById("action_loginInput");
    const passwordInput = document.getElementById("action_passwordInput");
    const couleurInput  = document.getElementById("action_couleurInput");

    // On vérifie que les champs obligatoires sont correctement renseignés
    if ( !nomInput.value || !dnsInput.value || !portInput.value || !loginInput.value )
    {
      alert(_bundle.GetStringFromName("everyFieldCompulsory"));
      return false ;
    }
    
    // Creation des prefs & mdp
    var prefs = init_foxyprivy_prefs("extensions.foxyprivy.") ;
    var i=nb_prefs() ;
    prefs.setCharPref("serveur."+i+".nom", nomInput.value);
    prefs.setCharPref("serveur."+i+".dns", dnsInput.value);
    prefs.setIntPref("serveur."+i+".port", portInput.value);
    prefs.setCharPref("serveur."+i+".login", loginInput.value);
    prefs.setCharPref("serveur."+i+".couleur", couleurInput.color);
    if (passwordInput.value!="") { setMdp("serveur_"+i,passwordInput.value); }
    
    // Reset des champs input
    nomInput.focus();
    nomInput.value = "";
    dnsInput.value = "";
    portInput.value = "";
    loginInput.value = "";
    passwordInput.value = "";
    couleurInput.color="" ;
    
    // On recharge ensuite la liste des serveurs MAJ.
    resetActionInput();
    hideAllElem();
    showElem("liste_serveurs");
    readServerList() ;
    reloalXUL();
    
}


/**
Fonction qui charge les parametres d'un serveur dans les champs de modification
**/
function editServer()
{
  numero_serveur = document.getElementById('serverListBox').selectedIndex ;
  if (numero_serveur==-1) { alert(_bundle.GetStringFromName("noSelectedServer")); return false ; }
  else
  {
    var prefs = init_foxyprivy_prefs("extensions.foxyprivy.serveur."+numero_serveur+".") ;
    document.getElementById("action_nomInput").value=prefs.getCharPref("nom");
    document.getElementById("action_dnsInput").value=prefs.getCharPref("dns");
    document.getElementById("action_portInput").value=prefs.getIntPref("port");
    document.getElementById("action_loginInput").value=prefs.getCharPref("login");
    document.getElementById("action_couleurInput").color=prefs.getCharPref("couleur");
    if(existMdp("serveur_"+numero_serveur)) { document.getElementById("action_passwordInput").value="******" ; }
    hideAllElem();
    showElem("actions_serveurs");
    return true ;
  }
}

/**
Fonction qui enregistre les parametres d'un serveur dans les prefs
**/
function editServer_save()
{
  var prefs = init_foxyprivy_prefs("extensions.foxyprivy.") ;
  prefs.setCharPref("serveur."+numero_serveur+".nom", document.getElementById("action_nomInput").value);
  prefs.setCharPref("serveur."+numero_serveur+".dns", document.getElementById("action_dnsInput").value);
  prefs.setIntPref("serveur."+numero_serveur+".port", document.getElementById("action_portInput").value);
  prefs.setCharPref("serveur."+numero_serveur+".login", document.getElementById("action_loginInput").value);
  prefs.setCharPref("serveur."+numero_serveur+".couleur", document.getElementById("action_couleurInput").color);
  var mdp=document.getElementById("action_passwordInput").value ;
  if (mdp!="" && mdp!="******")
  {
    if (existMdp("serveur_"+numero_serveur)) { editMdp("serveur_"+numero_serveur,mdp); }
    else { setMdp("serveur_"+numero_serveur,mdp); }
  }
  else 
  {
    if (existMdp("serveur_"+numero_serveur)) {  delMdp("serveur_"+numero_serveur) ; }
  }
  numero_serveur=-1 ;
  resetActionInput();
  hideAllElem();
  showElem("liste_serveurs");
  readServerList() ;
  reloalXUL();
}

/**
Fonction qui permet de supprimer un serveur
**/
function delServer() 
{
  // Récupération du numero du serveur a supprimer
  var numero = document.getElementById('serverListBox').selectedIndex ;
  if (numero==-1) 
  {
    alert(_bundle.GetStringFromName("aucunServeurSelectionn"));
    return false ;
  }
  else
  {
    if (window.confirm(_bundle.GetStringFromName("serverDeletionConfirm")))
    {
      // Reorganisation des prefs qui suivent le numero de la pref supprimé
      reorganize_prefs(numero);
      // Suppression de la derniere pref qui ne sert plus a rien. 
      var index=nb_prefs()-1 ;
      var prefs = init_foxyprivy_prefs("extensions.foxyprivy.serveur."+index+".") ;
      if (prefs.prefHasUserValue("nom"))	prefs.clearUserPref("nom");
      if (prefs.prefHasUserValue("dns"))	prefs.clearUserPref("dns");
      if (prefs.prefHasUserValue("port"))	prefs.clearUserPref("port");
      if (prefs.prefHasUserValue("login"))	prefs.clearUserPref("login");
      if (prefs.prefHasUserValue("couleur"))	prefs.clearUserPref("couleur");
      if (existMdp("serveur_"+index)) { delMdp("serveur_"+index) ; }
      // On recharge ensuite la liste des serveurs MAJ.
      readServerList() ; 
      reloalXUL();
      return true ;
    }
    else return false ;
  }
}


/**
Fonction qui réorganise le numero des extensions lors d'une suppression
**/
function reorganize_prefs(numero_supprime)
{
  alert(numero_supprime);
  for(i=numero_supprime;i<nb_prefs()-1;i++)
  {
	// Reorganisation des prefs
	var prefs = init_foxyprivy_prefs("extensions.foxyprivy.serveur.") ;	
	prefs.setCharPref(i+".nom", prefs.getCharPref((i+1)+".nom"));
	prefs.setCharPref(i+".dns", prefs.getCharPref((i+1)+".dns"));
	prefs.setIntPref(i+".port", prefs.getIntPref((i+1)+".port"));
	prefs.setCharPref(i+".login", prefs.getCharPref((i+1)+".login"));
	prefs.setCharPref(i+".couleur", prefs.getCharPref((i+1)+".couleur"));

	// Reorganisation des mots de passes
	if(existMdp("serveur_"+(i+1)))
	{
	  if (existMdp("serveur_"+i)) { editMdp("serveur_"+i,getMdp("serveur_"+(i+1))) ; }
	  else { setMdp("serveur_"+i,getMdp("serveur_"+(i+1))) ; }
	}
	else
	{
	  if (existMdp("serveur_"+i)) { alert("del"+i); delMdp("serveur_"+i); }
	}
  }
}


/**
 * Vérifie si l'automatisation de la connexion par mot de passe est possible (Linux & Mac avec sshpass)
 * Si ce n'est pas le cas, on interdit l'enregistrement du mot de passe.
**/
function statePasswordInput()
{
  if (getOS()!="WINNT")
  {
    if(existSSHpass()) {  document.getElementById("action_passwordInput").disabled=false; }
    else { document.getElementById("action_passwordInput").disabled=true ; }
  }
}


/**
 * Fonction qui affiche les explications des options de SSH  
**/
function showExplainations(optionName)
{
  var _label=document.getElementById("ssh_definition") ;
  if(optionName=="remotedns") 		{ _label.value=_bundle.GetStringFromName("explainationsRemotedns") ; }	
  else if (optionName=="manageproxy") 	{ _label.value=_bundle.GetStringFromName("explainationsManageproxy") ; }
  else if (optionName=="noterminal") 	{ _label.value=_bundle.GetStringFromName("explainationsNoterminal") ; }
  else if (optionName=="compression") 	{ _label.value=_bundle.GetStringFromName("explainationsCompression") ; }
  else if (optionName=="sshpass") 	{ _label.value=_bundle.GetStringFromName("explainationsSshpass") ; }
  else if (optionName=="pathTerm") 	{ _label.value=_bundle.GetStringFromName("explainationsPathTerm") ; }
  else if (optionName=="pathSsh") 	{ _label.value=_bundle.GetStringFromName("explainationsPathSsh") ; }
  else if (optionName=="pathSshpass") 	{ _label.value=_bundle.GetStringFromName("explainationsPathSshpass") ; }
  else if (optionName=="portNumber") 	{ _label.value=_bundle.GetStringFromName("explainationsPortNumber") ; }
}

/**
 * Fonction qui cache les explications des options SSH
**/
function hideExplainations()
{
  var _label=document.getElementById("ssh_definition") ;
  _label.value="" ;
}