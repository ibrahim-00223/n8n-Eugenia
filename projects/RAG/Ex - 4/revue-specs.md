# Revue des specs | Livre PDF et chat RAG

## Verdict

**PAS PRÊT**

## Justification

Le besoin principal est cohérent et les décisions métier nécessaires ont été obtenues pendant la revue. Toutefois, plusieurs de ces décisions ne figurent pas encore dans les spécifications auditées. En l'état du document, le concepteur devrait encore inventer le comportement attendu en cas de chargement partiel, de panne du chat et de redémarrage de l'instance. Les critères relatifs à la langue, à la longueur des réponses et aux deux cas de test ne sont pas non plus assez précis dans les specs actuelles.

Le projet pourra devenir **PRÊT** une fois les corrections confirmées ci-dessous intégrées aux spécifications avec `n8n-interview`.

## Blocages

### 1. Chargement partiel du livre

- **Impact :** une partie du livre pourrait rester interrogeable après un échec et produire des réponses incomplètes sans que l'utilisateur le sache.
- **Clarification confirmée :** le livre doit être considéré comme indisponible tant que son chargement complet n'a pas réussi.

### 2. Conservation après redémarrage

- **Impact :** les specs indiquent initialement que le livre doit rester disponible, sans définir le comportement lorsque l'instance n8n redémarre.
- **Clarification confirmée :** l'utilisateur accepte de renvoyer manuellement le PDF après un redémarrage de l'instance avant de réutiliser le chat.

### 3. Échec technique du chat

- **Impact :** une panne de Gemini ou un autre échec de traitement pourrait être confondu avec une absence d'information dans le livre.
- **Clarification confirmée :** le chat doit afficher un message clair indiquant qu'une erreur technique empêche momentanément la réponse.

## Points à clarifier

Aucune décision métier supplémentaire n'est attendue. Les informations confirmées pendant la revue doivent encore être intégrées aux specs :

- le PDF utilisé ne contient pas de texte sélectionnable, mais son texte est exploitable ;
- une réponse ordinaire doit contenir au maximum 100 mots ;
- le chat répond dans la langue de la requête ;
- toutes les langues prises en charge par Gemini sont admises, mais aucun test multilingue n'est exigé pour cet exercice ;
- aucune protection d'accès n'est nécessaire pour cet exercice ;
- les deux questions de validation et leurs résultats attendus doivent être inscrits dans les specs.

## Risques résiduels

- Le livre devra être rechargé manuellement après un redémarrage de l'instance. Ce risque est connu et accepté.
- L'accès au formulaire et au chat n'est pas protégé. Ce risque est accepté pour cet exercice.
- La compatibilité avec toutes les langues prises en charge par Gemini ne fera pas l'objet d'un test multilingue. Seul le scénario français défini sera vérifié.
- Aucune limite de coût ni de délai n'est fixée. Ce risque est accepté compte tenu du volume limité à un PDF de 20 Mo et du cadre d'exercice.
- Le comportement lors d'un deuxième chargement reste hors périmètre.

## Corrections à appliquer dans n8n-interview

1. **Section « Déclencheurs et conditions de démarrage »**
   - **Problème :** la nature du PDF n'est pas suffisamment décrite.
   - **Information confirmée :** le PDF est en anglais, ne contient pas de texte sélectionnable, mais son texte est exploitable.
   - **Modification attendue :** ajouter ces caractéristiques aux conditions d'entrée du livre.

2. **Section « Livrables et critères de réussite »**
   - **Problème :** « concise » n'est pas mesurable et la langue de réponse n'est pas définie.
   - **Information confirmée :** chaque réponse ordinaire contient au maximum 100 mots et utilise la langue de la requête.
   - **Modification attendue :** remplacer la formulation vague par ces critères observables.

3. **Section « Livrables et critères de réussite »**
   - **Problème :** les cas de validation ne sont pas reproductibles par une personne indépendante.
   - **Information confirmée :**
     - question présente : « Qui est le père de Soundiata ? » ; réponse attendue : « Maghan Kon Fatta » ;
     - question absente : « Qui est le premier président de la Côte d'Ivoire ? » ; résultat attendu : indiquer que l'information ne figure pas dans le livre, sans répondre « Félix Houphouët-Boigny ».
   - **Modification attendue :** inscrire ces deux tests et leurs résultats attendus.

4. **Section « Erreurs et cas limites »**
   - **Problème :** le comportement après un chargement partiel n'est pas défini.
   - **Information confirmée :** aucun contenu partiel ne doit être considéré comme disponible dans le chat.
   - **Modification attendue :** ajouter cette règle d'indisponibilité jusqu'au chargement complet.

5. **Section « Erreurs et cas limites »**
   - **Problème :** les pannes pendant une demande de chat ne sont pas couvertes.
   - **Information confirmée :** afficher un message clair signalant une erreur technique temporaire.
   - **Modification attendue :** distinguer explicitement la panne technique de l'absence d'information dans le livre.

6. **Sections « Outils, accès et limites confirmés » et « Hypothèses validées »**
   - **Problème :** la durée de disponibilité du livre est ambiguë.
   - **Information confirmée :** le rechargement manuel du PDF après un redémarrage de l'instance est accepté.
   - **Modification attendue :** documenter cette limite et retirer toute formulation laissant entendre une conservation permanente après redémarrage.

7. **Section « Sécurité, confidentialité et conformité »**
   - **Problème :** « destiné uniquement au créateur » peut être interprété comme une obligation de contrôle d'accès.
   - **Information confirmée :** aucune protection d'accès n'est exigée pour cet exercice.
   - **Modification attendue :** distinguer l'utilisateur prévu d'une restriction d'accès effective.

8. **Section « Livrables et critères de réussite » ou « Hypothèses validées »**
   - **Problème :** le périmètre linguistique n'est pas explicite.
   - **Information confirmée :** les langues prises en charge par Gemini sont admises, mais aucun test multilingue n'est requis.
   - **Modification attendue :** consigner cette portée et cette limite de validation.
