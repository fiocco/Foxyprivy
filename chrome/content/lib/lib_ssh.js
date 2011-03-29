/**
Declaration des objets globaux
**/
var process ;
var pidterm=-1 ;
var timer ;


/**
Fonction se charge d'initialiser les objets globaux file et process déclaré au début de ce fichier.
**/
function initSSH()
{
  process = Components. classes ["@mozilla.org/process/util;1"]. createInstance (Components. interfaces. nsIProcess);
}

/**
 * Fonction qui vérifie si une instance de ssh est en train de tourner.
 * Si SSH est mort, on arrete le timer. 
**/
function checkSSHrunning()
{
  if (process.isRunning)
    return true ;
  else
  {
    alert("SSH dead !") ;
    clearInterval(timer) ;
    return false ;
  }
}

/**
Fonction se charge de tuer le processus putty en cours via l'objet global process
**/
function killSSH()
{
  if (process.isRunning)
    process.kill();
  if (getOS()=="Darwin")
    if (pidterm!=-1)
    {
      killPID(pidterm) ;
      pidterm=-1;
      clearDarwinSSHScripts() ;  
    }
  stateImgFP("ready"); 
}


/**
Fonction qui vérifie si le binaire de putty est installé.
**/
function existPutty()
{
    var putty=Components. classes ["@mozilla.org/file/local;1"]. createInstance (Components. interfaces. nsILocalFile);
    var profD = Components.classes["@mozilla.org/file/directory_service;1"].
	   getService(Components.interfaces.nsIProperties).
	   get("ProfD", Components.interfaces.nsIFile);   
    var path_putty=profD.path+"\\foxyprivy\\putty.exe";
    
    // Vérification de la présence du binaire putty.exe dans le dossier foxyprivy du profil.
    var putty_exist=false ;
    try
    {
       putty.initWithPath(path_putty);
       if( putty.isFile() ) {  putty_exist=true ; }
    }
    catch (err) { putty_exist=false ; }
    return putty_exist ;
}


/**
Fonction qui télécharge le binaire de putty.
**/
function setupPutty()
{
    // Au besoin, creation du dossier foxyprivy à la racine du profil
    var dossier_foxyprivy = Components.classes["@mozilla.org/file/directory_service;1"].
	       getService(Components.interfaces.nsIProperties).
	       get("ProfD", Components.interfaces.nsIFile);
    dossier_foxyprivy.append("foxyprivy");
    if( !dossier_foxyprivy.exists() || !dossier_foxyprivy.isDirectory() )  dossier_foxyprivy.create(Components.interfaces.nsIFile.DIRECTORY_TYPE, 0777);
    // Téléchargement de putty
    var profD = Components.classes["@mozilla.org/file/directory_service;1"].
	       getService(Components.interfaces.nsIProperties).
	       get("ProfD", Components.interfaces.nsIFile);
    var path_putty=profD.path+"\\foxyprivy\\putty.exe";
    var putty = Components.classes["@mozilla.org/file/local;1"]
				    .createInstance(Components.interfaces.nsILocalFile);
    putty.initWithPath(path_putty);
    var URI = Components.classes["@mozilla.org/network/io-service;1"]
				    .getService(Components.interfaces.nsIIOService)
				    .newURI("http://the.earth.li/~sgtatham/putty/latest/x86/putty.exe", null, null);
    var persist = Components.classes["@mozilla.org/embedding/browser/nsWebBrowserPersist;1"]
				    .createInstance(Components.interfaces.nsIWebBrowserPersist);
    const nsIWBP = Components.interfaces.nsIWebBrowserPersist;
    const flags = nsIWBP.PERSIST_FLAGS_REPLACE_EXISTING_FILES;
    persist.persistFlags = flags | nsIWBP.PERSIST_FLAGS_FROM_CACHE;
    persist.saveURI(URI, null, null, null, "", putty);
    setPref("pathssh","string",path_putty);
}


