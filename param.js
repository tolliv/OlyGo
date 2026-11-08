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


  localStorage.setItem('TxtURL', pid('TxtURL').value);
  localStorage.setItem('TxtKEY', pid('TxtKEY').value);
  localStorage.setItem('TxtUSER', pid('TxtUSER').value);
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
function LitParametres()
{
  let param;

  //----- Paramètres Cloud -----

  param = localStorage.getItem('TxtURL');
  if (param == null)
      param = "(none)";
  pid('TxtURL').value = param;
  API_URL = param;

  param = localStorage.getItem('TxtKEY');
  if (param == null)
      param = "(none)";
  pid('TxtKEY').value = param;
  API_KEY = param;

  param = localStorage.getItem('TxtUSER');
  if (param == null)
      param = "(none)";
  pid('TxtUSER').value = param;
  USER = param;

  //----- Paramètres géolocalisation -----

  param = localStorage.getItem('Precision');
  if (param == null || isNaN(param))
      param = "15";
  pid('TxtPrecision').value = param;
  iSeuilPrecision = Math.round(param);

  param = localStorage.getItem('TempsMaxLocalisation');
  if (param == null || isNaN(param))
      param = "30";
  pid('TxtTempsMaxLocalisation').value = param;
  gTempsMaxLocalisation = Math.round(param);

  param = localStorage.getItem('SimulationGeolocalisation');
  if (param == null)
      param = "0";
  pid('ChkSimulation').checked = (param=="1"?true:false);

  param = localStorage.getItem('SimulationCoordonnees');
  if (param == null)
      param = "48.85826187,2.29449563";
  pid('TxtCoordonnees').value = param;

  //----- Paramètres météo  -----

  param = localStorage.getItem('SeuilVent');
  if (param == null || isNaN(param))
      param = "10";
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

  param = localStorage.getItem('NbJours');
  if (param == null || isNaN(param))
      param = "4"
  else if (Math.round(param) < 1)
    param = "1";
  else if (Math.round(param) > 15)
    param = "15";
  pid('TxtNbJours').value = param;

  //----- Personnalisation affichage -----

  // Taille de la police
  param = localStorage.getItem('TaillePolice');
  if (param == null || isNaN(param))
      param = "14"
  else if (Math.round(param) < 10)
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
  if (0) // TODO créer l'adresse complète
  {
    const lMemo = pid('TxtVisuGPX').value;
    pid('TxtVisuGPX').value = "https://www.visugpx.com/" + lMemo;

    // Sélectionner le contenu et copier
    pid('TxtVisuGPX').select();
    pid('TxtVisuGPX').setSelectionRange(0, 99999); // Pour compatibilité mobile

    // Ajouter une pause de 100ms
    await new Promise(resolve => setTimeout(resolve, 100));

    try
    {
      document.execCommand('copy');
      pid('ButCopierID').innerHTML = "Copié";
      pid('ButCopierID').style.background = "#0F0";
      pid('ButCopierID').style.color = "#000";
      await new Promise(resolve => setTimeout(resolve, 500));
      pid('ButCopierID').innerHTML = "Copier";
      pid('ButCopierID').style.background = "#008";
      pid('ButCopierID').style.color = "#FFF";
    }
    catch (err)
    {
      pid('ButCopierID').innerHTML = "Erreur";
      pid('ButCopierID').style.background = "#F00";
      await new Promise(resolve => setTimeout(resolve, 500));
      pid('ButCopierID').innerHTML = "Copier dans Presse-papier";
      pid('ButCopierID').style.background = "#008";
    }

    pid('TxtVisuGPX').value = lMemo;
    window.getSelection().removeAllRanges();
    document.activeElement.blur();
  }
}


//-------------------------------------------------------
// Test de la connexion à la base de données
//-------------------------------------------------------
async function ButTesterIDClick()
{
  pid('txtResultatTestID').innerHTML = "En cours...";
  const lRet = await SupabaseTestConnexion();
  pid('txtResultatTestID').innerHTML = lRet;
  console.log("Test de connexion : " + lRet);
}