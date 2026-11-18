//----- CODE ---------------------------------------------------------------------------------------

//----- Variables -----
let sPlateforme = "Unknown";
let iSeuilPrecision;                  // Paramètre mémorisé
let gTempsMaxLocalisation = 10;       // Paramètre mémorisé
let gNewVersion = "";

//--------------------------------------------------------------------------------------------------
// Initialisations
//--------------------------------------------------------------------------------------------------

//----- Installation du Service Worker -----
if ('serviceWorker' in navigator)
{
  // updateViaCache: 'none' force le navigateur à ignorer son cache HTTP
  const registrationPromise = navigator.serviceWorker.register('./sw.js',
  {
    updateViaCache: 'none'
  });

  registrationPromise.then(registration =>
  {
    // Force une vérification de mise à jour à chaque chargement de la page
    registration.update();

    // Updatefound
    registration.addEventListener('updatefound', () =>
    {
      console.log('Nouvelle version du service worker trouvée, installation en cours.');
      const newWorker = registration.installing;
      newWorker.addEventListener('statechange', () =>
      {
        if (newWorker.state === 'installed')
        {
          console.log('installed');
          pid('TxtVersionFuture').innerHTML = "&nbsp;Nouvelle version installée&nbsp;";
        }
      });
    });
  }).catch(error =>
  {
  });
}

//----- Gestionnaires d'événements DOM -----
document.addEventListener('DOMContentLoaded', async function()
{
   //----- Ecran HOME -----
  // Lit les paramètres dans le local storage
  await LitParametres();

  // Fin de l'initialisation et affichage version
  sPlateforme = getPlatform();

  // Dans écran PARAM
  pid('TxtVersion').innerHTML = "Version de l'application : <b>v" + VERSION + "</b>";
  pid('TxtPlateforme').innerHTML= "Plateforme  : <b>" + sPlateforme + "</b>";

  // Dans écran HOME
  pid('TxtVersionActuelle').innerHTML = "Version " + VERSION;

  // Affichage de l'écran HOME
  AfficherEcranHOME();

  // Gestion Upload/Download des fichiers communs (fonctions bloquantes au démarrage) TODO
  await GestionDatabaseEmplacements();
  await GestionDatabaseMessages();
  await GestionDatabaseRoute();

  // pid('scrHome').style.display = 'none';
  // pid('scrTrait').style.display = 'block';
  // pid('ButOuvrirOlySee').style.display = 'block';
});

//--------------------------------------------------------------------------------------------------
// Raccourci sur les éléments du DOM
//--------------------------------------------------------------------------------------------------
function pid(id)
{
  const element = document.getElementById(id);
  if (id == null)
    console.log("ID NULL (" + id + ")");
  return element;
}

//--------------------------------------------------------------------------------------------------
// Afficher l'écran Home
//--------------------------------------------------------------------------------------------------
function AfficherEcranHOME()
{
  let lNbReq = 0;

  // Gestion du nombre de requêtes en cours
  lNbReq = CountFIFO();

  // Il y a des requêtes à envoyer (donc bouton rouge)
  if (lNbReq > 0)
  {
    pid('ButMenuReq').style.backgroundColor = '#F00';
    pid('ButMenuReq').style.color = 'white';
  }

  // Pas de requêtes à envoyer
  else
  {
    pid('ButMenuReq').style.backgroundColor = '#0F0';
    pid('ButMenuReq').style.color = 'black';
  }
  pid('ButMenuReq').innerHTML = "<b>" + lNbReq + "</b> <small>Req</small>";

  // Affichage écran
  pid('scrHome').style.display = 'block';
}

//--------------------------------------------------------------------------------------------------
// Lecture de la plateforme
//--------------------------------------------------------------------------------------------------
function getPlatform()
{
    const ua = navigator.userAgent.toLowerCase();
    if (ua.includes("android"))
        return "Android";
    else if (ua.includes("iphone") || ua.includes("ipad") || ua.includes("ipod"))
        return "iOS";
    else if (ua.includes("windows") || ua.includes("win32") || ua.includes("win64"))
        return "Windows";
    else if (ua.includes("macintosh") || ua.includes("mac os x"))
        return "MacOS";
    else if (ua.includes("linux"))
        return "Linux";
    else
        return "Unknown";
}