/**
 Fonction qui supprime le binaire de putty 
 **/
function removePutty()
{
    // Recupération du chemin de putty
    var putty=Components. classes ["@mozilla.org/file/local;1"]. createInstance (Components. interfaces. nsILocalFile);
    var profD = Components.classes["@mozilla.org/file/directory_service;1"].
	   getService(Components.interfaces.nsIProperties).
	   get("ProfD", Components.interfaces.nsIFile);   
    var path_putty=profD.path+"\\foxyprivy";
    
    // Suppression du binaire
    try
    {
       putty.initWithPath(path_putty);
       putty.remove(true);
       setPref("pathssh","string","");
       return true ;
    }
    catch (err) { return false ; }
}


/**
Fonction qui vérifie si le binaire de ssh existe bien.
**/
function existSSH()
{
    var ssh=Components. classes ["@mozilla.org/file/local;1"]. createInstance (Components. interfaces. nsILocalFile);
    
    // Vérification de la présence du fichier /usr/bin/ssh
    var ssh_exist=false ;
    try
    {
       ssh.initWithPath(getPref("pathssh","string"));
       if( ssh.isFile() ) {  ssh_exist=true ; }
    }
    catch (err) { ssh_exist=false ; }
    return ssh_exist ;
}


/**
* Fonction qui vérifie si le binaire de sshpass existe bien.
**/
function existSSHpass()
{
    var sshpass=Components. classes ["@mozilla.org/file/local;1"]. createInstance (Components. interfaces. nsILocalFile);
    
    // Vérification de la présence du fichier /usr/bin/sshpass
    var sshpass_exist=false ;
    try
    {
       sshpass.initWithPath(getPref("pathsshpass","string"));
       if( sshpass.isFile() ) {  sshpass_exist=true ; }
    }
    catch (err) { sshpass_exist=false ; }
    return sshpass_exist ;
}


/**
* Fonction qui vérifie si le binaire du term existe bien.
**/
function existTerm()
{
    var term=Components. classes ["@mozilla.org/file/local;1"]. createInstance (Components. interfaces. nsILocalFile);
    
    var term_exist=false ;
    try
    {
       term.initWithPath(getPref("pathterm","string"));
       if( term.isFile() ) {  term_exist=true ; }
    }
    catch (err) { term_exist=false ; }
    return term_exist ;
}


