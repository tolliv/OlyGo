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
    lLien = "https://tolliv.github.io/OlySee/index.html?admin=" + lTxtID;
  return (lLien);
}

//-------------------------------------------------------
// Test de la connexion à la base de données
//-------------------------------------------------------
async function ButTesterIDClick()
{
  BoutonEtat('ButTesterID', 'actif');
  pid('txtResultatTestID').innerHTML = "En cours...";

  // On Récupère l'ID du champ
  const ID = pid('TxtID').value;
  const lRetDecode = await decodeSupabaseConfig(ID);

  // L'ID est correct
  if (lRetDecode.url != "")
  {
    API_URL = lRetDecode.url;
    API_KEY = lRetDecode.key;
    USER = lRetDecode.usr;
    const lRetTest = await SupabaseTestConnexion();

    // Si le test est OK, on lit le prénom
    if (lRetTest == "OK")
    {
      const lRetPrenom = await SupabaseReadPrenom();
      if (lRetPrenom.status == "OK")
      {
        const lPrenom = lRetPrenom.data[0].msg;
        pid('txtResultatTestID').innerHTML = 'OK : "Suivi de <b>' + lPrenom + '</b>"';
      }
    }

    else
    {
      pid('txtResultatTestID').innerHTML = lRetTest;
    }
  }
  else
  {
    pid('txtResultatTestID').innerHTML = "Erreur sur l'ID";
  }
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
