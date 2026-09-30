# Specs | Livre PDF et chat RAG

## Objectif et périmètre

Créer un workflow n8n unique couvrant deux usages indépendants :

1. charger le contenu d'un livre dans un espace de recherche vectorielle ;
2. interroger ce contenu depuis le chat intégré à n8n.

L'exercice porte sur un seul livre et un seul utilisateur. Le workflow doit répondre exclusivement à partir du contenu du livre chargé.

## Déclencheurs et conditions de démarrage

### Chargement du livre

- Le chargement est déclenché par l'envoi d'un fichier depuis un formulaire.
- Le formulaire accepte uniquement un fichier PDF.
- La taille du fichier ne dépasse pas 20 Mo.
- Le livre est rédigé en anglais.
- Le PDF ne contient pas de texte sélectionnable, mais son contenu textuel est exploitable.
- Un seul chargement sera effectué pendant l'exercice.

### Interrogation du livre

- L'interrogation est déclenchée par l'envoi d'un message depuis le chat intégré à n8n.
- Le livre est chargé avant toute utilisation du chat.
- L'utilisation du chat avant le chargement du livre est hors périmètre du test.

## Livrables et critères de réussite

Le workflow est considéré comme fonctionnel lorsque :

- le PDF envoyé peut être exploité pour répondre aux questions portant sur son contenu ;
- une question dont la réponse figure dans le livre reçoit une réponse de 100 mots maximum, fondée sur le livre ;
- une question dont la réponse ne figure pas dans le livre reçoit une indication claire que l'information n'est pas présente dans le livre ;
- les réponses ne sont pas complétées avec les connaissances générales de l'intelligence artificielle ;
- chaque réponse est formulée dans la langue de la question.

Aucun message particulier de confirmation n'est requis après le chargement réussi du PDF.

### Cas de validation

1. **Information présente dans le livre**
   - Question : « Qui est le père de Soundiata ? »
   - Réponse attendue : « Maghan Kon Fatta. »
2. **Information absente du livre**
   - Question : « Qui est le premier président de la Côte d'Ivoire ? »
   - Réponse attendue : un message indiquant que l'information ne figure pas dans le livre.
   - La réponse ne doit pas mentionner « Félix Houphouët-Boigny » à partir des connaissances générales de l'intelligence artificielle.

La compatibilité avec les langues prises en charge par Gemini est attendue, mais aucun test multilingue supplémentaire n'est exigé pour cet exercice.

## Acteur et destinataire

- Le seul utilisateur du formulaire et du chat est le créateur de l'exercice.
- Les réponses du chat sont destinées à ce même utilisateur.

## Outils, accès et limites confirmés

- Le processus doit être réalisé dans n8n sous la forme d'un workflow unique comportant deux déclencheurs.
- Le stockage vectoriel intégré à n8n est imposé.
- Gemini est imposé pour les traitements faisant appel à l'intelligence artificielle.
- Le workflow est exécuté sur une instance n8n auto-hébergée distante.
- L'accès à Gemini est déjà configuré et disponible sur cette instance.
- Après un redémarrage de l'instance, le rechargement manuel du PDF est accepté avant la reprise du chat.

## Volumes, délais et budgets

- Volume prévu : un seul livre PDF.
- Taille maximale du PDF : 20 Mo.
- Nombre de questions : non limité dans le cadre de l'exercice.
- Aucun délai maximal de traitement ou de réponse n'est imposé.
- Aucune limite de coût particulière n'est imposée.

## Erreurs et cas limites

- En cas d'échec du chargement, l'exécution doit se terminer avec une erreur simple visible dans n8n.
- Le livre doit rester indisponible dans le chat tant que son chargement complet n'a pas réussi ; aucun contenu chargé partiellement ne doit être interrogeable.
- Le chargement d'un second PDF n'est pas prévu et son comportement est hors périmètre.
- L'utilisation du chat avant le chargement du PDF n'est pas prévue et son comportement est hors périmètre.
- Lorsqu'une réponse ne peut pas être établie à partir du livre, le chat doit l'indiquer clairement au lieu d'inventer ou de compléter la réponse.
- Lorsqu'une panne technique empêche le traitement d'une question, le chat doit afficher un message clair signalant une erreur technique temporaire. Ce message doit être distinct de celui indiquant que l'information est absente du livre.
- Aucune notification externe ni reprise automatique n'est exigée.

## Sécurité, confidentialité et conformité

- Le livre utilisé est public et ne contient pas de données sensibles ou confidentielles.
- Aucun besoin supplémentaire de confidentialité, de conservation ou de conformité n'a été identifié pour cet exercice.
- Le créateur de l'exercice est le seul utilisateur prévu du formulaire et du chat.
- Aucun contrôle ou mécanisme de protection de l'accès n'est exigé pour cet exercice.

## Hypothèses validées

- Un seul PDF sera chargé au cours de l'exercice.
- Le livre sera disponible avant le premier message envoyé au chat.
- Après un redémarrage de l'instance n8n, le PDF pourra être envoyé à nouveau manuellement avant toute nouvelle utilisation du chat.
- Le remplacement, la suppression et la coexistence de plusieurs livres ne seront pas testés.
- L'absence de contrainte de délai et de coût est acceptable dans le cadre de cet exercice.
- Toutes les langues prises en charge par Gemini sont admises pour les questions, mais seul le scénario en français défini dans les cas de validation doit être testé.

## Questions ouvertes

Aucune question fonctionnelle ouverte ne bloque la suite de l'exercice.