/**
Fonction se charge d'appeler SSH (ou script qui lancera SHH) avec ses arguments 
**/
function callSSH(dns,port,login,passw)
{	
  killSSH();
  // Récupération des parametres supplémentaires
  var port_forward=getPref("portforward","integer");
  var compression=getPref("compression","boolean") ;
  var noterminal=getPref("noterminal","boolean") ;
  
  // W2K
  if(getOS()=="WINNT")
  {
    var path_client=getPref("pathssh","string");
    var args = ["-ssh", "-P", port, dns, "-l", login];
    // Passage du mot de passe en arguement que si passw semble valable ("/" = pas de mot de passe rentré par l'utilisateur)
    if (passw!="/")
    {
        args.splice(args.length,0,"-pw");
	args.splice(args.length,0, passw);
    }
    // Récupération autres paramètres des prefs et ajouts éventuels au tableau d'arguments
    args.splice(args.length,0,"-D");
    args.splice(args.length,0, port_forward);
    if (compression)  args.splice(args.length,0,"-C"); 
    if (noterminal)   args.splice(args.length,0,"-N"); 
  }
  // Mac
  else if (getOS()=="Darwin")
  {
    var path_client="/usr/bin/open";
    var path_terminal=getPref("pathterm","string");
    var path_sshpass=getPref("pathsshpass","string");
    var path_ssh=getPref("pathssh","string");
    // Arguments supplémentaires ?
    var args_sup="";
    if (compression)  args_sup=args_sup+" -C" ; 
    if (noterminal)   args_sup=args_sup+" -T" ;
    // Génération du script
    var script ;
    if (getPref("usesshpass","boolean") && passw!="/") // Si SSHpass est utilisé et que le mot de passe est définit !
      script=writeDarwinSSHpassScript(path_sshpass, path_ssh, login, dns, passw, port, port_forward,args_sup) ;
    else  // Si SSH direct sans SSHPass
      script=writeDarwinSSHScript(path_ssh, login, dns, port, port_forward,args_sup) ;
    var args = ["-Wna", path_terminal, script.path] ;
  }
  // Linux 
  else
  {
    var path_client=getPref("pathterm","string");
    var path_sshpass=getPref("pathsshpass","string");
    var path_ssh=getPref("pathssh","string");
    // Si SSHPass est utilisé (la pref usesshpass sur true) et que le mot de passe est définit !
    if (getPref("usesshpass","boolean") && passw!="/")
    {
      var args = ["-e", path_sshpass,"-p", passw, path_ssh, login+"@"+dns, "-p", port] ;
    }
    // Si SSH direct sans SSHPass
    else
    {
      var args = ["-e", path_ssh, login+"@"+dns, "-p", port] ;
    }   
    // Récupération autres paramètres des prefs et ajouts éventuels au tableau d'arguments
    args.splice(args.length,0,"-D");
    args.splice(args.length,0, port_forward);
    if (compression)  args.splice(args.length,0,"-C"); 
    if (noterminal)   args.splice(args.length,0,"-T");
  }
  
  /*
  var tmp=path_client ;
  for(i=0;i<args.length;i++)
    tmp=tmp+" "+args[i] ;
  alert(tmp);
  */

  // Initialisation et lancement de SSH
  var file=Components. classes ["@mozilla.org/file/local;1"]. createInstance (Components. interfaces. nsILocalFile);
  initSSH();
  file.initWithPath(path_client);
  process.init (file);
  process.run (false, args, args. length);
  if (getOS()=="Darwin")
  {
    pidterm=process.pid+1 ;
  }
  // Reconfiguration des paramètres proxy de FF
  setProxy(port_forward,getPref("remotedns","boolean")) ;
  
  // Initialisation du timer !
  //timer=setInterval("checkSSHrunning();", 1000);
}



function writeDarwinSSHScript(path_ssh, login, dns, port, port_forward,args_sup)
{
  // Contenu du fichier de script a creer
  var co="" ;
  co=co+"# @ Fiocco, generation automatique\n"+
        "# -----------------------------------------------------------\n" ;
  co=co+path_ssh+" -p "+port+" -D "+port_forward+" "+login+"@"+dns+" "+args_sup+"\n" ;
  co=co+"# -----------------------------------------------------------" ;

  // Au besoin, creation du dossier foxyprivy à la racine du profil
  var dossier_foxyprivy = Components.classes["@mozilla.org/file/directory_service;1"].
	     getService(Components.interfaces.nsIProperties).
	     get("ProfD", Components.interfaces.nsIFile);
  dossier_foxyprivy.append("foxyprivy");
  if( !dossier_foxyprivy.exists() || !dossier_foxyprivy.isDirectory() )  dossier_foxyprivy.create(Components.interfaces.nsIFile.DIRECTORY_TYPE, 0777);
  
  // Creation du fichier de script darwin_ssh.sh
  var script = Components.classes["@mozilla.org/file/directory_service;1"].
	     getService(Components.interfaces.nsIProperties).
	     get("ProfD", Components.interfaces.nsIFile);
  script.append("foxyprivy");	script.append("darwin_ssh.sh");
  if (!script.exists())     { script.create(Components.interfaces.nsIFile.NORMAL_FILE_TYPE, 0777);     }
     
  // Ecriture du contenu dans le fichier.
  var Stream = Components.classes["@mozilla.org/network/file-output-stream;1"].
               createInstance(Components.interfaces.nsIFileOutputStream);
  Stream.init(script, 0x02 | 0x08 | 0x20, 0666, 0);
  var converter = Components.classes["@mozilla.org/intl/converter-output-stream;1"].
		  createInstance(Components.interfaces.nsIConverterOutputStream);
  converter.init(Stream, "UTF-8", 0, 0);
  converter.writeString(co);
  converter.close();
  return script ;
}



