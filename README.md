# Sonneries
====================
Un site simple fait avec AngularJS (deuxième conception), apprit via " Devenez un ninja avec AngularJS " de Ninja Squad.

Ce site est orienté mobile mais peut être consulté sur ordinateur puis télécharger la sélection grâce à un QrCode généré.
SQLite est utilisé pour enregistré le nombre de téléchargement.

## Arguments serveur

Lorsque vous exécutez le serveur via la commande '** ./server.js **' ou '** node server.js **',
Vous pouvez ajouter des paramètres afin d'indiquer au serveur comment démarrer.

A la suite de la commande de lancement, vous avez ces options :
 - *port=8888*, Replacez 8888 par le port souhaité (option facultative).
 - *ip=no*, Le serveur ne cherchera pas votre adresse IP externe et passera à l'étape suivante.
 - *ping=no*, Le ping de vérification (pour regarder que le port est ouvert), ne sera pas envoyé.
 - *browser=no*, N'ouvrira pas le navigateur avec l'adresse du serveur.

## Sources utilisées

AngularJS : (https://angularjs.org/)
CryptoJS : (https://code.google.com/p/crypto-js/)
Audio5JS : (http://zohararad.github.io/audio5js/)
Ng-Infinite-Scroll : (https://binarymuse.github.io/ngInfiniteScroll/)

## Notes

Explications sur quelques fichiers / dossiers :
 - *index.php*, Ce fichier fait un iFrame et vérifie que le serveur répond (sinon un message est affiché).
   Ce fichier est à déposer sur un hébergeur web gratuit pour ceux hébergeant le serveur sur leur ordianteur personnel.
   Pour que le message de non réponse du serveur, pensez à indiquer l'adresse du site iFrame à la ligne 2 du fichier '** public/app.js **'.
   Pour l'iFrame, veuillez indiquer ligne 5 du fichier '** index.php **', l'adresse du serveur (votre adresse IP perso pour ce cas).
 - *index.html*, Il n'est pas situé dans le dossier '** public **' car NodeJS va ajouter l'adresse du site dans les balises méta (de facebook).
   Si vous n'en avez pas besoin, supprimez ces balises et repositionnez le fichier dans '** public **'.
 - *public/ringtones*, Ce dossier comprend les sonneries listés par le serveur (les formats m4r et mp3 doivent être présent pour une sonnerie).
 - *public/img/cat-#.png*, Ces images sont affichés dans la liste des genres de sonneries (dans la recherche).
   Remplacez '** # **' par le nom du dossier créé dans '** public/ringtones **', ajoutez aussi dans '** public/app.js **' aux lignes 15, 16 et 17.
