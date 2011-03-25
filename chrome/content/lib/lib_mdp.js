/* Creating stringbundle from locale file */
var gfoxyprivyBundle = Components.classes["@mozilla.org/intl/stringbundle;1"].getService(Components.interfaces.nsIStringBundleService);
var _bundle = gfoxyprivyBundle.createBundle("chrome://foxyprivy/locale/lib_pwd.properties");

function existMdp(id)
{
  var hostname = "chrome://foxyprivy" ;
  var formSubmitURL = "MDP_User" ; 
  var httprealm = null;
  var returnvalue=false ;
  try
  {
     // Obtient le gestionnaire d'identification 
     var myLoginManager = Components.classes["@mozilla.org/login-manager;1"]
			   .getService(Components.interfaces.nsILoginManager);
	    
     // Recherche des utilisateurs pour les paramètres donnés
     var logins = myLoginManager.findLogins({}, hostname, formSubmitURL, httprealm);
	
     // Trouve l'utilisateur dans le tableau d'objets nsILoginInfo renvoyé
     for (var i = 0; i < logins.length; i++)
     {
	if (logins[i].username == id)
	{
	   returnvalue=true ;
	   break;
	}
     }
  }
  catch(ex) {
    alert(_bundle.GetStringFromName("errorWhileRetrievingPassword"));
  }
  return returnvalue ;
}


function setMdp(id,mdp)
{
  var nsLoginInfo = new Components.Constructor("@mozilla.org/login-manager/loginInfo;1",
                        Components.interfaces.nsILoginInfo,
			"init");

  var loginInfo = new nsLoginInfo("chrome://foxyprivy",
		     "MDP_User", null,
		     id, mdp, "", "");
  
  var myLoginManager = Components.classes["@mozilla.org/login-manager;1"]
		      .getService(Components.interfaces.nsILoginManager);
  
  myLoginManager.addLogin(loginInfo);
}


function getMdp(id)
{
  var hostname = "chrome://foxyprivy" ;
  var formSubmitURL = "MDP_User" ; 
  var httprealm = null;
  var password;
  
  try
  {
     // Obtient le gestionnaire d'identification 
     var myLoginManager = Components.classes["@mozilla.org/login-manager;1"]
			   .getService(Components.interfaces.nsILoginManager);
	    
     // Recherche des utilisateurs pour les paramètres donnés
     var logins = myLoginManager.findLogins({}, hostname, formSubmitURL, httprealm);
	
     // Trouve l'utilisateur dans le tableau d'objets nsILoginInfo renvoyé
     for (var i = 0; i < logins.length; i++)
     {
	if (logins[i].username == id)
	{
	   password = logins[i].password;
	   break;
	}
     }
  }
  catch(ex) {
     alert(_bundle.GetStringFromName("errorWhileRetrievingPassword"));
  }
  return password ;
}

function delMdp(id)
{
  var hostname = "chrome://foxyprivy" ;
  var formSubmitURL = "MDP_User" ; 
  var httprealm = null;
  
  try {
     // Obtient le gestionnaire d'identification 
     var myLoginManager = Components.classes["@mozilla.org/login-manager;1"]
			   .getService(Components.interfaces.nsILoginManager);
   
     // Recherche des utilisateurs pour cette extension 
     var logins = myLoginManager.findLogins({}, hostname, formSubmitURL, httprealm);
	
     for (var i = 0; i < logins.length; i++) {
	if (logins[i].username == id) {
	   myLoginManager.removeLogin(logins[i]);
	   break;
	}
     }
  }
  catch(ex) {
     alert(_bundle.GetStringFromName("errorWhileDeletingPassword"));
  }
}


function editMdp(id,new_mdp)
{
  delMdp(id) ;
  setMdp(id,new_mdp);
}
