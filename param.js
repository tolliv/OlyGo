//=======================================================
// CODE Pour écran PARAM
//=======================================================

//-------------------------------------------------------
// Afficher l'écran scrParam
//-------------------------------------------------------
function AfficherEcranPARAM()
{
  // Affichage
  let lConnecte = IsConnected();
  pid('TxtReseau').innerHTML = "Accès réseau : <b>" + (lConnecte?"Oui":"Non") + "</b>";
  pid('txtResultatTestID').innerHTML = "";
  pid('scrParam').style.display = 'block';
}

//-------------------------------------------------------
// Annulation des modifications
//-------------------------------------------------------
function ButParamAnnulerClick()
{
  // On remet les valeurs qui sont dans le localStorage
  LitParametres();
  pid('scrParam').style.display = 'none';
  AfficherEcranHOME();
}

//-------------------------------------------------------
// Valider les modifications des paramètres
// Sauvegarde dans le localStorage et prise en compte des nouvelles valeurs
//-------------------------------------------------------
function ButParamValiderClick()
{
  let lModele;
  if (pid('RadArome').checked) lModele = 1;
  else if (pid('RadArpege').checked) lModele = 2;
  else if  (pid('RadIcon').checked) lModele = 3;
  else if  (pid('RadEcmwf').checked) lModele = 4;

  localStorage.setItem('TxtID', pid('TxtID').value);
  localStorage.setItem('Synchronisation', (pid('ChkSynchronisation').checked?"1":"0"));
  localStorage.setItem('Precision', pid('TxtPrecision').value);
  localStorage.setItem('TempsMaxLocalisation', pid('TxtTempsMaxLocalisation').value);
  localStorage.setItem('SimulationGeolocalisation', (pid('ChkSimulation').checked?"1":"0"));
  localStorage.setItem('SimulationCoordonnees', pid('TxtCoordonnees').value);
  localStorage.setItem('SeuilVent', pid('TxtSeuilVent').value);
  localStorage.setItem('Modele', lModele);
  localStorage.setItem('NbJours', (pid('TxtNbJours').value));
  localStorage.setItem('TaillePolice', pid('TxtTaillePolice').value);

  // On relit les paramètres et on ferme l'écran
  LitParametres();
  pid('scrParam').style.display = 'none';
  AfficherEcranHOME();
}

//-------------------------------------------------------
// Lit les paramètres dans le local storage
//-------------------------------------------------------
async function LitParametres()
{
  let param;

  //----- Paramètres Cloud -----

  param = localStorage.getItem('TxtID') ?? "";
  pid('TxtID').value = param;

  if (param != "")
  {
    ID = param;
    const lRetDecode = await decodeSupabaseConfig(ID);
    API_URL = lRetDecode.url;
    API_KEY = lRetDecode.key;
    USER    = lRetDecode.usr;
  }
  else
  {
    API_URL = "";
    API_KEY = "";
    USER = "";
  }

  param = localStorage.getItem('Synchronisation') ?? "1";
  pid('ChkSynchronisation').checked = (param=="1"?true:false);

  //----- Paramètres géolocalisation -----

  param = localStorage.getItem('Precision') ?? "15";
  if (isNaN(param)) param = "15";
  pid('TxtPrecision').value = param;
  iSeuilPrecision = Math.round(param);

  param = localStorage.getItem('TempsMaxLocalisation') ?? "30";
  if (isNaN(param)) param = "30";
  pid('TxtTempsMaxLocalisation').value = param;
  gTempsMaxLocalisation = Math.round(param);

  param = localStorage.getItem('SimulationGeolocalisation') ?? "0";
  pid('ChkSimulation').checked = (param=="1"?true:false);

  param = localStorage.getItem('SimulationCoordonnees') ?? "48.85826187,2.29449563";
  pid('TxtCoordonnees').value = param;

  //----- Paramètres météo  -----

  param = localStorage.getItem('SeuilVent') ?? "10";
  if (isNaN(param)) param = "10";
  pid('TxtSeuilVent').value = param;
  gSeuilVent = parseFloat(param);

  param = localStorage.getItem('Modele');
  if (param == 1 || param == null || isNaN(param))
  {
      pid('RadArome').checked = true;
      gModel = "AROME";
  }
  else if (param == 2)
  {
      pid('RadArpege').checked = true;
      gModel = "ARPEGE";
  }
  else if (param == 3)
  {
      pid('RadIcon').checked = true;
      gModel = "ICON";
  }
  else if (param == 4)
  {
      pid('RadEcmwf').checked = true;
      gModel = "ECMWF";
  }

  param = localStorage.getItem('NbJours') ?? "4";
  if (isNaN(param)) param = "4";
  if (Math.round(param) < 1)
    param = "1";
  else if (Math.round(param) > 15)
    param = "15";
  pid('TxtNbJours').value = param;

  //----- Personnalisation affichage -----

  // Taille de la police
  param = localStorage.getItem('TaillePolice') ?? "14";
  if (isNaN(param)) param = "14";
  if (Math.round(param) < 10)
    param = "10";
  else if (Math.round(param) > 24)
    param = "24";
  pid('TxtTaillePolice').value = param;
  ChangeTaillePolice();
}

//-------------------------------------------------------
// Change la taille de la police des éléments
//-------------------------------------------------------
function ChangeTaillePolice()
{
  const lFontSize = pid('TxtTaillePolice').value + "px";
  document.body.style.fontSize = lFontSize;
  pid('TxtEditInput').style.fontSize = lFontSize;
  changerTaillePoliceZoneSaisieQuery('.ZoneSaisie', lFontSize);
  changerTaillePoliceZoneSaisieQuery('.ZoneParamSaisie', lFontSize);
}

