//=======================================================
// CODE Pour écran EDIT
//=======================================================

//-------------------------------------------------------
// Afficher l'écran scrEdit
// Parent :
// 1 = ROUTE
// 2 = MSG
//-------------------------------------------------------
function AfficherEcranEdit()
{
  let lTxtInput;

  // Récupère le bon contenu à éditer
  pid('scrTexte').style.display = 'none';
  if (gParent == 1)
  {
    lTxtInput = localStorage.getItem('TxtRoute');
    pid('TxtEditTitre').innerHTML = "Edition ROUTE";
  }
  else if (gParent == 2)
  {
    lTxtInput= localStorage.getItem('TxtMessages');
    pid('TxtEditTitre').innerHTML = "Edition MSG";
  }

  // Robustesse
  if (lTxtInput == null)
    lTxtInput = "";

  // Affecte le contenu à éditer
  pid('TxtEditInput').value = lTxtInput;

  // Affiche l'écran maintenant
  pid('scrEdit').style.display = 'block';

  // Timeout pour mesurer la hauteur de l'écran
  setTimeout(function()
  {
    const lHauteur = window.innerHeight;
    pid('TxtEditInput').style.height = (lHauteur - 80) + 'px';
    pid('TxtEditInput').style.display = 'block';
  }, 500);
}

//-------------------------------------------------------
// Revient à l'écran parent d'avant l'édition
// Recharge le texte mémorisé
//-------------------------------------------------------
function RevientEcranParent()
{
  pid('scrEdit').style.display = 'none';
  AfficherEcranTEXTE(gParent);
}


//-------------------------------------------------------
// Annulation des modifications
// Et revient à l'écran parent
//-------------------------------------------------------
function ButEditAnnulerClick()
{
  RevientEcranParent();
}


//-------------------------------------------------------
// Validation des modifications
// Et revient à l'écran parent
//-------------------------------------------------------
function ButEditValiderClick()
{
  let lTxtInput = pid('TxtEditInput').value;
  if (lTxtInput == null)
    lTxtInput = "";

  if (gParent == 1)
    localStorage.setItem('TxtRoute', lTxtInput);

  else if (gParent == 2)
    localStorage.setItem('TxtMessages', lTxtInput);

  RevientEcranParent();
}

//-------------------------------------------------------
// Aller au début du fichier
//-------------------------------------------------------
function ButEditBeginClick()
{
  pid('TxtEditInput').scrollTop = 0;
}

//-------------------------------------------------------
// Aller à la fin du fichier
//-------------------------------------------------------
function ButEditEndClick()
{
  pid('TxtEditInput').scrollTop = pid('TxtEditInput').scrollHeight;
}