function writeDarwinSSHpassScript(path_sshpass, path_ssh, login, dns, passw, port, port_forward,args_sup) 
{
  // Contenu du fichier de script a creer
  var co="" ;
  co=co+"# @ Fiocco, generation automatique\n"+
        "# -----------------------------------------------------------\n" ;
  co=co+path_sshpass+" -p "+passw+" "+path_ssh+" -p "+port+" -D "+port_forward+" "+login+"@"+dns+" "+args_sup+"\n" ;
  co=co+"# -----------------------------------------------------------" ;

  // Au besoin, creation du dossier foxyprivy à la racine du profil
  var dossier_foxyprivy = Components.classes["@mozilla.org/file/directory_service;1"].
	     getService(Components.interfaces.nsIProperties).
	     get("ProfD", Components.interfaces.nsIFile);
  dossier_foxyprivy.append("foxyprivy");
  if( !dossier_foxyprivy.exists() || !dossier_foxyprivy.isDirectory() )  dossier_foxyprivy.create(Components.interfaces.nsIFile.DIRECTORY_TYPE, 0777);
  
  // Creation du fichier de script darwin_sshpass.sh
  var script = Components.classes["@mozilla.org/file/directory_service;1"].
	     getService(Components.interfaces.nsIProperties).
	     get("ProfD", Components.interfaces.nsIFile);
  script.append("foxyprivy");	script.append("darwin_sshpass.sh");
  if (!script.exists())     { script.create(Components.interfaces.nsIFile.NORMAL_FILE_TYPE, 0777);     }
     
  // Ecriture du contenu dans le fichier.
  var Stream = Components.classes["@mozilla.org/network/file-output-stream;1"].
               createInstance(Components.interfaces.nsIFileOutputStream);
  Stream.init(script, 0x02 | 0x08 | 0x20, 0666, 0);
  var converter = Components.classes["@mozilla.org/intl/converter-output-stream;1"].
		  createInstance(Components.interfaces.nsIConverterOutputStream);
  converter.init(Stream, "UTF-8", 0, 0);
  converter.writeString(co);
  converter.close();
  return script ;
}


/**
 * Fonction qui supprimer les scripts "auto généré" apres leur utilisation.
 * Important surtout dans le cas sur script SSHPass pour éviter de laisser le mot de passe en clair dans le profil !
**/
function clearDarwinSSHScripts()
{
  // Suppression du fichier de script darwin_sshpass.sh si il existe
  var script = Components.classes["@mozilla.org/file/directory_service;1"].
	     getService(Components.interfaces.nsIProperties).
	     get("ProfD", Components.interfaces.nsIFile);
  script.append("foxyprivy");	script.append("darwin_sshpass.sh");
  if (script.exists())     { script.remove(false) ; }
  // Suppression du fichier de script darwin_ssh.sh si il existe
  var script = Components.classes["@mozilla.org/file/directory_service;1"].
	     getService(Components.interfaces.nsIProperties).
	     get("ProfD", Components.interfaces.nsIFile);
  script.append("foxyprivy");	script.append("darwin_ssh.sh");
  if (script.exists())     { script.remove(false) ; } 
}


function killPID(pid)
{
  var fileKill=Components. classes ["@mozilla.org/file/local;1"]. createInstance (Components. interfaces. nsILocalFile);  
  var processKill = Components. classes ["@mozilla.org/process/util;1"]. createInstance (Components. interfaces. nsIProcess);
  var argsKill = [pid];
  fileKill.initWithPath("/bin/kill");
  processKill.init (fileKill);
  processKill.run (false, argsKill, argsKill. length);
}