//-------------------------------------------------------
// Changer la taille dans la classe spécifiée
//-------------------------------------------------------
function changerTaillePoliceZoneSaisieQuery(NomClasse, nouvelleTaille)
{
  const elementsZoneSaisie = document.querySelectorAll(NomClasse);
  if (elementsZoneSaisie.length > 0)
  {
    elementsZoneSaisie.forEach(element =>
    {
      element.style.fontSize = nouvelleTaille;
    });
  }
}

//-------------------------------------------------------
// Copier l'adresse complète dans le presse-papier
//-------------------------------------------------------
async function ButCopierIDClick()
{
  BoutonEtat('ButCopierID', 'actif');

  const lLien = CreeLienOlySee();
  try
  {
    await navigator.clipboard.writeText(lLien);
  }
  catch (err)
  {
    console.error("Erreur lors de la copie : ", err);
  }

  await sleep(300);
  BoutonEtat('ButCopierID', 'inactif');
}

//--------------------------------------------------------------------------------------------------
// Création d'un lien vers OlySee
//--------------------------------------------------------------------------------------------------
function CreeLienOlySee()
{
  let lLien = "";
  const lTxtID = pid('TxtID').value;
  if (lTxtID != "")
    lLien = gServerOlySee + "index.html?admin=" + lTxtID;
  return (lLien);
}

//-------------------------------------------------------
// Test de la connexion à la base de données
//-------------------------------------------------------
async function ButTesterIDClick()
{
  BoutonEtat('ButTesterID', 'actif');
  pid('txtResultatTestID').innerHTML = "En cours...";

  // Boucle unique
  do
  {
    // On Récupère l'ID du champ
    const ID = pid('TxtID').value;
    if (ID == "")
    {
      await sleep(300);
      pid('txtResultatTestID').innerHTML = "Erreur ID vide";
      break;
    }

    const lRetDecode = await decodeSupabaseConfig(ID);

    // L'ID est incorrect
    if (lRetDecode.url == "")
    {
      await sleep(300);
      pid('txtResultatTestID').innerHTML = "Erreur ID non valide";
      break;
    }

    // Test de connexion
    if (IsConnected() == false)
    {
      await sleep(300);
      pid('txtResultatTestID').innerHTML = "Erreur pas de réseau";
      break;
    }

    // L'ID est correct
    API_URL = lRetDecode.url;
    API_KEY = lRetDecode.key;
    USER = lRetDecode.usr;
    const lRetTest = await SupabaseTestConnexion();

    // Erreur sur l'ID
    if (lRetTest != "OK")
    {
      await sleep(300);
      pid('txtResultatTestID').innerHTML = lRetTest;
      break;
    }

    // Lecture Prénom
    const lRetPrenom = await SupabaseReadPrenom();
    if (lRetPrenom.status != "OK")
    {
      await sleep(300);
      pid('txtResultatTestID').innerHTML = lRetPrenom.status;
      break;
    }

    // Tout est OK
    const lPrenom = lRetPrenom.data[0].msg;
    await sleep(300);
    pid('txtResultatTestID').innerHTML = 'OK : "Suivi de <b>' + lPrenom + '</b>"';

  } while (0);
  BoutonEtat('ButTesterID', 'inactif');
}

//--------------------------------------------------------------------------------------------------
// Ouvrir OlySee
//--------------------------------------------------------------------------------------------------
async function ButOuvrirOlySeeDepuisParamClick()
{
  BoutonEtat('ButOuvrirOlySeeDepuisParam', 'actif');
  const lLien = CreeLienOlySee();
  window.open(lLien, '_blank');
  await sleep(300);
  BoutonEtat('ButOuvrirOlySeeDepuisParam', 'inactif'  );
}

//--------------------------------------------------------------------------------------------------
// Tester la géolocalisation
//--------------------------------------------------------------------------------------------------
async function ButTesterGeolocClick()
{
  BoutonEtat('ButTesterGeoloc', 'actif');
  pid('txtResultatTestGeoloc').innerHTML = "En cours...";
  const precision = pid('TxtPrecision').value;

  // Lancement géolocalisation
  GeolocalisationWatch(Number(precision));

  // Boucle d'attente de la fin
  let lTimeout = pid('TxtTempsMaxLocalisation').value * 10; // Car tempo de 100ms
  do
  {
    // Période vérification de l'état
    await sleep(100);
    const lStatus = gGeoStatus;

    // Si nouvelle position valide, on l'affiche
    if (lStatus > 1)
    {
      pid('txtResultatTestGeoloc').innerHTML = "Précision = " + gGeoAccuracy + "m";
    }

    // Limitation temps
    lTimeout--;
    if (lTimeout <= 0)
    {
      gGeoStatus = -3;
      break;
    }
  } while (gGeoStatus > 0); // Sortie si précision atteinte ou Erreur

  // Géolocalisation réussie
  if (gGeoStatus == 0)
  {
    pid('txtResultatTestGeoloc').innerHTML  = "OK : Précision = <b>" + gGeoAccuracy + "m</b>";
  }

  // Géolocalisation échouée
  else
  {
    pid('TxtMeteo').innerHTML += "Erreur : ";
    if (gGeoStatus == -1)   pid('txtResultatTestGeoloc').innerHTML = "Géolocalisation non supportée";
    if (gGeoStatus == -2)   pid('txtResultatTestGeoloc').innerHTML = "Permission refusée";
    if (gGeoStatus == -3)   pid('txtResultatTestGeoloc').innerHTML = "Précision insuffisante";
  }
  BoutonEtat('ButTesterGeoloc', 'inactif');
}