//--------------------------------------------------------------------------------------------------
// L'un des boutons est appuyé
//--------------------------------------------------------------------------------------------------
function butChoixClicked(choix)
{
  // Flag de Simulation de géolocalisation
  if (pid('ChkSimulation').checked)
  {
    console.log("Mode Simulation activé");
  }

  switch(choix)
  {
    case "BOUTON1":
      Localisation(choix, pid('ButActiviteDebut'));
      break;
    case "BOUTON2":
      Localisation(choix, pid('ButPosition'));
      break;
    case "BOUTON3":
      Localisation(choix, pid('ButBivouac'));
      break;
    case "BOUTON4":
      Localisation(choix, pid('ButActiviteFin'));
      break;
    case "MEMO":
      Localisation(choix, pid('ButMemo'));
      break;
  }
}

//--------------------------------------------------------------------------------------------------
// Boutons du menu
//--------------------------------------------------------------------------------------------------
function ButMenuParamClicked()
{
  pid('scrHome').style.display = 'none';
  AfficherEcranPARAM();
}

async function ButMenuMsgClicked()
{
  pid('scrHome').style.display = 'none';
  AfficherEcranTEXTE(2);
}

function ButMenuRouteClicked()
{
  pid('scrHome').style.display = 'none';
  AfficherEcranTEXTE(1);
}

function ButMenuMeteoClicked()
{
  pid('scrHome').style.display = 'none';
  AfficherEcranMETEO();
}

function ButMenuReqClicked()
{
  pid('scrHome').style.display = 'none';
  AfficherEcranREQ();
}

function ButMenuAideClicked()
{
  pid('scrHome').style.display = 'none';
  AfficherEcranAIDE();
}


//--------------------------------------------------------------------------------------------------
// Effacement du message
//--------------------------------------------------------------------------------------------------
async function butEffaceClicked()
{
  BoutonEtat('ButEffacer', 'actif');
  pid('TxtMessage').value = "";
  await sleep(300);
  BoutonEtat('ButEffacer', 'inactif');
}

//--------------------------------------------------------------------------------------------------
// Connexion réseau
//--------------------------------------------------------------------------------------------------
function IsConnected()
{
  let lConnected = navigator.onLine;
//  lConnected = false;     // Mode DEBUG : simulation pas de réseau (commenter si RELEASE)
  return(lConnected);
}

//--------------------------------------------------------------------------------------------------
// Activation/Désactivation d'un bouton
//--------------------------------------------------------------------------------------------------
function BoutonEtat(bouton, etat)
{
  const but = pid(bouton);
  if (etat == 'actif')
  {
    but.style.backgroundColor = '#FC8';
    but.style.color = '#000';
    but.style.border = '2px solid #DA6';
    but.state = 'actif';
  }

  if (etat == 'inactif')
  {
    but.style.backgroundColor = '#444';
    but.style.color = '#FFF';
    but.style.border = '2px solid #444';
    but.state = 'inactif';
  }
}


//--------------------------------------------------------------------------------------------------
// Gestion du panel pour les alertes
// pFlagIcon = true ou false
//--------------------------------------------------------------------------------------------------
function AfficherAlerte(pMessage, pBorder, pFlagIcon)
{
  pid('panStatusText').innerHTML = pMessage;
  pid('status-card').style.border = pBorder;
  pid('panStatusIcon').style.display = (pFlagIcon?'block':'none');

  // Affichage
  pid('panStatus').style.display = 'flex';
}
function MasquerAlerte()
{
  pid('panStatus').style.display = 'none';
}

//--------------------------------------------------------------------------------------------------
// Test SMS
//--------------------------------------------------------------------------------------------------
function TestSMS()
{
  initierSMS("+33612345678", "Message de test\n2e ligne.");
}
function initierSMS(numero, message)
{
    const lienSMS = "sms:" + numero + "?body=" + encodeURIComponent(message);
    window.location.href = lienSMS;
}



