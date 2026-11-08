//==================================================================================================
// Partie Choix d'un emplacement
//==================================================================================================

//-------------------------------------------------------
// Affiche l'écran pour le choix de l'emplacement
//-------------------------------------------------------
function AfficheEcranChoixEmplacement()
{
  pid('scrMeteo').style.display = 'none';
  pid('scrHome').style.display = 'none';
  CreeListeEmplacements();
  pid('DivChoixEmplacement').innerHTML = HTMLJ;
  pid('scrChoixEmplacement').style.display = 'block';
}

//-------------------------------------------------------
// Retour à l'écran météo
//-------------------------------------------------------
function ButChoixEmplacementRetourClick()
{
  pid('scrChoixEmplacement').style.display = 'none';
  pid('scrMeteo').style.display = 'block';
}


//-------------------------------------------------------
// Sélection d'un emplacement dans la liste
//-------------------------------------------------------
function SelectionnerEmplacement(nom, lat, lon)
{
  // Mémorisation dans les paramètres globaux
  gEmplacementMeteo = nom;
  gLatitudeMeteo = lat;
  gLongitudeMeteo = lon;

  // Efface les autres écrans pour montrer la prise en compte
  pid('scrChoixEmplacement').style.display = 'none';
  pid('TxtMeteoInfos').innerHTML = "";
  pid('TxtMeteo').innerHTML = "";
  pid('TxtResume').innerHTML = "";

  // Download le bulletin et l'affiche
  DownloadBulletin(true);
  pid('scrMeteo').style.display = 'block';
}

