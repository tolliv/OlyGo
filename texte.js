//=======================================================
// CODE Texte (HTML commun pour écran ROUTE et MSG)
//=======================================================
// Mémorisaton du parent
let gParent = 0;

//-------------------------------------------------------
// Afficher l'écran ROUTE ou MSG
// 1: ROUTE
// 2: MSG
//-------------------------------------------------------
async function AfficherEcranTEXTE(pChoix)
{
  gParent = pChoix; // Mémorisaton du parent

  // Récupération du texte mémorisé
  let lTexte = "";
  let lScrollPosition = 0; // Position à restaurer

  if (pChoix == 1)
  {
    lTexte= localStorage.getItem('TxtRoute');
    pid('TxtTexteTitre').innerHTML = "ROUTE";
    lScrollPosition = localStorage.getItem('ScrollTxtRoute');
    if (lScrollPosition == null)
      lScrollPosition = 0;
  }
  else if (pChoix == 2)
  {
    lTexte= localStorage.getItem('TxtMessages');
    pid('TxtTexteTitre').innerHTML = "MSG";
    lScrollPosition = localStorage.getItem('ScrollTxtMsg');
    if (lScrollPosition == null)
      lScrollPosition = 0;
  }

  // Conversion en HTML
  if (lTexte != null)
    ConversionHTML(lTexte);
  else
    pid('TxtFormated').innerHTML = "";

  // Affiche l'écran
  pid('scrTexte').style.display = 'block';

  // Laisse le temps à l'affichage de se faire, PUIS restaure la position de défilement
  setTimeout(function()
  {
    window.scrollTo({
      top: lScrollPosition,
      behavior: 'smooth' // 'auto' est instantané, 'smooth' est animé
    });
  }, 50);
}

//-------------------------------------------------------
// Conversion en HTML ligne par ligne
// "!R " en Rouge
// "!V " en Vert
// "!B " en Bleu
// "!N " en Noir
// "!P " en Pourpre (Violet)
//-------------------------------------------------------
function ConversionHTML(pTexte)
{
  const lLignes = pTexte.split("\n");
  let lFormated = "";
  let lFlag = 0;
  let lLigne = "";
  for (let i = 0; i < lLignes.length; i++)
  {
    lLigne = lLignes[i];
    const lDebut = lLigne.substring(0, 3);
    const lFin = lLigne.substring(3);
    if (lDebut == "!R ")
    {
      lLigne = "<span style='color: red;'><b>" + lFin + "</b></span>";
    }
    else if (lDebut == "!V ")
    {
      lLigne = "<span style='color: green;'><b>" + lFin + "</b></span>";
    }
    else if (lDebut == "!B ")
    {
      lLigne = "<span style='color: blue;'><b>" + lFin + "</b></span>";
    }
    else if (lDebut == "!N ")
    {
      lLigne = "<span style='color: black;'><b>" + lFin + "</b></span>";
    }
    else if (lDebut == "!P ")
    {
      lLigne = "<span style='color: purple;'><b>" + lFin + "</b></span>";
    }
    else
    {
      lLigne = "<span style='color: black;'>" + lDebut + lFin + "</span>";
    }
    lFormated += lLigne + "<br>";
  }
  pid('TxtFormated').innerHTML = lFormated;
}

//-------------------------------------------------------
// Retour
//-------------------------------------------------------
function ButTexteRetourClick()
{
  // On sauvegarde la position de défilement actuelle AVANT de quitter
  const lScrollPosition = window.scrollY;
  if (gParent == 1)
    localStorage.setItem('ScrollTxtRoute', lScrollPosition);
  else if (gParent == 2)
    localStorage.setItem('ScrollTxtMsg', lScrollPosition);

  pid('scrTexte').style.display = 'none';
  AfficherEcranHOME();
}

//-------------------------------------------------------
// Aller au début du fichier
//-------------------------------------------------------
function ButTexteBeginClick()
{
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
    });
}

//-------------------------------------------------------
// Aller à la fin du fichier
//-------------------------------------------------------
function ButTexteEndClick()
{
  window.scrollTo({
    top: document.body.scrollHeight,
    behavior: 'smooth'
    });
}

//-------------------------------------------------------
// Ajouter un bloc de lignes dans le fichier MSG uniquement
// Saut de ligne = '\n'
// TODO n'autoriser qu'un seul \n à la fin
//-------------------------------------------------------
function AjouterLigne(pNouvellesLignes)
{
  let lTexte = localStorage.getItem('TxtMessages');
  if (lTexte == null)
    lTexte = "";
  lTexte += pNouvellesLignes;
  localStorage.setItem('TxtMessages', lTexte);
}