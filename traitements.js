//=======================================================
// CODE Pour écran TRAITEMENTS
//=======================================================

//===== LOCALISATION ===============================================================================

const ColInactif = '#888';
const ColEnCours = 'orange';
const ColOK      = '#0F0';
const ColErreur  = '#F00';
const ColAttente = '#000';
let gDemandeAnnulation = false;

//--------------------------------------------------------------------------------------------------
// Afficher l'écran scrTrait
// Demande la localisation
// pChoix = "BOUTON1", "BOUTON2", "BOUTON3", "BOUTON4", "MEMO"
//--------------------------------------------------------------------------------------------------
async function Localisation(pChoix, choixBouton)
{
  // Par défaut, non affichés
  pid('DivEnvoi').style.display = 'none';
  pid('DivBulletin').style.display = 'none';

  // Réinitialisation des couleurs et des champs
  pid('Step1').style.backgroundColor = ColInactif;
  pid('TxtStep1').innerHTML = "<b>Localisation</b><br>";

  pid('Step2').style.backgroundColor = ColInactif;
  pid('TxtStep2').innerHTML = "<b>Mémorisation</b><br>";

  if (pChoix != "MEMO")
  {
    pid('DivEnvoi').style.display = 'block';
    pid('DivBulletin').style.display = 'block';
    pid('Step3').style.backgroundColor = ColInactif;
    pid('TxtStep3').innerHTML = "<b>Envoi</b><br>";
    pid('Step4').style.backgroundColor = ColInactif;
    pid('TxtStep4').innerHTML = "<b>Bulletin météo</b><br>";
  }

  // Couleur et texte barre de choix
  pid('BarreTraitChoix').style.backgroundColor = window.getComputedStyle(choixBouton).backgroundColor;
  pid('TxtTraitTitre').textContent = choixBouton.textContent;
  pid('TxtTraitTitre').style.color = window.getComputedStyle(choixBouton).color;

  // Bouton annuler au début
  pid('ButTraitRetour').innerHTML = "Annuler";
  pid('ButTraitRetour').style.backgroundColor = '#800';
  gDemandeAnnulation = false;

  // Affiche l'écran Traitement
  pid('scrHome').style.display = 'none';
  pid('scrTrait').style.display = 'block';

  //----- Localisation -----
  const lPrecision = pid('TxtPrecision').value;
  GeolocalisationWatch(lPrecision);

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
      const lRestant = Math.round(lTimeout/10);
      pid('TxtStep1').innerHTML  = S("<b>Localisation</b> (", lRestant, "s restante") + ")<br>";
      pid('TxtStep1').innerHTML += "précision = <b>" + gGeoAccuracy + "m</b> (seuil = " + iSeuilPrecision + "m)<br>";
      pid("Step1").style.backgroundColor = ColEnCours;
    }

    // Limitation temps
    lTimeout--;
    if (lTimeout <= 0)
    {
      gGeoStatus = -3;
      break;
    }

    // Demande d'annulation pendant la géolocalisation
    if (gDemandeAnnulation == true)
    {
      gGeoStatus = -3;
      break;
    }
  } while (gGeoStatus > 0); // Sortie si précision atteinte ou Erreur
  ArretGeolocalisation();

  // On vérifie avant, si on a demandé d'annuler
  if (gDemandeAnnulation == false)
  {
    // Si géolocalisation OK
    if (gGeoStatus == 0)
    {
      const lRestant = Math.round(lTimeout/10);
      pid("Step1").style.backgroundColor = ColOK;
      pid('TxtStep1').innerHTML = S("<b>Localisation</b> (", lRestant, "s restante") + ")<br>";
      pid('TxtStep1').innerHTML+= "précision = <b>"+ gGeoAccuracy + "m</b> (seuil = "+iSeuilPrecision+"m)<br>";
      pid('TxtStep1').innerHTML+= "Lat,Lon = " + gGeoLatitude + " , " + gGeoLongitude + "<br>";
      pid('TxtStep1').innerHTML+= "Altitude = " + gGeoAltitude + "m";

      // Temps d'attente pour annuler
      for (let lX = 0; lX < 15; lX++)
      {
        const lRestant = Math.round(2 - lX/10);
        pid('ButTraitRetour').innerHTML = "Annuler (" + lRestant + "s)";
        await sleep(100);
      }
    }

    // Erreur de géolocalisation
    else
    {
      pid("Step1").style.backgroundColor = ColErreur;
      if (gGeoStatus == -1)   pid('TxtStep1').innerHTML+= "Erreur, géolocalisation non supportée";
      if (gGeoStatus == -2)   pid('TxtStep1').innerHTML+= "Erreur, permission refusée";
      if (gGeoStatus == -3)   pid('TxtStep1').innerHTML+= "Erreur, seuil non atteint";
    }

    // Maintenant, on ne peut plus annuler
    pid('ButTraitRetour').innerHTML = "Retour";
    pid('ButTraitRetour').style.backgroundColor = '#008';
  }

  //========== Actions après localisation ==========

  // Fini précision atteinte, on prépare les différentes variables
  if ( (gGeoStatus == 0) && (gDemandeAnnulation == false) )
  {
    // Mémorisation
    gGeoEmplacement = "📡GPS";
    localStorage.setItem('LatitudeMemo', gGeoLatitude);
    localStorage.setItem('LongitudeMemo', gGeoLongitude);
    localStorage.setItem('EmplacementMemo', gGeoEmplacement);
    localStorage.setItem('AltitudeMemo', gGeoAltitude);
    localStorage.setItem('AccuracyMemo', gGeoAccuracy);

    //----- Mémorisation dans MSG -----
    // Date
    const lDateAbsolue = DateSupabase();
    const lDateRelative = FormaterDateRelative(Number(lDateAbsolue), 'complete');
    let lLigne1  = "!P " + lDateRelative.j + " à " + lDateRelative.h + "\n";
        lLigne1 += "!B Lat,Lon= " + gGeoLatitude + "," + gGeoLongitude + " ("+ gGeoAccuracy + "m)\n";
    let lLigne2 = "!V ";

    if (pChoix=="BOUTON1")  lLigne2 += "Début";
    if (pChoix=="BOUTON2")  lLigne2 += "Position";
    if (pChoix=="BOUTON3")  lLigne2 += "Bivouac";
    if (pChoix=="BOUTON4")  lLigne2 += "Fin";
    if (pChoix=="MEMO")  lLigne2 += "Mémo";
    lLigne2 += "\n";

    // Supprime tous les \n à la fin du message
    let lMessage = pid('TxtMessage').value;
    while ( (lMessage.length > 0) && (lMessage.slice(-1) === '\n') )
    {
      lMessage = lMessage.slice(0, -1); // Supprime le dernier caractère
    }
    let lLigne3 = lMessage + "\n";
    if (lMessage.length > 0)
      lLigne3 += "\n";

    const lNouveauMessage = lLigne1 + lLigne2 + lLigne3;
    AjouterLigne(lNouveauMessage);    // Message mémorisé dans MSG
    pid("TxtStep2").innerHTML += "Message mémorisé<br>";

    //----- Mémorisation requête dans buffer d'envoi -----
    // Valable pour tous les choix sauf MEMO
    if (pChoix != "MEMO")
    {
      pid("Step2").style.backgroundColor = ColEnCours;

      // Création de la requête internet
      let lNewReq = {};
      lNewReq.user = Number(USER);
      lNewReq.type = 100;
      lNewReq.date = lDateAbsolue;
      lNewReq.lat  = gGeoLatitude;
      lNewReq.lon  = gGeoLongitude;
      lNewReq.alt  = gGeoAltitude;
      lNewReq.prec = gGeoAccuracy;

      // Type de point
      if (pChoix=="BOUTON1")  lNewReq.poi = 1;
      if (pChoix=="BOUTON2")  lNewReq.poi = 2;
      if (pChoix=="BOUTON3")  lNewReq.poi = 3;
      if (pChoix=="BOUTON4")  lNewReq.poi = 4;

      // Remplacer \n par <br>
      const lMessageBR = lMessage.replace(/\n/g, '<br>');
      lNewReq.msg = lMessageBR;

      // Ajout nouvelle requête dans le FIFO
      WriteFIFO(lNewReq);
      pid("TxtStep2").innerHTML += "Requête mémorisée<br>";

      // Envoi des requêtes mémorisées
      EnvoiRequetesFIFO();
      pid("Step2").style.backgroundColor = ColOK;
    }

    // MEMO donc pas de requête à envoyer
    else
    {
      pid("Step2").style.backgroundColor = ColOK;
    }
  }
}

//--------------------------------------------------------------------------------------------------
// Fonction d'attente d'une durée
//--------------------------------------------------------------------------------------------------
function sleep(ms)
{
  return new Promise(resolve => setTimeout(resolve, ms));
}

//--------------------------------------------------------------------------------------------------
// Bouton retour
// Pris en compte de la demande
//--------------------------------------------------------------------------------------------------
function ButTraitRetourClick()
{
  gDemandeAnnulation = true;
  ArretGeolocalisation();
  pid('scrTrait').style.display = 'none';
  AfficherEcranHOME();
}