//-------------------------------------------------------
// Création d'une liste d'emplacements
// choix=0 pour une sélection (cliquable)
//-------------------------------------------------------
function CreeListeEmplacements(choix)
{
  // Récupération de la liste stockée
  let lListeEmplacementsJSON = localStorage.getItem("ListeEmplacements");
  let lListeEmplacements = [];

  // Si elle existe, conversion en tableau
  if (lListeEmplacementsJSON !== null)
  {
      lListeEmplacements = JSON.parse(lListeEmplacementsJSON);
  }

  HTMLJ = "";
  HTMLJ += "<b>Cliquer sur un emplacement pré-enregistré</b><br>";
  HTMLJ += "<div style='height: 6px;'></div>";

  // Coordonnées GPS mémorisées uniquement pour un choix
  gLatitudeMeteo = localStorage.getItem('LatitudeMemo');
  gLongitudeMeteo = localStorage.getItem('LongitudeMemo');
  HTMLJ += "<div ";
  HTMLJ += "onclick='SelectionnerEmplacement(\"📡GPS\"," + gLatitudeMeteo + "," + gLongitudeMeteo + ")' ";
  HTMLJ += "class='Emplacement' ";
  HTMLJ += "style='background: #F0F0FF;'>";
  HTMLJ += "📡<b> " + "GPS" + "</b> <small>(" + gLatitudeMeteo + "," + gLongitudeMeteo + ")</small>";
  HTMLJ += "</div>";
  HTMLJ += "<div style='height: 2px;'></div>";

  // Création de la liste cliquable
  lListeEmplacements.forEach((emplacement, index) =>
  {
    HTMLJ += "<div style='display: flex; align-items: center; margin-bottom: 2px;'>";

    // Zone du nom (cliquable pour sélectionner)
    const lNom = emplacement.nom.replace(/'/g, "`");
    HTMLJ += "<div ";
    HTMLJ += "onclick='SelectionnerEmplacement(\"" + lNom + "\"," + emplacement.lat + "," + emplacement.lon + ")' ";
    HTMLJ += "class='Emplacement' style='background: #EFE; flex-grow: 1;'>";
    HTMLJ += "<b> " + lNom + "</b> <small>(" + emplacement.lat + "," + emplacement.lon + ")</small>";
    HTMLJ += "</div>";

    HTMLJ += "</div>";
  });
}



//==================================================================================================
// Partie Gestion des emplacements
//==================================================================================================

//-------------------------------------------------------
// Affichage d'une liste d'emplacements
//-------------------------------------------------------
function AfficheEcranGestionEmplacements()
{
  pid('scrHome').style.display = 'none';
  pid('scrChoixEmplacement').style.display = 'none';
  pid('scrGestionEmplacements').style.display = 'block';
  CreeTexteEmplacements();
}

//-------------------------------------------------------
// Création d'une liste d'emplacements au format Texte
// compatible zone-area
//-------------------------------------------------------
function CreeTexteEmplacements()
{
  let lTXT = "";

  // Récupération de la liste stockée
  let lListeEmplacementsJSON = localStorage.getItem("ListeEmplacements");
  let lListeEmplacements = [];

  // Si elle existe, conversion en tableau
  if (lListeEmplacementsJSON !== null)
  {
      lListeEmplacements = JSON.parse(lListeEmplacementsJSON);
  }

  // Texte emplacement par emplacement
  lListeEmplacements.forEach((emplacement, index) =>
  {
    lTXT += emplacement.nom + ": " + emplacement.lat + ", " + emplacement.lon + "\r\n";
  });

  pid('TxtEmplacements').value = lTXT;
}

//-------------------------------------------------------
// Annulation des modifications, fermeture de cet écran
//-------------------------------------------------------
function ButGestionEmplacementsAnnulerClick()
{
  pid('scrGestionEmplacements').style.display = 'none';
  AfficheEcranChoixEmplacement();
}


//-------------------------------------------------------
// Analyse le texte de la zone de saisie pour créer
// le tableau d'objets lListeEmplacements
//-------------------------------------------------------
function AnalyseTexteVersTableau()
{
  let lTXT = pid('TxtEmplacements').value;
  let lListeEmplacements = [];

  // On sépare le texte par ligne
  let lignes = lTXT.split(/\r?\n/);

  lignes.forEach(ligne => {
    // On vérifie que la ligne n'est pas vide
    if (ligne.trim() !== "") {
      // Format attendu : "Nom : Lat, Lon"
      // On sépare d'abord le nom du reste par le ":"
      let parties = ligne.split(':');

      if (parties.length >= 2) {
        let nom = parties[0].trim();

        // On sépare ensuite la latitude et la longitude par la ","
        let coords = parties[1].split(',');

        if (coords.length >= 2) {
          let lat = parseFloat(coords[0].trim());
          let lon = parseFloat(coords[1].trim());

          // Ajout à la liste si les nombres sont valides
          if (!isNaN(lat) && !isNaN(lon)) {
            lListeEmplacements.push({
              nom: nom,
              lat: lat,
              lon: lon
            });
          }
        }
      }
    }
  });
  return (lListeEmplacements);
}

//-------------------------------------------------------
// Validation des modifications
//-------------------------------------------------------
function ButGestionEmplacementsValiderClick()
{
  let nouvelleListe = AnalyseTexteVersTableau();
  localStorage.setItem("ListeEmplacements", JSON.stringify(nouvelleListe));
  pid('scrGestionEmplacements').style.display = 'none';
  AfficheEcranChoixEmplacement();
}

//-------------------------------------------------------
// Récupération des coordonnées GPS d'une ville
//-------------------------------------------------------
async function GeocodingChercherVille()
{
  const ville = document.getElementById('InpGeoVille').value;
  const pays = document.getElementById('SelGeoPays').value;
  const listContainer = document.getElementById('DivGeoResultats');
  const ul = document.getElementById('UlGeoResultats');

  if (!ville) {
    alert("Veuillez saisir le nom d'une ville");
    return;
  }

  // Construction de l'URL pour l'API Open-Meteo Geocoding
  let url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(ville)}&count=10&language=fr&format=json`;
  if (pays) url += '&countryCode=' + pays;

  try
  {
    const response = await fetch(url);
    const data = await response.json();

    ul.innerHTML = '';

    if (data.results && data.results.length > 0)
    {
      listContainer.style.display = 'block';

      data.results.forEach(res =>
      {
        const li = document.createElement('li');
        li.style.padding = '5px';
        li.style.borderBottom = '1px solid #ddd';

        // Préparation des composants
        const departement = res.admin1 ? res.admin1 : '';
        const paysCode = res.country_code ? res.country_code : '';
        const altitude = res.elevation ? "Altitude=" + Math.round(res.elevation) + "m" : "";

        // Label affiché dans la liste de suggestion
        li.innerHTML = "<b>" + res.name + "</b> (" + departement + ", " + paysCode + ", "+ altitude + ")";

        // Effets visuels au survol
        li.onmouseover = () => { li.style.background = '#e9ecef'; };
        li.onmouseout = () => { li.style.background = 'transparent'; };

        // Action au clic : ajout dans la zone de texte
        li.onclick = () => {
          // Formatage demandé : Nom (département, codeCountry) altitude : lat, lon
          const formatted = res.name + ": " + res.latitude.toFixed(6) + ", " + res.longitude.toFixed(6);
          const area = document.getElementById('TxtEmplacements');

          // Ajout d'un saut de ligne si la zone n'est pas vide
          if (area.value.trim() !== "" && !area.value.endsWith("\n"))
          {
            area.value += "\n";
          }
          area.value += formatted + "\n";

          // Nettoyage de la recherche
          listContainer.style.display = 'none';
          document.getElementById('InpGeoVille').value = '';
          ul.innerHTML = '';
        };

        ul.appendChild(li);
      });
    }
    else
    {
      alert("Aucun résultat trouvé pour cette recherche.");
      listContainer.style.display = 'none';
    }
  }
  catch (error)
  {
    console.error("Erreur lors de la récupération des données de géocodage:", error);
    alert("Erreur de connexion au service de géocodage.");
  }
}
