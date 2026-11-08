//=======================================================
// CODE Pour écran AIDE
//=======================================================
//-------------------------------------------------------
// Afficher l'écran scrAide
//-------------------------------------------------------
function AfficherEcranAIDE()
{
  // Récupération de la position du défilement
  let lScrollPosition = localStorage.getItem('ScrollTxtAide');
  if (lScrollPosition == null)
    lScrollPosition = 0;

  // On affiche l'écran (le navigateur doit maintenant l'afficher)
  pid('scrAide').style.display = 'block';

  // On laisse le temps au navigateur de dessiner les icônes de la barre d'outils
  setTimeout(function() {
    afficherAideHtml();

    // Laisse le temps à l'affichage du contenu HTML de se faire,
    // PUIS restaure la position de défilement
    setTimeout(function()
    {
       window.scrollTo({
         top: lScrollPosition,
         behavior: 'auto'
       });
    }, 100);
  }, 500);
}

//--------------------------------------------------------------------------------------------------
// Fermeture de cet écran
//--------------------------------------------------------------------------------------------------
function ButAideRetourClick()
{
  // On sauvegarde la position de défilement actuelle AVANT de quitter
  const lScrollPosition = window.scrollY;
    localStorage.setItem('ScrollTxtAide', lScrollPosition);

  pid('scrAide').style.display = 'none';
  AfficherEcranHOME();
}

//--------------------------------------------------------------------------------------------------
// Fonction pour afficher l'écran d'aide
//--------------------------------------------------------------------------------------------------
function afficherAideHtml()
{
  const container = pid('TxtAide');

  return; // TODO

  // Charger le contenu seulement s'il n'est pas déjà là
  if (container.innerHTML.trim() === "")
  {
    fetch('aide.html')
      .then(response =>
      {
        if (!response.ok)
        {
          console.log("Erreur de chargement du fichier d'aide");
        }
        return response.text();
      })
      .then(html =>
      {
        container.innerHTML = html;
      })
      .catch(error =>
      {
        console.error(error);
        container.innerHTML = "Erreur pendant l'affichage de l'aide";
      });
  }
}


//-------------------------------------------------------
// Aller au début du fichier
//-------------------------------------------------------
function ButAideHomeClick()
{
  pid('TxtAide').scrollTop = 0;
}


//-------------------------------------------------------
// Agrandir la police
// Limitation à 20px
//-------------------------------------------------------
function ButAidePlusClick()
{
  const tailleActuelle = parseInt(window.getComputedStyle(pid('TxtAide')).fontSize, 10);
  if (tailleActuelle < 24)
    pid('TxtAide').style.fontSize = (tailleActuelle + 1) + 'px';
}


//-------------------------------------------------------
// Réduire la police
// Limitation à 10px
//-------------------------------------------------------
function ButAideMoinsClick()
{
  const tailleActuelle = parseInt(window.getComputedStyle(pid('TxtAide')).fontSize, 10);
  if (tailleActuelle > 10)
  pid('TxtAide').style.fontSize = (tailleActuelle - 1) + 'px';
}